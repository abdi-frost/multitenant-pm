'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { approveTenant, rejectTenant } from '@/api/tenant'
import { TenantDTO, TenantStatus, SubscriptionTier } from '@/types/tenant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CheckCircle2, XCircle, Building2, Users, Calendar, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/providers/AuthProvider'

interface TenantDetailsDialogProps {
    tenant: TenantDTO
    open: boolean
    onOpenChange: (open: boolean) => void
}

interface ApprovalFormData {
    subscriptionTier: SubscriptionTier
    maxEmployees: number
    maxProjects: number
}

interface RejectionFormData {
    rejectionReason: string
}

export function TenantDetailsDialog({ tenant, open, onOpenChange }: TenantDetailsDialogProps) {
    const [showApproveDialog, setShowApproveDialog] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const queryClient = useQueryClient()
    const { user } = useAuth()

    const { register: registerApprove, handleSubmit: handleApproveSubmit, formState: { errors: approveErrors }, setValue: setApproveValue, watch: watchApprove } = useForm<ApprovalFormData>({
        defaultValues: {
            subscriptionTier: SubscriptionTier.FREE,
            maxEmployees: 5,
            maxProjects: 10,
        }
    })

    const { register: registerReject, handleSubmit: handleRejectSubmit, formState: { errors: rejectErrors } } = useForm<RejectionFormData>()

    const subscriptionTier = watchApprove('subscriptionTier')

    const approveMutation = useMutation({
        mutationFn: async (data: ApprovalFormData) => {
            if (!user?.id) throw new Error('User not authenticated')
            return await approveTenant(tenant.id, {
                approvedBy: user.id,
                subscriptionTier: data.subscriptionTier,
                maxEmployees: data.maxEmployees,
                maxProjects: data.maxProjects,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] })
            toast.success('Tenant approved successfully')
            setShowApproveDialog(false)
            onOpenChange(false)
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } }
            toast.error(err?.response?.data?.message || 'Failed to approve tenant')
        },
    })

    const rejectMutation = useMutation({
        mutationFn: async (data: RejectionFormData) => {
            if (!user?.id) throw new Error('User not authenticated')
            return await rejectTenant(tenant.id, {
                rejectedBy: user.id,
                rejectionReason: data.rejectionReason,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] })
            toast.success('Tenant rejected')
            setShowRejectDialog(false)
            onOpenChange(false)
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } }
            toast.error(err?.response?.data?.message || 'Failed to reject tenant')
        },
    })

    const onApprove = (data: ApprovalFormData) => {
        approveMutation.mutate(data)
    }

    const onReject = (data: RejectionFormData) => {
        rejectMutation.mutate(data)
    }

    const getStatusBadge = (status: TenantStatus) => {
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

    const formatDate = (date: Date | string | null | undefined) => {
        if (!date) return 'N/A'
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <DialogTitle className="text-2xl">{tenant.organization?.name || 'Organization'}</DialogTitle>
                                <DialogDescription>
                                    Tenant ID: {tenant.id}
                                </DialogDescription>
                            </div>
                            {getStatusBadge(tenant.status)}
                        </div>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Organization Details */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Organization Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-muted-foreground">Name</Label>
                                    <p className="font-medium">{tenant.organization?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Industry</Label>
                                    <p className="font-medium">{tenant.organization?.industry || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Size</Label>
                                    <p className="font-medium">{tenant.organization?.size || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Website</Label>
                                    <p className="font-medium">
                                        {tenant.organization?.website ? (
                                            <a 
                                                href={tenant.organization.website} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline"
                                            >
                                                {tenant.organization.website}
                                            </a>
                                        ) : 'N/A'}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-muted-foreground">Description</Label>
                                    <p className="font-medium">{tenant.organization?.description || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Onboarding Request */}
                        {tenant.onboardingRequest && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Onboarding Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <Label className="text-muted-foreground">Business Type</Label>
                                        <p className="font-medium">{tenant.onboardingRequest.businessType || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Expected Users</Label>
                                        <p className="font-medium">{tenant.onboardingRequest.expectedUsers || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-muted-foreground">Additional Details</Label>
                                        <p className="font-medium">{tenant.onboardingRequest.description || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Status Information */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Status & Timeline
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-muted-foreground">Requested At</Label>
                                    <p className="font-medium">{formatDate(tenant.requestedAt)}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <p className="font-medium">{tenant.status}</p>
                                </div>
                                {tenant.status === TenantStatus.APPROVED && (
                                    <>
                                        <div>
                                            <Label className="text-muted-foreground">Approved At</Label>
                                            <p className="font-medium">{formatDate(tenant.approvedAt)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Approved By</Label>
                                            <p className="font-medium">{tenant.approvedBy || 'N/A'}</p>
                                        </div>
                                    </>
                                )}
                                {tenant.status === TenantStatus.REJECTED && (
                                    <>
                                        <div>
                                            <Label className="text-muted-foreground">Rejected At</Label>
                                            <p className="font-medium">{formatDate(tenant.rejectedAt)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Rejected By</Label>
                                            <p className="font-medium">{tenant.rejectedBy || 'N/A'}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <Label className="text-muted-foreground">Rejection Reason</Label>
                                            <p className="font-medium">{tenant.rejectionReason || 'N/A'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Subscription Details */}
                        {tenant.status === TenantStatus.APPROVED && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Subscription Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <Label className="text-muted-foreground">Tier</Label>
                                        <p className="font-medium">{tenant.subscriptionTier || 'FREE'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Max Employees</Label>
                                        <p className="font-medium">{tenant.maxEmployees || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Max Projects</Label>
                                        <p className="font-medium">{tenant.maxProjects || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {tenant.status === TenantStatus.PENDING && (
                        <DialogFooter>
                            <Button 
                                variant="outline" 
                                onClick={() => setShowRejectDialog(true)}
                                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                            <Button 
                                onClick={() => setShowApproveDialog(true)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>

            {/* Approval Dialog */}
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <form onSubmit={handleApproveSubmit(onApprove)}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Approve Tenant</AlertDialogTitle>
                            <AlertDialogDescription>
                                Set the subscription details for {tenant.organization?.name}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="subscriptionTier">Subscription Tier</Label>
                                <Select
                                    value={subscriptionTier}
                                    onValueChange={(value) => setApproveValue('subscriptionTier', value as SubscriptionTier)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={SubscriptionTier.FREE}>Free</SelectItem>
                                        <SelectItem value={SubscriptionTier.BASIC}>Basic</SelectItem>
                                        <SelectItem value={SubscriptionTier.PREMIUM}>Premium</SelectItem>
                                        <SelectItem value={SubscriptionTier.ENTERPRISE}>Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxEmployees">Max Employees</Label>
                                <Input
                                    id="maxEmployees"
                                    type="number"
                                    {...registerApprove('maxEmployees', { 
                                        required: 'Max employees is required',
                                        min: { value: 1, message: 'Must be at least 1' }
                                    })}
                                />
                                {approveErrors.maxEmployees && (
                                    <p className="text-sm text-destructive">{approveErrors.maxEmployees.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxProjects">Max Projects</Label>
                                <Input
                                    id="maxProjects"
                                    type="number"
                                    {...registerApprove('maxProjects', { 
                                        required: 'Max projects is required',
                                        min: { value: 1, message: 'Must be at least 1' }
                                    })}
                                />
                                {approveErrors.maxProjects && (
                                    <p className="text-sm text-destructive">{approveErrors.maxProjects.message}</p>
                                )}
                            </div>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={approveMutation.isPending}>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                type="submit" 
                                disabled={approveMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {approveMutation.isPending ? 'Approving...' : 'Approve Tenant'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>

            {/* Rejection Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <form onSubmit={handleRejectSubmit(onReject)}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Reject Tenant</AlertDialogTitle>
                            <AlertDialogDescription>
                                Provide a reason for rejecting {tenant.organization?.name}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                                <Input
                                    id="rejectionReason"
                                    placeholder="Provide a clear reason for rejection"
                                    {...registerReject('rejectionReason', { 
                                        required: 'Rejection reason is required',
                                        minLength: { value: 10, message: 'Reason must be at least 10 characters' }
                                    })}
                                />
                                {rejectErrors.rejectionReason && (
                                    <p className="text-sm text-destructive">{rejectErrors.rejectionReason.message}</p>
                                )}
                            </div>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={rejectMutation.isPending}>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                type="submit" 
                                disabled={rejectMutation.isPending}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                {rejectMutation.isPending ? 'Rejecting...' : 'Reject Tenant'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
