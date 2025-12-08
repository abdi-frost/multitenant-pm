# 🔐 PM App Authentication Guide

Complete authentication integration guide for the **PM App** (Project Management application for Tenants and Employees).

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication Strategy](#authentication-strategy)
3. [Setup & Installation](#setup--installation)
4. [Implementation Guide](#implementation-guide)
5. [Tenant Onboarding Flow](#tenant-onboarding-flow)
6. [Employee Invitation Flow](#employee-invitation-flow)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Security Best Practices](#security-best-practices)
9. [Error Handling](#error-handling)
10. [Testing](#testing)

---

## Overview

The **PM App** is a Next.js application for **Tenants** (organization owners) and **Employees** to manage projects, tasks, and teams.

**Key Characteristics:**
- **User Types:** `TENANT` (owner), `EMPLOYEE`, `MANAGER`
- **Authentication Methods:** 
  - OAuth (Google, GitHub) - Recommended for tenants
  - Email/Password - Alternative option
- **Port:** 3001
- **Core API:** http://localhost:3000 (dev) or production URL
- **Features:** Project management, task tracking, team collaboration

---

## Authentication Strategy

### Tenant Owner Flow

```
1. User navigates to PM App (localhost:3001)
2. Clicks "Sign Up" → Choose OAuth or Email/Password
3. OAuth: Redirects to Google/GitHub → Callback → Auto-create account
4. Email: Fill form → Create account with password
5. Redirect to /onboarding (multi-step form)
6. Fill organization info, business details
7. Submit → Tenant request created (status: PENDING)
8. Show "Pending Approval" page
9. Super Admin approves in Admin Panel
10. Tenant status → APPROVED
11. Tenant can now access full features
```

### Employee Flow

```
1. Tenant owner invites employee via email
2. Employee receives invitation email with link
3. Employee clicks link → /accept-invitation?token=xxx
4. If no account: Sign up (OAuth or Email/Password)
5. If has account: Sign in
6. Accept invitation → Added to tenant organization
7. Access PM App with tenant context
```

### Session Management

- **Session Storage:** HTTP-only cookies (Better Auth)
- **Session Validation:** On every protected route
- **Multi-Tenant Context:** Tenant ID stored in user record
- **Role-Based Access:** STAFF, MANAGER, ADMIN roles

---

## Setup & Installation

### 1. Create PM App Project

```bash
cd ..
npx create-next-app@latest pm-app --typescript --tailwind --app
cd pm-app
```

### 2. Install Dependencies

```bash
pnpm add axios @tanstack/react-query zustand
pnpm add lucide-react sonner date-fns
pnpm add react-hook-form @hookform/resolvers zod
pnpm add -D @types/node
```

### 3. Configure Environment Variables

Create `.env.local`:

```env
# Core API URL
NEXT_PUBLIC_CORE_API_URL=http://localhost:3000

# PM App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# OAuth Callback URLs (Google, GitHub)
NEXT_PUBLIC_GOOGLE_CALLBACK_URL=http://localhost:3001/auth/callback/google
NEXT_PUBLIC_GITHUB_CALLBACK_URL=http://localhost:3001/auth/callback/github

# Environment
NODE_ENV=development
```

### 4. Update `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  withCredentials: true, // Important: Send cookies
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
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/sign-in";
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
  userType: "TENANT" | "EMPLOYEE" | "MANAGER";
  tenantId: string | null;
  role: string | null;
  emailVerified: boolean;
  image?: string;
}

interface Tenant {
  id: string;
  organizationName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  subscriptionTier: string;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithOAuth: (provider: "google" | "github") => void;
  signOut: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch current session and tenant data
  const fetchSession = async () => {
    try {
      const sessionResponse = await apiClient.get("/api/auth/session");
      const sessionUser = sessionResponse.data.user;
      
      setUser(sessionUser);

      // If user has tenantId, fetch tenant details
      if (sessionUser?.tenantId) {
        try {
          const tenantResponse = await apiClient.get(`/api/tenants/${sessionUser.tenantId}`);
          setTenant(tenantResponse.data);
        } catch (error) {
          console.error("Failed to fetch tenant:", error);
        }
      }
    } catch (error) {
      setUser(null);
      setTenant(null);
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

      await fetchSession();
      
      // Redirect based on tenant status
      if (response.data.user.userType === "TENANT" && !response.data.user.tenantId) {
        router.push("/onboarding");
      } else if (tenant?.status === "PENDING") {
        router.push("/pending-approval");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Sign in failed");
    }
  };

  // Sign up with email/password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await apiClient.post("/api/auth/sign-up/email", {
        email,
        password,
        name,
      });

      await fetchSession();
      router.push("/onboarding");
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Sign up failed");
    }
  };

  // Sign in with OAuth (Google/GitHub)
  const signInWithOAuth = (provider: "google" | "github") => {
    const callbackUrl = encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback/${provider}`);
    window.location.href = `${API_URL}/api/auth/sign-in/social/${provider}?callbackUrl=${callbackUrl}`;
  };

  // Sign out
  const signOut = async () => {
    try {
      await apiClient.post("/api/auth/sign-out");
      setUser(null);
      setTenant(null);
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Refetch session
  const refetch = async () => {
    await fetchSession();
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        tenant, 
        loading, 
        signIn, 
        signUp, 
        signInWithOAuth, 
        signOut, 
        refetch 
      }}
    >
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

### Step 3: Create Sign In Page

**File:** `app/auth/sign-in/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Mail, Github } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithOAuth } = useAuth();

  const handleEmailSignIn = async (e: React.FormEvent) => {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => signInWithOAuth("google")}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Mail className="h-5 w-5 text-red-500" />
            <span className="font-medium">Continue with Google</span>
          </button>

          <button
            onClick={() => signInWithOAuth("github")}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Github className="h-5 w-5" />
            <span className="font-medium">Continue with GitHub</span>
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
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
              placeholder="you@example.com"
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
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/auth/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

---

### Step 4: Create Sign Up Page

**File:** `app/auth/sign-up/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Mail, Github } from "lucide-react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithOAuth } = useAuth();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUp(email, password, name);
      toast.success("Account created! Please complete onboarding.");
    } catch (error: any) {
      toast.error(error.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Get Started</h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => signInWithOAuth("google")}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Mail className="h-5 w-5 text-red-500" />
            <span className="font-medium">Continue with Google</span>
          </button>

          <button
            onClick={() => signInWithOAuth("github")}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Github className="h-5 w-5" />
            <span className="font-medium">Continue with GitHub</span>
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="John Doe"
            />
          </div>

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
              placeholder="you@example.com"
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
              minLength={8}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

---

## Tenant Onboarding Flow

### Step 5: Create Onboarding Page

**File:** `app/onboarding/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    organizationName: "",
    description: "",
    industry: "",
    companySize: "SMALL",
    website: "",
    expectedUsers: "",
    businessType: "",
    useCase: "",
  });

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await apiClient.post("/api/tenants", {
        organizationName: formData.organizationName,
        description: formData.description,
        industry: formData.industry,
        companySize: formData.companySize,
        website: formData.website,
        onboardingRequest: {
          expectedUsers: parseInt(formData.expectedUsers) || 10,
          businessType: formData.businessType,
          useCase: formData.useCase,
        },
      });

      toast.success("Application submitted! Awaiting approval.");
      router.push("/pending-approval");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600 mb-8">
            Let's set up your organization. This will take about 2 minutes.
          </p>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            <div className={`flex-1 text-center ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                1
              </div>
              <p className="text-xs mt-1">Organization</p>
            </div>
            <div className={`flex-1 text-center ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                2
              </div>
              <p className="text-xs mt-1">Details</p>
            </div>
            <div className={`flex-1 text-center ${step >= 3 ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                3
              </div>
              <p className="text-xs mt-1">Review</p>
            </div>
          </div>

          {/* Step 1: Organization Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Brief description of your organization"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Retail">Retail</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Size
                </label>
                <select
                  value={formData.companySize}
                  onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="SMALL">1-50 employees</option>
                  <option value="MEDIUM">51-200 employees</option>
                  <option value="LARGE">201-1000 employees</option>
                  <option value="ENTERPRISE">1000+ employees</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.organizationName}
                className="w-full mt-6 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {/* Step 2: Additional Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Number of Users
                </label>
                <input
                  type="number"
                  value={formData.expectedUsers}
                  onChange={(e) => setFormData({ ...formData, expectedUsers: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type
                </label>
                <input
                  type="text"
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., B2B SaaS, Consulting, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Use Case
                </label>
                <textarea
                  value={formData.useCase}
                  onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                  placeholder="How do you plan to use this platform?"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Organization Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Organization</p>
                    <p className="font-medium">{formData.organizationName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Industry</p>
                    <p className="font-medium">{formData.industry || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Company Size</p>
                    <p className="font-medium">{formData.companySize}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expected Users</p>
                    <p className="font-medium">{formData.expectedUsers || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>What happens next?</strong>
                  <br />
                  Your application will be reviewed by our team. You'll receive an email notification once approved (usually within 24 hours).
                </p>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(2)}
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin inline mr-2 h-4 w-4" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### Step 6: Create Pending Approval Page

**File:** `app/pending-approval/page.tsx`

```typescript
"use client";

import { useAuth } from "@/lib/auth-context";
import { Clock, Mail, CheckCircle } from "lucide-react";

export default function PendingApprovalPage() {
  const { user, tenant, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-orange-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Application Under Review
        </h1>

        <p className="text-gray-600 mb-6">
          Your organization <strong>{tenant?.organizationName}</strong> is currently pending approval.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            What's happening?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Account created successfully</li>
            <li>✓ Application submitted</li>
            <li>⏳ Awaiting admin approval</li>
            <li>📧 You'll receive an email notification</li>
          </ul>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-2">Expected Timeline</h3>
          <p className="text-sm text-gray-600">
            Most applications are reviewed within <strong>24 hours</strong>. You'll receive an email once your account is approved.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Check Status
          </button>

          <button
            onClick={signOut}
            className="w-full py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Sign Out
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Need help? Contact us at</p>
          <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-700">
            support@example.com
          </a>
        </div>
      </div>
    </div>
  );
}
```

---

## Employee Invitation Flow

### Step 7: Create Accept Invitation Page

**File:** `app/accept-invitation/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, refetch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      fetchInvitation();
    } else {
      setError("Invalid invitation link");
      setLoading(false);
    }
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const response = await apiClient.get(`/api/invitations/${token}`);
      setInvitation(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || "Invalid or expired invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user) {
      // Redirect to sign up with invitation token in query
      router.push(`/auth/sign-up?invitation=${token}`);
      return;
    }

    setLoading(true);

    try {
      await apiClient.post(`/api/invitations/${token}/accept`);
      toast.success("Invitation accepted! Welcome to the team.");
      await refetch();
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/auth/sign-in")}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          You're Invited!
        </h1>

        <p className="text-gray-600 mb-6">
          You've been invited to join <strong>{invitation.tenantOrganizationName}</strong> as a{" "}
          <strong>{invitation.role}</strong>.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-2">Invitation Details</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Organization:</strong> {invitation.tenantOrganizationName}</p>
            <p><strong>Role:</strong> {invitation.role}</p>
            <p><strong>Invited by:</strong> {invitation.invitedByName}</p>
          </div>
        </div>

        <button
          onClick={handleAccept}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin inline mr-2 h-4 w-4" />
              Accepting...
            </>
          ) : user ? (
            "Accept Invitation"
          ) : (
            "Sign Up to Accept"
          )}
        </button>

        {!user && (
          <p className="mt-4 text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => router.push(`/auth/sign-in?invitation=${token}`)}
              className="text-blue-600 hover:text-blue-700"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## API Endpoints Reference

### Authentication Endpoints

All authentication endpoints are documented in `tests/auth.http`. Key endpoints:

- `POST /api/auth/sign-in/email` - Email/password sign in
- `POST /api/auth/sign-up/email` - Email/password sign up
- `GET /api/auth/sign-in/social/{provider}` - OAuth sign in
- `GET /api/auth/session` - Get current session
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/user` - Get user profile
- `PATCH /api/auth/user` - Update user profile

### Tenant Endpoints

- `POST /api/tenants` - Create tenant (onboarding)
- `GET /api/tenants/{id}` - Get tenant details
- `GET /api/tenants` - List tenants (admin only)

### Invitation Endpoints

- `POST /api/invitations` - Create invitation (tenant owner)
- `POST /api/invitations/bulk` - Bulk create invitations
- `GET /api/invitations/{token}` - Get invitation details
- `POST /api/invitations/{token}/accept` - Accept invitation
- `DELETE /api/invitations/{id}` - Revoke invitation

---

## Security Best Practices

1. **OAuth Recommended** - Encourage users to sign up with Google/GitHub
2. **Password Strength** - Enforce minimum 8 characters, complexity requirements
3. **Session Security** - HTTP-only cookies, secure flag in production
4. **Tenant Isolation** - Always validate tenantId on API requests
5. **Role-Based Access** - Check user roles (STAFF, MANAGER, ADMIN) for sensitive actions
6. **Invitation Expiry** - Invitations expire after 7 days
7. **Rate Limiting** - Implement rate limits on auth endpoints (future)

---

## Error Handling

Common errors and solutions are similar to Admin Panel guide. Refer to `ADMIN_AUTH_GUIDE.md` for detailed error handling.

---

## Testing

Use `tests/auth.http` and `tests/invitations.http` to test authentication flows:

```bash
# Test tenant signup
POST /api/auth/sign-up/email

# Test tenant onboarding
POST /api/tenants

# Test invitation creation
POST /api/invitations

# Test invitation acceptance
POST /api/invitations/{token}/accept
```

---

## Summary

✅ **Multi-Auth Support:**
- OAuth (Google, GitHub) + Email/Password
- Tenant onboarding with approval workflow
- Employee invitation system

✅ **Key Files:**
- `lib/api-client.ts` - Axios client
- `lib/auth-context.tsx` - Auth state
- `app/auth/sign-in/page.tsx` - Sign in
- `app/auth/sign-up/page.tsx` - Sign up
- `app/onboarding/page.tsx` - Onboarding
- `app/pending-approval/page.tsx` - Pending state
- `app/accept-invitation/page.tsx` - Accept invite

✅ **User Flows:**
1. Tenant signs up → Onboarding → Pending → Approved → Dashboard
2. Employee invited → Accept → Sign up/in → Dashboard

---

**Ready to build the PM App! 🚀**

Next: Implement project and task management features.
