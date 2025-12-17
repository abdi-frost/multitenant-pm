import { db } from '@/db';
import { ResponseFactory } from "@/types/response";
import { AdminCreateTenantDTO, TenantStatus, UserRole, UserStatus, UserType } from "@/types";
import { account, employees, organizations, session, tenants, users, verification } from '../schema';
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
    private static async cleanupAuthUser(params: { userId?: string | null; email?: string | null }) {
        const email = params.email ?? null;
        let userId = params.userId ?? null;

        // If we don't have an id, try to resolve it by email.
        if (!userId && email) {
            const existing = await db.query.users.findFirst({
                where: eq(users.email, email),
            });
            userId = existing?.id ?? null;
        }

        if (!userId) return;

        // Best-effort direct DB cleanup.
        try {
            await db.transaction(async (tx) => {
                // These tables reference users via FK (cascade may handle this),
                // but we delete explicitly to be safe across environments.
                await tx.delete(account).where(eq(account.userId, userId));
                await tx.delete(session).where(eq(session.userId, userId));

                // Verification rows are keyed by identifier (often email), not FK.
                if (email) {
                    await tx.delete(verification).where(eq(verification.identifier, email));
                }

                // In case something partially linked the user to SaaS tables.
                await tx.delete(employees).where(eq(employees.userId, userId));

                await tx.delete(users).where(eq(users.id, userId));
            });
        } catch (error) {
            console.error("Fallback auth user cleanup failed", error);
        }
    }

    /**
     * Create a new tenant along with its organization and admin user
     */
    static async createTenant({ tenant, organization, user }: AdminCreateTenantDTO) {
        let createdUserId: string | null = null;

        try {

            // 1️⃣ Create user via Better Auth first
            const authResult = await auth.api.signUpEmail({
                body: {
                    name: user.name,
                    email: user.email,
                    password: "P@ssw0rd", // Temporary password, should be changed later
                }
            });

            createdUserId = authResult?.user?.id ?? null;

            if (!createdUserId) {
                console.log("[+] Better Auth error: failed to create user")
                throw new RepositoryError("Failed to create tenant owner user", 500);
            }

            const tenantOwnerId = createdUserId;

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

                const updatedUser = await tx.update(users).set({
                    role: UserRole.TENANT_ADMIN,
                    userType: UserType.USER,
                    tenantId: tenant.id
                }).where(eq(users.id, tenantOwnerId)).returning();

                return {
                    tenant: newTenant[0],
                    organization: newOrganization[0],
                    employee: newEmployee[0],
                    user: updatedUser[0]
                };
            });

            return ResponseFactory.createDataResponse(
                result,
                "Tenant, Organization, and Owner created successfully"
            );

        } catch (error) {
            console.log("Error creating tenant:", error);

            // Also remove the signup user from Better Auth (and related auth tables) if needed.
            // This is best-effort cleanup and should never mask the original error.
            try {
                await AdminTenantRepository.cleanupAuthUser({
                    // If signUpEmail succeeded we should have an id; if not, fallback to email lookup.
                    userId: createdUserId,
                    email: user.email,
                });
            } catch {
                // ignore
            }

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
     * Retrieve a tenant by ID
     */
    static async getTenantById(tenantId: string) {
        try {
            const tenant = await db.query.tenants.findFirst({
                where: eq(tenants.id, tenantId),
                with: {
                    organization: true,
                    employees: {
                        with: {
                            user: true
                        }
                    }
                }
            });
            if (!tenant) {
                throw new RepositoryError("Tenant not found", 404);
            }
            return ResponseFactory.createDataResponse(tenant, "Tenant retrieved successfully");
        } catch (error) {
            console.error("Error fetching tenant by ID:", error);
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError("Failed to retrieve tenant");
        }
    }

    /**
     * Delete a tenant by ID
     */
    static async deleteTenant(tenantId: string) {
        try {
            const result = await db.delete(tenants)
                .where(and(
                    eq(tenants.id, tenantId),
                    eq(tenants.deleted, false)
                ));

            if (result.rowCount === 0) {
                throw new RepositoryError("Tenant not found or already deleted", 404);
            }
            return ResponseFactory.createSuccessResponse("Tenant deleted successfully");
        } catch (error) {
            console.error("Error deleting tenant:", error);
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError("Failed to delete tenant");
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