# Better Auth Integration Guide (Next.js App Router v16)

This guide is grounded in the official Better Auth LLM documentation index at https://www.better-auth.com/llms.txt and references specific sections for authoritative setup:

- Next.js Integration: /llms.txt/docs/integrations/next.md
- Drizzle Adapter: /llms.txt/docs/adapters/drizzle.md
- PostgreSQL: /llms.txt/docs/adapters/postgresql.md
- Authentication Providers:
  - Email & Password: /llms.txt/docs/authentication/email-password.md
  - Google: /llms.txt/docs/authentication/google.md
  - GitHub: /llms.txt/docs/authentication/github.md
- Concepts:
  - Session Management: /llms.txt/docs/concepts/session-management.md
  - OAuth: /llms.txt/docs/concepts/oauth.md
  - Cookies: /llms.txt/docs/concepts/cookies.md
  - Database: /llms.txt/docs/concepts/database.md
- Plugins:
  - Bearer Token Authentication (for REST API clients): /llms.txt/docs/plugins/bearer.md
  - Organization (if you prefer managed orgs): /llms.txt/docs/plugins/organization.md

We implement Better Auth in this core multi‑tenant project management app as the central Auth Server for multiple Next.js client apps via REST APIs. It supports:

- Super Admin seeding and admin invites
- Tenant registration with a first employee as Tenant Manager (Org Admin)
- Employee invites under each tenant
- Email + Password for admins
- Google and GitHub OAuth for tenant signup and employee invites

Use this guide as a repeatable blueprint for similar projects.

---

## 1) Architecture Overview

- **Core App (Auth Server):**
  - Hosts Better Auth; issues sessions/tokens.
  - Exposes REST endpoints for authentication, user/tenant lifecycle, and invitations.
  - Owns multi‑tenant data: `tenants`, `employees`, `roles`, `invitations`.

- **Client Apps (Consumers):**
  - Use REST APIs to authenticate (redirect to provider, receive session) and manage tenant/employee flows.
  - Rely on the core app for identity, roles, and permissions.

- **Flows:**
  - **Super Admin Seeding:** Initialize the first super admin account.
  - **Admin Invites:** Super admin invites additional admins (email + password).
  - **Tenant Registration:** Public flow to create tenant + first employee (Org Admin). Supports Google/GitHub.
  - **Employee Invites:** Tenant Admin invites employees; supports Google/GitHub.

- **Scopes & Roles:**
  - Global: `SUPER_ADMIN`, `ADMIN`
  - Per‑tenant: `ORG_ADMIN`, `MANAGER`, `EMPLOYEE` etc.

- **Sessions & Tokens:**
  - Better Auth manages sessions (cookies) and can issue access tokens for REST API authorization.

---

## 2) Prerequisites & Environment

- **Runtime:** Next.js App Router v16, TypeScript.
- **Database:** PostgreSQL (via Drizzle ORM) with tenant/employee/invitation tables.
- **Env Vars:** (see Concepts: Cookies, Session Management, OAuth)
  - `BETTER_AUTH_SECRET` – cryptographic secret for signing (Options reference).
  - `AUTH_BASE_URL` – public base URL of the auth server (Next.js integration uses this for callbacks).
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` – Google OAuth credentials (Google provider doc).
  - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` – GitHub OAuth credentials (GitHub provider doc).
  - SMTP credentials for email delivery (Concepts: Email) if using email invites or email/password flows.

- **CLI:** Better Auth CLI for bootstrapping providers and basic config.

- **Network:** Publicly accessible callback URLs for Google/GitHub providers.

---

## 3) Database & Data Model Mapping

We leverage existing tables (see `db/schema.ts`) and align user identity with multi‑tenant entities.

- **Users Table (Better Auth):** Primary identity. Links to employees/admins.
- **Admins:** Global admins table or flag on user profile (role `ADMIN`/`SUPER_ADMIN`).
- **Tenants:** Each tenant record contains metadata and status (pending/approved/etc.).
- **Employees:** Belong to tenants; have roles (`ORG_ADMIN`, `MANAGER`, `EMPLOYEE`).
- **Invitations:** Tokenized invites to admins or tenant employees; track email, role, tenant, expiration, acceptedBy.

Note: Keep Better Auth’s internal `user.id` as the canonical identity and reference it from `admins` and `employees`. Use the Drizzle adapter patterns from /llms.txt/docs/adapters/drizzle.md and PostgreSQL best practices from /llms.txt/docs/adapters/postgresql.md.

---

## 4) Better Auth Initialization (Server)

Implement Better Auth in the core app to own identity lifecycle.

- **Install & Configure:** (Installation + Next.js + Drizzle adapter docs)
  ```bash
  pnpm add better-auth @better-auth/next @better-auth/drizzle
  ```

- **Setup Better Auth instance:** Create `lib/auth.ts` (already exists) to initialize providers and adapters.
  - **Adapter:** Use `@better-auth/drizzle` with Postgres (Drizzle adapter guide).
  - **Session Strategy:** Cookie‑based sessions for browsers (Session Management) and Bearer tokens for REST clients (Bearer plugin).
  - **Providers:**
    - **Email + Password** (Email & Password doc) for global admins.
    - **Google/GitHub** (provider docs) for tenant registration and employee invites.
  - **Hooks/Callbacks:** Use Better Auth hooks (Concepts: Hooks) to map OAuth profile → `users` and then to `employees` under tenant context when signing up via invitation or tenant registration.

- **Routes (App Router):**
  - Add Better Auth API endpoints under `app/api/auth/[...all]/route.ts` (present) to forward to Better Auth handler.
  - Provide custom endpoints for invitations, tenant registration, and admin onboarding.

- **Environment:** Ensure secrets and provider credentials are set.

Behind the scenes (Concepts: Cookies, Session Management, OAuth), Better Auth handles session creation, secure cookies, CSRF protection, and OAuth redirects/callbacks.

---

## 5) Role & Permission Model

- **Global Roles:**
  - `SUPER_ADMIN`: full control, approves tenants.
  - `ADMIN`: system ops; limited global privileges.

- **Tenant Roles:**
  - `ORG_ADMIN`: owns tenant configuration; invites employees.
  - `MANAGER`: manages projects/tasks within tenant.
  - `EMPLOYEE`: standard permissions.

Enforce via middleware or per‑route checks reading session claims and role assignments from DB. For API clients, leverage Bearer tokens (Plugins: Bearer) to authorize requests without browser cookies.

---

## 6) Core Flows (Step‑by‑Step)

### 6.1 Super Admin Seeding

1. **Create seed script** (see `scripts/seed.admin.ts`):
   - Inserts a user with role `SUPER_ADMIN` (email + password only).
   - Uses Better Auth password hashing.
2. **Run seed:**
   ```bash
   pnpm tsx scripts/seed.admin.ts
   ```
3. **Login:** Super admin logs in via `/api/auth/signin` (Email & Password doc).

Why: Establish a trusted bootstrap identity to govern the system. Behind the scenes, Better Auth creates a session cookie with claims indicating global role.

### 6.2 Admin Invites (Global)

1. **Create an invite:** Super admin uses `/api/invitations` to create an admin invite (email, role=`ADMIN`).
2. **Send email:** Email includes link with token (`/invite?token=...`).
3. **Accept invite:** The link leads to a page that calls `/api/auth/signup` (email + password) with the invite token.
4. **Finalize:** Upon successful signup, link `user` to `admin` role (use Hooks for post‑signup mapping).

Why: Invitation tokens gate who can onboard as admin. The token is validated server‑side; Better Auth creates the user and session.

### 6.3 Tenant Registration + First Employee (Org Admin)

1. **Public registration endpoint:** `/api/tenants` accepts tenant details.
2. **First employee (Org Admin):**
   - Option A: Email + password.
   - Option B: Google/GitHub OAuth.
3. **If OAuth:** (Provider docs: Google, GitHub)
  - Redirect user to provider; on callback, Better Auth creates/links the `user`.
  - In `onUserCreated`/post‑callback hook, link to tenant and create `employee` with role `ORG_ADMIN`.
4. **Approval Workflow:** Super admin or admin can approve tenant (`/api/tenants/[id]/approve`).
5. **Session:** User receives session with tenant context (e.g., default tenant ID in claims).

Why: Combines identity creation with tenant provisioning. Behind the scenes, provider profile is normalized and stored; tenant linkage is transactional.

### 6.4 Employee Invites (Per Tenant)

1. **Tenant admin creates invite:** `/api/invitations` with `tenantId`, `role`, email.
2. **OAuth support:** Invite landing page can trigger Google/GitHub signup.
3. **Accept invite:** On callback, Better Auth creates/links the `user` (new or existing), then we create an `employee` for the tenant (Hooks).
4. **Permissions:** Set role based on invite.

Why: Controlled onboarding into tenant with provider flexibility.

---

## 7) REST Endpoints & Handlers

- **Auth Core:**
  - `POST /api/auth/signin` (email+password)
  - `POST /api/auth/signup` (email+password)
  - `GET /api/auth/providers` → list providers
  - `GET /api/auth/session` → current session
  - `POST /api/auth/signout`

- **OAuth:** (Next.js integration doc provides canonical endpoints wired via the Better Auth handler)
  - `GET /api/auth/oauth/google` → redirect
  - `GET /api/auth/oauth/github` → redirect
  - `GET /api/auth/callback/google` → callback
  - `GET /api/auth/callback/github` → callback

- **Invitations:**
  - `POST /api/invitations` → create invite
  - `GET /api/invitations/:token` → validate
  - `POST /api/invitations/:token/accept` → finalize

- **Tenants:**
  - `POST /api/tenants` → register
  - `POST /api/tenants/:id/approve` → approve
  - `POST /api/tenants/:id/reject` → reject
  - `POST /api/tenants/:id/recover` → recover
  - `DELETE /api/tenants/:id` → hard delete

- **Employees:**
  - `POST /api/tenants/:id/employees` → create
  - `POST /api/tenants/:id/employees/invite` → invite
  - Optional: `GET /api/tenants/:id/employees/me` → resolve role and membership from session or Bearer token (Plugins: Bearer)

All endpoints enforce role checks using Better Auth session claims + DB role mapping.

---

## 8) Next.js App Router Integration

- **Server Components & Route Handlers:** Use Better Auth server helpers to read session in route handlers and middleware.
- **Client Components:** Minimal—most auth runs server‑side. For OAuth, use server redirects.
- **Middleware:** Optional `middleware.ts` to enforce auth on specific routes.

Behind the scenes (Next.js integration + Concepts), Better Auth uses secure cookies, CSRF tokens for POST auth routes, and integrates with App Router via handlers.

---

## 9) CLI Usage (Faster Setup)

- **Initialize Better Auth:** (Concepts: CLI)
  ```bash
  npx better-auth init
  ```
  - Generates base config and environment entries.

- **Add Providers:**
  ```bash
  npx better-auth add provider google
  npx better-auth add provider github
  ```

- **Apply DB Adapter:**
  ```bash
  npx better-auth add adapter drizzle
  ```

- **Check Config:**
  ```bash
  npx better-auth doctor
  ```

Use CLI to scaffold provider configs and verify callbacks (Next.js integration).

---

## 10) Configuration Snippets (Reference)

- **Initialize Better Auth (pseudo, align with Next.js integration):**
  ```ts
  // lib/auth.ts
  import { createAuth } from 'better-auth';
  import { drizzleAdapter } from '@better-auth/drizzle';
  import { googleProvider, githubProvider, emailPasswordProvider } from '@better-auth/next';
  import { db } from '@/db';

  export const auth = createAuth({
    secret: process.env.BETTER_AUTH_SECRET!,
    baseUrl: process.env.AUTH_BASE_URL!,
    adapter: drizzleAdapter(db),
    session: { strategy: 'cookie' },
    providers: [
      emailPasswordProvider(),
      googleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
      githubProvider({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      }),
    ],
    hooks: {
      async onUserCreated(ctx) {
        // Map new user to tenant/employee/admin depending on invite/flow (Concepts: Hooks)
      },
    },
  });
  ```

- **Auth Routes:** (Next.js integration)
  ```ts
  // app/api/auth/[...all]/route.ts
  import { auth } from '@/lib/auth';
  export const GET = auth.handler;
  export const POST = auth.handler;
  ```

- **Use Session:** (Concepts: Session Management)
  ```ts
  import { auth } from '@/lib/auth';
  export async function GET() {
    const session = await auth.getSession();
    // check roles/tenant before proceeding
  }
  ```

---

## 11) Multi‑Tenant Context Handling

- Store a `defaultTenantId` in user session claims when logging in from a tenant context.
- For global admins, no tenant context is required; operations span all tenants.
- For employees, enforce tenant scoping by reading `employee` record linked to `userId` + `tenantId`.
- When switching tenants (if applicable), update session claim or read from request param and verify membership. Consider Bearer tokens with tenant scoping for API clients (Plugins: Bearer) and validate via DB membership.

---

## 12) Security & Operations

- **Token Scopes:** Restrict access tokens to necessary scopes; rotate regularly (Plugins: JWT/Bearer; Reference: Security).
- **Session Hardening:** Secure, HTTP‑only cookies; sameSite settings; CSRF on mutating routes.
- **Rate Limiting:** Protect auth endpoints against brute force.
- **Auditing:** Log invite creations, acceptances, role changes.
- **Secrets Management:** Use `.env` with a vault or platform secrets.
- **Backups:** Regular DB backups; migration discipline.

---

## 13) Step‑by‑Step Implementation Checklist

1. Install Better Auth + adapters.
2. Configure env vars and provider credentials.
3. Initialize `lib/auth.ts` with providers + adapter.
4. Wire `app/api/auth/[...all]/route.ts` to Better Auth handler.
5. Build invite endpoints (`/api/invitations`).
6. Build tenant registration endpoints (`/api/tenants`).
7. Implement callbacks to map user → admin/employee.
8. Seed super admin and test login.
9. Implement approve/reject flows for tenants.
10. Add role checks in route handlers.
11. Test OAuth flows for tenant signup and invites (Provider docs: Google/GitHub).
12. Add rate limits and audit logs.

---

## 14) Troubleshooting & Tips

- **OAuth Callback Issues:** Verify provider callback URLs and env vars; use `better-auth doctor` (Errors: invalid_callback_request, no_callback_url, no_code, state_mismatch).
- **Session Missing:** Ensure `baseUrl` and cookie domain are correct; check App Router handler wiring.
- **Invite Token Invalid:** Confirm signature, expiration, and invite type; log server validation. Consider One-Time Token plugin for robust single‑use tokens (/llms.txt/docs/plugins/one-time-token.md).
- **Role Not Applied:** Confirm callback fired and DB transaction completed.

---

## 15) Applying This Blueprint Elsewhere

- Swap adapters (Prisma, Sequelize) while keeping the same flows.
- Change providers (e.g., Azure AD, Okta) with similar callback mapping.
- Adjust role model for different org structures (departments, projects).
- Integrate with other client frameworks (React SPA, mobile) via the same REST endpoints. For non‑cookie clients, rely on Bearer/JWT plugins.

---

## 16) What Happens Behind The Scenes

- Better Auth manages cookie/session lifecycle, CSRF tokens, provider OAuth redirects, callback validation, and user creation.
- The adapter persists users/sessions in Postgres via Drizzle.
- Our app binds identity to multi‑tenant domain entities (admins, tenants, employees) via transactional handlers.
- Invitations act as pre‑authorization tokens, guiding the identity flow to the correct role/tenant.

---

## 17) Quick Start Commands

```bash
# Install dependencies
pnpm add better-auth @better-auth/next @better-auth/drizzle

# Scaffold config and providers
npx better-auth init
npx better-auth add adapter drizzle
npx better-auth add provider google
npx better-auth add provider github

# Verify setup
npx better-auth doctor

# Run the app
pnpm dev
```

Use this documentation alongside the existing endpoints in `app/api` and DB repositories in `db/repositories/*` to implement and verify the full authentication lifecycle.
