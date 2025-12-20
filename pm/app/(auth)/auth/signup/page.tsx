'use client'

import { useState } from 'react'
import { useForm, type FieldPath } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { registerTenant } from '@/api/tenant'
import { TenantRegistrationDTO } from '@/types/tenant'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { CountrySelector } from '@/components/ui/country-selector'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Building2, User, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TenantSignupPage() {
    const router = useRouter()
    const steps = ['tenant', 'organization', 'user'] as const
    type Step = (typeof steps)[number]
    const [activeTab, setActiveTab] = useState<Step>('tenant')

    const form = useForm<TenantRegistrationDTO>({
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
                website: '',
                description: '',
            },
            user: {
                name: '',
                email: '',
                password: '',
            },
            onboardingRequest: {
                businessType: '',
                expectedUsers: 0,
                description: '',
            },
        },
    })

    const registerMutation = useMutation({
        mutationFn: async (data: TenantRegistrationDTO) => {
            console.log('🚀 Registering tenant:', JSON.stringify(data, null, 2))
            return await registerTenant(data)
        },
        onSuccess: (response) => {
            console.log('✅ Registration successful:', response)
            toast.success('Registration successful!', {
                description: 'Your tenant registration is pending approval. You will be notified once approved.',
                duration: 5000,
            })
            form.reset()
            // Redirect to login or success page after a delay
            setTimeout(() => {
                router.push('/auth/login')
            }, 2000)
        },
        onError: (error: unknown) => {
            console.error('❌ Registration error:', error)
            const err = error as { response?: { data?: { error?: string, message?: string } } }
            const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'An unexpected error occurred.'
            console.error('❌ Error message:', errorMessage)
            toast.error('Registration failed', {
                description: errorMessage,
                duration: 5000,
            })
        },
    })

    const onSubmit = (data: TenantRegistrationDTO) => {
        console.log('Form submitted with data:', data)

        // Clean up and prepare payload
        const payload: TenantRegistrationDTO = {
            tenant: {
                id: data.tenant.id,
                status: 'PENDING',
            },
            organization: {
                name: data.organization.name,
                tenantId: data.tenant.id,
                legalName: data.organization.legalName || undefined,
                country: data.organization.country || undefined,
                phone: data.organization.phone || undefined,
                website: data.organization.website || undefined,
                description: data.organization.description || undefined,
            },
            user: {
                name: data.user.name,
                email: data.user.email,
                password: data.user.password,
            },
            onboardingRequest: {
                businessType: data.onboardingRequest?.businessType || undefined,
                expectedUsers: data.onboardingRequest?.expectedUsers || undefined,
                description: data.onboardingRequest?.description || undefined,
            },
        }

        console.log('Submitting payload:', payload)
        registerMutation.mutate(payload)
    }

    const goNext = async () => {
        const currentIndex = steps.indexOf(activeTab)
        if (currentIndex >= steps.length - 1) return

        const fieldsToValidate: FieldPath<TenantRegistrationDTO>[] =
            activeTab === 'tenant'
                ? ['tenant.id']
                : activeTab === 'organization'
                    ? ['organization.name']
                    : ['user.name', 'user.email', 'user.password']

        const isValid = await form.trigger(fieldsToValidate, { shouldFocus: true })
        if (!isValid) return

        setActiveTab(steps[currentIndex + 1])
    }

    const goBack = () => {
        const currentIndex = steps.indexOf(activeTab)
        if (currentIndex <= 0) return
        setActiveTab(steps[currentIndex - 1])
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Register Your Tenant</h1>
                <p className="text-muted-foreground mt-2">
                    Create your organization account and get started with project management.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Step)} className="w-full">
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
                                Admin User
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="tenant" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tenant Information</CardTitle>
                                    <CardDescription>
                                        Choose a unique identifier for your organization
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="tenant.id"
                                        rules={{
                                            required: 'Tenant ID is required',
                                            pattern: {
                                                value: /^[a-z0-9-]+$/,
                                                message: 'Only lowercase letters, numbers, and hyphens allowed'
                                            }
                                        }}
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
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="organization" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Organization Details</CardTitle>
                                    <CardDescription>
                                        Tell us about your organization
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="organization.name"
                                            rules={{ required: 'Organization name is required' }}
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
                                                        <Input placeholder="Acme Corp. LLC" {...field} value={field.value ?? ''} />
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
                                                        <CountrySelector
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                            disabled={registerMutation.isPending}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>Stored as ISO code (e.g., US, GB, ET)</FormDescription>
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
                                                        <Input placeholder="+1 (555) 123-4567" {...field} value={field.value ?? ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="organization.website"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Website</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://acmecorp.com" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="organization.description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Brief description of your organization" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="user" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Admin User Account</CardTitle>
                                    <CardDescription>
                                        Create your administrator account
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="user.name"
                                        rules={{ required: 'Name is required' }}
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

                                    <FormField
                                        control={form.control}
                                        name="user.email"
                                        rules={{
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address'
                                            }
                                        }}
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

                                    <FormField
                                        control={form.control}
                                        name="user.password"
                                        rules={{
                                            required: 'Password is required',
                                            minLength: {
                                                value: 8,
                                                message: 'Password must be at least 8 characters'
                                            }
                                        }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password *</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="********" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Minimum 8 characters
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
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
                                disabled={registerMutation.isPending}
                            >
                                Reset Form
                            </Button>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={goBack}
                                    disabled={registerMutation.isPending || activeTab === 'tenant'}
                                >
                                    Back
                                </Button>

                                {activeTab !== 'user' ? (
                                    <Button
                                        type="button"
                                        onClick={goNext}
                                        disabled={registerMutation.isPending}
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={registerMutation.isPending}>
                                        {registerMutation.isPending ? (
                                            <>
                                                <span className="mr-2">Registering...</span>
                                                <span className="animate-spin">⏳</span>
                                            </>
                                        ) : (
                                            'Register Tenant'
                                        )}
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    )
}
