'use client'
import { Spinner } from "@/components/ui/spinner";
import {
    AuthContextType,
    LoginCredentials,
    LoginResponse,
    LogoutResponse,
    SessionResponse
} from "@/types/auth";
import { authClient } from "@/lib/auth";
import { createContext, useContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { protectedRoutes } from "@/config/protected-routes";
import { UserType } from "@/types";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: sessionData, isPending, error } = authClient.useSession();
    const router = useRouter();
    const pathname = usePathname();

    const user = sessionData?.user || null;
    const loading = isPending;

    useEffect(() => {
        if (loading) return;

        console.log("AuthProvider useEffect:", { user, pathname });
        const isLoginPage = pathname === "/login";
        const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

        if (!user && isProtected) {
            router.push("/login");
        } else if (user && isLoginPage && user.userType == UserType.ADMIN) {
            router.push("/dashboard");
        } else if (user && isLoginPage) {
            if (user.userType === UserType.ADMIN) {
                router.push("/dashboard");
            } else {
                router.push("/");
            }
        }
    }, [user, loading, pathname, router]);

    const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
        return await authClient.signIn.email(credentials);
    };

    const logout = async (): Promise<LogoutResponse> => {
        const res = await authClient.signOut();
        router.push("/login");
        return res;
    };

    const getSession = async (): Promise<SessionResponse> => {
        return await authClient.getSession();
    }

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, getSession }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}