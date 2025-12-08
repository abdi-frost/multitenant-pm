'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/AuthProvider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { 
    LayoutDashboard, 
    FolderKanban, 
    Users, 
    Settings,
    LogOut,
    Building2
} from "lucide-react"

export default function DashboardPage() {
    const router = useRouter()
    const { user, loading, signOut } = useAuth()

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login")
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Spinner className="size-8" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    const handleSignOut = async () => {
        await signOut()
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building2 className="size-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold">Project Management</h1>
                                <p className="text-xs text-muted-foreground">
                                    {user.role} • {user.email}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleSignOut}>
                            <LogOut className="size-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">
                        Welcome back, {user.name}!
                    </h2>
                    <p className="text-muted-foreground">
                        Here's what's happening with your projects today.
                    </p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <LayoutDashboard className="size-8 text-primary" />
                            </div>
                            <CardTitle className="mt-4">Dashboard</CardTitle>
                            <CardDescription>
                                View your overview and recent activities
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <FolderKanban className="size-8 text-blue-500" />
                            </div>
                            <CardTitle className="mt-4">Projects</CardTitle>
                            <CardDescription>
                                Manage and track all your projects
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <Users className="size-8 text-green-500" />
                            </div>
                            <CardTitle className="mt-4">Team</CardTitle>
                            <CardDescription>
                                Collaborate with your team members
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <Settings className="size-8 text-orange-500" />
                            </div>
                            <CardTitle className="mt-4">Settings</CardTitle>
                            <CardDescription>
                                Manage your account and preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* User Info Card */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Your current session details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                                <dd className="text-sm font-semibold">{user.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                                <dd className="text-sm font-semibold">{user.email}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                                <dd className="text-sm font-semibold">{user.role || "Employee"}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">User Type</dt>
                                <dd className="text-sm font-semibold">{user.userType}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Tenant ID</dt>
                                <dd className="text-sm font-semibold">{user.tenantId || "N/A"}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Email Verified</dt>
                                <dd className="text-sm font-semibold">
                                    {user.emailVerified ? "✅ Yes" : "❌ No"}
                                </dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
