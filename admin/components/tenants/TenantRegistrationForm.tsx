'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTenant } from '@/api/tenant'
import { CreateTenantDTO, OrganizationSize } from '@/types/tenant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

interface TenantFormData {
    // Tenant
    tenantId: string
    // Organization
    organizationName: string
    description: string
    website: string
    industry: string
    organizationSize: OrganizationSize
    // Onboarding Request
    businessType: string
    expectedUsers: number
    companyDetails: string
    // User
    userName: string
    userEmail: string
}

export function TenantRegistrationForm() {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()
    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<TenantFormData>()

    const organizationSize = watch('organizationSize')

    const createMutation = useMutation({
        mutationFn: async (data: TenantFormData) => {
            const payload: CreateTenantDTO = {
                tenant: {
                    id: data.tenantId,
                    isActive: true,
                },
                organization: {
                    name: data.organizationName,
                    description: data.description,
                    website: data.website,
                    industry: data.industry,
                    size: data.organizationSize,
                    isActive: true,
                },
                onboardingRequest: {
                    businessType: data.businessType,
                    expectedUsers: data.expectedUsers,
                    description: data.companyDetails,
                    isActive: true,
                },
                user: {
                    name: data.userName,
                    email: data.userEmail,
                },
            }
            return await createTenant(payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] })
            toast.success('Tenant registered successfully')
            reset()
            setOpen(false)
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { error?: string } } }
            toast.error(err?.response?.data?.error || 'Failed to register tenant')
        },
    })

    const onSubmit = (data: TenantFormData) => {
        createMutation.mutate(data)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Register Tenant
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Register New Tenant</DialogTitle>
                    <DialogDescription>
                        Create a new tenant organization with complete details
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Tenant Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Tenant Information</h3>
                        <div className="space-y-2">
                            <Label htmlFor="tenantId">Tenant ID *</Label>
                            <Input
                                id="tenantId"
                                type="text"
                                placeholder="tenant"
                                {...register('tenantId', { 
                                    required: 'Tenant ID is required',
                                })}
                            />
                            {errors.tenantId && (
                                <p className="text-sm text-destructive">{errors.tenantId.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Organization Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Organization Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="organizationName">Organization Name *</Label>
                                <Input
                                    id="organizationName"
                                    placeholder="Acme Corp"
                                    {...register('organizationName', { required: 'Organization name is required' })}
                                />
                                {errors.organizationName && (
                                    <p className="text-sm text-destructive">{errors.organizationName.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="industry">Industry</Label>
                                <Input
                                    id="industry"
                                    placeholder="Technology"
                                    {...register('industry')}
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="Brief description of the organization"
                                {...register('description')}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    placeholder="https://company.com"
                                    {...register('website')}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="organizationSize">Organization Size *</Label>
                                <Select
                                    value={organizationSize}
                                    onValueChange={(value) => setValue('organizationSize', value as OrganizationSize)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={OrganizationSize.SMALL}>Small (1-50)</SelectItem>
                                        <SelectItem value={OrganizationSize.MEDIUM}>Medium (51-200)</SelectItem>
                                        <SelectItem value={OrganizationSize.LARGE}>Large (201-1000)</SelectItem>
                                        <SelectItem value={OrganizationSize.ENTERPRISE}>Enterprise (1000+)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.organizationSize && (
                                    <p className="text-sm text-destructive">{errors.organizationSize.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Business Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Business Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="businessType">Business Type</Label>
                                <Input
                                    id="businessType"
                                    placeholder="SaaS, E-commerce, etc."
                                    {...register('businessType')}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expectedUsers">Expected Users</Label>
                                <Input
                                    id="expectedUsers"
                                    type="number"
                                    placeholder="50"
                                    {...register('expectedUsers', { valueAsNumber: true })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="companyDetails">Additional Details</Label>
                            <Input
                                id="companyDetails"
                                placeholder="Any additional information about the company"
                                {...register('companyDetails')}
                            />
                        </div>
                    </div>

                    {/* User Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Primary Contact</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="userName">Contact Name *</Label>
                                <Input
                                    id="userName"
                                    placeholder="John Doe"
                                    {...register('userName', { required: 'Contact name is required' })}
                                />
                                {errors.userName && (
                                    <p className="text-sm text-destructive">{errors.userName.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="userEmail">Contact Email *</Label>
                                <Input
                                    id="userEmail"
                                    type="email"
                                    placeholder="john@company.com"
                                    {...register('userEmail', { 
                                        required: 'Contact email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                />
                                {errors.userEmail && (
                                    <p className="text-sm text-destructive">{errors.userEmail.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setOpen(false)}
                            disabled={createMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Registering...' : 'Register Tenant'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
