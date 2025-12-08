'use client'
import { AUTH_API } from "@/api/constants";
import { Spinner } from "@/components/ui/spinner";
import { coreApiClient } from "@/lib/api.client";
import { User } from "@/types";
import { AuthContextType } from "@/types/auth";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [fetchingSession, setFetchingSession] = useState<boolean>(false);
    const router = useRouter();

    const fetchSession = async () => {
        setLoading(true);
        setFetchingSession(true);
        try {
            const session = await coreApiClient.get(AUTH_API.SESSION);
            const sessionUser = session.data.user;

            setUser(sessionUser);

        } catch (error) {
            setUser(null);
            console.error("Failed to fetch session:", error);
        } finally {
            setLoading(false);
            setFetchingSession(false);
        }
    }

    useEffect(() => {
        fetchSession();
    }, []);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        try {
            const response = await coreApiClient.post(AUTH_API.SIGNIN, { email, password });
            const signedInUser = response.data.user;

            setUser(signedInUser);

        } catch (error) {
            setUser(null);
            console.error("Sign-in failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const signOut = async () => {
        try {
            await coreApiClient.post(AUTH_API.SIGN_OUT);
            setUser(null);
            router.push("/login");
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    const refetch = async () => {
        await fetchSession();
    }

    if (fetchingSession) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut, refetch }}>
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