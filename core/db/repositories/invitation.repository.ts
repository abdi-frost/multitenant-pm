/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateInvitationDTO, AcceptInvitationDTO } from "@/types/entityDTO";
import { db } from "../index";
import { invitationsTable, userTable, organizationsTable } from "../schema";
import { ResponseFactory } from "@/types/response";
import { and, eq } from "drizzle-orm";
import { InvitationStatus, UserType } from "@/types/entityEnums";
import crypto from "crypto";

export class RepositoryError extends Error {
    status: number;
    constructor(message: string, status = 500) {
        super(message);
        this.status = status;
        this.name = "RepositoryError";
    }
}

/**
 * Create a new employee invitation
 */
export async function createInvitation(data: CreateInvitationDTO) {
    try {
        // Check if user already exists
        const existingUser = await db.query.userTable.findFirst({
            where: eq(userTable.email, data.email),
        });

        if (existingUser && existingUser.tenantId) {
            throw new RepositoryError('User already belongs to a tenant', 400);
        }

        // Generate invitation token
        const invitationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        const [invitation] = await db.insert(invitationsTable).values({
            tenantId: data.tenantId,
            organizationId: data.organizationId,
            email: data.email,
            role: data.role,
            invitedBy: data.invitedBy,
            invitationToken,
            expiresAt,
            status: InvitationStatus.PENDING,
            isActive: true,
            deleted: false,
            metadata: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }).returning();

        const invitationUrl = `${process.env.PM_APP_URL}/accept-invitation?token=${invitationToken}`;

        // Get inviter and organization details for email
        const inviter = await db.query.userTable.findFirst({
            where: eq(userTable.id, data.invitedBy),
        });

        const organization = await db.query.organizationsTable.findFirst({
            where: eq(organizationsTable.id, data.organizationId),
        });

        // Send invitation email
        if (inviter && organization) {
            const { emailService } = await import('@/lib/email.service');
            await emailService.sendInvitationEmail(data.email, {
                inviteeName: data.email.split('@')[0], // Use email prefix as name
                inviterName: inviter.name,
                organizationName: organization.name,
                role: data.role,
                invitationUrl,
                expiresAt,
            });
        }

        return ResponseFactory.createDataResponse({
            ...invitation,
            invitationUrl,
        });
    } catch (error: any) {
        console.error("Error creating invitation:", error);
        const message = error instanceof Error ? error.message : String(error);
        throw new RepositoryError(message || 'Error creating invitation', 500);
    }
}

/**
 * Accept an invitation and link user to tenant
 */
export async function acceptInvitation(data: AcceptInvitationDTO) {
    try {
        return await db.transaction(async (tx) => {
            // Find invitation
            const invitation = await tx.query.invitationsTable.findFirst({
                where: and(
                    eq(invitationsTable.invitationToken, data.invitationToken),
                    eq(invitationsTable.status, InvitationStatus.PENDING),
                    eq(invitationsTable.deleted, false)
                ),
            });

            if (!invitation) {
                throw new RepositoryError('Invalid or expired invitation', 404);
            }

            // Check if invitation expired
            if (new Date() > invitation.expiresAt) {
                await tx.update(invitationsTable)
                    .set({ status: InvitationStatus.EXPIRED, updatedAt: new Date() })
                    .where(eq(invitationsTable.id, invitation.id));
                throw new RepositoryError('Invitation has expired', 400);
            }

            // Check if user already exists
            let user = await tx.query.userTable.findFirst({
                where: eq(userTable.email, invitation.email),
            });

            if (!user) {
                // If user doesn't exist, they need to signup first via Better Auth
                throw new RepositoryError('Please signup first before accepting invitation', 400);
            }

            // Update user with tenant and organization info
            [user] = await tx.update(userTable)
                .set({
                    tenantId: invitation.tenantId,
                    organizationId: invitation.organizationId,
                    userType: UserType.EMPLOYEE,
                    role: invitation.role,
                    updatedAt: new Date(),
                })
                .where(eq(userTable.id, user.id))
                .returning();

            // Mark invitation as accepted
            await tx.update(invitationsTable)
                .set({
                    status: InvitationStatus.ACCEPTED,
                    acceptedAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(invitationsTable.id, invitation.id));

            return ResponseFactory.createDataResponse({
                user,
                invitation,
                message: 'Invitation accepted successfully',
            });
        });
    } catch (error: any) {
        console.error("Error accepting invitation:", error);
        const message = error instanceof Error ? error.message : String(error);
        throw new RepositoryError(message || 'Error accepting invitation', 500);
    }
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(token: string) {
    try {
        const invitation = await db.query.invitationsTable.findFirst({
            where: and(
                eq(invitationsTable.invitationToken, token),
                eq(invitationsTable.deleted, false)
            ),
            with: {
                tenant: true,
                organization: true,
            },
        });

        if (!invitation) {
            throw new RepositoryError('Invitation not found', 404);
        }

        return ResponseFactory.createDataResponse(invitation);
    } catch (error: any) {
        console.error("Error fetching invitation:", error);
        const message = error instanceof Error ? error.message : String(error);
        throw new RepositoryError(message || 'Error fetching invitation', 500);
    }
}

/**
 * Get all invitations for a tenant
 */
export async function getInvitationsByTenant(tenantId: string) {
    try {
        const invitations = await db.query.invitationsTable.findMany({
            where: and(
                eq(invitationsTable.tenantId, tenantId),
                eq(invitationsTable.deleted, false)
            ),
            orderBy: (inv, { desc }) => [desc(inv.createdAt)],
        });

        return ResponseFactory.createDataResponse(invitations);
    } catch (error: any) {
        console.error("Error fetching invitations:", error);
        const message = error instanceof Error ? error.message : String(error);
        throw new RepositoryError(message || 'Error fetching invitations', 500);
    }
}

/**
 * Revoke an invitation
 */
export async function revokeInvitation(invitationId: string) {
    try {
        const [invitation] = await db.update(invitationsTable)
            .set({
                status: InvitationStatus.REVOKED,
                updatedAt: new Date(),
            })
            .where(and(
                eq(invitationsTable.id, invitationId),
                eq(invitationsTable.status, InvitationStatus.PENDING)
            ))
            .returning();

        if (!invitation) {
            throw new RepositoryError('Invitation not found or already processed', 404);
        }

        return ResponseFactory.createDataResponse(invitation);
    } catch (error: any) {
        console.error("Error revoking invitation:", error);
        const message = error instanceof Error ? error.message : String(error);
        throw new RepositoryError(message || 'Error revoking invitation', 500);
    }
}
