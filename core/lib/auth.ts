import { betterAuth, BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { 
  userTable, 
  sessionTable, 
  accountTable, 
  verificationTable 
} from "@/db/schema";
import { UserType } from "@/types/entityEnums";

/**
 * Better Auth Configuration for Multi-Tenant SaaS
 * 
 * Architecture:
 * - Super Admins/Admins: Email/Password only (userType: ADMIN)
 * - Tenant Owners: Social auth (Google, GitHub) or Email/Password (userType: TENANT)
 * - Employees: Invited by tenant owners, can use social auth (userType: EMPLOYEE/MANAGER)
 * 
 * Auth Flow:
 * 1. Super Admin logs in with email/password to access Admin Panel
 * 2. Tenant signs up via social auth or email, status = PENDING
 * 3. Tenant can login but features are limited until APPROVED
 * 4. Super Admin approves tenant in Admin Panel
 * 5. Tenant invites employees who can accept and signup
 */

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: userTable,
      session: sessionTable,
      account: accountTable,
      verification: verificationTable,
    },
  }),
  
  // Email/Password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  
  // Social authentication providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      enabled: !!process.env.GITHUB_CLIENT_ID,
    },
  },
  
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 2, // 2 days
    updateAge: 60 * 60 * 6, // Update session every 6 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  
  // Advanced configuration
  advanced: {
    cookiePrefix: "multi_tenant_pm",
    crossSubDomainCookies: {
      enabled: false, // Enable if using subdomains for tenants
    },
  },
  
  // Trust proxy for deployment
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    process.env.PM_APP_URL || "http://localhost:3001", // Project Management App
    process.env.ADMIN_APP_URL || "http://localhost:3002", // Admin Panel App
  ],
});

/**
 * Helper function to check if user is an admin
 */
export function isAdmin(user: { userType?: string | null }): boolean {
  return user.userType === UserType.ADMIN;
}

/**
 * Helper function to check if user is a tenant owner
 */
export function isTenantOwner(user: { userType?: string | null }): boolean {
  return user.userType === UserType.TENANT;
}

/**
 * Helper function to check if user is an employee
 */
export function isEmployee(user: { userType?: string | null }): boolean {
  return user.userType === UserType.EMPLOYEE;
}

/**
 * Helper function to get user's tenant ID
 */
export function getUserTenantId(user: { tenantId?: string | null }): string | null {
  return user.tenantId || null;
}
