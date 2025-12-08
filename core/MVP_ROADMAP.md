# 🚀 MVP Development Roadmap & Implementation Plan

## 📍 Current Status

### ✅ Completed - Core API Module
- Database schema with Better Auth integration
- Multi-tenant architecture with user types (SUPER_ADMIN, TENANT, EMPLOYEE)
- Tenant onboarding and approval workflow
- Employee invitation system
- CORS configuration for multi-app architecture
- Authentication system (email/password + OAuth)
- Repository layer for tenants and invitations
- Type definitions and enums
- Comprehensive documentation

### 🔄 Current Phase: Database Setup & Admin Seeding

---

## 🎯 MVP Goal

Build a fully functional multi-tenant project management SaaS with:
1. **Core API** (Port 3000) - Authentication & tenant management ✅
2. **Admin Panel** (Port 3002) - Super admin operations
3. **PM App** (Port 3001) - Project management features

---

## 📋 Phase-by-Phase Implementation Plan

---

## **PHASE 1: Database Setup & Admin Creation** ⏱️ 2-4 hours

### Step 1.1: Database Migration
```bash
# Generate migrations from schema
pnpm migrate:generate

# Review generated migration files in drizzle/ folder
# Ensure all tables are properly created

# Apply migrations to database
pnpm migrate:up
```

**Verification:**
- Check PostgreSQL database has all tables
- Verify foreign key relationships
- Check indexes and constraints

### Step 1.2: Seed Super Admin
```bash
# Update .env with admin credentials
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=SecureAdminPass123!
ADMIN_NAME=Super Admin

# Run seed script
pnpm seed:admin
```

**Verification:**
```sql
-- Check admin user was created
SELECT * FROM "user" WHERE "userType" = 'SUPER_ADMIN';

-- Check admin account was created
SELECT * FROM "account" WHERE "providerId" = 'credential';
```

### Step 1.3: Test Core API Authentication
```bash
# Start Core API
pnpm dev

# Test super admin login (use Postman/Insomnia)
POST http://localhost:3000/api/auth/sign-in
{
  "email": "admin@yourcompany.com",
  "password": "SecureAdminPass123!"
}

# Verify session is created
GET http://localhost:3000/api/auth/session
```

**Deliverable:** ✅ Core API running with authenticated super admin

---

## **PHASE 2: Admin Panel App Development** ⏱️ 1-2 days

### Step 2.1: Setup Admin Panel Repository
```bash
# Create new Next.js app
cd ../
npx create-next-app@latest admin-panel --typescript --tailwind --app
cd admin-panel

# Install dependencies
pnpm add @tanstack/react-query axios zustand
pnpm add -D @types/node
```

### Step 2.2: Configure Environment
```bash
# .env.local
NEXT_PUBLIC_CORE_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

### Step 2.3: Create Core Features

#### A. Authentication
**Files to create:**
- `lib/api-client.ts` - Axios instance with credentials
- `lib/auth-context.tsx` - Auth context provider
- `hooks/useAuth.ts` - Auth hook
- `app/login/page.tsx` - Login page (email/password only)

**Login Flow:**
```typescript
// POST to Core API /api/auth/sign-in
// Store session in httpOnly cookie
// Redirect to dashboard if userType === 'SUPER_ADMIN'
```

#### B. Dashboard Layout
**Files to create:**
- `components/layout/sidebar.tsx` - Navigation sidebar
- `components/layout/header.tsx` - Top header with user menu
- `app/dashboard/layout.tsx` - Dashboard layout wrapper

**Sidebar Navigation:**
- 📊 Dashboard (overview stats)
- 🏢 Tenants (list, approve, reject)
- 👥 Users (view all users)
- 📈 Analytics (system metrics)
- ⚙️ Settings

#### C. Tenant Management
**Files to create:**
- `app/dashboard/tenants/page.tsx` - Tenant list
- `app/dashboard/tenants/[id]/page.tsx` - Tenant details
- `components/tenants/tenant-list.tsx` - Table component
- `components/tenants/tenant-card.tsx` - Card component
- `components/tenants/approval-modal.tsx` - Approve modal
- `components/tenants/rejection-modal.tsx` - Reject modal

**API Integration:**
```typescript
// GET /api/tenants?status=PENDING
// GET /api/tenants/[id]
// PUT /api/tenants/[id]/approve
// PUT /api/tenants/[id]/reject
```

**Tenant List Features:**
- Filter by status (PENDING, APPROVED, REJECTED)
- Search by organization name or email
- Sort by request date
- Pagination
- Quick actions (Approve, Reject, View Details)

**Approval Modal:**
- Set subscription tier (FREE, BASIC, PREMIUM, ENTERPRISE)
- Set max employees limit
- Set max projects limit
- Confirmation button

**Rejection Modal:**
- Text area for rejection reason
- Confirmation button

#### D. Dashboard Overview
**Files to create:**
- `app/dashboard/page.tsx` - Dashboard homepage

**Dashboard Metrics:**
- Total tenants
- Pending approvals
- Active tenants
- Total users
- Recent tenant requests (last 10)
- System health status

**Deliverable:** ✅ Admin Panel with tenant approval workflow

---

## **PHASE 3: PM App Core Features** ⏱️ 3-4 days

### Step 3.1: Setup PM App Repository
```bash
cd ../
npx create-next-app@latest pm-app --typescript --tailwind --app
cd pm-app

# Install dependencies
pnpm add @tanstack/react-query axios zustand
pnpm add lucide-react date-fns
pnpm add -D @types/node
```

### Step 3.2: Configure Environment
```bash
# .env.local
NEXT_PUBLIC_CORE_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Step 3.3: Create Authentication Flow

#### A. Auth Pages
**Files to create:**
- `app/auth/sign-up/page.tsx` - Signup (email/password or OAuth)
- `app/auth/sign-in/page.tsx` - Login
- `app/auth/callback/page.tsx` - OAuth callback handler
- `lib/auth-context.tsx` - Auth context
- `hooks/useAuth.ts` - Auth hook

**Signup Options:**
- Google OAuth button
- GitHub OAuth button
- Email/password form
- Redirect to onboarding after successful signup

#### B. Tenant Onboarding
**Files to create:**
- `app/onboarding/page.tsx` - Multi-step onboarding form

**Onboarding Steps:**
1. **Organization Info**
   - Company name (required)
   - Description
   - Industry (dropdown)
   - Company size (SMALL, MEDIUM, LARGE, ENTERPRISE)
   - Website

2. **Additional Details**
   - Expected number of users
   - Business type
   - Use case description

3. **Confirmation**
   - Review information
   - Submit tenant request
   - Show "Pending Approval" message

**API Integration:**
```typescript
// POST /api/tenants
// Creates tenant, organization, and onboarding request
```

#### C. Awaiting Approval State
**Files to create:**
- `app/pending-approval/page.tsx` - Waiting screen
- `components/pending-approval-banner.tsx` - Banner component

**Features:**
- Show pending status
- Display message: "Your account is under review"
- Estimated approval time
- Contact support option
- Limited access (profile settings only)

### Step 3.4: Create Main App Features

#### A. Dashboard Layout
**Files to create:**
- `components/layout/sidebar.tsx` - Navigation
- `components/layout/header.tsx` - Top bar
- `components/layout/tenant-switcher.tsx` - Org selector (future)
- `app/dashboard/layout.tsx` - Layout wrapper

**Sidebar Navigation:**
- 🏠 Dashboard
- 📊 Projects
- ✅ Tasks
- 👥 Team
- ⚙️ Settings

#### B. Projects Feature (MVP)
**Core API Additions Needed:**
- Create `projects` table in schema
- Create `project.repository.ts`
- Create `/api/projects` endpoints

**Schema for Projects:**
```typescript
export const projectsTable = pgTable("projects", {
  id: uuid().primaryKey().defaultRandom(),
  tenantId: varchar({ length: 36 }).notNull().references(() => tenantsTable.id),
  organizationId: uuid().notNull().references(() => organizationsTable.id),
  name: varchar({ length: 256 }).notNull(),
  description: text(),
  status: varchar({ length: 20 }).default("ACTIVE"), // ACTIVE | ARCHIVED | COMPLETED
  startDate: timestamp(),
  endDate: timestamp(),
  createdBy: text().references(() => userTable.id),
  ...systemFields
});
```

**PM App Files:**
- `app/dashboard/projects/page.tsx` - Project list
- `app/dashboard/projects/new/page.tsx` - Create project
- `app/dashboard/projects/[id]/page.tsx` - Project details
- `components/projects/project-card.tsx` - Card component
- `components/projects/project-form.tsx` - Form component

**Project List Features:**
- Grid or list view toggle
- Filter by status
- Search by name
- Create new project button
- Project cards with:
  - Name, description
  - Progress bar
  - Task count
  - Team member avatars
  - Quick actions (Edit, Archive, View)

#### C. Tasks Feature (MVP)
**Core API Additions Needed:**
- Create `tasks` table in schema
- Create `task.repository.ts`
- Create `/api/tasks` endpoints

**Schema for Tasks:**
```typescript
export const tasksTable = pgTable("tasks", {
  id: uuid().primaryKey().defaultRandom(),
  projectId: uuid().notNull().references(() => projectsTable.id),
  tenantId: varchar({ length: 36 }).notNull().references(() => tenantsTable.id),
  title: varchar({ length: 256 }).notNull(),
  description: text(),
  status: varchar({ length: 20 }).default("TODO"), // TODO | IN_PROGRESS | DONE
  priority: varchar({ length: 20 }).default("MEDIUM"), // LOW | MEDIUM | HIGH | URGENT
  assignedTo: text().references(() => userTable.id),
  dueDate: timestamp(),
  ...systemFields
});
```

**PM App Files:**
- `app/dashboard/projects/[id]/tasks/page.tsx` - Task list
- `components/tasks/task-list.tsx` - List component
- `components/tasks/task-card.tsx` - Card component
- `components/tasks/task-form.tsx` - Create/edit form
- `components/tasks/task-board.tsx` - Kanban board

**Task Features:**
- Kanban board (TODO, IN_PROGRESS, DONE)
- List view
- Create task modal
- Edit task inline
- Filter by status, assignee, priority
- Sort by due date, priority
- Drag & drop (future enhancement)

#### D. Team Management
**Files to create:**
- `app/dashboard/team/page.tsx` - Team member list
- `components/team/invite-modal.tsx` - Invite form
- `app/accept-invitation/page.tsx` - Accept invitation page

**Team Features:**
- List all team members
- Show role (STAFF, MANAGER, ADMIN)
- Invite new members (email)
- Remove members
- Update roles

**Invitation Flow:**
1. Tenant owner clicks "Invite Member"
2. Enters email and role
3. System creates invitation (POST /api/invitations)
4. Email sent to invitee
5. Invitee clicks link, signs up/logs in
6. Invitation accepted (POST /api/invitations/[token]/accept)
7. User added to tenant

**Deliverable:** ✅ PM App with projects, tasks, and team management

---

## **PHASE 4: Core API Extensions** ⏱️ 1-2 days

### Files to Create/Modify:

#### A. Database Schema Updates
**File:** `db/schema.ts`
- Add `projectsTable`
- Add `tasksTable`
- Add `commentsTable` (optional)
- Add relations

#### B. Project Repository
**File:** `db/repositories/project.repository.ts`
```typescript
- createProject(data, tenantId)
- getProjectById(id, tenantId)
- getProjectsByTenant(tenantId, query)
- updateProject(id, data, tenantId)
- deleteProject(id, tenantId)
- archiveProject(id, tenantId)
```

#### C. Task Repository
**File:** `db/repositories/task.repository.ts`
```typescript
- createTask(data, tenantId)
- getTaskById(id, tenantId)
- getTasksByProject(projectId, tenantId)
- updateTask(id, data, tenantId)
- deleteTask(id, tenantId)
- assignTask(taskId, userId, tenantId)
```

#### D. API Routes
**Files to create:**
- `app/api/projects/route.ts` - List, Create
- `app/api/projects/[id]/route.ts` - Get, Update, Delete
- `app/api/projects/[id]/tasks/route.ts` - Project tasks
- `app/api/tasks/route.ts` - List, Create
- `app/api/tasks/[id]/route.ts` - Get, Update, Delete

**Middleware:**
- Add tenant isolation checks
- Verify tenant approval status
- Check user permissions

**Deliverable:** ✅ Core API with project and task endpoints

---

## **PHASE 5: Integration & Testing** ⏱️ 1-2 days

### Step 5.1: End-to-End Testing

#### Test Scenario 1: Tenant Onboarding
1. Open PM App, signup with Google/email
2. Complete onboarding form
3. Submit tenant request
4. See "Pending Approval" message
5. Login to Admin Panel as super admin
6. Approve tenant with BASIC tier
7. Refresh PM App, verify access granted
8. Create first project

#### Test Scenario 2: Team Collaboration
1. Tenant owner invites employee
2. Employee receives email (check logs)
3. Employee clicks link, signs up
4. Employee accepts invitation
5. Employee sees projects
6. Employee creates task
7. Tenant owner sees task

#### Test Scenario 3: Project Management
1. Create new project
2. Add description, dates
3. Create multiple tasks
4. Assign tasks to team members
5. Update task status
6. Complete project

### Step 5.2: Bug Fixes & Polish
- Fix CORS issues
- Improve error messages
- Add loading states
- Add empty states
- Improve form validation
- Add toast notifications
- Fix TypeScript errors

### Step 5.3: Documentation Updates
- Update API documentation
- Add deployment guide
- Create user guide
- Add screenshots to README

**Deliverable:** ✅ Fully functional MVP

---

## **PHASE 6: Deployment** ⏱️ 4-6 hours

### Step 6.1: Database Setup (Production)
- Setup PostgreSQL on Neon/Supabase/Railway
- Run migrations
- Seed super admin

### Step 6.2: Deploy Core API
**Platform Options:**
- Vercel (recommended)
- Railway
- Render
- AWS

**Steps:**
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy
5. Test API endpoints

### Step 6.3: Deploy Admin Panel
1. Push code to GitHub
2. Connect to Vercel
3. Update CORE_API_URL to production
4. Deploy
5. Test login and tenant approval

### Step 6.4: Deploy PM App
1. Push code to GitHub
2. Connect to Vercel
3. Update CORE_API_URL to production
4. Deploy
5. Test full onboarding flow

### Step 6.5: OAuth Configuration
- Update Google OAuth redirect URIs
- Update GitHub OAuth redirect URIs
- Test social login in production

**Deliverable:** ✅ Deployed MVP accessible online

---

## 📊 MVP Feature Checklist

### Core API ✅
- [x] Authentication (Better Auth)
- [x] Tenant management
- [x] User management
- [x] Invitation system
- [ ] Project CRUD
- [ ] Task CRUD
- [ ] CORS configuration
- [ ] Rate limiting (optional)

### Admin Panel 🔄
- [ ] Super admin login
- [ ] Dashboard overview
- [ ] Tenant list with filters
- [ ] Approve tenant
- [ ] Reject tenant with reason
- [ ] View tenant details
- [ ] View all users
- [ ] System analytics

### PM App 🔄
- [ ] Signup (OAuth + email/password)
- [ ] Login
- [ ] Tenant onboarding
- [ ] Pending approval state
- [ ] Dashboard
- [ ] Project list
- [ ] Create/edit project
- [ ] Task board (Kanban)
- [ ] Create/edit tasks
- [ ] Team management
- [ ] Invite employees
- [ ] Accept invitation
- [ ] User profile
- [ ] Settings

---

## 🎯 Success Metrics

### Technical Metrics
- ✅ All TypeScript errors resolved
- ✅ Database migrations successful
- ⏳ API response time < 200ms
- ⏳ Zero runtime errors
- ⏳ All API endpoints tested

### User Flow Metrics
- ⏳ Tenant can signup in < 2 minutes
- ⏳ Admin can approve tenant in < 1 minute
- ⏳ Employee can accept invitation in < 1 minute
- ⏳ Project creation in < 30 seconds
- ⏳ Task creation in < 15 seconds

---

## 🚀 Quick Start Commands

### Core API
```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your values

# Run migrations
pnpm migrate:generate
pnpm migrate:up

# Seed admin
pnpm seed:admin

# Start dev server
pnpm dev
```

### Admin Panel (after creation)
```bash
# Install dependencies
pnpm install

# Setup environment
echo "NEXT_PUBLIC_CORE_API_URL=http://localhost:3000" > .env.local
echo "NEXT_PUBLIC_APP_URL=http://localhost:3002" >> .env.local

# Start dev server
pnpm dev
```

### PM App (after creation)
```bash
# Install dependencies
pnpm install

# Setup environment
echo "NEXT_PUBLIC_CORE_API_URL=http://localhost:3000" > .env.local
echo "NEXT_PUBLIC_APP_URL=http://localhost:3001" >> .env.local

# Start dev server
pnpm dev
```

---

## 📁 Recommended Project Structure

```
multi-tenant-pm-saas/           # Core API (Port 3000)
├── app/api/
│   ├── auth/
│   ├── tenants/
│   ├── invitations/
│   ├── projects/                # To add
│   └── tasks/                   # To add
├── db/
│   ├── schema.ts
│   └── repositories/
├── lib/
├── types/
└── scripts/

admin-panel/                     # Admin Panel (Port 3002)
├── app/
│   ├── login/
│   └── dashboard/
│       ├── page.tsx            # Dashboard overview
│       ├── tenants/            # Tenant management
│       ├── users/              # User management
│       └── analytics/          # System metrics
├── components/
│   ├── layout/
│   ├── tenants/
│   └── ui/
├── lib/
│   ├── api-client.ts
│   └── auth-context.tsx
└── hooks/

pm-app/                          # PM App (Port 3001)
├── app/
│   ├── auth/                   # Auth pages
│   ├── onboarding/             # Tenant onboarding
│   ├── pending-approval/       # Pending state
│   ├── accept-invitation/      # Accept invite
│   └── dashboard/
│       ├── page.tsx            # Dashboard
│       ├── projects/           # Project management
│       ├── team/               # Team management
│       └── settings/           # Settings
├── components/
│   ├── layout/
│   ├── projects/
│   ├── tasks/
│   ├── team/
│   └── ui/
├── lib/
│   ├── api-client.ts
│   └── auth-context.tsx
└── hooks/
```

---

## ⏰ Estimated Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Phase 1** | 2-4 hours | Database setup, admin seeding, testing |
| **Phase 2** | 1-2 days | Admin Panel development |
| **Phase 3** | 3-4 days | PM App core features |
| **Phase 4** | 1-2 days | Core API extensions |
| **Phase 5** | 1-2 days | Integration & testing |
| **Phase 6** | 4-6 hours | Deployment |
| **TOTAL** | **7-12 days** | Full MVP |

---

## 🎯 Next Immediate Actions

### Action 1: Database Setup (START HERE)
```bash
# 1. Ensure PostgreSQL is running
# 2. Verify DATABASE_URL in .env
# 3. Generate migrations
pnpm migrate:generate

# 4. Check generated SQL in drizzle/ folder
# 5. Apply migrations
pnpm migrate:up

# 6. Verify tables created
psql $DATABASE_URL -c "\dt"
```

### Action 2: Seed Super Admin
```bash
# 1. Update admin credentials in .env
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=SecureAdminPass123!
ADMIN_NAME=Super Admin

# 2. Run seed script
pnpm seed:admin

# 3. Verify admin created
psql $DATABASE_URL -c "SELECT * FROM \"user\" WHERE \"userType\" = 'SUPER_ADMIN';"
```

### Action 3: Test Core API
```bash
# 1. Start Core API
pnpm dev

# 2. Test super admin login (Postman/curl)
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourcompany.com","password":"SecureAdminPass123!"}'

# 3. Verify session
curl http://localhost:3000/api/auth/session
```

---

## 📝 Notes & Considerations

### Database Migrations
- Always review generated SQL before applying
- Keep backups before running migrations
- Use transactions for data migrations

### OAuth Setup
- Development: Use localhost URLs
- Production: Update redirect URIs
- Test both Google and GitHub flows

### Security
- Never commit .env files
- Use strong passwords for admin
- Enable rate limiting in production
- Add CSRF protection
- Validate all user inputs

### Performance
- Add database indexes on foreign keys
- Implement pagination everywhere
- Cache tenant data in Redis (future)
- Optimize database queries

### Future Enhancements (Post-MVP)
- Email service integration
- Password reset flow
- 2FA authentication
- Audit logging
- Billing integration (Stripe)
- Usage analytics
- API rate limiting
- Webhook system
- Mobile app

---

**Ready to build! Start with Phase 1 ⬆️**
