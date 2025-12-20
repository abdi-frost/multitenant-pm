"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import Link from "next/link"
import { Building2, Eye, EyeOff } from "lucide-react"
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
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="size-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle>Employee Login</CardTitle>
                    <CardDescription>
                        Sign in to access your organization's project management dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                                    className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
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

                        <div className="text-center text-sm text-muted-foreground">
                            <p>
                                Don't have an account?{" "}
                                <span className="text-foreground">Check your email for an invitation link</span>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
