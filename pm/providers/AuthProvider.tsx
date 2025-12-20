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
import { createContext, useContext, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { UserType } from "@/types";
import { URLS } from "@/config/urls";

const LOGIN_PATH = "/auth/login";
const protectedRoutes = ["/app", "/dashboard"];

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: sessionData, isPending } = authClient.useSession();
    const router = useRouter();
    const pathname = usePathname();

    const user = sessionData?.user || null;
    const session = sessionData?.session || null;
    const isAuth = !!user && !!session
    const loading = isPending;

    const lastRedirect = useRef<string | null>(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        if (loading) return;
        if (typeof pathname !== "string") return;

        const normalizedPath = pathname || "/";
        const isProtected = protectedRoutes.some(
            (route) => normalizedPath === route || normalizedPath.startsWith(`${route}/`)
        );

        // Avoid duplicate redirects
        if (lastRedirect.current === normalizedPath) return;

        // Helper to navigate, using full-nav for external URLs
        const navigateTo = (dest: string) => {
            if (dest.startsWith("http://") || dest.startsWith("https://")) {
                window.location.href = dest;
            } else {
                router.replace(dest);
            }
            lastRedirect.current = normalizedPath;
        };

        // If unauthenticated and on a protected route, send to login with return path
        if (!isAuth && isProtected) {
            const url = new URL(LOGIN_PATH, window.location.href);
            url.searchParams.set("redirect", normalizedPath);
            navigateTo(url.pathname + url.search);
            return;
        }

        // If authenticated but on login page, forward to intended destination
        if (isAuth) {

            console.log({type: user.userType, role: user.role});

            const redirectParam = searchParams?.get("redirect");
            if (redirectParam && redirectParam !== normalizedPath) {
                navigateTo(redirectParam);
                return;
            }

            // Fallback by user type
            const dest = user?.userType === UserType.ADMIN ? URLS.ADMIN_APP : "/app";
            if (dest && dest !== normalizedPath) {
                navigateTo(dest);
            }
        }
    }, [isAuth, user?.userType, loading, pathname, router, searchParams]);

    const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
        return await authClient.signIn.email(credentials);
    };

    const logout = async (): Promise<LogoutResponse> => {
        const res = await authClient.signOut();
        router.push(LOGIN_PATH);
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