import { coreApiClient } from "@/lib/api.client"
import { TENANT_API } from "./constants"
import { ApproveTenantDTO, CreateTenantDTO, RejectTenantDTO } from "@/types/tenant"

export const getTenants = async (queryParams = "") => {
    return await coreApiClient.get(`${TENANT_API.TENANTS}?${queryParams}`)
}

export const getTenantById = async (tenantId: string) => {
    return await coreApiClient.get(`${TENANT_API.TENANTS}/${tenantId}`)
}

export const createTenant = async (data: CreateTenantDTO) => {
    return await coreApiClient.post(`${TENANT_API.TENANTS}`, data)
}

export const updateTenant = async (tenantId: string, data: any) => {
    return await coreApiClient.put(`${TENANT_API.TENANTS}/${tenantId}`, data)
}

export const approveTenant = async (tenantId: string, data: Omit<ApproveTenantDTO, 'tenantId'>) => {
    return await coreApiClient.patch(`${TENANT_API.TENANTS}/${tenantId}/approve`, data)
}

export const rejectTenant = async (tenantId: string, data: Omit<RejectTenantDTO, 'tenantId'>) => {
    return await coreApiClient.patch(`${TENANT_API.TENANTS}/${tenantId}/reject`, data)
}