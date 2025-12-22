'use client'

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { acceptInvitation, getInvitationByToken } from "@/lib/invitations"
import { toast } from "sonner"
import { CheckCircle2, XCircle } from "lucide-react"
import type { InvitationDetails } from "@/types/invitation"

function getErrorMessage(error: unknown, fallback: string) {
    if (typeof error === "object" && error !== null) {
        const maybeResponse = (error as { response?: { data?: { message?: unknown } } }).response
        const maybeMessage = maybeResponse?.data?.message
        if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage
    }
    if (error instanceof Error && error.message) return error.message
    return fallback
}

export default function AcceptInvitationPage() {
    const params = useParams()
    const router = useRouter()
    const token = params.token as string

    const [loading, setLoading] = useState(false)
    const [verifying, setVerifying] = useState(true)
    const [invitationValid, setInvitationValid] = useState(false)
    const [invitationData, setInvitationData] = useState<InvitationDetails | null>(null)
    
    const [formData, setFormData] = useState({
        name: "",
        password: "",
        confirmPassword: "",
    })

    const verifyInvitation = useCallback(async () => {
        setVerifying(true)
        try {
            const response = await getInvitationByToken(token)
            if (!response.success || !response.data?.invitation) {
                throw new Error(response.message || "Invalid invitation")
            }
            setInvitationData(response.data)
            setInvitationValid(true)
        } catch (error: unknown) {
            setInvitationValid(false)
            toast.error(getErrorMessage(error, "Invalid or expired invitation"))
        } finally {
            setVerifying(false)
        }
    }, [token])

    useEffect(() => {
        verifyInvitation()
    }, [verifyInvitation])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }

        setLoading(true)
        try {
            const email = invitationData?.invitation?.email
            if (!email) {
                toast.error("Invitation email not found")
                return
            }

            const res = await acceptInvitation(token, {
                email,
                name: formData.name,
                password: formData.password,
            })

            if (!res.success) {
                throw new Error(res.message || res.error || "Failed to accept invitation")
            }

            toast.success("Invitation accepted! You can now log in.")
            router.push("/auth/login")
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to accept invitation"))
        } finally {
            setLoading(false)
        }
    }

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Spinner className="size-8 mb-4" />
                        <p className="text-muted-foreground">Verifying invitation...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!invitationValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <XCircle className="size-12 text-destructive mx-auto mb-4" />
                        <CardTitle>Invalid Invitation</CardTitle>
                        <CardDescription>
                            This invitation link is invalid or has expired.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            onClick={() => router.push("/auth/login")} 
                            className="w-full"
                        >
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CheckCircle2 className="size-12 text-green-500 mx-auto mb-4" />
                    <CardTitle>Accept Invitation</CardTitle>
                    <CardDescription>
                        You’ve been invited to join <strong>{invitationData?.organizationName}</strong>
                        <br />
                        as a <strong>{invitationData?.invitation?.role}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={invitationData?.invitation?.email || ""}
                                disabled
                                className="opacity-70"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Create a password (min 8 characters)"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                                    Accepting...
                                </>
                            ) : (
                                "Accept Invitation"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
