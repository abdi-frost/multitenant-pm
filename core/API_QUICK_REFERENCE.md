# Quick Reference - API Endpoints

Quick reference card for Multi-Tenant PM SaaS Core API endpoints.

---

## 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | Create new account |
| POST | `/api/auth/sign-in/email` | Sign in with email/password |
| POST | `/api/auth/sign-out` | Sign out current session |
| GET | `/api/auth/session` | Get current session |
| GET | `/api/auth/user` | Get current user profile |
| PATCH | `/api/auth/user` | Update user profile |
| GET | `/api/auth/sign-in/social/google` | Google OAuth |
| GET | `/api/auth/sign-in/social/github` | GitHub OAuth |
| POST | `/api/auth/reset-password` | Request password reset |
| POST | `/api/auth/reset-password/confirm` | Reset password with token |
| POST | `/api/auth/change-password` | Change password (authenticated) |
| POST | `/api/auth/verify-email` | Resend verification email |
| POST | `/api/auth/verify-email/confirm` | Verify email with token |

---

## 👥 Tenant Management (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenants` | List all tenants |
| GET | `/api/tenants?status=PENDING` | Get pending tenants |
| GET | `/api/tenants?status=APPROVED` | Get approved tenants |
| GET | `/api/tenants?search=term` | Search tenants |
| GET | `/api/tenants/:id` | Get tenant by ID |
| POST | `/api/tenants/:id/approve` | Approve tenant |
| POST | `/api/tenants/:id/reject` | Reject tenant |
| DELETE | `/api/tenants/:id` | Soft delete tenant |
| POST | `/api/tenants/:id/recover` | Recover soft deleted tenant |
| DELETE | `/api/tenants/:id/hard-delete` | Permanent delete (CAUTION) |

---

## 📧 Invitations (Tenant Owner)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/invitations` | Create invitation |
| POST | `/api/invitations/bulk` | Bulk invite employees |
| GET | `/api/invitations` | List all invitations |
| GET | `/api/invitations?status=PENDING` | Get pending invitations |
| GET | `/api/invitations/:token` | Get invitation by token (public) |
| GET | `/api/invitations/id/:id` | Get invitation by ID |
| POST | `/api/invitations/:token/accept` | Accept invitation (public) |
| POST | `/api/invitations/:id/resend` | Resend invitation email |
| DELETE | `/api/invitations/:id` | Revoke invitation |
| PATCH | `/api/invitations/:id` | Update invitation role |
| GET | `/api/invitations/check?email=x` | Check if email invited |

---

## 🏥 Health & System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health check |
| GET | `/` | API documentation (homepage) |

---

## 📝 Request Body Examples

### Sign Up
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "User Name"
}
```

### Sign In
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

### Approve Tenant
```json
{
  "subscriptionTier": "BASIC",
  "maxEmployees": 10,
  "maxProjects": 20,
  "notes": "Approved for basic tier"
}
```

### Reject Tenant
```json
{
  "reason": "Invalid business information"
}
```

### Create Invitation
```json
{
  "email": "employee@example.com",
  "role": "STAFF",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Accept Invitation
```json
{
  "email": "employee@example.com",
  "password": "Password123!",
  "name": "John Doe"
}
```

---

## 🎫 Subscription Tiers

| Tier | Max Employees | Max Projects | Features |
|------|---------------|--------------|----------|
| FREE | 5 | 3 | Basic PM |
| BASIC | 10 | 20 | Basic + Reports |
| PREMIUM | 50 | 100 | Basic + Reports + Analytics |
| ENTERPRISE | Unlimited | Unlimited | All features + Custom |

---

## 👤 User Types

| Type | Description | Access Level |
|------|-------------|--------------|
| ADMIN | System administrator | All tenants, approval workflow |
| TENANT | Tenant owner | Own tenant, invite employees |
| EMPLOYEE | Team member | Assigned projects/tasks |

---

## 🛡️ Employee Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| STAFF | Basic employee | View/edit assigned tasks |
| MANAGER | Team manager | Create projects, assign tasks |
| ADMIN | Tenant admin | Manage employees, settings |

---

## 📊 Status Values

### Tenant Status
- `PENDING` - Awaiting admin approval
- `APPROVED` - Active and can use system
- `REJECTED` - Rejected with reason

### Invitation Status
- `PENDING` - Waiting for employee to accept
- `ACCEPTED` - Employee joined tenant
- `EXPIRED` - Invitation expired (7 days)
- `REVOKED` - Cancelled by tenant owner

---

## 🔑 Authentication Headers

### Session Token (Authenticated Requests)
```
Cookie: better-auth.session_token=YOUR_SESSION_TOKEN
```

### Content Type (POST/PATCH Requests)
```
Content-Type: application/json
```

---

## 🌐 Environment Variables

```env
# Database
DATABASE_URL=postgres://user:pass@localhost:5433/dbname

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!
ADMIN_NAME=System Admin

# Multi-App URLs
CORE_API_URL=http://localhost:3000
PM_APP_URL=http://localhost:3001
ADMIN_APP_URL=http://localhost:3002
```

---

## 🚀 Common Commands

```bash
# Start development server
pnpm dev

# Database migrations
pnpm migrate:generate    # Generate migrations
pnpm migrate:up          # Apply migrations
pnpm migrate:down        # Rollback migrations

# Seed admin user
pnpm seed:admin

# View database
pnpm drizzle-kit studio

# Type checking
pnpm tsc --noEmit

# Build for production
pnpm build

# Start production server
pnpm start
```

---

## 📦 Query Parameters

### Pagination
```
?page=1&limit=10
```

### Search
```
?search=company
```

### Filter by Status
```
?status=PENDING
```

### Combined
```
?search=acme&status=APPROVED&page=1&limit=20
```

---

## ⚡ Quick Test Flow

1. **Start Server:** `pnpm dev`
2. **Health Check:** GET `/api/health`
3. **Seed Admin:** `pnpm seed:admin`
4. **Admin Login:** POST `/api/auth/sign-in/email`
5. **Create Tenant:** POST `/api/auth/sign-up/email`
6. **Approve Tenant:** POST `/api/tenants/:id/approve`
7. **Create Invitation:** POST `/api/invitations`
8. **Accept Invitation:** POST `/api/invitations/:token/accept`

---

## 📋 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

---

## 🔗 Related Files

- `tests/auth.http` - Authentication tests
- `tests/tenants.http` - Tenant management tests
- `tests/invitations.http` - Invitation tests
- `tests/API_TESTING_GUIDE.md` - Complete testing guide
- `ARCHITECTURE.md` - System architecture
- `MVP_ROADMAP.md` - Development roadmap

---

**Base URL:** `http://localhost:3000`

**Documentation:** Visit homepage at `http://localhost:3000`
