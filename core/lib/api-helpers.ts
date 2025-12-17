import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { UserType } from "@/types/entityEnums";

// Extended user type with custom fields
type ExtendedUser = {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
    userType?: string | null;
    tenantId?: string | null;
    organizationId?: string | null;
    role?: string | null;
};

/**
 * Get the current authenticated user from session
 */
export async function getCurrentUser(): Promise<ExtendedUser | null> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        return session?.user as ExtendedUser | null || null;
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
}

/**
 * Get the current session from a Route Handler request (Next.js App Router).
 *
 * Use this inside App Router route handlers (e.g. `app/api/.../route.ts`) where you already have access
 * to the incoming Request object.
 */
export async function getSessionFromRequest(request: Request) {
    try {
        return await auth.api.getSession({
            headers: request.headers,
        });
    } catch (error) {
        console.error("Error getting session from request:", error);
        return null;
    }
}

/**
 * Get the current authenticated user from a Route Handler request.
 */
export async function getUserFromRequest(request: Request): Promise<ExtendedUser | null> {
    const session = await getSessionFromRequest(request);
    return (session?.user as ExtendedUser | null) || null;
}

/**
 * Require authentication - returns user or throws 401
 */
export async function requireAuth(): Promise<ExtendedUser> {
    const user = await getCurrentUser();
    
    if (!user) {
        throw new AuthError("Unauthorized", 401);
    }
    
    return user;
}

/**
 * Require authentication (Route Handler variant) - returns user or throws 401.
 */
export async function requireAuthFromRequest(request: Request): Promise<ExtendedUser> {
    const user = await getUserFromRequest(request);

    if (!user) {
        throw new AuthError("Unauthorized", 401);
    }

    return user;
}

/**
 * Require admin authentication (Route Handler variant).
 */
export async function requireAdminFromRequest(request: Request): Promise<ExtendedUser> {
    const user = await requireAuthFromRequest(request);

    // NOTE: This project currently uses `userType` in checks.
    // If your canonical admin flag is `role`, swap this condition accordingly.
    if (user.userType !== UserType.ADMIN) {
        throw new AuthError("Forbidden: Admin access required", 403);
    }

    return user;
}

/**
 * Require admin authentication
 */
export async function requireAdmin(): Promise<ExtendedUser> {
    const user = await requireAuth();
    
    if (user.userType !== UserType.ADMIN) {
        throw new AuthError("Forbidden: Admin access required", 403);
    }
    
    return user;
}

/**
 * Require tenant owner authentication
 */
export async function requireTenantOwner(): Promise<ExtendedUser> {
    const user = await requireAuth();
    
    if (user.userType !== UserType.USER) {
        throw new AuthError("Forbidden: Tenant owner access required", 403);
    }
    
    if (!user.tenantId) {
        throw new AuthError("Tenant not configured", 400);
    }
    
    return user;
}

/**
 * Require tenant access (tenant owner or employee)
 */
export async function requireTenantAccess(tenantId?: string): Promise<ExtendedUser> {
    const user = await requireAuth();
    
    if (user.userType === UserType.ADMIN) {
        // Admin has access to all tenants
        return user;
    }
    
    if (!user.tenantId) {
        throw new AuthError("No tenant access", 403);
    }
    
    if (tenantId && user.tenantId !== tenantId) {
        throw new AuthError("Forbidden: Access denied to this tenant", 403);
    }
    
    return user;
}

/**
 * Require approved tenant
 */
export async function requireApprovedTenant(): Promise<ExtendedUser> {
    const user = await requireAuth();
    
    if (user.userType === UserType.ADMIN) {
        return user;
    }
    
    // Check tenant approval status
    if (!user.tenantId) {
        throw new AuthError("No tenant configured", 400);
    }
    
    // This would ideally check the tenant status from the database
    // For now, we'll assume the middleware handles this
    
    return user;
}

/**
 * Custom auth error class
 */
export class AuthError extends Error {
    status: number;
    
    constructor(message: string, status = 401) {
        super(message);
        this.status = status;
        this.name = "AuthError";
    }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown) {
    console.error("API Error:", error);
    
    if (error instanceof AuthError) {
        return NextResponse.json(
            { error: error.message },
            { status: error.status }
        );
    }
    
    if (error instanceof Error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
    
    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
    );
}

/**
 * Create standardized API response
 */
export function createApiResponse<T>(
    data: T,
    status = 200,
    message?: string
) {
    return NextResponse.json(
        {
            success: true,
            data,
            message,
        },
        { status }
    );
}

/**
 * Create error API response
 */
export function createErrorResponse(
    message: string,
    status = 400,
    details?: unknown
) {
    return NextResponse.json(
        {
            success: false,
            error: message,
            details,
        },
        { status }
    );
}
