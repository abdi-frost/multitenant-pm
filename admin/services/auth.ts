import { authClient } from "@/lib/auth";
import { LoginCredentials, LoginResponse, LogoutResponse, SessionResponse } from "@/types/auth";

export async function login(credentials: LoginCredentials): Promise<any> {
    const result = await authClient.signIn.email(credentials);
    console.log("Login result: ", result)
    return result;
}

export async function logout(): Promise<LogoutResponse> {
    const result = await authClient.signOut();
    console.log("Logout result: ", result)
    return result;
}

export async function getSession() : Promise<SessionResponse>{
    const result = await authClient.getSession();
    console.log("Get session result: ", result)
    return result;
}