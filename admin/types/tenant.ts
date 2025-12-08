// ============================================================================
// TENANT TYPES - Matching core types for consistency
// ============================================================================

export enum TenantStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
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

export interface BaseEntityDTO {
    id: string;
    metadata?: Record<string, any>;
    isActive: boolean;
    deleted: boolean;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface TenantDTO extends BaseEntityDTO {
    uuid: string;
    status: TenantStatus;
    requestedAt: Date;
    approvedAt?: Date | null;
    approvedBy?: string | null;
    rejectedAt?: Date | null;
    rejectedBy?: string | null;
    rejectionReason?: string | null;
    subscriptionTier?: SubscriptionTier;
    maxEmployees?: number;
    maxProjects?: number;
    subscriptionExpiresAt?: Date | null;
    // Related data
    organization?: OrganizationDTO;
    onboardingRequest?: OnboardingRequestDTO;
}

export interface OrganizationDTO extends BaseEntityDTO {
    tenantId: string;
    name: string;
    description?: string | null;
    logoUrl?: string | null;
    website?: string | null;
    industry?: string | null;
    size?: OrganizationSize | null;
    preferences?: Record<string, any>;
}

export interface OnboardingRequestDTO extends BaseEntityDTO {
    tenantId: string;
    description?: string | null;
    companyDetails?: Record<string, any>;
    businessType?: string | null;
    expectedUsers?: number | null;
}

// ============================================================================
// REQUEST DTOs
// ============================================================================

export interface CreateTenantDTO {
    tenant: {
        id: string; // Email or unique identifier
        metadata?: Record<string, any>;
        isActive?: boolean;
    };
    organization: {
        name: string;
        description?: string;
        logoUrl?: string;
        website?: string;
        industry?: string;
        size?: OrganizationSize;
        preferences?: Record<string, any>;
        isActive?: boolean;
        metadata?: Record<string, any>;
    };
    onboardingRequest?: {
        description?: string;
        companyDetails?: Record<string, any>;
        businessType?: string;
        expectedUsers?: number;
        isActive?: boolean;
        metadata?: Record<string, any>;
    };
    user: {
        name: string;
        email: string;
        image?: string;
        password?: string; // Optional if using OAuth
    };
}

export interface ApproveTenantDTO {
    tenantId: string;
    approvedBy: string;
    subscriptionTier?: SubscriptionTier;
    maxEmployees?: number;
    maxProjects?: number;
}

export interface RejectTenantDTO {
    tenantId: string;
    rejectedBy: string;
    rejectionReason: string;
}
