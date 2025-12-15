import { db } from '@/db';
import { ResponseFactory } from "@/types/response";
import { AdminCreateTenantDTO, TenantStatus, UserRole, UserStatus } from "@/types";
import { employees, organizations, tenants } from '../schema';
import { auth } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';

export class RepositoryError extends Error {
    status: number;
    constructor(message: string, status = 500) {
        super(message);
        this.status = status;
        this.name = "RepositoryError";
    }
}

export class AdminTenantRepository {
    /**
     * Create a new tenant along with its organization and admin user
     */
    static async createTenant({ tenant, organization, user }: AdminCreateTenantDTO) {
        try {

            // 1️⃣ Create user via Better Auth first
            const authResult = await auth.api.signUpEmail({
                body: {
                    name: user.name,
                    email: user.email,
                    password: "P@ssw0rd", // Temporary password, should be changed later
                }
            });

            if (!authResult?.user?.id) {
                console.log("[+] Better Auth error: failed to create user")
                throw new RepositoryError("Failed to create tenant owner user", 500);
            }

            const tenantOwnerId = authResult.user.id;

            // 2️⃣ Transaction: tenant + org + employee
            const result = await db.transaction(async (tx) => {
                const newTenant = await tx.insert(tenants).values({
                    id: tenant.id,
                }).returning();

                const newOrganization = await tx.insert(organizations).values({
                    tenantId: tenant.id,
                    name: organization.name,
                    legalName: organization.legalName,
                    country: organization.country,
                    address: organization.address,
                    phone: organization.phone,
                    logoUrl: organization.logoUrl,
                    website: organization.website,
                }).returning();

                const newEmployee = await tx.insert(employees).values({
                    tenantId: tenant.id,
                    userId: tenantOwnerId,
                    role: UserRole.TENANT_ADMIN,
                    status: UserStatus.ACTIVE,
                    joinedAt: new Date()
                }).returning();

                return {
                    tenant: newTenant[0],
                    organization: newOrganization[0],
                    employee: newEmployee[0],
                    user: authResult.user
                };
            });

            return ResponseFactory.createDataResponse(
                result,
                "Tenant, Organization, and Owner created successfully"
            );

        } catch (error) {
            console.log("Error creating tenant:", error);
            throw new RepositoryError("Failed to create tenant");
        }
    }

    /**
     * Retrieve all tenants
     */
    static async getTenants() {
        try {
            const tenantsList = await db.query.tenants.findMany({
                with: {
                    organization: true,
                },
                where: eq(tenants.deleted, false),
            });
            return ResponseFactory.createListResponse(tenantsList, {
                page: 1,
                limit: 20,
                total: tenantsList.length,
                totalPages: 1
            }
            );
        } catch (error) {
            console.error("Error fetching tenants:", error);
            throw new RepositoryError("Failed to retrieve tenants");
        }
    }

    /**
     * Approve a tenant by admin
     */
    static async approveTenant(tenantId: string, userId: string, reason?: string) {
        try {
            // find the tenant
            const tenant = await db.query.tenants.findFirst({
                where: and(
                    eq(tenants.id, tenantId),
                    eq(tenants.status, TenantStatus.PENDING)
                )
            });

            if (!tenant) {
                throw new RepositoryError("Tenant not found or already approved", 404);
            }

            // approve the tenant
            const moderationLog = [
                ...tenant.moderationLog,
                {
                    action: TenantStatus.APPROVED,
                    reason: reason || "",
                    by: userId,
                    at: new Date().toISOString()
                }
            ]
            const result = await db.update(tenants)
                .set({ status: TenantStatus.APPROVED, moderationLog })
                .where(eq(tenants.id, tenantId));

            if (result.rowCount === 0) {
                throw new RepositoryError("Failed to approve tenant", 500);
            }

            return ResponseFactory.createSuccessResponse("Tenant approved successfully");

        } catch (error) {
            console.error("Error approving tenant:", error);
            throw new RepositoryError("Failed to approve tenant");
        }
    }
}