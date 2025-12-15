'use client'

import { useForm } from 'react-hook-form'
import { DevTool } from '@hookform/devtools'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTenant } from '@/api/tenant'
import { CreateTenantDTO } from '@/types/tenant'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Building2, User, Shield } from 'lucide-react'

export default function NewTenantPage() {
    const queryClient = useQueryClient()

    const form = useForm<CreateTenantDTO>({
        defaultValues: {
            tenant: {
                id: '',
                status: 'PENDING',
            },
            organization: {
                name: '',
                tenantId: '',
                legalName: '',
                country: '',
                phone: '',
                logoUrl: '',
                website: '',
            },
            user: {
                id: '',
                name: '',
                email: '',
                tenantId: '',
                userType: 'USER',
                role: 'TENANT_ADMIN',
            },
        },
    })

    const createMutation = useMutation({
        mutationFn: async (data: CreateTenantDTO) => {
            console.log('🚀 Sending to API:', JSON.stringify(data, null, 2))
            return await createTenant(data)
        },
        onSuccess: (response) => {
            console.log('✅ Success response:', response)
            queryClient.invalidateQueries({ queryKey: ['tenants'] })
            toast.success('Tenant registered successfully', {
                description: 'The tenant has been created and is ready to use.',
            })
            form.reset()
        },
        onError: (error: unknown) => {
            console.error('❌ Error details:', error)
            const err = error as { response?: { data?: { error?: string, message?: string, details?: any } } }
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'An unexpected error occurred.'
            console.error('❌ Error message:', errorMessage)
            console.error('❌ Full error object:', JSON.stringify(err?.response?.data, null, 2))
            toast.error('Failed to register tenant', {
                description: errorMessage,
                duration: 5000,
            })
        },
    })

    const onSubmit = (data: CreateTenantDTO) => {
        console.log('Form submitted with data:', data)

        // Clean up empty strings and ensure tenantId is set
        const payload: CreateTenantDTO = {
            tenant: {
                id: data.tenant.id,
                status: data.tenant.status || undefined,
            },
            organization: {
                name: data.organization.name,
                tenantId: data.tenant.id,
                legalName: data.organization.legalName || undefined,
                country: data.organization.country || undefined,
                phone: data.organization.phone || undefined,
                logoUrl: data.organization.logoUrl || undefined,
                website: data.organization.website || undefined,
            },
            user: {
                id: data.user.id || undefined,
                name: data.user.name,
                email: data.user.email,
                tenantId: data.tenant.id,
                userType: data.user.userType || undefined,
                role: data.user.role || undefined,
            },
        }

        console.log('Submitting payload:', payload)
        createMutation.mutate(payload)
    }

    return (
        <DashboardLayout>
            <div className="mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Register New Tenant</h1>
                    <p className="text-muted-foreground mt-2">
                        Create a new tenant with organization details and primary user account.
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Tabs defaultValue="tenant" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="tenant" className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Tenant
                                </TabsTrigger>
                                <TabsTrigger value="organization" className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Organization
                                </TabsTrigger>
                                <TabsTrigger value="user" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Primary User
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="tenant" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tenant Information</CardTitle>
                                        <CardDescription>
                                            Basic tenant configuration and metadata
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="tenant.id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tenant ID *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="acme-corp" {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Unique identifier (lowercase, hyphens only)
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="tenant.status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Status</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="PENDING">Pending</SelectItem>
                                                            <SelectItem value="APPROVED">Approved</SelectItem>
                                                            <SelectItem value="REJECTED">Rejected</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="organization.name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Organization Name *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Acme Corporation" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="organization.legalName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Legal Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Acme Corp. LLC" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="organization.country"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Country</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="United States" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="organization.phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="+1 (555) 123-4567" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="organization.website"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Website</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="https://acmecorp.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="organization.logoUrl"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Logo URL</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="https://acmecorp.com/logo.png" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="user" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Primary User Account</CardTitle>
                                        <CardDescription>
                                            Administrator account for this tenant
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          
                                            <FormField
                                                control={form.control}
                                                name="user.name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Full Name *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="John Doe" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="user.email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Address *</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="john@acmecorp.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="user.userType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>User Type</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select user type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="User">User</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="user.role"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Role</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select role" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="TENANT_ADMIN">Tenant Admin</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        <Card>
                            <CardFooter className="flex justify-between pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => form.reset()}
                                    disabled={createMutation.isPending}
                                >
                                    Reset Form
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? (
                                        <>
                                            <span className="mr-2">Registering...</span>
                                            <span className="animate-spin">⏳</span>
                                        </>
                                    ) : (
                                        'Register Tenant'
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                    <DevTool control={form.control} />
                </Form>
            </div>
        </DashboardLayout>
    )
}

