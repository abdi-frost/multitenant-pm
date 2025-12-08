import { coreApiClient } from "@/lib/api.client";
import { AUTH_API } from "./constants";

export const logout = async () => {
    await coreApiClient.post(AUTH_API.SIGN_OUT, {
        headers: {
            "Content-Type": "application/json",
        }
    });
}