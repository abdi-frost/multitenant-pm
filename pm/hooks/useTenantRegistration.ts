import { useMutation } from '@tanstack/react-query'
import { registerTenant } from '@/api/tenant'
import { TenantRegistrationDTO } from '@/types/tenant'
import { toast } from 'sonner'
import { AxiosError } from 'axios'

interface UseRegisterTenantOptions {
    onSuccess?: () => void
    onError?: (error: unknown) => void
}

interface ApiErrorResponse {
    error?: string
    message?: string
}

function getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        const data = error.response?.data as ApiErrorResponse | undefined
        return data?.error || data?.message || error.message
    }
    if (error instanceof Error) {
        return error.message
    }
    return 'An unexpected error occurred.'
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
            const errorMessage = getErrorMessage(error)
            console.error('❌ Error message:', errorMessage)
            toast.error('Registration failed', {
                description: errorMessage,
                duration: 5000,
            })
            options?.onError?.(error)
        },
    })
}
