<div align="center">

# 🚀 Multi-Tenant Project Management SaaS

### Enterprise-grade project management platform with multi-tenant architecture

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

[Features](#-features) •
[Architecture](#-architecture) •
[Tech Stack](#-tech-stack) •
[Getting Started](#-getting-started) •
[Documentation](#-documentation) •
[License](#-license)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Configuration](#-environment-configuration)
- [Development](#-development)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🎯 Overview

**Multi-Tenant Project Management SaaS** is a modern, scalable project management platform built with a microservices-inspired architecture. The system supports multiple organizations (tenants) with complete data isolation, subscription-based access control, and enterprise-level security features.

### What Makes This Special?

- ✅ **True Multi-Tenancy** - Complete data isolation with shared database architecture
- ✅ **Microservices Design** - Three independent Next.js applications working in harmony
- ✅ **Modern Authentication** - Social login (Google, GitHub) + traditional email/password
- ✅ **Enterprise Ready** - Tenant approval workflows, subscription tiers, and role-based access
- ✅ **Developer Friendly** - TypeScript, modern tooling, comprehensive documentation

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Multiple Auth Methods**: Social authentication (Google, GitHub) and email/password
- **Role-Based Access Control**: Super Admin, Tenant Owner, Manager, Staff roles
- **Secure Sessions**: Cookie-based sessions with httpOnly flags and CORS support
- **Better Auth Integration**: Modern, type-safe authentication system

### 👥 Multi-Tenant Management
- **Tenant Isolation**: Complete data separation between organizations
- **Approval Workflow**: Admin review and approval for new tenants
- **Subscription Tiers**: FREE, BASIC, PREMIUM, ENTERPRISE with configurable limits
- **Employee Invitations**: Secure token-based invitation system

### 📊 Project Management
- **Project CRUD**: Full project lifecycle management
- **Task Management**: Create, assign, and track tasks
- **Team Collaboration**: Real-time updates and team coordination
- **Reports & Analytics**: Insights into project progress and team performance

### ⚙️ Admin Panel
- **Tenant Management**: Approve, reject, or manage tenant applications
- **System Analytics**: Monitor platform usage and performance
- **Subscription Management**: Configure tiers and limits
- **User Management**: Oversee all users across tenants

---

## 🏗️ Architecture

This platform uses a **three-application architecture** to separate concerns and enable independent scaling:

```
┌─────────────────────────────────────────────────────────────┐
│                      CORE API (Port 3000)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  • Authentication (Better Auth)                        │ │
│  │  • Tenant Management                                   │ │
│  │  • User Management                                     │ │
│  │  • Session Management                                  │ │
│  │  • Employee Invitations                                │ │
│  │  • Shared Business Logic                               │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────┬──────────────────────────┬─────────────────┘
                 │                          │
      ┌──────────▼────────────┐  ┌─────────▼──────────────┐
      │  PM APP (Port 3001)   │  │  ADMIN (Port 3002)     │
      │  ┌──────────────────┐ │  │  ┌──────────────────┐  │
      │  │ • Projects       │ │  │  │ • Tenant Approval│  │
      │  │ • Tasks          │ │  │  │ • System Analytics│ │
      │  │ • Dashboards     │ │  │  │ • User Management│  │
      │  │ • Team Collab    │ │  │  │ • Settings       │  │
      │  │ • Reports        │ │  │  │ • Configuration  │  │
      │  └──────────────────┘ │  │  └──────────────────┘  │
      └───────────────────────┘  └────────────────────────┘
                 │                          │
                 └──────────┬───────────────┘
                            │
                  ┌─────────▼──────────┐
                  │  PostgreSQL (Neon) │
                  │  ┌───────────────┐ │
                  │  │ • Users       │ │
                  │  │ • Tenants     │ │
                  │  │ • Sessions    │ │
                  │  │ • Projects    │ │
                  │  │ • Invitations │ │
                  │  └───────────────┘ │
                  └────────────────────┘
```

### Application Breakdown

#### 🔵 Core API (`/core`)
Central authentication and tenant management service.
- **Port**: 3000
- **Purpose**: Authentication, user management, tenant operations
- **Key Features**: Better Auth integration, multi-tenant data isolation

#### 🟢 Project Management App (`/pm`)
Main application for end-users to manage projects and tasks.
- **Port**: 3001
- **Purpose**: Project management features for tenant users
- **Key Features**: Projects, tasks, dashboards, team collaboration

#### 🟡 Admin Panel (`/admin`)
Super admin interface for system management.
- **Port**: 3002
- **Purpose**: System administration and tenant approval
- **Key Features**: Tenant approval, analytics, system configuration

---

## 🛠️ Tech Stack

### Frontend & Backend
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

### Authentication
- **[Better Auth](https://www.better-auth.com/)** - Modern authentication system
- **OAuth Providers**: Google, GitHub
- **Session Management**: Cookie-based with PostgreSQL storage

### Database & ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[Neon](https://neon.tech/)** - Serverless PostgreSQL hosting
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database toolkit
- **[Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** - Database migrations

### UI & Styling
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable components

### Developer Tools
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager
- **[ESLint](https://eslint.org/)** - Code linting
- **[tsx](https://github.com/privatenumber/tsx)** - TypeScript execution

### Deployment
- **[Vercel](https://vercel.com/)** - Hosting platform (recommended)
- **Alternative**: Railway, AWS, Google Cloud

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- **Node.js** 18+ installed
- **pnpm** package manager (`npm install -g pnpm`)
- **PostgreSQL** database (local or cloud - [Neon](https://neon.tech/) recommended)
- **Google/GitHub OAuth apps** (optional, for social authentication)

### Quick Start

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/abdi-frost/multitenant-pm.git
cd multitenant-pm
```

#### 2️⃣ Setup Core API

```bash
cd core
pnpm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Run database migrations
pnpm migrate:generate
pnpm migrate:up

# Seed super admin user
pnpm seed:admin

# Start development server
pnpm dev
```

Core API will run at `http://localhost:3000`

#### 3️⃣ Setup PM App

```bash
cd ../pm
pnpm install

# Configure environment
cp .env.example .env
# Set NEXT_PUBLIC_CORE_API_URL=http://localhost:3000

# Start development server
pnpm dev
```

PM App will run at `http://localhost:3001`

#### 4️⃣ Setup Admin Panel

```bash
cd ../admin
pnpm install

# Configure environment
cp .env.example .env
# Set NEXT_PUBLIC_CORE_API_URL=http://localhost:3000

# Start development server
pnpm dev
```

Admin Panel will run at `http://localhost:3002`

### 🧪 Test the Setup

1. **Login to Admin Panel**: `http://localhost:3002`
   - Use credentials from `pnpm seed:admin` output
   
2. **Sign up as Tenant**: `http://localhost:3001`
   - Create account using Google/GitHub or email
   
3. **Approve Tenant**: Back in Admin Panel
   - Approve the tenant registration
   
4. **Explore**: Navigate around to see the features!

---

## 📁 Project Structure

```
multitenant-pm/
├── core/                    # Core API application
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # Authentication endpoints
│   │   │   ├── tenants/    # Tenant management
│   │   │   ├── invitations/# Invitation system
│   │   │   └── users/      # User management
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/         # Reusable components
│   ├── db/
│   │   ├── schema.ts       # Database schema (Drizzle)
│   │   └── index.ts        # DB connection
│   ├── lib/
│   │   ├── auth.ts         # Better Auth config
│   │   ├── api-helpers.ts  # API utilities
│   │   └── utils.ts
│   ├── types/              # TypeScript types
│   ├── scripts/
│   │   └── seed.admin.ts   # Admin seeding script
│   ├── ARCHITECTURE.md     # Detailed architecture docs
│   ├── SETUP.md           # Setup instructions
│   └── package.json
│
├── pm/                     # Project Management App
│   ├── app/
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── projects/       # Project management
│   │   ├── auth/          # Auth pages
│   │   └── ...
│   ├── components/         # UI components
│   ├── services/          # API service layer
│   └── package.json
│
├── admin/                  # Admin Panel App
│   ├── app/
│   │   ├── dashboard/      # Admin dashboard
│   │   ├── tenants/        # Tenant management
│   │   ├── users/         # User management
│   │   └── ...
│   ├── components/         # UI components
│   ├── services/          # API service layer
│   └── package.json
│
├── README.md              # This file
└── LICENSE                # MIT License
```

---

## ⚙️ Environment Configuration

### Core API Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/multitenant_pm"

# Better Auth
BETTER_AUTH_SECRET="your-random-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# App URLs
PM_APP_URL="http://localhost:3001"
ADMIN_APP_URL="http://localhost:3002"
ALLOWED_ORIGINS="http://localhost:3001,http://localhost:3002"

# Super Admin
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="YourSecurePassword123!"
ADMIN_NAME="Super Admin"
```

### PM App & Admin Panel Environment Variables

```bash
# Core API URL
NEXT_PUBLIC_CORE_API_URL="http://localhost:3000"

# App URL (for redirects)
NEXT_PUBLIC_APP_URL="http://localhost:3001"  # or 3002 for admin
```

---

## 💻 Development

### Available Commands

#### Core API
```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm migrate:generate # Generate migrations
pnpm migrate:up       # Apply migrations
pnpm migrate:down     # Rollback migration
pnpm seed:admin       # Seed super admin
```

#### PM App / Admin Panel
```bash
pnpm dev              # Start development server (port 3001/3002)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

### Development Workflow

1. **Make Changes**: Edit code in your preferred IDE
2. **Test Locally**: Use the development servers
3. **Lint Code**: Run `pnpm lint` to check for issues
4. **Build**: Ensure `pnpm build` succeeds
5. **Commit**: Follow conventional commit messages

---

## 🌐 Deployment

### Deploying to Vercel (Recommended)

#### 1. Deploy Core API
```bash
cd core
vercel --prod
```

Configure environment variables in Vercel dashboard.

#### 2. Deploy PM App
```bash
cd pm
vercel --prod
```

Set `NEXT_PUBLIC_CORE_API_URL` to your Core API URL.

#### 3. Deploy Admin Panel
```bash
cd admin
vercel --prod
```

Set `NEXT_PUBLIC_CORE_API_URL` to your Core API URL.

### Production Checklist

- [ ] Setup production PostgreSQL database (Neon recommended)
- [ ] Configure OAuth apps with production URLs
- [ ] Set strong `BETTER_AUTH_SECRET` (32+ random characters)
- [ ] Update `ALLOWED_ORIGINS` with production URLs
- [ ] Run database migrations on production DB
- [ ] Seed super admin user
- [ ] Test authentication flows
- [ ] Configure custom domains (optional)
- [ ] Setup monitoring and error tracking
- [ ] Enable HTTPS (automatic on Vercel)

---

## 📚 Documentation

Detailed documentation is available in the `/core` directory:

- **[ARCHITECTURE.md](./core/ARCHITECTURE.md)** - Complete system architecture, database schema, and authentication flows
- **[SETUP.md](./core/SETUP.md)** - Detailed setup guide with troubleshooting
- **[API_QUICK_REFERENCE.md](./core/API_QUICK_REFERENCE.md)** - API endpoint reference
- **[MVP_ROADMAP.md](./core/MVP_ROADMAP.md)** - Development roadmap

### External Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/multitenant-pm.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Your Changes**
   - Write clean, maintainable code
   - Follow existing code style
   - Add tests if applicable

4. **Commit Your Changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe your changes
   - Reference any related issues

### Contribution Guidelines

- Follow TypeScript best practices
- Maintain test coverage
- Update documentation as needed
- Follow conventional commit messages
- Be respectful and collaborative

### Areas We Need Help

- 🐛 Bug fixes and issue resolution
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Test coverage
- 🌐 Internationalization (i18n)
- ♿ Accessibility improvements

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

### What This Means

✅ **Free to use** - Commercial and personal projects  
✅ **Modify freely** - Adapt the code to your needs  
✅ **Distribute** - Share with others  
✅ **Private use** - Use in closed-source projects  

The only requirement is to include the original license and copyright notice.

---

## 💬 Support

### Need Help?

- 📖 **Documentation**: Check the [docs](./core/) first
- 🐛 **Bug Reports**: [Open an issue](https://github.com/abdi-frost/multitenant-pm/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/abdi-frost/multitenant-pm/discussions)
- 📧 **Email**: Contact the maintainer

### Community

- ⭐ Star the repo if you find it useful!
- 🔀 Fork and create your own version
- 📣 Share with others who might benefit

---

## 🙏 Acknowledgments

Built with amazing open-source technologies:

- [Next.js](https://nextjs.org/) - The React Framework for the Web
- [Better Auth](https://www.better-auth.com/) - Modern authentication
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe database toolkit
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

Special thanks to all contributors and the open-source community!

---

<div align="center">

**[⬆ Back to Top](#-multi-tenant-project-management-saas)**

Made with ❤️ by [abdi-frost](https://github.com/abdi-frost)

**If you find this project useful, please consider giving it a ⭐!**

</div>
