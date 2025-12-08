import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  Mail, 
  Zap, 
  CheckCircle2, 
  GitBranch,
  Database,
  Lock,
  Server,
  Code,
  FileText,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold">Multi-Tenant PM SaaS</h1>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
              Core API
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/health">
                <Zap className="h-4 w-4 mr-1" />
                Health Check
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-4 py-2 rounded-full mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">API Running on Port 3000</span>
        </div>
        
        <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Core API Module
        </h2>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8">
          Authentication, tenant management, and employee invitations for your multi-tenant project management SaaS.
        </p>

        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <a href="#quick-start">
              Get Started
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#api-endpoints">
              View API Docs
            </a>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-3xl font-bold text-center mb-8">Core Features</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Better Auth Integration</CardTitle>
              <CardDescription>
                Secure authentication with email/password and social OAuth (Google, GitHub)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-zinc-600 dark:text-zinc-400">
                <li>✓ Session-based auth</li>
                <li>✓ Social login providers</li>
                <li>✓ Email verification</li>
                <li>✓ Password reset</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Multi-Tenant Architecture</CardTitle>
              <CardDescription>
                Complete tenant isolation with approval workflow and subscription tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-zinc-600 dark:text-zinc-400">
                <li>✓ Tenant approval system</li>
                <li>✓ 4 subscription tiers</li>
                <li>✓ Soft/hard delete</li>
                <li>✓ Usage limits</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Mail className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Employee Invitations</CardTitle>
              <CardDescription>
                Invite team members with role-based access control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-zinc-600 dark:text-zinc-400">
                <li>✓ Secure token-based invites</li>
                <li>✓ 3 role levels (Staff/Manager/Admin)</li>
                <li>✓ 7-day expiration</li>
                <li>✓ Bulk invitations</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Start */}
      <section id="quick-start" className="container mx-auto px-4 py-12 bg-zinc-100 dark:bg-zinc-900 rounded-lg my-8">
        <h3 className="text-3xl font-bold mb-6">Quick Start</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Database className="h-6 w-6 text-blue-600 mb-2" />
              <CardTitle>1. Setup Database</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-black text-green-400 p-4 rounded text-sm overflow-x-auto">
{`# Generate migrations
pnpm migrate:generate

# Apply migrations
pnpm migrate:up

# Seed admin user
pnpm seed:admin`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Code className="h-6 w-6 text-purple-600 mb-2" />
              <CardTitle>2. Test API</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                Open any <code className="bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">.http</code> file in VS Code:
              </p>
              <ul className="text-sm space-y-2">
                <li>📁 <code>tests/auth.http</code> - Authentication</li>
                <li>📁 <code>tests/tenants.http</code> - Tenant management</li>
                <li>📁 <code>tests/invitations.http</code> - Employee invites</li>
                <li>📁 <code>tests/README.http</code> - Complete guide</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <FileText className="h-6 w-6 text-green-600 mb-2" />
            <CardTitle>3. Install REST Client Extension</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
              Required VS Code extension to test .http files:
            </p>
            <Button variant="outline" asChild>
              <a 
                href="vscode:extension/humao.rest-client" 
                className="inline-flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Install REST Client Extension
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* API Endpoints */}
      <section id="api-endpoints" className="container mx-auto px-4 py-12">
        <h3 className="text-3xl font-bold mb-8">API Endpoints</h3>

        <div className="space-y-6">
          {/* Authentication */}
          <Card>
            <CardHeader>
              <Lock className="h-6 w-6 text-blue-600 mb-2" />
              <CardTitle>Authentication</CardTitle>
              <CardDescription>Better Auth endpoints for user authentication</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded">
                  <code className="text-green-600 font-mono">POST</code>
                  <div className="flex-1">
                    <code className="font-mono text-zinc-700 dark:text-zinc-300">/api/auth/sign-up/email</code>
                    <p className="text-zinc-500 mt-1">Create new account with email/password</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded">
                  <code className="text-green-600 font-mono">POST</code>
                  <div className="flex-1">
                    <code className="font-mono text-zinc-700 dark:text-zinc-300">/api/auth/sign-in/email</code>
                    <p className="text-zinc-500 mt-1">Sign in with email/password</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded">
                  <code className="text-blue-600 font-mono">GET</code>
                  <div className="flex-1">
                    <code className="font-mono text-zinc-700 dark:text-zinc-300">/api/auth/sign-in/social/google</code>
                    <p className="text-zinc-500 mt-1">OAuth sign in with Google</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded">
                  <code className="text-blue-600 font-mono">GET</code>
                  <div className="flex-1">
                    <code className="font-mono text-zinc-700 dark:text-zinc-300">/api/auth/session</code>
                    <p className="text-zinc-500 mt-1">Get current user session</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tenants */}
          <Card>
            <CardHeader>
              <Users className="h-6 w-6 text-purple-600 mb-2" />
              <CardTitle>Tenant Management</CardTitle>
              <CardDescription>Admin-only endpoints for managing tenants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded">
                  <code className="text-blue-600 font-mono">GET</code>
                  <div className="flex-1">
                    <code className="font-mono text-zinc-700 dark:text-zinc-300">/api/tenants</code>
                    <p className="text-zinc-500 mt-1">List all tenants (admin only)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded">
                  <code className="text-green-600 font-mono">POST</code>
                  <div className="flex-1">
                    <code className="font-mono text-zinc-700 dark:text-zinc-300">/api/tenants/:id/approve</code>
                    <p className="text-zinc-500 mt-1">Approve tenant with subscription tier</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded">
                  <code className="text-green-600 font-mono">POST</code>
                  <div className="flex-1">
                    <code className="font-mono text-zinc-700 dark:text-zinc-300">/api/tenants/:id/reject</code>
                    <p className="text-zinc-500 mt-1">Reject tenant with reason</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded">
                  <code className="text-red-600 font-mono">DELETE</code>
                  <div className="flex-1">
                    <code className="font-mono text-zinc-700 dark:text-zinc-300">/api/tenants/:id</code>
                    <p className="text-zinc-500 mt-1">Soft delete tenant</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invitations */}
          <Card>
            <CardHeader>
              <Mail className="h-6 w-6 text-green-600 mb-2" />
              <CardTitle>Employee Invitations</CardTitle>
              <CardDescription>Tenant owner endpoints for inviting employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded">
                  <code className="text-green-600 font-mono">POST</code>
                  <div className="flex-1">
                    <code className="font-mono text-zinc-700 dark:text-zinc-300">/api/invitations</code>
                    <p className="text-zinc-500 mt-1">Create invitation for employee</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded">
                  <code className="text-blue-600 font-mono">GET</code>
                  <div className="flex-1">
                    <code className="font-mono text-zinc-700 dark:text-zinc-300">/api/invitations</code>
                    <p className="text-zinc-500 mt-1">List all invitations for tenant</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded">
                  <code className="text-green-600 font-mono">POST</code>
                  <div className="flex-1">
                    <code className="font-mono text-zinc-700 dark:text-zinc-300">/api/invitations/:token/accept</code>
                    <p className="text-zinc-500 mt-1">Accept invitation (public endpoint)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Architecture */}
      <section className="container mx-auto px-4 py-12 bg-zinc-100 dark:bg-zinc-900 rounded-lg my-8">
        <h3 className="text-3xl font-bold mb-6">Multi-App Architecture</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 border-blue-200 dark:border-blue-900">
            <CardHeader>
              <Server className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Core API</CardTitle>
              <CardDescription>Port 3000 (This App)</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>• Authentication</li>
                <li>• Tenant management</li>
                <li>• User management</li>
                <li>• Invitations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <GitBranch className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>PM App</CardTitle>
              <CardDescription>Port 3001 (Coming Soon)</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>• Project management</li>
                <li>• Task boards</li>
                <li>• Team collaboration</li>
                <li>• Reports</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>Port 3002 (Coming Soon)</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>• Admin dashboard</li>
                <li>• Tenant approval</li>
                <li>• Analytics</li>
                <li>• System settings</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-3xl font-bold mb-6 text-center">Tech Stack</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border text-center">
            <h4 className="font-semibold mb-2">Framework</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Next.js 16</p>
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border text-center">
            <h4 className="font-semibold mb-2">Auth</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Better Auth 1.4.5</p>
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border text-center">
            <h4 className="font-semibold mb-2">Database</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">PostgreSQL + Drizzle ORM</p>
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border text-center">
            <h4 className="font-semibold mb-2">Language</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">TypeScript</p>
          </div>
        </div>
      </section>

      {/* Documentation Links */}
      <section className="container mx-auto px-4 py-12 bg-zinc-100 dark:bg-zinc-900 rounded-lg my-8">
        <h3 className="text-3xl font-bold mb-6 text-center">Documentation</h3>
        
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Button variant="outline" className="h-auto py-4 px-6 flex flex-col items-start gap-2" asChild>
            <a href="/ARCHITECTURE.md" target="_blank">
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Architecture Guide</div>
                <div className="text-xs text-zinc-500">Complete system design & flows</div>
              </div>
            </a>
          </Button>

          <Button variant="outline" className="h-auto py-4 px-6 flex flex-col items-start gap-2" asChild>
            <a href="/MVP_ROADMAP.md" target="_blank">
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">MVP Roadmap</div>
                <div className="text-xs text-zinc-500">Development phases & timeline</div>
              </div>
            </a>
          </Button>

          <Button variant="outline" className="h-auto py-4 px-6 flex flex-col items-start gap-2" asChild>
            <a href="/SETUP.md" target="_blank">
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Setup Guide</div>
                <div className="text-xs text-zinc-500">OAuth config & installation</div>
              </div>
            </a>
          </Button>

          <Button variant="outline" className="h-auto py-4 px-6 flex flex-col items-start gap-2" asChild>
            <a href="/CHANGES.md" target="_blank">
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Changelog</div>
                <div className="text-xs text-zinc-500">Recent changes & updates</div>
              </div>
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
        <div className="container mx-auto px-4">
          <p>Multi-Tenant PM SaaS - Core API Module</p>
          <p className="mt-2">Built with Next.js 16, Better Auth, and Drizzle ORM</p>
        </div>
      </footer>
    </div>
  );
}
