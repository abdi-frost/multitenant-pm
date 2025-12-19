'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MoreHorizontal, PlusCircle, Search, Users, Activity, Clock, XCircle, ShieldCheck, ShieldX } from 'lucide-react'

import { getTenants } from '@/api/tenant'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { TenantDetailsDialog } from '@/components/tenants/TenantDetailsDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { ListResponse } from '@/types'
import { TenantDTO, TenantListSummary, TenantStatus } from '@/types'

export default function TenantsPage() {
    const router = useRouter()
    const [selectedTenant, setSelectedTenant] = useState<TenantDTO | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const { data, isLoading, isError } = useQuery<ListResponse<TenantDTO, TenantListSummary>>({
        queryKey: ['tenants', searchTerm],
        queryFn: async () => {
            const queryParams = searchTerm ? `search=${encodeURIComponent(searchTerm)}` : ''
            const res = await getTenants(queryParams)
            return res.data
        },
    })

    const tenants = data?.data ?? []
    const summary = data?.summary

    const pendingCount = summary?.pending ?? tenants.filter(t => t.status === TenantStatus.PENDING).length
    const approvedCount = summary?.approved ?? tenants.filter(t => t.status === TenantStatus.APPROVED).length
    const rejectedCount = summary?.rejected ?? tenants.filter(t => t.status === TenantStatus.REJECTED).length
    const totalCount = summary?.totalTenants ?? tenants.length

    const suspendedCount = summary?.suspended ?? 0
    const reinstatedCount = summary?.reinstated ?? 0
    const hasOwnerCount = summary?.hasOwner ?? 0
    const hasCreatedByCount = summary?.hasCreatedBy ?? 0

    const getStatusBadge = (status: TenantStatus) => {
        switch (status) {
            case TenantStatus.APPROVED:
                return <Badge className="bg-green-500">Approved</Badge>
            case TenantStatus.REJECTED:
                return <Badge variant="destructive">Rejected</Badge>
            case TenantStatus.PENDING:
                return <Badge variant="secondary">Pending</Badge>
            case TenantStatus.SUSPENDED:
                return <Badge variant="secondary">Suspended</Badge>
            case TenantStatus.REINSTATED:
                return <Badge variant="outline">Reinstated</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const handleViewDetails = (tenant: TenantDTO) => {
        setSelectedTenant(tenant)
        setDetailsOpen(true)
    }

    const handleOpenDetailsPage = (tenant: TenantDTO) => {
        router.push(`/tenants/${tenant.id}`)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
                        <p className="text-muted-foreground">Manage tenant registrations and approvals</p>
                    </div>
                    <Button asChild variant="outline" className="gap-2">
                        <Link href="/tenants/new">
                            <PlusCircle className="h-4 w-4" />
                            <span className="hidden md:block">Register New Tenant</span>
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalCount}</div>
                            <p className="text-xs text-muted-foreground">All registered organizations</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <Activity className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                            <p className="text-xs text-muted-foreground">Active tenants</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                            <p className="text-xs text-muted-foreground">Awaiting approval</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{rejectedCount}</div>
                            <p className="text-xs text-muted-foreground">Declined tenants</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
                            <ShieldX className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{suspendedCount}</div>
                            <p className="text-xs text-muted-foreground">Temporarily disabled</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Reinstated</CardTitle>
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reinstatedCount}</div>
                            <p className="text-xs text-muted-foreground">Restored tenants</p>
                        </CardContent>
                    </Card>
                </div>

                {summary?.byStatus ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Breakdown</CardTitle>
                            <CardDescription>Counts grouped by tenant status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {(Object.entries(summary.byStatus) as Array<[TenantStatus, number]>).map(([status, count]) => (
                                    <span key={status} className="inline-flex items-center gap-2">
                                        {getStatusBadge(status)}
                                        <span className="text-sm text-muted-foreground">{count}</span>
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : null}

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <CardTitle>Tenants</CardTitle>
                                <CardDescription>Browse and manage tenant registrations</CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by tenant ID..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {[...Array(6)].map((_, i) => (
                                    <Card key={i}>
                                        <CardHeader>
                                            <Skeleton className="h-5 w-40" />
                                            <Skeleton className="h-4 w-56" />
                                        </CardHeader>
                                        <CardContent>
                                            <Skeleton className="h-4 w-64" />
                                        </CardContent>
                                        <CardFooter className="justify-end">
                                            <Skeleton className="h-9 w-28" />
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : isError ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>Error loading tenants. Please try again.</p>
                            </div>
                        ) : tenants.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No tenants found. Register a new tenant to get started.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {tenants.map((tenant) => (
                                    <Card key={tenant.id} className="py-4">
                                        <CardHeader className="pb-3">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base">
                                                    {tenant.organization?.name || 'Unknown Organization'}
                                                </CardTitle>
                                                <CardDescription>Tenant ID: {tenant.id}</CardDescription>
                                            </div>

                                            <CardAction>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" aria-label="Open tenant actions">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleOpenDetailsPage(tenant)}>
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {tenant.status === TenantStatus.PENDING && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleViewDetails(tenant)}
                                                                    className="text-green-600"
                                                                >
                                                                    Approve Tenant
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleViewDetails(tenant)}
                                                                    className="text-destructive"
                                                                >
                                                                    Reject Tenant
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </CardAction>
                                        </CardHeader>

                                        <CardContent className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Status</span>
                                                <span>{getStatusBadge(tenant.status)}</span>
                                            </div>
                                        </CardContent>

                                        <CardFooter className="justify-end border-t">
                                            <Button variant="outline" size="sm" onClick={() => handleOpenDetailsPage(tenant)}>
                                                View
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {selectedTenant ? (
                <TenantDetailsDialog tenant={selectedTenant} open={detailsOpen} onOpenChange={setDetailsOpen} />
            ) : null}
        </DashboardLayout>
    )
}
