# 🔐 Admin Panel Authentication Guide

Complete authentication integration guide for the **Admin Panel** (Super Admin application).

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication Strategy](#authentication-strategy)
3. [Setup & Installation](#setup--installation)
4. [Implementation Guide](#implementation-guide)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Security Best Practices](#security-best-practices)
7. [Error Handling](#error-handling)
8. [Testing](#testing)

---

## Overview

The **Admin Panel** is a Next.js application for **Super Admins** to manage tenant approvals, view system analytics, and oversee the entire multi-tenant platform.

**Key Characteristics:**
- **User Type:** `SUPER_ADMIN` only
- **Authentication Method:** Email/Password only (no OAuth)
- **Port:** 3002
- **Core API:** http://localhost:3000 (dev) or production URL
- **Purpose:** Tenant approval workflow, system management

---

## Authentication Strategy

### User Flow

```
1. Super Admin navigates to Admin Panel (localhost:3002)
2. If not authenticated → Redirect to /login
3. Super Admin enters email/password
4. POST /api/auth/sign-in/email → Core API
5. Core API validates credentials & checks userType === 'SUPER_ADMIN'
6. Session cookie set by Better Auth
7. Redirect to /dashboard
8. Access protected admin routes
9. Sign out → POST /api/auth/sign-out
```

### Session Management

- **Session Storage:** HTTP-only cookies (handled by Better Auth)
- **Session Validation:** On every protected route
- **Session Duration:** Configurable in Better Auth (default: 30 days)
- **Session Refresh:** Automatic by Better Auth

---

## Setup & Installation

### 1. Create Admin Panel Project

```bash
cd ..
npx create-next-app@latest admin-panel --typescript --tailwind --app
cd admin-panel
```

### 2. Install Dependencies

```bash
pnpm add axios @tanstack/react-query zustand
pnpm add lucide-react sonner
pnpm add -D @types/node
```

### 3. Configure Environment Variables

Create `.env.local`:

```env
# Core API URL
NEXT_PUBLIC_CORE_API_URL=http://localhost:3000

# Admin Panel URL
NEXT_PUBLIC_APP_URL=http://localhost:3002

# Environment
NODE_ENV=development
```

### 4. Update `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable credentials for CORS
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:3000" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## Implementation Guide

### Step 1: Create API Client

**File:** `lib/api-client.ts`

```typescript
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:3000";

/**
 * Axios instance for Core API requests
 * - Includes credentials (cookies) for session management
 * - Base URL configured from environment
 * - Automatic JSON content type
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important: Send cookies with every request
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

### Step 2: Create Auth Context

**File:** `lib/auth-context.tsx`

```typescript
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "./api-client";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  userType: string;
  emailVerified: boolean;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch current session
  const fetchSession = async () => {
    try {
      const response = await apiClient.get("/api/auth/session");
      const sessionUser = response.data.user;
      
      // Verify user is SUPER_ADMIN
      if (sessionUser?.userType !== "SUPER_ADMIN") {
        setUser(null);
        throw new Error("Access denied. Super admin only.");
      }
      
      setUser(sessionUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/api/auth/sign-in/email", {
        email,
        password,
      });

      const sessionUser = response.data.user;

      // Verify user is SUPER_ADMIN
      if (sessionUser?.userType !== "SUPER_ADMIN") {
        throw new Error("Access denied. Super admin only.");
      }

      setUser(sessionUser);
      router.push("/dashboard");
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Sign in failed");
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await apiClient.post("/api/auth/sign-out");
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Refetch session
  const refetch = async () => {
    await fetchSession();
  };

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
```

---

### Step 3: Create Root Layout

**File:** `app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Panel - Multi-Tenant PM SaaS",
  description: "Super admin dashboard for tenant management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### Step 4: Create Login Page

**File:** `app/login/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  if (user) {
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Super Admin Access Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Super Admin credentials only.</p>
          <p className="mt-1">Contact system administrator for access.</p>
        </div>
      </div>
    </div>
  );
}
```

---

### Step 5: Create Protected Route Middleware

**File:** `middleware.ts` (in root directory)

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");

  // If accessing protected route without session → redirect to login
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If accessing login page with session → redirect to dashboard
  if (isLoginPage && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*"],
};
```

---

### Step 6: Create Dashboard Layout

**File:** `app/dashboard/layout.tsx`

```typescript
"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
```

---

### Step 7: Create Dashboard Home

**File:** `app/dashboard/page.tsx`

```typescript
"use client";

import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Welcome, {user?.name || "Admin"}!
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Total Tenants</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Active Tenants</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
      </div>
    </div>
  );
}
```

---

## API Endpoints Reference

### Authentication Endpoints

#### 1. Sign In (Admin)

```http
POST http://localhost:3000/api/auth/sign-in/email
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "P@ssw0rd"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "user_123",
    "email": "admin@example.com",
    "name": "Super Admin",
    "userType": "SUPER_ADMIN",
    "emailVerified": true
  },
  "session": {
    "id": "session_123",
    "userId": "user_123",
    "expiresAt": "2024-01-15T00:00:00.000Z"
  }
}
```

**Cookie Set:**
```
better-auth.session_token=<session_token>; HttpOnly; SameSite=Lax; Path=/
```

---

#### 2. Get Session

```http
GET http://localhost:3000/api/auth/session
Cookie: better-auth.session_token=<session_token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "user_123",
    "email": "admin@example.com",
    "name": "Super Admin",
    "userType": "SUPER_ADMIN",
    "emailVerified": true
  },
  "session": {
    "id": "session_123",
    "userId": "user_123",
    "expiresAt": "2024-01-15T00:00:00.000Z"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized",
  "message": "No active session"
}
```

---

#### 3. Sign Out

```http
POST http://localhost:3000/api/auth/sign-out
Cookie: better-auth.session_token=<session_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

**Cookie Cleared:**
```
better-auth.session_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0
```

---

## Security Best Practices

### 1. HTTP-Only Cookies
- Session tokens stored in HTTP-only cookies
- Not accessible via JavaScript (XSS protection)
- Automatically sent with every request

### 2. CORS Configuration
- Core API allows credentials from Admin Panel origin
- Whitelist specific origins in production
- Never use `Access-Control-Allow-Origin: *` with credentials

### 3. User Type Validation
- Always verify `userType === 'SUPER_ADMIN'` on client and server
- Don't trust client-side checks alone
- Core API should validate user type for admin endpoints

### 4. Secure Password Requirements
- Minimum 8 characters
- Require uppercase, lowercase, numbers, special characters
- Enforce password strength on signup

### 5. Environment Variables
- Never commit `.env` files
- Use different credentials for dev/staging/production
- Rotate admin passwords regularly

### 6. Session Management
- Set reasonable session expiration (7-30 days)
- Implement "Remember Me" option
- Force logout on password change

---

## Error Handling

### Common Errors

#### 1. Invalid Credentials (401)
```typescript
{
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

**Solution:** Verify email/password, ensure user exists and userType is SUPER_ADMIN.

---

#### 2. Session Expired (401)
```typescript
{
  "error": "SESSION_EXPIRED",
  "message": "Your session has expired. Please sign in again."
}
```

**Solution:** Redirect to login page, user must sign in again.

---

#### 3. Access Denied (403)
```typescript
{
  "error": "ACCESS_DENIED",
  "message": "Access denied. Super admin only."
}
```

**Solution:** User is not a SUPER_ADMIN, show access denied message.

---

#### 4. CORS Error
```
Access to fetch at 'http://localhost:3000/api/auth/sign-in/email' from origin 'http://localhost:3002' has been blocked by CORS policy
```

**Solution:** 
- Verify Core API CORS configuration includes Admin Panel origin
- Ensure `withCredentials: true` in axios config
- Check Core API `.env` has `ALLOWED_ORIGINS=http://localhost:3002`

---

#### 5. Network Error
```typescript
{
  "error": "NETWORK_ERROR",
  "message": "Unable to connect to Core API"
}
```

**Solution:**
- Verify Core API is running on port 3000
- Check `NEXT_PUBLIC_CORE_API_URL` environment variable
- Verify network connectivity

---

## Testing

### Manual Testing Checklist

#### Authentication Flow
- [ ] Admin can sign in with email/password
- [ ] Invalid credentials show error message
- [ ] Session cookie is set after sign in
- [ ] Protected routes accessible after sign in
- [ ] Accessing /login while authenticated redirects to /dashboard
- [ ] Sign out clears session and redirects to /login
- [ ] Accessing protected route after sign out redirects to /login

#### Security
- [ ] Non-admin users cannot access Admin Panel
- [ ] Session token is HTTP-only (check DevTools)
- [ ] Session validates on every protected route
- [ ] Session expires after configured duration

---

### Testing with REST Client

Use the `tests/auth.http` file in Core API project:

```http
### Admin Sign In
POST http://localhost:3000/api/auth/sign-in/email
Content-Type: application/json

{
  "email": "abdimegersa14@gmail.com",
  "password": "P@ssw0rd"
}

### Get Session
GET http://localhost:3000/api/auth/session
Cookie: better-auth.session_token=<copy_from_signin_response>

### Sign Out
POST http://localhost:3000/api/auth/sign-out
Cookie: better-auth.session_token=<copy_from_signin_response>
```

---

## Troubleshooting

### Issue: "Network Error" when signing in

**Cause:** Core API not running or wrong URL

**Solution:**
```bash
# Verify Core API is running
cd ../multi-tenant-pm-saas
pnpm dev

# Check environment variable
echo $NEXT_PUBLIC_CORE_API_URL
```

---

### Issue: User redirected to login after sign in

**Cause:** Session cookie not being set

**Solution:**
- Verify `withCredentials: true` in axios config
- Check Core API CORS allows credentials
- Verify cookie domain matches (both localhost)

---

### Issue: "Access denied. Super admin only."

**Cause:** User is not SUPER_ADMIN type

**Solution:**
- Verify admin user was seeded correctly
- Check database: `SELECT "userType" FROM "user" WHERE email = 'admin@example.com';`
- Re-seed admin if needed: `pnpm seed:admin`

---

## Next Steps

1. **Implement Tenant Management:**
   - Create `/dashboard/tenants` page
   - List pending tenants
   - Approve/reject functionality

2. **Add User Management:**
   - View all users
   - Filter by userType
   - Soft delete users

3. **System Analytics:**
   - Total tenants over time
   - Active vs inactive tenants
   - User growth metrics

4. **Settings:**
   - Update admin profile
   - Change password
   - System configuration

---

## Summary

✅ **Super Admin Authentication:**
- Email/password only (no OAuth)
- Session-based with HTTP-only cookies
- Automatic session validation
- Secure sign out

✅ **Key Files:**
- `lib/api-client.ts` - Axios instance
- `lib/auth-context.tsx` - Auth state management
- `middleware.ts` - Route protection
- `app/login/page.tsx` - Login UI
- `app/dashboard/layout.tsx` - Protected layout

✅ **Security:**
- HTTP-only cookies
- CORS with credentials
- User type validation
- Secure password requirements

---

**Ready to build the Admin Panel! 🚀**

Next: Implement tenant management dashboard using the Core API endpoints.
