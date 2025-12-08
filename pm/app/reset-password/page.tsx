'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { coreApiClient } from "@/lib/api.client"
import { AUTH_API } from "@/api/constants"
import { toast } from "sonner"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [emailSent, setEmailSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email) {
            toast.error("Please enter your email address")
            return
        }

        setLoading(true)
        try {
            await coreApiClient.post(AUTH_API.REQUEST_PASSWORD_RESET, { email })
            setEmailSent(true)
            toast.success("Password reset link sent to your email")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send reset link")
        } finally {
            setLoading(false)
        }
    }

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <Mail className="size-12 text-primary mx-auto mb-4" />
                        <CardTitle>Check Your Email</CardTitle>
                        <CardDescription>
                            We've sent a password reset link to <strong>{email}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground text-center">
                            Click the link in the email to reset your password. 
                            The link will expire in 1 hour.
                        </p>
                        <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setEmailSent(false)}
                        >
                            Didn't receive? Try again
                        </Button>
                        <Link href="/login">
                            <Button variant="ghost" className="w-full">
                                <ArrowLeft className="mr-2 size-4" />
                                Back to Login
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Reset Password</CardTitle>
                    <CardDescription>
                        Enter your email address and we'll send you a link to reset your password
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
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
                                    Sending...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </Button>

                        <Link href="/login">
                            <Button variant="ghost" className="w-full">
                                <ArrowLeft className="mr-2 size-4" />
                                Back to Login
                            </Button>
                        </Link>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
