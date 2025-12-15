'use client';

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user || null;

  const initials = useMemo(() => {
    const src = user?.name || user?.email || "";
    return src
      .split(/[\s.@_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(s => s[0]?.toUpperCase())
      .join("") || "U";
  }, [user]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center px-6">
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-10">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="bg-linear-to-r from-slate-400 via-violet-400 to-cyan-300 bg-clip-text text-2xl font-semibold tracking-tight text-transparent md:text-3xl">
              Admin Panel — Multi‑Tenant PM
            </h1>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 select-none items-center justify-center rounded-full bg-white/10 text-sm font-medium ring-1 ring-white/15">
                  {initials}
                </div>
              </div>
            ) : null}
          </div>

          {user ? (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-300">
                  Welcome back, <span className="font-medium text-slate-100">{user.name || user.email}</span>
                </p>
                <p className="text-xs text-slate-400">
                  Jump into your workspace or manage tenants, projects, and members.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="sm" asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button size="sm" variant="secondary" asChild>
                  <Link href="/settings">Organization Settings</Link>
                </Button>
                <Button size="sm" variant="outline" onClick={handleSignOut}>
                  Sign out
                </Button>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-slate-400">
                Tip: You can invite teammates from the dashboard and assign them to tenants.
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-300">
                  Sign in to access your multi‑tenant administration tools.
                </p>
                <p className="text-xs text-slate-400">
                  Centralized control for projects, teams, and tenant‑level permissions.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="sm" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
