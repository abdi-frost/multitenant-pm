// ============================================================================
// TENANT TYPES - For tenant registration/signup
// ============================================================================

export enum TenantStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    SUSPENDED = 'SUSPENDED',
    REINSTATED = 'REINSTATED',
}

// DTOs for tenant registration
export interface NewTenantDTO {
    id: string;
    status?: string;
    metadata?: unknown;
}

export interface NewOrganizationDTO {
    name: string;
    tenantId: string;
    legalName?: string | null;
    country?: string | null;
    phone?: string | null;
    logoUrl?: string | null;
    website?: string | null;
    description?: string | null;
}

export interface NewUserDTO {
    name: string;
    email: string;
    password: string;
}

export interface OnboardingRequestDTO {
    businessType?: string | null;
    expectedUsers?: number | null;
    description?: string | null;
}

export interface TenantRegistrationDTO {
    tenant: NewTenantDTO;
    organization: NewOrganizationDTO;
    user: NewUserDTO;
    onboardingRequest?: OnboardingRequestDTO;
}
