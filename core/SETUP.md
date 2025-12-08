# 🚀 Quick Setup Guide

This guide will help you get the Core API module up and running quickly.

## Prerequisites

- Node.js 18+ and pnpm installed
- PostgreSQL database (local or cloud)
- Google/GitHub OAuth apps (optional, for social auth)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` with your values:

```bash
# Required
DATABASE_URL="postgres://user:password@localhost:5432/dbname"
BETTER_AUTH_SECRET="generate-a-random-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Optional: OAuth (skip if you don't need social auth yet)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Multi-app URLs (adjust ports if different)
PM_APP_URL="http://localhost:3001"
ADMIN_APP_URL="http://localhost:3002"
ALLOWED_ORIGINS="http://localhost:3001,http://localhost:3002"

# Super Admin credentials
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="YourSecurePassword123!"
ADMIN_NAME="Super Admin"
```

### 3. Setup Database

```bash
# Generate migration files
pnpm migrate:generate

# Apply migrations to database
pnpm migrate:up
```

### 4. Seed Super Admin

```bash
pnpm seed:admin
```

You should see output like:
```
✅ Super admin created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: admin@example.com
🔑 Password: YourSecurePassword123!
⚠️  Please change the password after first login!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5. Start Development Server

```bash
pnpm dev
```

The Core API will be running at `http://localhost:3000`

### 6. Test the Setup

#### Check API Health
```bash
curl http://localhost:3000/api/auth/session
```

#### Test Super Admin Login

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "YourSecurePassword123!"
  }'
```

**Using Postman/Insomnia:**
- Method: POST
- URL: `http://localhost:3000/api/auth/sign-in`
- Body (JSON):
```json
{
  "email": "admin@example.com",
  "password": "YourSecurePassword123!"
}
```

## OAuth Setup (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3001/api/auth/callback/google` (PM App)
6. Copy Client ID and Secret to `.env`

### GitHub OAuth

1. Go to [GitHub Settings > Developer settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: Your App Name
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env`

## Testing the Tenant Flow

### 1. Tenant Signup (via API)

```bash
# First, create a user via Better Auth
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tenant@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'

# Then create tenant record
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Cookie: [session-cookie-from-signup]" \
  -d '{
    "tenant": {
      "id": "tenant@example.com"
    },
    "organization": {
      "name": "Acme Corp",
      "description": "Software company",
      "industry": "Technology",
      "size": "SMALL"
    },
    "user": {
      "name": "John Doe",
      "email": "tenant@example.com"
    }
  }'
```

### 2. Approve Tenant (as Super Admin)

```bash
curl -X PUT http://localhost:3000/api/tenants/tenant@example.com/approve \
  -H "Content-Type: application/json" \
  -H "Cookie: [super-admin-session-cookie]" \
  -d '{
    "approvedBy": "[super-admin-user-id]",
    "subscriptionTier": "BASIC",
    "maxEmployees": 10,
    "maxProjects": 50
  }'
```

### 3. Create Employee Invitation

```bash
curl -X POST http://localhost:3000/api/invitations \
  -H "Content-Type: application/json" \
  -H "Cookie: [tenant-session-cookie]" \
  -d '{
    "email": "employee@example.com",
    "role": "STAFF"
  }'
```

## Common Issues

### Database Connection Error
```
Error: connect ECONNREFUSED
```
**Solution:** Check DATABASE_URL, ensure PostgreSQL is running

### Migration Error
```
Error: relation "user" does not exist
```
**Solution:** Run migrations: `pnpm migrate:up`

### OAuth Not Working
```
Error: Invalid OAuth configuration
```
**Solution:** Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set

### CORS Error in Browser
```
Access to fetch has been blocked by CORS policy
```
**Solution:** Add your frontend URL to ALLOWED_ORIGINS in .env

## Next Steps

1. **Setup PM App** - Clone and configure the Project Management application
2. **Setup Admin Panel** - Clone and configure the Admin Panel application
3. **Configure Email Service** - Setup SendGrid/AWS SES for invitation emails
4. **Deploy to Production** - Follow the deployment guide in ARCHITECTURE.md

## Useful Commands

```bash
# Development
pnpm dev                # Start dev server
pnpm build             # Build for production
pnpm start             # Start production server

# Database
pnpm migrate:generate  # Generate migration
pnpm migrate:up        # Apply migrations
pnpm migrate:down      # Rollback last migration

# Seed
pnpm seed:admin        # Seed super admin

# Code Quality
pnpm lint              # Run ESLint
```

## Documentation

- **Architecture:** See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design
- **Changes:** See [CHANGES.md](./CHANGES.md) for complete changelog
- **Better Auth:** https://www.better-auth.com/docs
- **Drizzle ORM:** https://orm.drizzle.team/docs

## Support

If you encounter issues:
1. Check the documentation files
2. Review environment variables
3. Check database connection
4. Verify migrations are applied
5. Check console logs for errors

---

**Ready to build something amazing! 🚀**
