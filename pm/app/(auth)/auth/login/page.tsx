"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import Link from "next/link"
import { Building2, Eye, EyeOff, CheckCircle2, Users, LayoutDashboard, Shield } from "lucide-react"
import { authClient } from "@/lib/auth"
import { URLS } from "@/config/urls"

export default function LoginPage() {
    
    const callbackURL = `${URLS.PM_APP}/app`

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false)


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.email || !formData.password) {
            toast.error("Please fill in all fields")
            return
        }

        setLoading(true)
        try {
            const result = await authClient.signIn.email({
                email: formData.email,
                password:formData.password,
                callbackURL
            })
            if (!result){
                throw new Error("Login failed")
            }
            if (result.error) {
                throw new Error(result.error.message)
            }
            toast.success("Welcome back!")
        } catch (error) {
            const errMsg = error instanceof Error ? error?.message : "Invalid email or password";
            toast.error(errMsg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
            <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
                {/* Left side - Features/Benefits */}
                <div className="hidden md:block space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building2 className="size-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
                                <p className="text-muted-foreground">Sign in to your workspace</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-8">
                        <h2 className="text-xl font-semibold">Why teams choose us</h2>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <CheckCircle2 className="size-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-medium">Powerful Project Management</h3>
                                    <p className="text-sm text-muted-foreground">Organize tasks, track progress, and collaborate seamlessly</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Users className="size-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-medium">Team Collaboration</h3>
                                    <p className="text-sm text-muted-foreground">Real-time updates and communication for your entire team</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <LayoutDashboard className="size-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-medium">Insightful Analytics</h3>
                                    <p className="text-sm text-muted-foreground">Track performance with comprehensive reports and dashboards</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Shield className="size-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-medium">Enterprise Security</h3>
                                    <p className="text-sm text-muted-foreground">Bank-level security with complete data isolation</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Login Form */}
                <Card className="w-full shadow-lg">
                    <CardHeader className="space-y-3">
                        <div className="md:hidden flex justify-center mb-2">
                            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building2 className="size-6 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl text-center md:text-left">Sign in to your account</CardTitle>
                        <CardDescription className="text-center md:text-left">
                            Enter your credentials to access your workspace
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@company.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link 
                                        href="/reset-password" 
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        onClick={() => setShowPassword((s) => !s)}
                                        className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>

                        <Separator />

                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-3">
                                    New to our platform?
                                </p>
                                <div className="flex gap-2 justify-center">
                                    <Button 
                                        variant="outline" 
                                        asChild
                                        className="w-full sm:w-auto"
                                    >
                                        <Link href="/auth/signup">
                                            <Building2 className="mr-2 size-4" />
                                            Sign up as Organization
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="text-center text-xs text-muted-foreground pt-2 border-t">
                                <p>
                                    Already part of a team?{" "}
                                    <span className="text-foreground font-medium">Check your email for an invitation link</span>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
