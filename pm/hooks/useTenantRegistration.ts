import { useMutation } from '@tanstack/react-query'
import { registerTenant } from '@/api/tenant'
import { TenantRegistrationDTO } from '@/types/tenant'
import { toast } from 'sonner'

interface UseRegisterTenantOptions {
    onSuccess?: () => void
    onError?: (error: unknown) => void
}

export function useRegisterTenant(options?: UseRegisterTenantOptions) {
    return useMutation({
        mutationFn: async (data: TenantRegistrationDTO) => {
            console.log('🚀 Registering tenant:', JSON.stringify(data, null, 2))
            return await registerTenant(data)
        },
        onSuccess: (response) => {
            console.log('✅ Registration successful:', response)
            toast.success('Registration successful!', {
                description: 'Your tenant registration is pending approval. You will be notified once approved.',
                duration: 5000,
            })
            options?.onSuccess?.()
        },
        onError: (error: unknown) => {
            console.error('❌ Registration error:', error)
            const err = error as { response?: { data?: { error?: string, message?: string } } }
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'An unexpected error occurred.'
            console.error('❌ Error message:', errorMessage)
            toast.error('Registration failed', {
                description: errorMessage,
                duration: 5000,
            })
            options?.onError?.(error)
        },
    })
}
