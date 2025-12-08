/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateTenant } from "@/types/entityDTO";
import { db } from "../index";
import { invitationsTable, onboardingRequestsTable, organizationsTable, tenantsTable, userTable } from "../schema";
import { UserType } from "@/types/entityEnums";
import { ResponseFactory } from "@/types/response";
import { SearchRequest } from "@/types/request";
import { and, asc, count, eq, ilike } from "drizzle-orm";
import crypto from "crypto";
import { emailService } from "@/lib/email.service";

export class RepositoryError extends Error {
    status: number;
    constructor(message: string, status = 500) {
        super(message);
        this.status = status;
        this.name = "RepositoryError";
    }
}

export async function createTenant(tenantData: CreateTenant) {

    console.log("Creating tenant with data:", tenantData);

    try {

        const result = await db.transaction(async (tx) => {

            const tenantPayload = tenantData.tenant;
            const orgPayload = tenantData.organization;
            const onboardPayload = tenantData.onboardingRequest;
            const userPayload = tenantData.user;

            const [tenant] = await tx.insert(tenantsTable).values({
                id: tenantPayload.id,
                requestedAt: new Date(),
                isActive: tenantPayload.isActive ?? true,
                deleted: false,
                metadata: tenantPayload.metadata || {},
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            }).returning();

            const [organization] = await tx.insert(organizationsTable).values({
                tenantId: tenant.id,
                name: orgPayload.name,
                description: orgPayload.description || "",
                logoUrl: orgPayload.logoUrl,
                preferences: orgPayload.preferences || {},
                isActive: orgPayload.isActive ?? true,
                deleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                metadata: orgPayload.metadata || {},
            }).returning();

            const [onboardingRequest] = await tx.insert(onboardingRequestsTable).values({
                tenantId: tenant.id,
                description: onboardPayload?.description || `${orgPayload.name} requested onboarding`,
                businessType: onboardPayload?.businessType,
                expectedUsers: onboardPayload?.expectedUsers,
                companyDetails: onboardPayload?.companyDetails,
                isActive: onboardPayload?.isActive ?? true,
                deleted: false,
                metadata: {
                    ...onboardPayload?.metadata,
                    ownerName: userPayload.name,
                    ownerEmail: userPayload.email,
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            }).returning();

            // Always create an invitation for the tenant owner
            let user = null;
            let invitation = null;
            if (userPayload.email) {
                // Check if user already exists
                const existingUser = await tx.query.userTable.findFirst({
                    where: eq(userTable.email, userPayload.email),
                });

                if (existingUser) {
                    // Update existing user with tenant info
                    [user] = await tx.update(userTable)
                        .set({
                            tenantId: tenant.id,
                            organizationId: organization.id,
                            userType: UserType.TENANT,
                            updatedAt: new Date(),
                        })
                        .where(eq(userTable.id, existingUser.id))
                        .returning();
                } else {
                    // User will be created by Better Auth during signup
                    user = {
                        email: userPayload.email,
                        name: userPayload.name,
                        message: 'User will be created during signup',
                    };
                }

                // Get a system admin user to use as inviter
                const systemAdmin = await tx.query.userTable.findFirst({
                    where: eq(userTable.userType, UserType.ADMIN),
                });

                if (systemAdmin) {
                    // Create invitation for tenant owner
                    const invitationToken = crypto.randomBytes(32).toString('hex');
                    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days for tenant setup
                    
                    [invitation] = await tx.insert(invitationsTable).values({
                        tenantId: tenant.id,
                        organizationId: organization.id,
                        email: userPayload.email,
                        role: 'ADMIN', // Tenant owner gets ADMIN role
                        invitedBy: systemAdmin.id,
                        invitationToken,
                        expiresAt,
                        status: 'PENDING',
                        isActive: true,
                        deleted: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        deletedAt: null,
                        metadata: {
                            isTenantOwner: true,
                            organizationName: organization.name,
                        },
                    }).returning();

                    // Send invitation email to tenant owner
                    try {
                        const invitationUrl = `${process.env.NEXT_PUBLIC_PM_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/accept-invitation?token=${invitationToken}`;
                        
                        const emailSent = await emailService.sendInvitationEmail(userPayload.email, {
                            inviteeName: userPayload.name,
                            inviterName: 'System Admin',
                            organizationName: organization.name,
                            role: 'Tenant Owner (Admin)',
                            invitationUrl,
                            expiresAt,
                        });
                        
                        if (emailSent) {
                            console.log(`✅ Invitation email sent to tenant owner: ${userPayload.email}`);
                        } else {
                            console.warn(`⚠️ Email not sent (service not configured). Invitation created for: ${userPayload.email}`);
                            console.log(`🔗 Invitation URL (for testing): ${invitationUrl}`);
                            console.log(`🎫 Invitation Token: ${invitationToken}`);
                        }
                    } catch (emailError) {
                        console.error('Failed to send tenant owner invitation email:', emailError);
                        const invitationUrl = `${process.env.NEXT_PUBLIC_PM_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/accept-invitation?token=${invitationToken}`;
                        console.log(`🔗 Invitation URL (for testing): ${invitationUrl}`);
                        console.log(`🎫 Invitation Token: ${invitationToken}`);
                        // Don't fail the transaction if email fails
                    }
                } else {
                    console.warn('⚠️ No system admin found. Invitation will be created after admin approval.');
                }
            }

            return ResponseFactory.createDataResponse({ tenant, organization, onboardingRequest, user, invitation });
        });

        return result;

    } catch (error: any) {
        console.error("Error creating tenant in tenant.repository.ts:", error);

        // Handle Postgres unique violation (duplicate key)
        const pgCode = error?.cause?.code || error?.code;
        const message = error instanceof Error ? error.message : String(error);

        if (pgCode === '23505' || /duplicate key|already exists/i.test(message)) {
            // try to extract detail if available: e.g., 'Key (email)=(...) already exists.'
            const detail = error?.cause?.detail || error?.detail || message;
            throw new RepositoryError(detail || 'Duplicate resource', 409);
        }

        throw new RepositoryError(message || 'Error creating tenant', 500);
    }
}

export async function getTenantById(tenantId: string) {
    try {
        const tenant = await db.query.tenantsTable.findFirst({
            where: (t, { eq, and }) => and(
                eq(t.id, tenantId),
                eq(t.deleted, false)
            ),
            with: {
                organization: true,
                onboardingRequest: true,
            },
        });

        return ResponseFactory.createDataResponse(tenant);
    } catch (error: any) {
        console.error("Error fetching tenant by ID in tenant.repository.ts:", error);
        const message = error instanceof Error ? error.message : String(error);
        throw new RepositoryError(message || 'Error fetching tenant', 500);
    }
}

export async function getTenants(query: SearchRequest) {
    const page = query.page;
    const limit = query.limit;
    const search = query.search?.trim() ?? "";

    try {
        const whereFilter = and(
            eq(tenantsTable.deleted, false),
            search ? ilike(tenantsTable.id, `%${search}%`) : undefined
        );

        // Fetch paginated data with relations
        const tenants = await db.query.tenantsTable.findMany({
            where: whereFilter,
            limit,
            offset: (page - 1) * limit,
            orderBy: (t) => [asc(t.createdAt)],
            with: {
                organization: true,
                onboardingRequest: true,
            },
        });

        // Count with SAME filter
        const [{ count: total }] = await db
            .select({ count: count() })
            .from(tenantsTable)
            .where(whereFilter);

        return ResponseFactory.createListResponse(tenants, {
            page,
            totalPages: Math.ceil(total / limit),
            limit,
            total,
        });
    } catch (error: any) {
        console.error("Error fetching tenants:", error);
        throw new RepositoryError(error?.message || "Error fetching tenants", 500);
    }
}

export async function approveTenant(tenantId: string, approvedBy?: string, subscriptionTier?: string, maxEmployees?: number, maxProjects?: number) {
    try {
        // Find the tenant first with relations
        const tenant = await db.query.tenantsTable.findFirst({
            where: (t, { eq, and }) => and(
                eq(t.id, tenantId),
                eq(t.deleted, false)
            ),
            with: {
                organization: true,
                onboardingRequest: true,
            },
        });

        if (!tenant) {
            throw new RepositoryError(`Tenant with id=${tenantId} not found`, 404);
        }

        // Update tenant status
        const [updated] = await db.update(tenantsTable)
            .set({
                status: 'APPROVED',
                approvedAt: new Date(),
                approvedBy: approvedBy || null,
                subscriptionTier: subscriptionTier || 'FREE',
                maxEmployees: maxEmployees || 5,
                maxProjects: maxProjects || 10,
                updatedAt: new Date(),
            })
            .where(and(eq(tenantsTable.id, tenantId), eq(tenantsTable.deleted, false)))
            .returning();

        if (!updated) {
            throw new RepositoryError('Failed to update tenant', 400);
        }

        // Check if invitation already exists for tenant owner
        const existingInvitation = await db.query.invitationsTable.findFirst({
            where: (inv, { eq, and }) => and(
                eq(inv.tenantId, tenantId),
                eq(inv.email, tenantId), // tenant.id is the owner's email
                eq(inv.status, 'PENDING')
            ),
        });

        // If no invitation exists, create one now that tenant is approved
        if (!existingInvitation && tenant.organization) {
            try {
                // Get owner details from onboarding request metadata
                const metadata = tenant.onboardingRequest?.metadata as Record<string, any> | undefined;
                const ownerName = metadata?.ownerName || tenant.organization.name;
                const ownerEmail = metadata?.ownerEmail || tenant.id;

                const invitationToken = crypto.randomBytes(32).toString('hex');
                const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

                await db.insert(invitationsTable).values({
                    tenantId: tenant.id,
                    organizationId: tenant.organization.id,
                    email: ownerEmail,
                    role: 'ADMIN',
                    invitedBy: approvedBy || 'system',
                    invitationToken,
                    expiresAt,
                    status: 'PENDING',
                    isActive: true,
                    deleted: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                    metadata: {
                        isTenantOwner: true,
                        organizationName: tenant.organization.name,
                        approvedAt: new Date(),
                    },
                }).returning();

                // Send invitation email
                const invitationUrl = `${process.env.NEXT_PUBLIC_PM_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/accept-invitation?token=${invitationToken}`;
                
                const emailSent = await emailService.sendInvitationEmail(ownerEmail, {
                    inviteeName: ownerName,
                    inviterName: 'System Admin',
                    organizationName: tenant.organization.name,
                    role: 'Tenant Owner (Admin)',
                    invitationUrl,
                    expiresAt,
                });

                if (emailSent) {
                    console.log(`✅ Tenant approved and invitation sent to: ${ownerEmail}`);
                } else {
                    console.warn(`⚠️ Tenant approved but email not sent (service not configured).`);
                    console.log(`🔗 Invitation URL (for testing): ${invitationUrl}`);
                    console.log(`🎫 Invitation Token: ${invitationToken}`);
                }
            } catch (inviteError) {
                console.error('Failed to create/send invitation after approval:', inviteError);
                // Don't fail approval if invitation fails
            }
        } else if (existingInvitation) {
            console.log(`✅ Tenant approved. Invitation already exists for: ${tenant.id}`);
        }

        return ResponseFactory.createDataResponse(updated);
    } catch (error: any) {
        console.error('Error approving tenant:', error);
        const message = error instanceof Error ? error.message : String(error);
        if (error instanceof RepositoryError) throw error;
        throw new RepositoryError(message || 'Error approving tenant', 500);
    }
}

export async function rejectTenant(tenantId: string, rejectedBy: string, rejectionReason: string) {
    try {
        // find the tenant first
        const tenant = await db.query.tenantsTable.findFirst({
            where: (t, { eq, and }) => and(
                eq(t.id, tenantId),
                eq(t.deleted, false)
            )
        });

        if (!tenant) {
            throw new RepositoryError(`Tenant with id=${tenantId} not found`, 404);
        }

        const [updated] = await db.update(tenantsTable)
            .set({
                status: 'REJECTED',
                rejectedAt: new Date(),
                rejectedBy: rejectedBy,
                rejectionReason: rejectionReason,
                updatedAt: new Date(),
            })
            .where(and(eq(tenantsTable.id, tenantId), eq(tenantsTable.deleted, false)))
            .returning();

        if (!updated) {
            throw new RepositoryError('Failed to update tenant', 400);
        }

        return ResponseFactory.createDataResponse(updated);
    } catch (error: any) {
        console.error('Error rejecting tenant:', error);
        const message = error instanceof Error ? error.message : String(error);
        if (error instanceof RepositoryError) throw error;
        throw new RepositoryError(message || 'Error rejecting tenant', 500);
    }
}

export async function deleteTenant(tenantId: string) {
    try {
        const result = await db.transaction(async (tx) => {
            // soft-delete tenant
            const [tenant] = await tx.update(tenantsTable)
                .set({ deleted: true, deletedAt: new Date(), isActive: false, updatedAt: new Date() })
                .where(and(eq(tenantsTable.id, tenantId), eq(tenantsTable.deleted, false)))
                .returning();

            if (!tenant) {
                throw new RepositoryError('Tenant not found', 404);
            }

            // soft-delete related organizations, users, onboarding requests
            await tx.update(organizationsTable)
                .set({ deleted: true, deletedAt: new Date(), isActive: false, updatedAt: new Date() })
                .where(eq(organizationsTable.tenantId, tenantId));

            // Note: userTable doesn't have deleted/deletedAt fields, managed by Better Auth
            // We just set tenantId to null to dissociate users
            // await tx.update(userTable)
            //     .set({ tenantId: null, updatedAt: new Date() })
            //     .where(eq(userTable.tenantId, tenantId));

            await tx.update(onboardingRequestsTable)
                .set({ deleted: true, deletedAt: new Date(), isActive: false, updatedAt: new Date() })
                .where(eq(onboardingRequestsTable.tenantId, tenantId));

            return ResponseFactory.createDataResponse({ message: 'Tenant deleted' });
        });

        return result;
    } catch (error: any) {
        console.error('Error deleting tenant:', error);
        if (error instanceof RepositoryError) throw error;
        throw new RepositoryError(error?.message || 'Error deleting tenant', 500);
    }
}

export async function recoverTenant(tenantId: string) {
    try {
        const result = await db.transaction(async (tx) => {
            // restore tenant
            const [tenant] = await tx.update(tenantsTable)
                .set({ deleted: false, deletedAt: null, isActive: true, updatedAt: new Date() })
                .where(and(eq(tenantsTable.id, tenantId), eq(tenantsTable.deleted, true)))
                .returning();

            if (!tenant) {
                throw new RepositoryError('Tenant not found or not deleted', 404);
            }

            // restore related organizations, users, onboarding requests
            await tx.update(organizationsTable)
                .set({ deleted: false, deletedAt: null, isActive: true, updatedAt: new Date() })
                .where(eq(organizationsTable.tenantId, tenantId));

            // Note: userTable doesn't have deleted/deletedAt fields, managed by Better Auth
            // We could re-link users if needed
            // await tx.update(userTable)
            //     .set({ tenantId: tenantId, updatedAt: new Date() })
            //     .where(eq(userTable.tenantId, tenantId));

            await tx.update(onboardingRequestsTable)
                .set({ deleted: false, deletedAt: null, isActive: true, updatedAt: new Date() })
                .where(eq(onboardingRequestsTable.tenantId, tenantId));

            return ResponseFactory.createDataResponse({ message: 'Tenant recovered' });
        });

        return result;
    } catch (error: any) {
        console.error('Error recovering tenant:', error);
        if (error instanceof RepositoryError) throw error;
        throw new RepositoryError(error?.message || 'Error recovering tenant', 500);
    }
}

export async function permanentlyDeleteTenant(tenantId: string) {
    try {
        const result = await db.transaction(async (tx) => {
            // ensure tenant exists
            const existing = await tx.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId));
            if (!existing || existing.length === 0) {
                throw new RepositoryError('Tenant not found', 404);
            }

            // delete related rows first to avoid FK constraints
            // Delete users associated with this tenant
            await tx.delete(userTable).where(eq(userTable.tenantId, tenantId));
            await tx.delete(onboardingRequestsTable).where(eq(onboardingRequestsTable.tenantId, tenantId));
            await tx.delete(organizationsTable).where(eq(organizationsTable.tenantId, tenantId));

            // delete tenant
            await tx.delete(tenantsTable).where(eq(tenantsTable.id, tenantId));

            return ResponseFactory.createDataResponse({ message: 'Tenant permanently deleted' });
        });

        return result;
    } catch (error: any) {
        console.error('Error hard-deleting tenant:', error);
        if (error instanceof RepositoryError) throw error;
        throw new RepositoryError(error?.message || 'Error permanently deleting tenant', 500);
    }
}

