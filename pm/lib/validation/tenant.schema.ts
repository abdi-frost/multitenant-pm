import { z } from 'zod'

// Helper for URL validation that allows empty strings
const optionalUrl = z.string().url().optional().nullable().or(z.literal(''))

export const tenantRegistrationSchema = z.object({
    tenant: z.object({
        id: z.string()
            .min(3, 'Tenant ID must be at least 3 characters')
            .max(50, 'Tenant ID must be less than 50 characters')
            .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed'),
        status: z.string().optional(),
        metadata: z.unknown().optional(),
    }),
    organization: z.object({
        name: z.string()
            .min(2, 'Organization name must be at least 2 characters')
            .max(100, 'Organization name must be less than 100 characters'),
        tenantId: z.string(),
        legalName: z.string().max(100).optional().nullable(),
        country: z.string().optional().nullable(),
        phone: z.string().max(20).optional().nullable(),
        logoUrl: optionalUrl,
        website: optionalUrl,
        description: z.string().max(500).optional().nullable(),
    }),
    user: z.object({
        name: z.string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name must be less than 100 characters'),
        email: z.string()
            .email('Invalid email address')
            .max(100, 'Email must be less than 100 characters'),
        password: z.string()
            .min(8, 'Password must be at least 8 characters')
            .max(100, 'Password must be less than 100 characters'),
    }),
    onboardingRequest: z.object({
        businessType: z.string().max(100).optional().nullable(),
        expectedUsers: z.number().int().positive().optional().nullable(),
        description: z.string().max(500).optional().nullable(),
    }).optional(),
})

export type TenantRegistrationFormData = z.infer<typeof tenantRegistrationSchema>
