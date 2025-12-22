import { coreApiClient } from "@/lib/api.client"
import { TenantRegistrationDTO } from "@/types/tenant"
import type { AxiosResponse } from "axios"

const TENANT_API = {
    REGISTER: "/tenants",
}

export const registerTenant = async (data: TenantRegistrationDTO): Promise<AxiosResponse> => {
    return await coreApiClient.post(TENANT_API.REGISTER, data)
}
