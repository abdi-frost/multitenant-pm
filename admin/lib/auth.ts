import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_CORE_URL || "http://localhost:3000",
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
            metdata: {
                type: "json"
            }
        }
    })],
})