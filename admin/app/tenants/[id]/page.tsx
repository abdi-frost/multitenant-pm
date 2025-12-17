'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getTenantById } from '@/api/tenant'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { getCountryNameByCode } from '@/lib/countries'
import { TenantDTO, TenantStatus } from '@/types/tenant'
import type { DataResponse } from '@/types/response'
import { ArrowLeft, Building2, Calendar, CheckCircle2, Shield, Trash, Users, XCircle } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useTenantMutations } from '@/hooks/useTenant'

function StatusBadge({ status }: { status: TenantStatus }) {
    switch (status) {
        case TenantStatus.APPROVED:
            return <Badge className="bg-green-500">Approved</Badge>
        case TenantStatus.REJECTED:
            return <Badge variant="destructive">Rejected</Badge>
        case TenantStatus.PENDING:
            return <Badge variant="secondary">Pending</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

function formatDate(date: Date | string | null | undefined) {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const getTenantApprovedAt = (moderationLog: TenantDTO['moderationLog']) => {
    if (!moderationLog || moderationLog.length === 0) return null
    return moderationLog.find(log => log.action === TenantStatus.APPROVED)?.at
}

const getTenantRejectedAt = (moderationLog: TenantDTO['moderationLog']) => {
    if (!moderationLog || moderationLog.length === 0) return null
    return moderationLog.find(log => log.action === TenantStatus.REJECTED)?.at
}

export default function TenantDetailsPage() {
    const tenantId = useParams().id as string
    const router = useRouter()

    const [approveOpen, setApproveOpen] = useState(false)
    const [rejectOpen, setRejectOpen] = useState(false)

    const [approvalReason, setApprovalReason] = useState('')
    const [rejectionReason, setRejectionReason] = useState('')

    const [deleteOpen, setDeleteOpen] = useState(false)


    const tenantQuery = useQuery({
        queryKey: ['tenant', tenantId],
        queryFn: async () => {
            const res = await getTenantById(tenantId)
            const payload: unknown = res.data
            if (payload && typeof payload === 'object' && 'data' in payload) {
                const dataResponse = payload as DataResponse<TenantDTO>
                return dataResponse.data
            }
            return payload as TenantDTO
        },
    })

    const { approveMutation, rejectMutation, deleteMutation } = useTenantMutations({
        onApproved: () => setApproveOpen(false),
        onRejected: () => setRejectOpen(false),
        onDeleted: () => {
            setDeleteOpen(false)
            router.push('/tenants')
        },
    })

    const tenant = tenantQuery.data

    const orgCountryCode = (() => {
        const org = tenant?.organization
        const direct = (org as unknown as { country?: unknown })?.country
        if (typeof direct === 'string' && direct.trim()) return direct.trim().toUpperCase()

        const metadata = (org?.metadata ?? undefined) as unknown as Record<string, unknown> | undefined
        const fromMetadata = metadata?.country
        if (typeof fromMetadata === 'string' && fromMetadata.trim()) return fromMetadata.trim().toUpperCase()

        return undefined
    })()

    const orgPhone = (() => {
        const org = tenant?.organization
        const direct = (org as unknown as { phone?: unknown })?.phone
        if (typeof direct === 'string' && direct.trim()) return direct.trim()

        const metadata = (org?.metadata ?? undefined) as unknown as Record<string, unknown> | undefined
        const fromMetadata = metadata?.phone
        if (typeof fromMetadata === 'string' && fromMetadata.trim()) return fromMetadata.trim()

        return undefined
    })()

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <Button asChild variant="outline" className="gap-2">
                            <Link href="/tenants">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Tenants
                            </Link>
                        </Button>

                        {tenantQuery.isLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-4 w-72" />
                            </div>
                        ) : tenantQuery.isError ? (
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Tenant</h1>
                                <p className="text-muted-foreground">Unable to load tenant details.</p>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold tracking-tight">
                                        {tenant?.organization?.name || tenant?.id}
                                    </h1>
                                    {tenant?.status ? <StatusBadge status={tenant.status} /> : null}
                                </div>
                                <p className="text-muted-foreground">Tenant ID: {tenant?.id}</p>
                            </div>
                        )}
                    </div>

                    {!tenantQuery.isLoading && tenant?.status === TenantStatus.PENDING ? (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                className="gap-2"
                                onClick={() => setRejectOpen(true)}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                            >
                                <XCircle className="h-4 w-4" />
                                Reject
                            </Button>
                            <Button
                                className="gap-2"
                                onClick={() => setApproveOpen(true)}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Approve
                            </Button>
                        </div>
                    ) : null}

                    <Button
                        className="gap-2"
                        onClick={() => setDeleteOpen(true)}
                        variant="destructive"
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>

                {tenantQuery.isLoading ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-56 w-full md:col-span-2" />
                    </div>
                ) : tenantQuery.isError || !tenant ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Could not load tenant</CardTitle>
                            <CardDescription>Please try again or go back to tenants.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline">
                                <Link href="/tenants">Go to Tenants</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Overview
                                    </CardTitle>
                                    <CardDescription>Status and core identifiers</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Tenant ID</span>
                                            <span className="font-medium">{tenant.id}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Status</span>
                                            <span className="font-medium">{tenant.status}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Requested At</span>
                                            <span className="font-medium">{formatDate(tenant.createdAt)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Timeline
                                    </CardTitle>
                                    <CardDescription>Approval / rejection history</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="grid grid-cols-1 gap-4">
                                        {tenant.status === TenantStatus.APPROVED && (
                                            <div>
                                                <div className="text-muted-foreground">Approved At</div>
                                                <div className="font-medium">{formatDate(getTenantApprovedAt(tenant.moderationLog))}</div>
                                            </div>
                                        )}
                                        {tenant.status === TenantStatus.REJECTED && (
                                            <div>
                                                <div className="text-muted-foreground">Rejected At</div>
                                                <div className="font-medium">{formatDate(getTenantRejectedAt(tenant.moderationLog))}</div>
                                            </div>
                                        )}
                                        {tenant.status === TenantStatus.PENDING && (
                                            <div>
                                                <div className="text-muted-foreground">Awaiting Approval</div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Organization
                                </CardTitle>
                                <CardDescription>Company information for this tenant</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-muted-foreground">Name</Label>
                                    <div className="font-medium">{tenant.organization?.name || 'N/A'}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Website</Label>
                                    <div className="font-medium">
                                        {tenant.organization?.website ? (
                                            <a
                                                href={tenant.organization.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:underline"
                                            >
                                                {tenant.organization.website}
                                            </a>
                                        ) : (
                                            'N/A'
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Country</Label>
                                    <div className="font-medium">
                                        {orgCountryCode
                                            ? `${getCountryNameByCode(orgCountryCode) ?? orgCountryCode} (${orgCountryCode})`
                                            : 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Phone</Label>
                                    <div className="font-medium">
                                        {orgPhone || 'N/A'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {tenant.onboardingRequest ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Onboarding
                                    </CardTitle>
                                    <CardDescription>Request details provided during signup</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-muted-foreground">Business Type</Label>
                                        <div className="font-medium">{tenant.onboardingRequest.businessType || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Expected Users</Label>
                                        <div className="font-medium">{tenant.onboardingRequest.expectedUsers ?? 'N/A'}</div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label className="text-muted-foreground">Description</Label>
                                        <div className="font-medium">{tenant.onboardingRequest.description || 'N/A'}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : null}
                    </>
                )}
            </div>

            {/* Approve */}
            <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Approve tenant</DialogTitle>
                        <DialogDescription>Set subscription tier and limits for this tenant.</DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            approveMutation.mutate({ tenantId, data: { reason: approvalReason } })
                        }}
                        className="space-y-4"
                    >
                        <div className="grid">
                            <div className="md:col-span-1">
                                <Label>Approval Reason (Optional)</Label>
                                <Input
                                    type="text"
                                    maxLength={100}
                                    value={approvalReason}
                                    onChange={(e) => setApprovalReason(e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setApproveOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={approveMutation.isPending}>
                                {approveMutation.isPending ? 'Approving…' : 'Approve'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Reject */}
            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Reject tenant</DialogTitle>
                        <DialogDescription>
                            Provide a reason. This can be reversed later by approving the tenant.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <Label>Rejection reason</Label>
                        <Input
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g. Missing verification documents"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setRejectOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => rejectMutation.mutate({ tenantId, data: { reason: rejectionReason } })}
                            disabled={rejectMutation.isPending}
                        >
                            {rejectMutation.isPending ? 'Rejecting…' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Delete tenant</DialogTitle>
                        <DialogDescription>
                            This action is irreversible. All data associated with this tenant will be permanently deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => deleteMutation.mutate({ tenantId })}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </DashboardLayout >
    )
}
