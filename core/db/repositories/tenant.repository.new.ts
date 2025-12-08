/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateTenantDTO, ApproveTenantDTO, RejectTenantDTO } from "@/types/entityDTO";
import { db } from "../index";
import { 
    tenantsTable, 
    organizationsTable, 
    onboardingRequestsTable, 
    userTable 
} from "../schema";
import { ResponseFactory } from "@/types/response";
import { SearchRequest } from "@/types/request";
import { and, count, eq, ilike, asc } from "drizzle-orm";
import { TenantStatus, UserType } from "@/types/entityEnums";

export class RepositoryError extends Error {
    status: number;
    constructor(message: string, status = 500) {
        super(message);
        this.status = status;
        this.name = "RepositoryError";
    }
}

/**
 * Create a new tenant with organization and user
 * This is called after the user signs up via Better Auth
 */
export async function createTenant(tenantData: CreateTenantDTO) {
    console.log("Creating tenant with data:", tenantData);

    try {
        const result = await db.transaction(async (tx) => {
            const tenantPayload = tenantData.tenant;
            const orgPayload = tenantData.organization;
            const onboardPayload = tenantData.onboardingRequest;
            const userPayload = tenantData.user;

            // Create tenant
            const tenantResult = await tx.insert(tenantsTable).values({
                id: tenantPayload.id,
                requestedAt: new Date(),
                status: TenantStatus.PENDING,
                isActive: tenantPayload.isActive ?? true,
                deleted: false,
                metadata: tenantPayload.metadata || {},
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            }).returning() as Array<typeof tenantsTable.$inferSelect>;
            
            if (!tenantResult || tenantResult.length === 0) {
                throw new RepositoryError('Failed to create tenant', 500);
            }
            const tenant = tenantResult[0];

            // Create organization
            const orgResult = await tx.insert(organizationsTable).values({
                tenantId: tenant.id,
                name: orgPayload.name,
                description: orgPayload.description || null,
                logoUrl: orgPayload.logoUrl || null,
                website: orgPayload.website || null,
                industry: orgPayload.industry || null,
                size: orgPayload.size || null,
                preferences: orgPayload.preferences || {},
                isActive: orgPayload.isActive ?? true,
                deleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                metadata: orgPayload.metadata || {},
            }).returning() as Array<typeof organizationsTable.$inferSelect>;
            
            if (!orgResult || orgResult.length === 0) {
                throw new RepositoryError('Failed to create organization', 500);
            }
            const organization = orgResult[0];

            // Create onboarding request
            const onboardingResult = await tx.insert(onboardingRequestsTable).values({
                tenantId: tenant.id,
                description: onboardPayload?.description || `${orgPayload.name} requested onboarding`,
                companyDetails: onboardPayload?.companyDetails || {},
                businessType: onboardPayload?.businessType || null,
                expectedUsers: onboardPayload?.expectedUsers || null,
                isActive: onboardPayload?.isActive ?? true,
                deleted: false,
                metadata: onboardPayload?.metadata || {},
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            }).returning() as Array<typeof onboardingRequestsTable.$inferSelect>;
            
            if (!onboardingResult || onboardingResult.length === 0) {
                throw new RepositoryError('Failed to create onboarding request', 500);
            }
            const onboardingRequest = onboardingResult[0];

            // Update the user record to link to tenant and organization
            const userResult = await tx.update(userTable)
                .set({
                    tenantId: tenant.id,
                    organizationId: organization.id,
                    userType: UserType.TENANT,
                    updatedAt: new Date(),
                })
                .where(eq(userTable.email, userPayload.email))
                .returning() as Array<typeof userTable.$inferSelect>;
            
            if (!userResult || userResult.length === 0) {
                throw new RepositoryError('User not found after signup', 404);
            }
            const user = userResult[0];

            return ResponseFactory.createDataResponse({ 
                tenant, 
                organization, 
                onboardingRequest, 
                user 
            });
        });

        return result;

    } catch (error: any) {
        console.error("Error creating tenant in tenant.repository.ts:", error);

        const pgCode = error?.cause?.code || error?.code;
        const message = error instanceof Error ? error.message : String(error);

        if (pgCode === '23505' || /duplicate key|already exists/i.test(message)) {
            const detail = error?.cause?.detail || error?.detail || message;
            throw new RepositoryError(detail || 'Duplicate resource', 409);
        }

        throw new RepositoryError(message || 'Error creating tenant', 500);
    }
}

/**
 * Get tenant by ID
 */
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
            }
        });

        return ResponseFactory.createDataResponse(tenant);
    } catch (error: any) {
        console.error("Error fetching tenant by ID:", error);
        const message = error instanceof Error ? error.message : String(error);
        throw new RepositoryError(message || 'Error fetching tenant', 500);
    }
}

/**
 * Get all tenants with pagination and search
 */
export async function getTenants(query: SearchRequest) {
    const page = query.page;
    const limit = query.limit;
    const search = query.search?.trim() ?? "";
    const status = query.status as TenantStatus | undefined;

    try {
        const conditions = [
            eq(tenantsTable.deleted, false),
            search ? ilike(tenantsTable.id, `%${search}%`) : undefined,
            status ? eq(tenantsTable.status, status) : undefined,
        ].filter(Boolean);

        const whereFilter = conditions.length > 0 ? and(...conditions) : undefined;

        // Fetch paginated data
        const tenants = await db.query.tenantsTable.findMany({
            where: whereFilter,
            limit,
            offset: (page - 1) * limit,
            orderBy: (t) => [asc(t.createdAt)],
            with: {
                organization: true,
            }
        });

        // Count total
        const [{ count: total }] = await db
            .select({ count: count() })
            .from(tenantsTable)
            .where(whereFilter);

        return ResponseFactory.createDataListResponse(
            tenants,
            total,
            page,
            limit,
        );
    } catch (error: any) {
        console.error("Error fetching tenants:", error);
        const message = error instanceof Error ? error.message : String(error);
        throw new RepositoryError(message || 'Error fetching tenants', 500);
    }
}

/**
 * Approve a tenant
 */
export async function approveTenant(data: ApproveTenantDTO) {
    try {
        const tenantResult = await db.update(tenantsTable)
            .set({
                status: TenantStatus.APPROVED,
                approvedAt: new Date(),
                approvedBy: data.approvedBy,
                subscriptionTier: data.subscriptionTier,
                maxEmployees: data.maxEmployees,
                maxProjects: data.maxProjects,
                updatedAt: new Date(),
            })
            .where(and(
                eq(tenantsTable.id, data.tenantId),
                eq(tenantsTable.deleted, false)
            ))
            .returning() as Array<typeof tenantsTable.$inferSelect>;

        if (!tenantResult || tenantResult.length === 0) {
            throw new RepositoryError('Tenant not found', 404);
        }
        const tenant = tenantResult[0];

        // Get tenant user and organization for email
        const tenantUser = await db.query.userTable.findFirst({
            where: and(
                eq(userTable.tenantId, tenant.id),
                eq(userTable.userType, UserType.TENANT)
            ),
        });

        const organization = await db.query.organizationsTable.findFirst({
            where: eq(organizationsTable.tenantId, tenant.id),
        });

        // Send approval email
        if (tenantUser && organization) {
            const { emailService } = await import('@/lib/email.service');
            await emailService.sendTenantApprovalEmail(tenantUser.email, {
                tenantName: tenantUser.name,
                organizationName: organization.name,
                subscriptionTier: data.subscriptionTier || 'FREE',
                loginUrl: process.env.PM_APP_URL || 'http://localhost:3001',
            });
        }

        return ResponseFactory.createDataResponse(tenant);
    } catch (error: any) {
        console.error("Error approving tenant:", error);
        const message = error instanceof Error ? error.message : String(error);
        throw new RepositoryError(message || 'Error approving tenant', 500);
    }
}

/**
 * Reject a tenant
 */
export async function rejectTenant(data: RejectTenantDTO) {
    try {
        const tenantResult = await db.update(tenantsTable)
            .set({
                status: TenantStatus.REJECTED,
                rejectedAt: new Date(),
                rejectedBy: data.rejectedBy,
                rejectionReason: data.rejectionReason,
                updatedAt: new Date(),
            })
            .where(and(
                eq(tenantsTable.id, data.tenantId),
                eq(tenantsTable.deleted, false)
            ))
            .returning() as Array<typeof tenantsTable.$inferSelect>;

        if (!tenantResult || tenantResult.length === 0) {
            throw new RepositoryError('Tenant not found', 404);
        }
        const tenant = tenantResult[0];

        // Get tenant user and organization for email
        const tenantUser = await db.query.userTable.findFirst({
            where: and(
                eq(userTable.tenantId, tenant.id),
                eq(userTable.userType, UserType.TENANT)
            ),
        });

        const organization = await db.query.organizationsTable.findFirst({
            where: eq(organizationsTable.tenantId, tenant.id),
        });

        // Send rejection email
        if (tenantUser && organization) {
            const { emailService } = await import('@/lib/email.service');
            await emailService.sendTenantRejectionEmail(tenantUser.email, {
                tenantName: tenantUser.name,
                organizationName: organization.name,
                reason: data.rejectionReason,
                supportEmail: process.env.SUPPORT_EMAIL || 'support@company.com',
            });
        }

        return ResponseFactory.createDataResponse(tenant);
    } catch (error: any) {
        console.error("Error rejecting tenant:", error);
        const message = error instanceof Error ? error.message : String(error);
        throw new RepositoryError(message || 'Error rejecting tenant', 500);
    }
}

/**
 * Soft delete a tenant
 */
export async function softDeleteTenant(tenantId: string) {
    try {
        const tenantResult = await db.update(tenantsTable)
            .set({
                deleted: true,
                deletedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(and(
                eq(tenantsTable.id, tenantId),
                eq(tenantsTable.deleted, false)
            ))
            .returning() as Array<typeof tenantsTable.$inferSelect>;

        if (!tenantResult || tenantResult.length === 0) {
            throw new RepositoryError('Tenant not found', 404);
        }
        const tenant = tenantResult[0];

        return ResponseFactory.createDataResponse(tenant);
    } catch (error: any) {
        console.error("Error soft deleting tenant:", error);
        const message = error instanceof Error ? error.message : String(error);
        throw new RepositoryError(message || 'Error deleting tenant', 500);
    }
}

/**
 * Hard delete a tenant (permanently)
 */
export async function hardDeleteTenant(tenantId: string) {
    try {
        await db.delete(tenantsTable)
            .where(eq(tenantsTable.id, tenantId));

        return ResponseFactory.createSuccessResponse('Tenant permanently deleted');
    } catch (error: any) {
        console.error("Error hard deleting tenant:", error);
        const message = error instanceof Error ? error.message : String(error);
        throw new RepositoryError(message || 'Error permanently deleting tenant', 500);
    }
}

/**
 * Recover a soft-deleted tenant
 */
export async function recoverTenant(tenantId: string) {
    try {
        const tenantResult = await db.update(tenantsTable)
            .set({
                deleted: false,
                deletedAt: null,
                updatedAt: new Date(),
            })
            .where(eq(tenantsTable.id, tenantId))
            .returning() as Array<typeof tenantsTable.$inferSelect>;

        if (!tenantResult || tenantResult.length === 0) {
            throw new RepositoryError('Tenant not found', 404);
        }
        const tenant = tenantResult[0];

        return ResponseFactory.createDataResponse(tenant);
    } catch (error: any) {
        console.error("Error recovering tenant:", error);
        const message = error instanceof Error ? error.message : String(error);
        throw new RepositoryError(message || 'Error recovering tenant', 500);
    }
}
