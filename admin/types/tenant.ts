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

interface ModerationLog {
    action: TenantStatus;
    by: string;
    reason?: string;
    at: string;
}

export interface TenantDTO extends BaseEntityDTO {
    uuid: string;
    status: TenantStatus;
    organization?: OrganizationDTO;
    onboardingRequest?: OnboardingRequestDTO;
    ownerId: string | null;
    moderationLog: ModerationLog[];
    createdBy: string | null;
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

// ============================================================================
// REQUEST DTOs
// ============================================================================

export interface NewTenantDTO {
    id: string;
    uuid?: string | undefined;
    status?: string | undefined;
    metadata?: unknown;
    deleted?: boolean | undefined;
    deletedAt?: Date | null | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    ownerId?: string | null | undefined;
    moderationLog?: {
        action: TenantStatus;
        by: string;
        reason?: string;
        at: string;
    }[] | undefined;
    createdBy?: string | null | undefined;
}

export interface NewOrganizationDTO {
    name: string;
    tenantId: string;
    metadata?: unknown;
    deleted?: boolean | undefined;
    deletedAt?: Date | null | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    legalName?: string | null | undefined;
    country?: string | null | undefined;
    address?: unknown;
    phone?: string | null | undefined;
    logoUrl?: string | null | undefined;
    website?: string | null | undefined;
    preferences?: unknown;
}

export interface NewUserDTO {
    id?: string;
    name: string;
    email: string;
    tenantId?: string | null | undefined;
    emailVerified?: boolean | undefined;
    image?: string | null | undefined;
    userType?: string | undefined;
    role?: string | undefined;
    approved?: boolean | undefined;
    metadata?: unknown;
    deleted?: boolean | undefined;
    deletedAt?: Date | null | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}

export interface CreateTenantDTO {
    tenant: NewTenantDTO;
    organization: NewOrganizationDTO;
    user: NewUserDTO;
}

export interface ApproveTenantDTO {
    tenantId: string;
    reason: string;
}

export interface RejectTenantDTO {
    tenantId: string;
    reason: string;
}
