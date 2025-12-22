import crypto from "crypto";
import { db } from "@/db";
import { invitations, employees, organizations, tenants, users } from "@/db/schema";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { EmployeeRole, InvitationStatus, UserRole, UserStatus, UserType } from "@/types/entityEnums";
import { auth } from "@/lib/auth";
import { RepositoryError } from "./tenant.repository";

const INVITE_TTL_DAYS = 7;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function sha256Hex(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function looksLikeUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function computeEffectiveStatus(invite: { status: string; expiresAt: Date | string | null }) {
  const status = String(invite.status);
  if (status === InvitationStatus.PENDING && invite.expiresAt) {
    const expiresAt = invite.expiresAt instanceof Date ? invite.expiresAt : new Date(invite.expiresAt);
    if (expiresAt.getTime() <= Date.now()) return InvitationStatus.EXPIRED;
  }
  return status;
}

function mapEmployeeRoleToUserRole(employeeRole: string) {
  if (employeeRole === EmployeeRole.ADMIN) return UserRole.TENANT_ADMIN;
  return UserRole.MEMBER;
}

export type CreateInvitationInput = {
  tenantId: string;
  inviterUserId: string;
  inviterName: string;
  email: string;
  role: EmployeeRole;
  firstName?: string;
  lastName?: string;
};

export class InvitationRepository {
  static normalizeEmail = normalizeEmail;
  static sha256Hex = sha256Hex;
  static looksLikeUuid = looksLikeUuid;

  static async assertTenantAdmin(params: { userId: string; tenantId: string; userRole?: string | null }) {
    // Fast path: user.role already set by tenant creation.
    if (params.userRole === UserRole.TENANT_ADMIN) return;

    // Fallback: validate via employee record.
    const employee = await db.query.employees.findFirst({
      where: and(eq(employees.tenantId, params.tenantId), eq(employees.userId, params.userId)),
    });

    if (!employee) throw new RepositoryError("Forbidden: Tenant access required", 403);

    // Only ADMIN employee can invite.
    if (String(employee.role) !== EmployeeRole.ADMIN) {
      throw new RepositoryError("Forbidden: TENANT_ADMIN access required", 403);
    }
  }

  static async createInvitation(input: CreateInvitationInput) {
    const email = normalizeEmail(input.email);
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256Hex(token);

    const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

    // Ensure tenant exists
    const tenant = await db.query.tenants.findFirst({ where: eq(tenants.id, input.tenantId) });
    if (!tenant) throw new RepositoryError("Tenant not found", 404);

    // If the user already exists and is already a member of this tenant, block.
    const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existingUser) {
      const existingEmployee = await db.query.employees.findFirst({
        where: and(eq(employees.tenantId, input.tenantId), eq(employees.userId, existingUser.id)),
      });
      if (existingEmployee) {
        throw new RepositoryError("User is already a member of this tenant", 409);
      }
    }

    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.tenantId, input.tenantId),
    });

    const invitationUrlBase = process.env.PM_APP_URL || "http://localhost:3001";
    const invitationUrl = `${invitationUrlBase.replace(/\/$/, "")}/accept-invite?token=${token}`;

    const row = await db.transaction(async (tx) => {
      const existing = await tx.query.invitations.findFirst({
        where: and(eq(invitations.tenantId, input.tenantId), eq(invitations.email, email)),
      });

      if (existing && String(existing.status) === InvitationStatus.ACCEPTED) {
        throw new RepositoryError("Invitation already accepted for this email", 409);
      }

      if (existing) {
        const updated = await tx
          .update(invitations)
          .set({
            firstName: input.firstName ?? existing.firstName,
            lastName: input.lastName ?? existing.lastName,
            role: input.role,
            status: InvitationStatus.PENDING,
            tokenHash,
            expiresAt,
            acceptedAt: null,
            invitedByUserId: input.inviterUserId,
          })
          .where(eq(invitations.id, existing.id))
          .returning();

        return updated[0];
      }

      const inserted = await tx
        .insert(invitations)
        .values({
          tenantId: input.tenantId,
          email,
          firstName: input.firstName,
          lastName: input.lastName,
          role: input.role,
          status: InvitationStatus.PENDING,
          tokenHash,
          expiresAt,
          invitedByUserId: input.inviterUserId,
        })
        .returning();

      return inserted[0];
    });

    return {
      invitation: {
        ...row,
        effectiveStatus: computeEffectiveStatus(row),
      },
      token,
      invitationUrl,
      organizationName: organization?.name ?? input.tenantId,
    };
  }

  static async listInvitations(params: {
    tenantId: string;
    status?: InvitationStatus;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = Math.max(1, Number(params.page ?? 1) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit ?? 20) || 20));
    const offset = (page - 1) * limit;

    const conditions = [eq(invitations.tenantId, params.tenantId), eq(invitations.deleted, false)];

    if (params.status) {
      conditions.push(eq(invitations.status, params.status));
    }

    if (params.search?.trim()) {
      const q = `%${params.search.trim()}%`;
      conditions.push(
        or(
          ilike(invitations.email, q),
          ilike(sql`coalesce(${invitations.firstName}, '')`, q),
          ilike(sql`coalesce(${invitations.lastName}, '')`, q)
        )!
      );
    }

    const whereClause = and(...conditions);

    const rows = await db
      .select()
      .from(invitations)
      .where(whereClause)
      .orderBy(desc(invitations.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db.select({ total: count() }).from(invitations).where(whereClause);
    const total = Number(totalRow?.total ?? 0);

    return {
      data: rows.map((r) => ({ ...r, effectiveStatus: computeEffectiveStatus(r) })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getInvitationByToken(token: string) {
    const tokenHash = sha256Hex(token);
    const invite = await db.query.invitations.findFirst({ where: eq(invitations.tokenHash, tokenHash) });
    if (!invite) throw new RepositoryError("Invitation not found", 404);

    const organization = await db.query.organizations.findFirst({ where: eq(organizations.tenantId, invite.tenantId) });

    return {
      invitation: {
        ...invite,
        effectiveStatus: computeEffectiveStatus(invite),
      },
      organizationName: organization?.name ?? invite.tenantId,
    };
  }

  static async getInvitationById(invitationId: string) {
    if (!looksLikeUuid(invitationId)) throw new RepositoryError("Invalid invitation id", 400);

    const invite = await db.query.invitations.findFirst({ where: eq(invitations.id, invitationId) });
    if (!invite) throw new RepositoryError("Invitation not found", 404);

    return { ...invite, effectiveStatus: computeEffectiveStatus(invite) };
  }

  static async validateToken(token: string) {
    const { invitation } = await this.getInvitationByToken(token);

    const effectiveStatus = computeEffectiveStatus(invitation);
    if (effectiveStatus !== InvitationStatus.PENDING) {
      return { valid: false, reason: `Invitation is ${effectiveStatus}` };
    }

    return { valid: true };
  }

  static async acceptInvitation(params: {
    token: string;
    // Either existing user, or create user via email+password
    existingUserId?: string;
    signup?: { email: string; password: string; name: string };
    // If we have a live session, prefer it.
    sessionUser?: { id: string; email?: string | null; name?: string | null };
  }) {
    const { invitation } = await this.getInvitationByToken(params.token);
    const effectiveStatus = computeEffectiveStatus(invitation);

    if (effectiveStatus !== InvitationStatus.PENDING) {
      throw new RepositoryError(`Invitation is ${effectiveStatus}`, 400);
    }

    const inviteEmail = normalizeEmail(String(invitation.email));

    // Resolve user (prefer session)
    let userId: string | null = null;
    let userEmail: string | null = null;
    let userName: string | null = null;

    if (params.sessionUser?.id) {
      userId = params.sessionUser.id;
      userEmail = params.sessionUser.email ? normalizeEmail(params.sessionUser.email) : null;
      userName = params.sessionUser.name ?? null;
    }

    if (!userId && params.existingUserId) {
      const existing = await db.query.users.findFirst({ where: eq(users.id, params.existingUserId) });
      if (!existing) throw new RepositoryError("User not found", 404);
      userId = existing.id;
      userEmail = normalizeEmail(existing.email);
      userName = existing.name;
    }

    if (!userId && params.signup) {
      const email = normalizeEmail(params.signup.email);
      if (email !== inviteEmail) {
        throw new RepositoryError("Email does not match invitation", 400);
      }

      const authResult = await auth.api.signUpEmail({
        body: {
          email,
          password: params.signup.password,
          name: params.signup.name,
        },
      });

      const createdUserId = authResult?.user?.id ?? null;
      if (!createdUserId) {
        throw new RepositoryError("Failed to create user for invitation", 500);
      }

      userId = createdUserId;
      userEmail = email;
      userName = params.signup.name;
    }

    if (!userId) {
      throw new RepositoryError("Missing user context for accepting invitation", 400);
    }

    if (userEmail && userEmail !== inviteEmail) {
      throw new RepositoryError("Authenticated user email does not match invitation", 403);
    }

    const employeeRole = String(invitation.role);
    const userRole = mapEmployeeRoleToUserRole(employeeRole);

    const accepted = await db.transaction(async (tx) => {
      // Mark accepted
      const updatedInvitation = await tx
        .update(invitations)
        .set({ status: InvitationStatus.ACCEPTED, acceptedAt: new Date() })
        .where(eq(invitations.id, invitation.id))
        .returning();

      // Create membership
      const insertedEmployee = await tx
        .insert(employees)
        .values({
          tenantId: invitation.tenantId,
          userId,
          role: employeeRole,
          status: UserStatus.ACTIVE,
          joinedAt: new Date(),
        })
        .onConflictDoNothing()
        .returning();

      // Update user tenant + role
      const updatedUser = await tx
        .update(users)
        .set({
          tenantId: invitation.tenantId,
          userType: UserType.USER,
          role: userRole,
        })
        .where(eq(users.id, userId))
        .returning();

      return {
        invitation: updatedInvitation[0],
        employee: insertedEmployee[0] ?? null,
        user: updatedUser[0] ?? null,
        userName,
      };
    });

    return {
      ...accepted,
    };
  }

  static async updateInvitationRole(params: { tenantId: string; invitationId: string; role: EmployeeRole }) {
    if (!looksLikeUuid(params.invitationId)) throw new RepositoryError("Invalid invitation id", 400);

    const updated = await db
      .update(invitations)
      .set({ role: params.role })
      .where(and(eq(invitations.id, params.invitationId), eq(invitations.tenantId, params.tenantId)))
      .returning();

    if (!updated[0]) throw new RepositoryError("Invitation not found", 404);
    return updated[0];
  }

  static async revokeInvitation(params: { tenantId: string; invitationId: string }) {
    if (!looksLikeUuid(params.invitationId)) throw new RepositoryError("Invalid invitation id", 400);

    const updated = await db
      .update(invitations)
      .set({ status: InvitationStatus.REVOKED })
      .where(and(eq(invitations.id, params.invitationId), eq(invitations.tenantId, params.tenantId)))
      .returning();

    if (!updated[0]) throw new RepositoryError("Invitation not found", 404);
    return updated[0];
  }

  static async resendInvitation(params: { tenantId: string; invitationId: string }) {
    if (!looksLikeUuid(params.invitationId)) throw new RepositoryError("Invalid invitation id", 400);

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256Hex(token);
    const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

    const updated = await db
      .update(invitations)
      .set({ status: InvitationStatus.PENDING, tokenHash, expiresAt, acceptedAt: null })
      .where(and(eq(invitations.id, params.invitationId), eq(invitations.tenantId, params.tenantId)))
      .returning();

    if (!updated[0]) throw new RepositoryError("Invitation not found", 404);

    return { invitation: updated[0], token };
  }

  static async checkEmailInvited(params: { tenantId: string; email: string }) {
    const email = normalizeEmail(params.email);

    const invite = await db.query.invitations.findFirst({
      where: and(eq(invitations.tenantId, params.tenantId), eq(invitations.email, email)),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });

    if (!invite) return { invited: false };

    return {
      invited: true,
      invitation: { ...invite, effectiveStatus: computeEffectiveStatus(invite) },
    };
  }
}
