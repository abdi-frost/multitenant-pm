import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  Mail, 
  Zap, 
  CheckCircle2, 
  Server,
  ExternalLink,
  ArrowRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";

const PM_APP_URL = process.env.PM_APP_URL || "http://localhost:3001";
const ADMIN_APP_URL = process.env.ADMIN_APP_URL || "http://localhost:3002";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Server className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Multi-Tenant PM SaaS</h1>
              <span className="text-xs text-zinc-400">Core API</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-zinc-700 hover:bg-zinc-800" asChild>
              <Link href="/api/health">
                <Zap className="h-4 w-4 mr-1 text-green-400" />
                Health
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">API Active • Port 3000</span>
        </div>
        
        <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Core API Module
        </h2>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
          Enterprise authentication, tenant management, and team collaboration APIs for modern multi-tenant applications
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 min-w-[200px]" asChild>
            <a href={PM_APP_URL} target="_blank" rel="noopener noreferrer">
              <Sparkles className="h-5 w-5 mr-2" />
              PM Application
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
          <Button size="lg" variant="outline" className="border-zinc-700 hover:bg-zinc-800 min-w-[200px]" asChild>
            <a href={ADMIN_APP_URL} target="_blank" rel="noopener noreferrer">
              <Shield className="h-5 w-5 mr-2 text-purple-400" />
              Admin Panel
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900/70 transition-colors">
            <CardHeader>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg w-fit mb-4">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle className="text-white">Better Auth</CardTitle>
              <CardDescription className="text-zinc-400">
                Modern authentication with social OAuth and secure sessions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900/70 transition-colors">
            <CardHeader>
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg w-fit mb-4">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">Multi-Tenant</CardTitle>
              <CardDescription className="text-zinc-400">
                Complete tenant isolation with approval workflow & tiers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900/70 transition-colors">
            <CardHeader>
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg w-fit mb-4">
                <Mail className="h-6 w-6 text-green-400" />
              </div>
              <CardTitle className="text-white">Team Invites</CardTitle>
              <CardDescription className="text-zinc-400">
                Secure token-based invitations with role management
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold mb-12 text-center text-white">
          Built with Modern Technologies
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center backdrop-blur-sm hover:bg-zinc-900/70 transition-colors">
            <h4 className="font-semibold text-white mb-2">Next.js</h4>
            <p className="text-sm text-zinc-400">v16.0</p>
          </div>
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center backdrop-blur-sm hover:bg-zinc-900/70 transition-colors">
            <h4 className="font-semibold text-white mb-2">Better Auth</h4>
            <p className="text-sm text-zinc-400">v1.4.5</p>
          </div>
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center backdrop-blur-sm hover:bg-zinc-900/70 transition-colors">
            <h4 className="font-semibold text-white mb-2">PostgreSQL</h4>
            <p className="text-sm text-zinc-400">Drizzle ORM</p>
          </div>
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center backdrop-blur-sm hover:bg-zinc-900/70 transition-colors">
            <h4 className="font-semibold text-white mb-2">TypeScript</h4>
            <p className="text-sm text-zinc-400">v5.x</p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-center text-white">Quick Links</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900/70 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  API Documentation
                  <ArrowRight className="h-5 w-5 text-zinc-400" />
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Complete API reference and endpoint documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800" asChild>
                  <a href="/API_QUICK_REFERENCE.md" target="_blank">
                    View Docs
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900/70 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Architecture Guide
                  <ArrowRight className="h-5 w-5 text-zinc-400" />
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  System design, database schema, and flows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800" asChild>
                  <a href="/ARCHITECTURE.md" target="_blank">
                    View Architecture
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
        <div className="container mx-auto px-4">
          <p>Multi-Tenant PM SaaS - Core API Module</p>
          <p className="mt-2">Powered by Next.js, Better Auth, and Drizzle ORM</p>
        </div>
      </footer>
    </div>
  );
}
