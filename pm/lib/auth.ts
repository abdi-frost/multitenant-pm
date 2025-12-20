import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import { URLS } from "@/config/urls"

export const authClient = createAuthClient({
    baseURL: URLS.CORE_API,
    plugins: [inferAdditionalFields({
        user: {
            role: {
                type: "string"
            },
            userType: {
                type: "string"
            },
            approved: {
                type: "boolean"
            },
            metadata: {
                type: "json"
            }
        }
    })],
})