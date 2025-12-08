# API Testing Guide

Complete guide for testing the Multi-Tenant PM SaaS Core API using HTTP files.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Test Files](#test-files)
- [Testing Workflows](#testing-workflows)
- [Common Scenarios](#common-scenarios)
- [Tips & Tricks](#tips--tricks)

---

## Prerequisites

### 1. Install REST Client Extension

Install the REST Client extension in VS Code:

```
Extension ID: humao.rest-client
```

Or search "REST Client" in VS Code extensions marketplace.

### 2. Start the Development Server

```bash
cd c:/Users/HP/Desktop/projects/fullstack/multi-tenant-pm-saas
pnpm dev
```

The API will be available at `http://localhost:3000`

### 3. Setup Database

```bash
# Generate and apply migrations
pnpm migrate:generate
pnpm migrate:up

# Seed admin user
pnpm seed:admin
```

---

## Quick Start

### Step 1: Test Health Check

Open `tests/README.http` and send the health check request:

```http
GET http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "services": {
    "database": "connected",
    "auth": "operational"
  }
}
```

### Step 2: Test Admin Login

Open `tests/auth.http` and update the variables:

```http
@adminEmail = admin@example.com
@adminPassword = Admin123!
```

Send the admin sign-in request and copy the session token from the response cookies.

### Step 3: Test Tenant Management

Open `tests/tenants.http` and paste your admin session token:

```http
@adminSessionToken = your-copied-session-token
```

Now you can test tenant approval, rejection, and management endpoints.

---

## Test Files

### 📁 `tests/auth.http`
**Purpose:** Authentication and user management

**Endpoints covered:**
- Sign up with email/password
- Sign in (admin, tenant, employee)
- OAuth login (Google, GitHub)
- Session management
- Password reset
- Email verification

**Use cases:**
- Create new tenant accounts
- Admin login
- Social authentication testing
- Password management flows

---

### 📁 `tests/tenants.http`
**Purpose:** Tenant management (Admin only)

**Endpoints covered:**
- List all tenants
- Search and filter tenants
- Get tenant details
- Approve tenant with subscription tier
- Reject tenant with reason
- Soft delete and recovery
- Hard delete (permanent)

**Use cases:**
- Tenant approval workflow
- Subscription tier assignment
- Tenant moderation
- Analytics and reporting

---

### 📁 `tests/invitations.http`
**Purpose:** Employee invitation system

**Endpoints covered:**
- Create invitation
- Bulk invite employees
- List invitations by status
- Accept invitation
- Resend invitation email
- Revoke invitation

**Use cases:**
- Onboard team members
- Role-based access control
- Invitation lifecycle management
- Employee acceptance flow

---

### 📁 `tests/onboarding.http`
**Purpose:** Onboarding requests (future feature)

**Endpoints covered:**
- Submit onboarding request
- List onboarding requests
- Review and approve requests

**Use cases:**
- Collect business information
- Sales qualified leads
- Custom tier negotiations

---

### 📁 `tests/README.http`
**Purpose:** Complete testing guide and examples

**Contains:**
- Setup instructions
- Common test scenarios
- Error handling examples
- Performance testing tips
- Security testing checklist

---

## Testing Workflows

### Workflow 1: Complete Tenant Onboarding (10 minutes)

**Goal:** Take a new tenant from signup to approved status

1. **Create Tenant Account** (`auth.http`)
   ```http
   POST /api/auth/sign-up/email
   {
     "email": "newtenant@example.com",
     "password": "Tenant123!",
     "name": "New Tenant"
   }
   ```

2. **Admin Reviews Tenant** (`tenants.http`)
   ```http
   # Sign in as admin first
   GET /api/tenants?status=PENDING
   ```

3. **Admin Approves Tenant** (`tenants.http`)
   ```http
   POST /api/tenants/{tenantId}/approve
   {
     "subscriptionTier": "BASIC",
     "maxEmployees": 10,
     "maxProjects": 20
   }
   ```

4. **Tenant Signs In** (`auth.http`)
   ```http
   POST /api/auth/sign-in/email
   {
     "email": "newtenant@example.com",
     "password": "Tenant123!"
   }
   ```

**Success criteria:** Tenant can now access full system features

---

### Workflow 2: Employee Invitation & Acceptance (7 minutes)

**Goal:** Invite an employee and have them accept the invitation

1. **Tenant Creates Invitation** (`invitations.http`)
   ```http
   POST /api/invitations
   {
     "email": "employee@example.com",
     "role": "STAFF",
     "firstName": "John",
     "lastName": "Doe"
   }
   ```

2. **Copy Invitation Token** (from response)
   ```json
   {
     "token": "inv_abc123xyz..."
   }
   ```

3. **Employee Accepts Invitation** (`invitations.http`)
   ```http
   POST /api/invitations/{token}/accept
   {
     "email": "employee@example.com",
     "password": "Employee123!",
     "name": "John Doe"
   }
   ```

4. **Verify Employee Access** (`auth.http`)
   ```http
   POST /api/auth/sign-in/email
   {
     "email": "employee@example.com",
     "password": "Employee123!"
   }
   ```

**Success criteria:** Employee linked to tenant and can login

---

### Workflow 3: Tenant Rejection Flow (3 minutes)

**Goal:** Reject a tenant with a specific reason

1. **Admin Reviews Tenant** (`tenants.http`)
   ```http
   GET /api/tenants?status=PENDING
   ```

2. **Admin Rejects Tenant** (`tenants.http`)
   ```http
   POST /api/tenants/{tenantId}/reject
   {
     "reason": "Invalid business information provided"
   }
   ```

3. **Verify Rejection** (`tenants.http`)
   ```http
   GET /api/tenants/{tenantId}
   ```

**Success criteria:** Tenant status is REJECTED with reason recorded

---

## Common Scenarios

### Scenario 1: Forgot Password

```http
# Request password reset
POST /api/auth/reset-password
{
  "email": "user@example.com"
}

# Reset with token from email
POST /api/auth/reset-password/confirm
{
  "token": "reset-token-from-email",
  "password": "NewPassword123!"
}
```

---

### Scenario 2: Bulk Employee Invitations

```http
POST /api/invitations/bulk
{
  "invitations": [
    {
      "email": "dev1@example.com",
      "role": "STAFF",
      "firstName": "Alice",
      "lastName": "Developer"
    },
    {
      "email": "manager@example.com",
      "role": "MANAGER",
      "firstName": "Bob",
      "lastName": "Manager"
    }
  ]
}
```

---

### Scenario 3: Upgrade Tenant Subscription

```http
# Admin re-approves with higher tier
POST /api/tenants/{tenantId}/approve
{
  "subscriptionTier": "PREMIUM",
  "maxEmployees": 50,
  "maxProjects": 100,
  "notes": "Upgraded to Premium"
}
```

---

### Scenario 4: Revoke Employee Access

```http
# Tenant owner revokes invitation
DELETE /api/invitations/{invitationId}
```

---

## Tips & Tricks

### 1. Managing Session Tokens

**Problem:** Session tokens are long and hard to manage

**Solution:** Use VS Code variables

```http
# At top of file
@sessionToken = your-session-token-here

# Use in requests
Cookie: better-auth.session_token={{sessionToken}}
```

**Tip:** Copy token from response cookies after sign-in

---

### 2. Testing Multiple Tenants

**Problem:** Need to test with different tenant accounts

**Solution:** Create multiple variable sets

```http
# Tenant 1
@tenant1Email = tenant1@example.com
@tenant1Token = token1

# Tenant 2
@tenant2Email = tenant2@example.com
@tenant2Token = token2
```

---

### 3. Quick Status Filtering

**Problem:** Too many results when listing tenants

**Solution:** Use status filters

```http
# Only pending approvals
GET /api/tenants?status=PENDING

# Only active tenants
GET /api/tenants?status=APPROVED

# Only rejected
GET /api/tenants?status=REJECTED
```

---

### 4. Debugging Failed Requests

**Problem:** Request fails with error

**Steps to debug:**

1. Check response status code
   - 400: Bad request (check request body)
   - 401: Unauthorized (check session token)
   - 403: Forbidden (check user permissions)
   - 404: Not found (check ID/URL)
   - 500: Server error (check server logs)

2. Read error message in response
3. Verify session token is valid
4. Check user has required permissions
5. Verify all required fields are present

---

### 5. Testing OAuth Locally

**Problem:** OAuth redirects don't work on localhost

**Solution:** Configure OAuth callback URLs

**Google Console:**
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

**GitHub Settings:**
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

**Update .env:**
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
```

---

### 6. Resetting Test Data

**Problem:** Test data is messy, want to start fresh

**Solution:** Reset database (CAUTION - DEVELOPMENT ONLY)

```bash
# Rollback migrations
pnpm migrate:down

# Drop database
dropdb multitenant-pm

# Recreate database
createdb multitenant-pm

# Re-apply migrations
pnpm migrate:up

# Re-seed admin
pnpm seed:admin
```

---

### 7. Viewing Database Data

**Problem:** Want to see actual data in database

**Solution:** Use Drizzle Studio

```bash
pnpm drizzle-kit studio
```

Opens a web UI at `http://localhost:4983` to browse database tables.

---

## Response Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request body, validation error |
| 401 | Unauthorized | Not logged in, invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (email, invitation) |
| 500 | Server Error | Database error, unexpected error |

---

## Common Error Messages

### "Unauthorized"
- **Cause:** Missing or invalid session token
- **Fix:** Sign in and copy fresh session token

### "Forbidden: Admin access required"
- **Cause:** Non-admin user accessing admin endpoint
- **Fix:** Use admin session token

### "Tenant not found"
- **Cause:** Invalid tenant ID
- **Fix:** Verify ID from GET /api/tenants request

### "Invitation already accepted"
- **Cause:** Trying to accept same invitation twice
- **Fix:** Use a new invitation token

### "Email already exists"
- **Cause:** Signing up with existing email
- **Fix:** Use different email or sign in

---

## Best Practices

### ✅ DO:
- Test with realistic data
- Use descriptive variable names
- Comment your test scenarios
- Save successful responses for reference
- Test error cases
- Verify response data structure

### ❌ DON'T:
- Test hard delete in production
- Share session tokens
- Use production emails in tests
- Skip authentication tests
- Ignore error messages
- Test without migrations applied

---

## Next Steps

After testing Core API:

1. **Build Admin Panel** (Port 3002)
   - Login page
   - Tenant approval dashboard
   - Analytics

2. **Build PM App** (Port 3001)
   - Tenant/Employee login
   - Project management
   - Task boards

3. **Add Projects API**
   - Create/list projects
   - Task management
   - Team collaboration

4. **Deploy to Production**
   - Setup production database
   - Configure OAuth production URLs
   - Deploy all three apps

---

## Support

For issues or questions:

1. Check `ARCHITECTURE.md` for system design
2. Check `SETUP.md` for configuration help
3. Check `MVP_ROADMAP.md` for development plan
4. Review server logs for errors

---

**Happy Testing! 🚀**
