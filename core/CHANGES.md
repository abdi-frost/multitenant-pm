# Changelog - Multi-Tenant SaaS Core API Refactor

## Overview
This document tracks all changes made to transform the system into a multi-tenant SaaS platform with Better Auth integration and a multi-app architecture.

---

## 🗄️ Database Schema Changes

### ✅ Added Better Auth Tables

#### `user` table (replaces `admins` and `employees` tables)
- **Purpose:** Unified user management for all user types
- **Key Fields:**
  - `id` (text) - User identifier
  - `userType` (varchar) - ADMIN | TENANT | EMPLOYEE
  - `tenantId` (varchar, FK) - Links users to tenants
  - `organizationId` (uuid, FK) - Links users to organizations
  - `role` (varchar) - User-specific role
- **Integration:** Fully compatible with Better Auth

#### `session` table
- **Purpose:** Session management for Better Auth
- **Features:** IP tracking, user agent logging, expiration

#### `account` table
- **Purpose:** OAuth and credential linking
- **Providers:** google, github, credential (email/password)
- **Fields:** accessToken, refreshToken, idToken, password (hashed)

#### `verification` table
- **Purpose:** Email verification tokens
- **Use Case:** Email verification flow (optional feature)

### ✅ Updated Tenant Tables

#### `tenants` table - Enhanced
**Added Fields:**
- `approvedBy` (text, FK to user) - Changed from uuid to text
- `rejectedBy` (text, FK to user) - Changed from uuid to text
- `rejectionReason` (text) - Reason for rejection
- `subscriptionTier` (varchar) - FREE | BASIC | PREMIUM | ENTERPRISE
- `maxEmployees` (integer) - Subscription limit
- `maxProjects` (integer) - Subscription limit
- `subscriptionExpiresAt` (timestamp) - Subscription expiry date

#### `organizations` table - Enhanced
**Added Fields:**
- `website` (varchar) - Company website
- `industry` (varchar) - Industry type
- `size` (varchar) - SMALL | MEDIUM | LARGE | ENTERPRISE

#### `onboarding_requests` table - Enhanced
**Added Fields:**
- `companyDetails` (json) - Additional company information
- `businessType` (varchar) - Type of business
- `expectedUsers` (integer) - Expected number of users

### ✅ New Tables

#### `invitations` table
- **Purpose:** Employee invitation system
- **Key Fields:**
  - `id` (uuid, PK)
  - `tenantId` (varchar, FK)
  - `organizationId` (uuid, FK)
  - `email` (varchar) - Invitee email
  - `role` (varchar) - STAFF | MANAGER
  - `invitedBy` (text, FK to user)
  - `invitationToken` (varchar, unique) - Secure token
  - `expiresAt` (timestamp) - 7-day expiration
  - `status` (varchar) - PENDING | ACCEPTED | EXPIRED | REVOKED

### ❌ Removed Tables
- **`admins` table** - Replaced by `user` table with userType=ADMIN
- **`employees` table** - Replaced by `user` table with userType=EMPLOYEE

---

## 🔐 Authentication System Changes

### ✅ New: Better Auth Integration

#### Created `lib/auth.ts`
**Configuration:**
- Email/password authentication
- Social providers (Google, GitHub)
- Custom user ID generation
- Multi-tenant session management
- Hooks for signup/signin events
- Trusted origins for CORS

**Helper Functions:**
- `isSuperAdmin(user)` - Check super admin status
- `isTenantOwner(user)` - Check tenant owner status
- `isEmployee(user)` - Check employee status
- `getUserTenantId(user)` - Get user's tenant ID

### ✅ New: API Authentication Helpers

#### Created `lib/api-helpers.ts`
**Functions:**
- `getCurrentUser()` - Get authenticated user
- `requireAuth()` - Require any authenticated user
- `requireSuperAdmin()` - Require super admin
- `requireTenantOwner()` - Require tenant owner
- `requireTenantAccess(tenantId?)` - Require tenant access
- `requireApprovedTenant()` - Require approved tenant
- `handleApiError(error)` - Consistent error handling
- `createApiResponse(data, status, message)` - Success responses
- `createErrorResponse(message, status, details)` - Error responses

**Custom Error Class:**
- `AuthError` - Authentication/authorization errors with status codes

---

## 📁 Repository Layer Changes

### ✅ New: `tenant.repository.new.ts`
**Purpose:** Updated tenant management for Better Auth integration

**Key Functions:**
- `createTenant(data)` - Create tenant + org + onboarding request + link user
- `getTenantById(id)` - Fetch tenant with relationships
- `getTenants(query)` - Paginated list with search and status filter
- `approveTenant(data)` - Approve tenant with subscription settings
- `rejectTenant(data)` - Reject tenant with reason
- `softDeleteTenant(id)` - Soft delete
- `hardDeleteTenant(id)` - Permanent delete
- `recoverTenant(id)` - Recover soft-deleted tenant

**Changes from Original:**
- Uses `userTable` instead of `employeesTable`
- Updates `userType` when creating tenant
- Supports subscription tier and limits
- Enhanced error handling

### ✅ New: `invitation.repository.ts`
**Purpose:** Employee invitation management

**Key Functions:**
- `createInvitation(data)` - Create invitation with token generation
- `acceptInvitation(data)` - Accept invitation and link user
- `getInvitationByToken(token)` - Fetch invitation details
- `getInvitationsByTenant(tenantId)` - List tenant's invitations
- `revokeInvitation(id)` - Revoke pending invitation

**Features:**
- Secure token generation (crypto.randomBytes)
- 7-day expiration
- Status tracking (PENDING → ACCEPTED/EXPIRED/REVOKED)
- User linking to tenant and organization
- Invitation URL generation

---

## 🛣️ API Routes Changes

### ✅ New: `/api/invitations`
**Endpoints:**
- `GET /api/invitations` - List invitations (tenant owner)
- `POST /api/invitations` - Create invitation (tenant owner)

**Authentication:**
- Requires tenant owner authentication
- Automatic tenant ID from session

### ✅ New: `/api/invitations/[token]`
**Endpoints:**
- `GET /api/invitations/[token]` - Get invitation details (public)
- `POST /api/invitations/[token]/accept` - Accept invitation (authenticated)

**Features:**
- Token-based invitation validation
- User linking on acceptance

### ⚠️ Existing: `/api/auth/[...all]`
**Status:** Already configured
**Integration:** Better Auth handlers
**Methods:** GET, POST for all auth operations

### ⚠️ Existing: `/api/tenants`
**Status:** Needs update to use new repository
**Action Required:** Replace old tenant.repository.ts with tenant.repository.new.ts

---

## 🌐 CORS & Multi-App Configuration

### ✅ Updated: `next.config.ts`
**Added:**
- Headers configuration for CORS
- Allowed origins from environment variables
- Support for credentials
- Allowed methods and headers
- Applied to all `/api/*` routes

**Supported Origins:**
- PM App (localhost:3001 or production URL)
- Admin Panel (localhost:3002 or production URL)

### ✅ New: `middleware.ts`
**Purpose:** Enhanced CORS and request handling

**Features:**
- Preflight OPTIONS handling
- Dynamic origin validation
- Credentials support
- CORS headers for all API routes
- Excludes static files and Next.js internals

**Matcher:**
- All API routes: `/api/:path*`
- Excludes: `_next/static`, `_next/image`, `favicon.ico`

---

## 📝 Type Definitions Changes

### ✅ Updated: `types/entityEnums.ts`

**Added Enums:**
- `UserType` - ADMIN | TENANT | EMPLOYEE
- `OAuthProvider` - google | github | credential
- `InvitationStatus` - PENDING | ACCEPTED | EXPIRED | REVOKED
- `SubscriptionTier` - FREE | BASIC | PREMIUM | ENTERPRISE
- `OrganizationSize` - SMALL | MEDIUM | LARGE | ENTERPRISE
- `AccountStatus` - ACTIVE | SUSPENDED | DEACTIVATED

**Updated Enums:**
- `EmployeeRole` - Added ADMIN (tenant admin)
- `AdminRole` - Kept only ADMIN

### ✅ Updated: `types/entityDTO.ts`

**Added DTOs:**
- `UserDTO` - Better Auth user structure
- `SessionDTO` - Session information
- `AccountDTO` - OAuth account information
- `InvitationDTO` - Invitation structure
- `CreateSuperAdminDTO` - Super admin creation
- `CreateTenantDTO` - Updated tenant creation
- `CreateInvitationDTO` - Invitation creation
- `AcceptInvitationDTO` - Invitation acceptance
- `ApproveTenantDTO` - Tenant approval
- `RejectTenantDTO` - Tenant rejection

**Updated DTOs:**
- `TenantDTO` - Added subscription fields
- `OrganizationDTO` - Added website, industry, size
- `OnboardingRequestDTO` - Added companyDetails, businessType

**Removed DTOs:**
- `AdminDTO` - Replaced by UserDTO
- `EmployeeDTO` - Replaced by UserDTO

---

## 🔧 Configuration Files Changes

### ✅ Updated: `.env`
**Added Variables:**
```bash
# OAuth Providers
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET

# Multi-App URLs
CORE_API_URL
PM_APP_URL
ADMIN_APP_URL
ALLOWED_ORIGINS

# Super Admin (changed from USERNAME to EMAIL)
ADMIN_EMAIL (was ADMIN_USERNAME)
ADMIN_NAME (new)
ADMIN_PASSWORD (unchanged)
```

**Removed Variables:**
```bash
ADMIN_USERNAME (replaced by ADMIN_EMAIL)
ADMIN_ROLE (not needed, always ADMIN)
```

### ✅ New: `.env.example`
**Purpose:** Template for environment setup
**Sections:**
- Database configuration
- Better Auth configuration
- OAuth providers
- Multi-app architecture URLs
- CORS configuration
- Super admin seed data
- Email configuration (optional)
- SaaS configuration
- Security settings

---

## 📜 Scripts Changes

### ✅ Updated: `scripts/seed.admin.ts`
**Changes:**
- Uses `userTable` instead of `adminsTable`
- Creates Better Auth user record
- Creates credential account with hashed password
- Sets `userType = ADMIN`
- Sets `role = ADMIN`
- Uses email instead of username
- Enhanced console output with emojis
- Includes login URL for Admin Panel

**New Fields:**
- `ADMIN_EMAIL` (replaces ADMIN_USERNAME)
- `ADMIN_NAME` (new)

---

## 📚 Documentation Changes

### ✅ New: `ARCHITECTURE.md`
**Comprehensive documentation covering:**

1. **System Overview**
   - Multi-app architecture explanation
   - Key features
   - Technology stack

2. **Multi-App Architecture**
   - Core API responsibilities
   - PM App responsibilities
   - Admin Panel responsibilities
   - Communication flow diagram

3. **Database Schema**
   - Complete schema documentation
   - Table relationships
   - Field explanations

4. **Authentication & Authorization**
   - User types and auth methods
   - Auth flows for each user type
   - Authorization helper functions
   - Session management

5. **Tenant Onboarding Flow**
   - Step-by-step process
   - User experience at each stage
   - Backend operations
   - Admin approval process

6. **Employee Invitation Flow**
   - Invitation creation
   - Email template
   - Acceptance process
   - Employee onboarding

7. **API Structure**
   - Complete endpoint list
   - Request/response formats
   - Authentication requirements

8. **Security Considerations**
   - CORS configuration
   - Data isolation
   - Password security
   - Session security
   - Recommendations

9. **Deployment Guide**
   - Environment setup
   - Deployment steps
   - OAuth configuration
   - Monitoring recommendations

10. **Contributing**
    - Development workflow
    - Code structure

### ✅ New: `CHANGES.md` (This File)
**Purpose:** Track all modifications made during refactor

---

## 🎯 Migration Path

### For Existing Installations

#### Step 1: Backup
```bash
# Backup database
pg_dump multitenant-pm > backup.sql
```

#### Step 2: Update Code
```bash
# Pull latest changes
git pull origin main
```

#### Step 3: Install Dependencies
```bash
# Install new packages (Better Auth)
pnpm install
```

#### Step 4: Update Environment
```bash
# Copy new environment template
cp .env.example .env.new
# Manually merge old .env values into .env.new
# Rename .env.new to .env
```

#### Step 5: Database Migration
```bash
# Generate migration for new schema
pnpm drizzle-kit generate

# Review migration files in drizzle/ folder
# Apply migration
pnpm drizzle-kit migrate
```

#### Step 6: Migrate Data
```sql
-- Migrate admins to users table
INSERT INTO "user" (id, name, email, emailVerified, userType, role)
SELECT 
  'user_' || id::text,
  username,
  username || '@system.local', -- Generate email if not present
  true,
  'ADMIN',
  'ADMIN'
FROM admins
WHERE deleted = false;

-- Migrate admin credentials to accounts table
INSERT INTO account (id, accountId, providerId, userId, password)
SELECT 
  'account_' || id::text,
  'user_' || id::text,
  'credential',
  'user_' || id::text,
  password
FROM admins
WHERE deleted = false;

-- Migrate employees to users table (if needed)
-- Similar process for employees
```

#### Step 7: Seed Super Admin
```bash
# Seed new super admin
pnpm seed:admin
```

#### Step 8: Test
```bash
# Start dev server
pnpm dev

# Test authentication
# Test tenant creation
# Test invitation flow
```

### For Fresh Installations

#### Step 1: Setup
```bash
# Clone repository
git clone <repo-url>
cd multi-tenant-pm-saas

# Install dependencies
pnpm install
```

#### Step 2: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
# - Database URL
# - OAuth credentials
# - App URLs
# - Admin credentials
```

#### Step 3: Database Setup
```bash
# Generate and run migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Seed super admin
pnpm seed:admin
```

#### Step 4: Start Development
```bash
# Start Core API
pnpm dev

# Core API runs on http://localhost:3000
```

#### Step 5: Setup Other Apps
```bash
# Clone and setup PM App (separate repo)
# Configure PM_APP_URL to Core API

# Clone and setup Admin Panel (separate repo)
# Configure ADMIN_APP_URL to Core API
```

---

## ⚠️ Breaking Changes

### Database Schema
- **`admins` table removed** - All admin data must be migrated to `user` table
- **`employees` table removed** - All employee data must be migrated to `user` table
- **Foreign key changes** - `approvedBy` and `rejectedBy` changed from uuid to text

### API Changes
- **Authentication endpoints** - Now handled by Better Auth (`/api/auth/[...all]`)
- **User responses** - Structure changed to match Better Auth user model
- **Session format** - Better Auth session structure

### Environment Variables
- **`ADMIN_USERNAME` removed** - Use `ADMIN_EMAIL`
- **`ADMIN_ROLE` removed** - Always ADMIN
- **New required variables** - OAuth credentials, app URLs

### Code Changes
- **Import paths** - Update imports from `adminsTable`, `employeesTable` to `userTable`
- **User type checks** - Use `user.userType` instead of table-specific queries
- **Authentication** - Use Better Auth API instead of custom auth

---

## 🚀 New Features

### Authentication
✅ Social authentication (Google, GitHub)  
✅ Email/password authentication  
✅ Session management  
✅ Email verification support (optional)  
✅ OAuth provider management

### Multi-Tenancy
✅ Tenant approval workflow  
✅ Subscription tiers  
✅ Resource limits (employees, projects)  
✅ Tenant isolation  
✅ Soft delete with recovery

### Employee Management
✅ Email invitations  
✅ Invitation expiration  
✅ Role-based invitations  
✅ Social auth for employees  
✅ Invitation status tracking

### Security
✅ CORS configuration  
✅ Role-based access control  
✅ API authentication helpers  
✅ Secure token generation  
✅ Password hashing with bcrypt

### Developer Experience
✅ Comprehensive documentation  
✅ Type-safe DTOs  
✅ Error handling utilities  
✅ Seed scripts  
✅ Environment templates

---

## 📊 Statistics

### Files Added: 11
- `lib/auth.ts`
- `lib/api-helpers.ts`
- `db/repositories/tenant.repository.new.ts`
- `db/repositories/invitation.repository.ts`
- `app/api/invitations/route.ts`
- `app/api/invitations/[token]/route.ts`
- `middleware.ts`
- `.env.example`
- `ARCHITECTURE.md`
- `CHANGES.md`
- (1 more utility file)

### Files Modified: 7
- `db/schema.ts` (major refactor)
- `types/entityEnums.ts` (added enums)
- `types/entityDTO.ts` (updated DTOs)
- `scripts/seed.admin.ts` (complete rewrite)
- `next.config.ts` (added CORS)
- `.env` (updated variables)
- `package.json` (Better Auth dependencies)

### Files Deprecated: 1
- `db/repositories/tenant.repository.ts` (use tenant.repository.new.ts)

### Lines of Code: ~3000+ new lines
- Documentation: ~1000 lines
- Code: ~2000 lines
- Configuration: ~100 lines

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Email service integration (SendGrid/AWS SES)
- [ ] Password reset flow
- [ ] Email verification flow
- [ ] Two-factor authentication (2FA)
- [ ] Audit logging
- [ ] Billing integration (Stripe)
- [ ] Usage analytics
- [ ] Rate limiting middleware
- [ ] API versioning
- [ ] GraphQL API option

### Infrastructure
- [ ] CI/CD pipeline
- [ ] Automated testing
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)
- [ ] Database backups
- [ ] Horizontal scaling strategy

### Documentation
- [ ] API reference (OpenAPI/Swagger)
- [ ] Postman collection
- [ ] Video tutorials
- [ ] Migration guides
- [ ] Troubleshooting guide

---

**Document Version:** 1.0.0  
**Last Updated:** December 5, 2025  
**Author:** Development Team
