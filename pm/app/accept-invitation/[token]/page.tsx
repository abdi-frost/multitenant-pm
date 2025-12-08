'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { coreApiClient } from "@/lib/api.client"
import { AUTH_API } from "@/api/constants"
import { toast } from "sonner"
import { CheckCircle2, XCircle } from "lucide-react"

export default function AcceptInvitationPage() {
    const params = useParams()
    const router = useRouter()
    const token = params.token as string

    const [loading, setLoading] = useState(false)
    const [verifying, setVerifying] = useState(true)
    const [invitationValid, setInvitationValid] = useState(false)
    const [invitationData, setInvitationData] = useState<any>(null)
    
    const [formData, setFormData] = useState({
        name: "",
        password: "",
        confirmPassword: "",
    })

    useEffect(() => {
        verifyInvitation()
    }, [token])

    const verifyInvitation = async () => {
        setVerifying(true)
        try {
            const response = await coreApiClient.get(`/invitations/verify/${token}`)
            setInvitationData(response.data)
            setInvitationValid(true)
        } catch (error: any) {
            setInvitationValid(false)
            toast.error(error.response?.data?.message || "Invalid or expired invitation")
        } finally {
            setVerifying(false)
        }
    }

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
            await coreApiClient.post(AUTH_API.ACCEPT_INVITATION, {
                token,
                name: formData.name,
                password: formData.password,
            })

            toast.success("Invitation accepted! You can now log in.")
            router.push("/login")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to accept invitation")
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
                            onClick={() => router.push("/login")} 
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
                        You've been invited to join <strong>{invitationData?.organizationName}</strong>
                        <br />
                        as a <strong>{invitationData?.role}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={invitationData?.email || ""}
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
