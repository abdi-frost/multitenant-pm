import { NextRequest, NextResponse } from "next/server";
import { InvitationRepository } from "@/db/repositories";
import { RepositoryError } from "@/db/repositories/tenant.repository";
import { ResponseFactory } from "@/types/response";
import { EmployeeRole, InvitationStatus } from "@/types/entityEnums";
import { requireAuthFromRequest } from "@/lib/api-helpers";
import { emailService } from "@/lib/email.service";

function asEmployeeRole(value: unknown): EmployeeRole {
  const role = String(value ?? "").toUpperCase();
  if (role === EmployeeRole.STAFF) return EmployeeRole.STAFF;
  if (role === EmployeeRole.MANAGER) return EmployeeRole.MANAGER;
  if (role === EmployeeRole.ADMIN) return EmployeeRole.ADMIN;
  throw new RepositoryError("Invalid role", 400);
}

function asInvitationStatus(value: string | null): InvitationStatus | undefined {
  if (!value) return undefined;
  const v = value.toUpperCase();
  if (v === InvitationStatus.PENDING) return InvitationStatus.PENDING;
  if (v === InvitationStatus.ACCEPTED) return InvitationStatus.ACCEPTED;
  if (v === InvitationStatus.EXPIRED) return InvitationStatus.EXPIRED;
  if (v === InvitationStatus.REVOKED) return InvitationStatus.REVOKED;
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    if (!user.tenantId) throw new RepositoryError("Tenant not configured", 400);

    await InvitationRepository.assertTenantAdmin({
      userId: user.id,
      tenantId: user.tenantId,
      userRole: user.role ?? null,
    });

    const body = (await request.json()) as {
      email: string;
      role: EmployeeRole;
      firstName?: string;
      lastName?: string;
    };

    if (!body?.email) throw new RepositoryError("Email is required", 400);

    const { invitation, token, invitationUrl, organizationName } = await InvitationRepository.createInvitation({
      tenantId: user.tenantId,
      inviterUserId: user.id,
      inviterName: user.name,
      email: body.email,
      role: asEmployeeRole(body.role),
      firstName: body.firstName,
      lastName: body.lastName,
    });

    // Best-effort email.
    await emailService.sendInvitationEmail(invitation.email, {
      inviteeName:
        [invitation.firstName, invitation.lastName].filter(Boolean).join(" ") || invitation.email,
      inviterName: user.name,
      organizationName,
      role: String(invitation.role),
      invitationUrl,
      expiresAt: new Date(invitation.expiresAt),
    });

    const safeInvitation = { ...invitation, tokenHash: undefined } as unknown;

    return NextResponse.json(
      ResponseFactory.createDataResponse(
        {
          invitation: safeInvitation,
          token,
          invitationUrl,
        },
        "Invitation created"
      ),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof RepositoryError) {
      return NextResponse.json(ResponseFactory.createErrorResponse("Error creating invitation", error.message), {
        status: error.status,
      });
    }
    return NextResponse.json(ResponseFactory.createErrorResponse("Error creating invitation", String(error)), { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    if (!user.tenantId) throw new RepositoryError("Tenant not configured", 400);

    await InvitationRepository.assertTenantAdmin({
      userId: user.id,
      tenantId: user.tenantId,
      userRole: user.role ?? null,
    });

    const url = new URL(request.url);
    const status = asInvitationStatus(url.searchParams.get("status"));
    const page = url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined;
    const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;
    const search = url.searchParams.get("search") ?? undefined;

    const result = await InvitationRepository.listInvitations({
      tenantId: user.tenantId,
      status,
      page,
      limit,
      search,
    });

    return NextResponse.json(
      ResponseFactory.createListResponse(result.data, result.pagination, "Invitations fetched"),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof RepositoryError) {
      return NextResponse.json(ResponseFactory.createErrorResponse("Error fetching invitations", error.message), {
        status: error.status,
      });
    }
    return NextResponse.json(ResponseFactory.createErrorResponse("Error fetching invitations", String(error)), { status: 500 });
  }
}
