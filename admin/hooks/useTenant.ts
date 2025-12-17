'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { approveTenant, deleteTenant, rejectTenant } from '@/api/tenant'
import type { ApproveTenantInput, RejectTenantInput } from '@/types/tenant'

type UseTenantMutationsOptions = {
    onApproved?: () => void
    onRejected?: () => void
    onDeleted?: () => void
}

export function useTenantMutations(options: UseTenantMutationsOptions = {}) {
    const queryClient = useQueryClient()

    const approveMutation = useMutation({
        mutationFn: async ({ tenantId, data }: { tenantId: string, data: ApproveTenantInput }) => {
            return await approveTenant(tenantId, {
                reason: data.reason,
            })
        },
        onSuccess: (_res, { tenantId }) => {
            queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] })
            queryClient.invalidateQueries({ queryKey: ['tenants'] })
            toast.success('Tenant approved successfully')
            options.onApproved?.()
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } }
            toast.error(err?.response?.data?.message || 'Failed to approve tenant')
        },
    })

    const rejectMutation = useMutation({
        mutationFn: async ({ tenantId, data }: { tenantId: string, data: RejectTenantInput }) => {
            return await rejectTenant(tenantId, {
                reason: data.reason,
            })
        },
        onSuccess: (_res, { tenantId }) => {
            queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] })
            queryClient.invalidateQueries({ queryKey: ['tenants'] })
            toast.success('Tenant rejected')
            options.onRejected?.()
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } }
            toast.error(err?.response?.data?.message || 'Failed to reject tenant')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async ({ tenantId }: { tenantId: string }) => {
            return await deleteTenant(tenantId)
        },
        onSuccess: (_res, { tenantId }) => {
            queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] })
            queryClient.invalidateQueries({ queryKey: ['tenants'] })
            toast.success('Tenant deleted successfully')
            options.onDeleted?.()
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } }
            toast.error(err?.response?.data?.message || 'Failed to delete tenant')
        },
    })

    return {
        approveMutation,
        rejectMutation,
        deleteMutation,
    }
}
