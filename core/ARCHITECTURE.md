# Multi-Tenant Project Management SaaS - Architecture Documentation

## 📋 Table of Contents
- [System Overview](#system-overview)
- [Multi-App Architecture](#multi-app-architecture)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Tenant Onboarding Flow](#tenant-onboarding-flow)
- [Employee Invitation Flow](#employee-invitation-flow)
- [API Structure](#api-structure)
- [Security Considerations](#security-considerations)
- [Deployment Guide](#deployment-guide)

---

## 🎯 System Overview

This is a **multi-tenant SaaS platform** for project management, built with a **microservices-inspired architecture** using three separate Next.js applications:

1. **Core API** (Port 3000) - Authentication, tenants, users, shared resources
2. **Project Management App** (Port 3001) - PM features, tasks, projects
3. **Admin Panel** (Port 3002) - Super admin operations, tenant approval

### Key Features
- ✅ Multi-tenant isolation with shared database
- ✅ Social authentication (Google, GitHub) for tenants
- ✅ Email/password authentication for super admins
- ✅ Tenant approval workflow
- ✅ Employee invitation system
- ✅ Subscription-based access control
- ✅ Cross-origin API access with CORS

---

## 🏗️ Multi-App Architecture

### Application Roles

#### 1. Core API (This Repository)
**Purpose:** Central authentication and tenant management service

**Responsibilities:**
- User authentication via Better Auth
- Tenant CRUD operations
- User management (super admins, tenant owners, employees)
- Employee invitations
- Session management
- Shared business logic

**Technology Stack:**
- Next.js 16 (App Router)
- Better Auth (Authentication)
- Drizzle ORM
- PostgreSQL (Neon)
- TypeScript
- Vercel

**Port:** 3000
**Environment Variable:** `CORE_API_URL`

#### 2. Project Management App
**Purpose:** Main application for project management features

**Responsibilities:**
- Project CRUD operations
- Task management
- Team collaboration
- Reports and analytics
- User dashboard
- Tenant-specific PM features

**Consumes:**
- Core API for authentication
- Core API for user/tenant data

**Port:** 3001
**Environment Variable:** `PM_APP_URL`

#### 3. Admin Panel App
**Purpose:** Super admin interface for system management

**Responsibilities:**
- Tenant approval/rejection
- System-wide analytics
- User management
- Subscription management
- System configuration

**Consumes:**
- Core API for authentication
- Core API for tenant operations

**Port:** 3002
**Environment Variable:** `ADMIN_APP_URL`

### Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         CORE API                            │
│                       (Port 3000)                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ • Better Auth (Social + Email/Password)                │ │
│  │ • Tenant Management                                    │ │
│  │ • User Management                                      │ │
│  │ • Session Management                                   │ │
│  │ • Invitation System                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────┬──────────────────────┬──────────────────┘
                    │                      │
         ┌──────────▼────────────┐  ┌──────▼─────────────┐
         │   PM App (3001)       │  │  Admin Panel (3002)│
         │  ┌─────────────────┐  │  │  ┌──────────────┐  │
         │  │ • Projects      │  │  │  │ • Approve    │  │
         │  │ • Tasks         │  │  │  │   Tenants    │  │
         │  │ • Dashboard     │  │  │  │ • Analytics  │  │
         │  │ • Reports       │  │  │  │ • Settings   │  │
         │  └─────────────────┘  │  │  └──────────────┘  │
         └───────────────────────┘  └────────────────────┘
```

---

## 🗄️ Database Schema

### Better Auth Tables

#### `user`
Core user table supporting all user types:
- `id` (text, PK) - User ID
- `name` (text) - Full name
- `email` (text, unique) - Email address
- `emailVerified` (boolean) - Email verification status
- `image` (text) - Profile picture URL
- `userType` (varchar) - ADMIN | TENANT | EMPLOYEE
- `tenantId` (varchar, FK) - Associated tenant (null for super admins)
- `organizationId` (uuid, FK) - Associated organization
- `role` (varchar) - User role within their context

#### `session`
Session management:
- `id` (text, PK)
- `userId` (text, FK)
- `expiresAt` (timestamp)
- `ipAddress` (text)
- `userAgent` (text)

#### `account`
OAuth and credential accounts:
- `id` (text, PK)
- `userId` (text, FK)
- `providerId` (text) - google | github | credential
- `accountId` (text) - Provider-specific ID
- `password` (text) - Hashed password (for email/password)
- `accessToken`, `refreshToken`, `idToken` (text)

#### `verification`
Email verification tokens

### Tenant & Organization Tables

#### `tenants`
- `id` (varchar, PK) - Tenant identifier (typically short name)
- `uuid` (uuid, unique) - Alternative unique identifier
- `status` (varchar) - PENDING | APPROVED | REJECTED
- `approvedBy` (text, FK to user)
- `rejectedBy` (text, FK to user)
- `rejectionReason` (text)
- `subscriptionTier` (varchar) - FREE | BASIC | PREMIUM | ENTERPRISE :)
- `maxEmployees` (integer)
- `maxProjects` (integer)
- System fields (isActive, deleted, timestamps, metadata)

#### `organizations`
- `id` (uuid, PK)
- `tenantId` (varchar, FK)
- `name` (varchar)
- `description`, `logoUrl`, `website` (varchar)
- `industry` (varchar)
- `size` (varchar) - SMALL | MEDIUM | LARGE | ENTERPRISE
- `preferences` (json)
- System fields

#### `onboarding_requests`
- `id` (uuid, PK)
- `tenantId` (varchar, FK)
- `description` (varchar)
- `companyDetails` (json)
- `businessType` (varchar)
- `expectedUsers` (integer)
- System fields

#### `invitations`
- `id` (uuid, PK)
- `tenantId` (varchar, FK)
- `organizationId` (uuid, FK)
- `email` (varchar)
- `role` (varchar) - STAFF | MANAGER
- `invitedBy` (text, FK to user)
- `invitationToken` (varchar, unique)
- `expiresAt` (timestamp)
- `acceptedAt` (timestamp)
- `status` (varchar) - PENDING | ACCEPTED | EXPIRED | REVOKED
- System fields

---

## 🔐 Authentication & Authorization

### User Types & Authentication Methods

| User Type | Auth Method | Access | Use Case |
|-----------|-------------|--------|----------|
| **ADMIN** | Email/Password only | Admin Panel | System administrators |
| **TENANT** | Social Auth or Email/Password | PM App | Company owners |
| **EMPLOYEE** | Social Auth or Email/Password | PM App | Invited team members |

### Authentication Flow (Better Auth)

#### 1. Super Admin Login
```
Admin Panel → POST /api/auth/sign-in
            → Email + Password
            → userType = ADMIN validated
            → Session created
            → Redirect to Admin Dashboard
```

#### 2. Tenant Signup (Social Auth)
```
PM App → Social Login Button (Google/GitHub)
       → OAuth Flow
       → User created in Better Auth
       → POST /api/tenants (create tenant + org)
       → Status = PENDING
       → Redirect to "Awaiting Approval/Dashboard" page
```

#### 3. Tenant Signup (Email/Password)
```
PM App → Sign Up Form
       → POST /api/auth/sign-up
       → User created
       → POST /api/tenants
       → Status = PENDING
       → Email verification sent (optional)
       → Redirect to "Awaiting Approval/Dashboard" page
```

#### 4. Employee Login
```
PM App → Accept Invitation Link
       → Social Login or Email/Password
       → POST /api/invitations/[token]/accept
       → User linked to tenant + org
       → userType = EMPLOYEE
       → Redirect to Dashboard
```

### Authorization Levels

#### API Helper Functions
Located in `lib/api-helpers.ts`:

- `getCurrentUser()` - Get current user or null
- `requireAuth()` - Require authentication (any user type)
- `requireSuperAdmin()` - Require super admin/admin
- `requireTenantOwner()` - Require tenant owner
- `requireTenantAccess(tenantId?)` - Require tenant member access
- `requireApprovedTenant()` - Require approved tenant status

### Session Management
- Sessions stored in PostgreSQL
- 2-day expiration (configurable)
- Automatic renewal on activity
- Cookie-based with httpOnly flag
- CORS-enabled for cross-origin access

---

## 🚀 Tenant Onboarding Flow

### Step-by-Step Process

#### Step 1: Signup
**User Action:** Visits PM App, clicks "Sign Up"

**Options:**
- Social Auth (Google/GitHub)
- Email/Password

**Backend:**
```typescript
// Better Auth handles user creation
POST /api/auth/sign-up or OAuth callback
→ Creates user in `user` table
→ userType = null initially
```

#### Step 2: Tenant Registration
**User Action:** Fills out company information form

**Data Required:**
- Organization name
- Description (optional)
- Industry
- Company size
- Expected number of users

**Backend:**
```typescript
POST /api/tenants
Body: {
  tenant: { id: userEmail, metadata: {...} },
  organization: { name, description, industry, size },
  onboardingRequest: { description, expectedUsers },
  user: { name, email }
}

→ Creates tenant (status: PENDING)
→ Creates organization
→ Creates onboarding_request
→ Links user to tenant (userType: TENANT)
```

#### Step 3: Awaiting Approval
**User Experience:**
- Can login to PM App
- Limited features (e.g., view profile, setup preferences)
- Banner: "Your account is pending approval"
- Cannot create projects or invite employees

**Backend:**
- Session valid but tenant status checked on protected routes

#### Step 4: Admin Approval
**Admin Action:** Logs into Admin Panel

**Process:**
1. Views pending tenants list
2. Reviews tenant details + onboarding request
3. Sets subscription tier and limits
4. Clicks "Approve" or "Reject"

**Backend:**
```typescript
PUT /api/tenants/[id]/approve
Body: {
  approvedBy: adminUserId,
  subscriptionTier: 'BASIC',
  maxEmployees: 10,
  maxProjects: 50
}

→ Updates tenant status to APPROVED
→ Sets approvedAt, approvedBy
→ Sets subscription limits
```

#### Step 5: Tenant Activated
**User Experience:**
- Receives email notification
- Logs in to PM App
- Full access granted
- Can create projects
- Can invite employees

---

## 👥 Employee Invitation Flow

### Step-by-Step Process

#### Step 1: Tenant Invites Employee
**Tenant Action:** Navigates to "Team" section, clicks "Invite Member"

**Data Required:**
- Email address
- Role (STAFF | MANAGER)

**Backend:**
```typescript
POST /api/invitations
Body: {
  email: 'employee@example.com',
  role: 'STAFF'
}

→ Creates invitation record
→ Generates unique token
→ Sets expiry (7 days)
→ Returns invitation URL
```

**Frontend:**
- Send email with invitation link
- Format: `{PM_APP_URL}/accept-invitation?token={token}`

#### Step 2: Employee Receives Invitation
**Email Content:**
```
Subject: You've been invited to join {OrganizationName}

Hi,

{TenantName} has invited you to join their team on ProjectManagementSaaS.

Click here to accept: {invitation_url}

This invitation expires in 7 days.
```

#### Step 3: Employee Accepts Invitation
**Employee Action:** Clicks invitation link

**Experience:**
1. Redirected to PM App
2. If not logged in:
   - Shows signup options (Social or Email/Password)
   - "You're joining {OrganizationName} as {Role}"
3. If already logged in:
   - Shows confirmation screen

**Backend:**
```typescript
GET /api/invitations/[token]
→ Returns invitation details (org name, role, etc.)

POST /api/invitations/[token]/accept
→ Links user to tenant + organization
→ Sets userType = EMPLOYEE
→ Sets role from invitation
→ Marks invitation as ACCEPTED
```

#### Step 4: Employee Onboarded
**Employee Experience:**
- Redirected to PM App dashboard
- Tenant-scoped access
- Can see tenant's projects (based on role)
- Can collaborate with team

---

## 🔌 API Structure

### Core API Endpoints

#### Authentication
```
POST   /api/auth/sign-up        # Sign up with email/password
POST   /api/auth/sign-in        # Sign in with email/password
POST   /api/auth/sign-out       # Sign out
GET    /api/auth/session        # Get current session
GET    /api/auth/[...all]       # Better Auth handlers
POST   /api/auth/[...all]       # Better Auth handlers
```

#### Tenants
```
GET    /api/tenants             # List tenants (admin only)
POST   /api/tenants             # Create tenant (authenticated user)
GET    /api/tenants/[id]        # Get tenant details
PUT    /api/tenants/[id]/approve      # Approve tenant (admin)
PUT    /api/tenants/[id]/reject       # Reject tenant (admin)
DELETE /api/tenants/[id]        # Soft delete tenant
POST   /api/tenants/[id]/recover     # Recover soft-deleted
DELETE /api/tenants/[id]/hard-delete # Permanently delete
```

#### Invitations
```
GET    /api/invitations         # List invitations (tenant owner)
POST   /api/invitations         # Create invitation (tenant owner)
GET    /api/invitations/[token] # Get invitation details
POST   /api/invitations/[token]/accept  # Accept invitation
DELETE /api/invitations/[id]    # Revoke invitation
```

#### Users
```
GET    /api/users               # List users (filtered by tenant)
GET    /api/users/me            # Get current user
PUT    /api/users/[id]          # Update user
DELETE /api/users/[id]          # Delete user
```

### Request/Response Format

#### Standard Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

#### Standard Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

#### Paginated List Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

## 🔒 Security Considerations

### CORS Configuration
- Configured in `next.config.ts` and `middleware.ts`
- Allowed origins from environment variables
- Credentials enabled for cookie-based auth
- Preflight requests handled

### Data Isolation
- Tenant ID validated on every request
- Row-level security via application logic
- Super admins bypass tenant isolation
- Soft deletes prevent accidental data loss

### Password Security
- Bcrypt hashing (10 rounds)
- Minimum 8 characters
- No password for social auth users
- Password reset flow (to be implemented)

### Session Security
- HttpOnly cookies
- Secure flag in production
- 2-day expiration
- IP address tracking
- User agent tracking

### Rate Limiting
- Recommended: Add rate limiting middleware
- Protect auth endpoints
- Protect invitation endpoints

### Input Validation
- Type checking via TypeScript
- Runtime validation in API routes
- SQL injection prevention via Drizzle ORM
- XSS prevention via React

---

## 🚀 Deployment Guide

### Environment Setup

#### Core API (.env)
```bash
DATABASE_URL="postgres://..."
BETTER_AUTH_SECRET="random-secret-key"
BETTER_AUTH_URL="https://api.yourapp.com"

GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

PM_APP_URL="https://app.yourapp.com"
ADMIN_APP_URL="https://admin.yourapp.com"
ALLOWED_ORIGINS="https://app.yourapp.com,https://admin.yourapp.com"

ADMIN_EMAIL="admin@yourapp.com"
ADMIN_PASSWORD="strong-password"
ADMIN_NAME="Super Admin"
```

#### PM App (.env)
```bash
NEXT_PUBLIC_CORE_API_URL="https://api.yourapp.com"
NEXT_PUBLIC_APP_URL="https://app.yourapp.com"
```

#### Admin Panel (.env)
```bash
NEXT_PUBLIC_CORE_API_URL="https://api.yourapp.com"
NEXT_PUBLIC_APP_URL="https://admin.yourapp.com"
```

### Deployment Steps

#### 1. Database Setup
```bash
# Run migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Seed super admin
pnpm seed:admin
```

#### 2. Deploy Core API
```bash
# Build
pnpm build

# Deploy to Vercel/Railway/AWS
# Ensure environment variables are set
```

#### 3. Deploy PM App
```bash
# Build with Core API URL
pnpm build

# Deploy
```

#### 4. Deploy Admin Panel
```bash
# Build with Core API URL
pnpm build

# Deploy
```

#### 5. Configure OAuth
- Add redirect URIs for production domains
- Update Google/GitHub OAuth apps
- Test social auth flows

### Monitoring & Maintenance
- Set up error tracking (Sentry)
- Monitor API response times
- Track tenant signup conversion
- Monitor database performance
- Regular security audits

---

## 📚 Additional Resources

### Better Auth Documentation
https://www.better-auth.com/docs

### Drizzle ORM Documentation
https://orm.drizzle.team/docs

### Next.js Documentation
https://nextjs.org/docs

### Multi-Tenancy Best Practices
- Tenant isolation strategies
- Subscription management
- Usage analytics

---

## 🤝 Contributing

### Development Workflow
1. Clone repository
2. Install dependencies: `pnpm install`
3. Setup database: Create PostgreSQL instance
4. Configure environment: Copy `.env.example` to `.env`
5. Run migrations: `pnpm migrate:up`
6. Seed admin: `pnpm seed:admin`
7. Start dev server: `pnpm dev`

### Code Structure
```
.
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication
│   │   ├── tenants/      # Tenant management
│   │   └── invitations/  # Invitation system
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/           # React components
├── db/
│   ├── schema.ts         # Database schema
│   ├── index.ts          # Database connection
│   └── repositories/     # Data access layer
├── lib/
│   ├── auth.ts           # Better Auth config
│   ├── api-helpers.ts    # API utilities
│   └── utils.ts          # Shared utilities
├── types/
│   ├── entityDTO.ts      # Data transfer objects
│   ├── entityEnums.ts    # Enumerations
│   └── request.ts        # Request types
├── scripts/
│   └── seed.admin.ts     # Super admin seed script
├── middleware.ts         # CORS + auth middleware
├── .env                  # Environment variables
└── ARCHITECTURE.md       # This file
```

---

**Last Updated:** December 5, 2025  
**Version:** 1.0.0  
**Maintainer:** @abdi-frost
