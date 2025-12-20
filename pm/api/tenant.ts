import { coreApiClient } from "@/lib/api.client"
import { TenantRegistrationDTO } from "@/types/tenant"

const TENANT_API = {
    REGISTER: "/tenants",
}

export const registerTenant = async (data: TenantRegistrationDTO) => {
    return await coreApiClient.post(TENANT_API.REGISTER, data)
}
