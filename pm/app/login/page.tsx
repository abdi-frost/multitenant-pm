'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/providers/AuthProvider"
import { toast } from "sonner"
import Link from "next/link"
import { Building2 } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const { signIn, user } = useAuth()
    
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    // Redirect if already logged in
    if (user) {
        router.push("/dashboard")
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.email || !formData.password) {
            toast.error("Please fill in all fields")
            return
        }

        setLoading(true)
        try {
            await signIn(formData.email, formData.password)
            toast.success("Welcome back!")
            router.push("/dashboard")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid email or password")
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
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
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
