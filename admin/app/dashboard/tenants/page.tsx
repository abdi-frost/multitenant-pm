'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, MoreHorizontal, Users, Activity, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getTenants } from '@/api/tenant'
import { ListResponse } from '@/types/response'
import { TenantDTO, TenantStatus } from '@/types/tenant'
import { TenantRegistrationForm } from '@/components/tenants/TenantRegistrationForm'
import { TenantDetailsDialog } from '@/components/tenants/TenantDetailsDialog'
import { Skeleton } from '@/components/ui/skeleton'

export default function TenantsPage() {
    const [selectedTenant, setSelectedTenant] = useState<TenantDTO | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const { data, isLoading, error, isError } = useQuery<ListResponse<TenantDTO>>({
        queryKey: ['tenants', searchTerm],
        queryFn: async () => {
            const queryParams = searchTerm ? `search=${encodeURIComponent(searchTerm)}` : ''
            const res = await getTenants(queryParams)
            return res.data
        },
    })

    const tenants = data?.data || []
    
    const pendingCount = tenants.filter(t => t.status === TenantStatus.PENDING).length
    const approvedCount = tenants.filter(t => t.status === TenantStatus.APPROVED).length
    const rejectedCount = tenants.filter(t => t.status === TenantStatus.REJECTED).length

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

    const handleViewDetails = (tenant: TenantDTO) => {
        setSelectedTenant(tenant)
        setDetailsOpen(true)
    }

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
                        <p className="text-muted-foreground">
                            Manage tenant registrations and approvals
                        </p>
                    </div>
                    <TenantRegistrationForm />
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{tenants.length}</div>
                            <p className="text-xs text-muted-foreground">
                                All registered organizations
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <Activity className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                            <p className="text-xs text-muted-foreground">
                                Active tenants
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                            <p className="text-xs text-muted-foreground">
                                {rejectedCount} rejected
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tenants Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>All Tenants</CardTitle>
                                <CardDescription>
                                    View and manage all tenant registrations
                                </CardDescription>
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
                            <div className="space-y-2">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
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
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tenant ID</TableHead>
                                        <TableHead>Organization</TableHead>
                                        <TableHead>Industry</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Requested</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tenants.map((tenant) => (
                                        <TableRow key={tenant.id}>
                                            <TableCell className="font-medium">{tenant.id}</TableCell>
                                            <TableCell>{tenant.organization?.name || 'N/A'}</TableCell>
                                            <TableCell>{tenant.organization?.industry || 'N/A'}</TableCell>
                                            <TableCell>{tenant.organization?.size || 'N/A'}</TableCell>
                                            <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                                            <TableCell>{formatDate(tenant.requestedAt)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleViewDetails(tenant)}>
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
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Tenant Details Dialog */}
            {selectedTenant && (
                <TenantDetailsDialog
                    tenant={selectedTenant}
                    open={detailsOpen}
                    onOpenChange={setDetailsOpen}
                />
            )}
        </DashboardLayout>
    )
}
