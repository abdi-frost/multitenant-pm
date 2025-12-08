import { AdminRole, TenantStatus } from "./entityEnums";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BaseEntityDTO {
    id: string;
    metadata: Record<string, any>;
    isActive: boolean;
    deleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================================================
// TENANT & ORGANIZATION DTOs
// ============================================================================

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
// INVITATION DTOs
// ============================================================================

export interface InvitationDTO extends BaseEntityDTO {
    tenantId: string;
    organizationId: string;
    email: string;
    role: EmployeeRole;
    invitedBy: string;
    invitationToken: string;
    expiresAt: Date;
    acceptedAt?: Date | null;
    status: InvitationStatus;
}

// ============================================================================
// CREATE/UPDATE DTOs
// ============================================================================

export interface CreateSuperAdminDTO {
    email: string;
    password: string;
    name: string;
}

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
        // Password is optional - user might signup via OAuth
        password?: string;
    };
}

export interface CreateInvitationDTO {
    tenantId: string;
    organizationId: string;
    email: string;
    role: EmployeeRole;
    invitedBy: string;
}

export interface AcceptInvitationDTO {
    invitationToken: string;
    name: string;
    password?: string; // Optional if using OAuth
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

// Legacy type for backward compatibility (to be removed)
export type CreateTenant = CreateTenantDTO;