// ============================================================================
// TENANT & ORGANIZATION ENUMS
// ============================================================================

export enum TenantStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    SUSPENDED = 'SUSPENDED',
    REINSTATED = 'REINSTATED',
}

export enum SubscriptionTier {
    FREE = 'FREE',
    BASIC = 'BASIC',
    PREMIUM = 'PREMIUM',
    ENTERPRISE = 'ENTERPRISE',
}

export enum OrganizationSize {
    SMALL = 'SMALL',          // 1-50 employees
    MEDIUM = 'MEDIUM',        // 51-200 employees
    LARGE = 'LARGE',          // 201-1000 employees
    ENTERPRISE = 'ENTERPRISE', // 1000+ employees
}

// ============================================================================
// USER & AUTHENTICATION ENUMS
// ============================================================================

export enum UserType {
    ADMIN = 'ADMIN',             // System admin (seeded, email/password only)
    USER = 'USER',       // Regular user (tenant member)
}

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN', // System super admin
    ADMIN = 'ADMIN',             // lower system admin
    TENANT_ADMIN = 'TENANT_ADMIN',   // Tenant admin
    MEMBER = 'MEMBER',           // Regular tenant member
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    DEACTIVATED = 'DEACTIVATED',
    INVITED = 'INVITED',
}

export enum EmployeeRole {
    STAFF = 'STAFF',
    MANAGER = 'MANAGER',
    ADMIN = 'ADMIN', // Tenant admin
}

export enum OAuthProvider {
    GOOGLE = 'google',
    GITHUB = 'github',
    CREDENTIAL = 'credential', // Email/password
}

export enum InvitationStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    EXPIRED = 'EXPIRED',
    REVOKED = 'REVOKED',
}

// ============================================================================
// SYSTEM ENUMS
// ============================================================================

export enum DeleteType {
    SOFT = 'SOFT',
    HARD = 'HARD',
}

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    DEACTIVATED = 'DEACTIVATED',
}
