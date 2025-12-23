'use client'

import { useState } from 'react'
import { useForm, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TenantRegistrationDTO } from '@/types/tenant'
import { tenantRegistrationSchema } from '@/lib/validation/tenant.schema'
import { useRegisterTenant } from '@/hooks/useTenantRegistration'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { CountrySelector } from '@/components/ui/country-selector'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, User, Shield, CheckCircle2, Zap, Lock, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TenantSignupPage() {
    const router = useRouter()
    const steps = ['tenant', 'organization', 'user'] as const
    type Step = (typeof steps)[number]
    const [activeTab, setActiveTab] = useState<Step>('tenant')

    const registerMutation = useRegisterTenant({
        onSuccess: () => {
            form.reset()
            // Redirect to login after a delay
            setTimeout(() => {
                router.push('/auth/login')
            }, 2000)
        },
    })

    const form = useForm<TenantRegistrationDTO>({
        resolver: zodResolver(tenantRegistrationSchema),
        defaultValues: {
            tenant: {
                id: '',
                status: 'PENDING',
            },
            organization: {
                name: '',
                tenantId: '', // Will be populated from tenant.id on submit
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
                expectedUsers: undefined,
                description: '',
            },
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
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 py-8">
            <div className="mx-auto max-w-6xl">
                {/* Header Section */}
                <div className="text-center space-y-4 mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="size-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Create Your Organization</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Join thousands of teams managing projects efficiently with our platform
                    </p>
                    
                    {/* Trust Indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-primary" />
                            <span>Free 14-day trial</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Lock className="size-4 text-primary" />
                            <span>Enterprise security</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="size-4 text-primary" />
                            <span>Setup in 5 minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="size-4 text-primary" />
                            <span>Cancel anytime</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-[1fr,400px] gap-8">
                    {/* Form Section */}
                    <div className="space-y-6">
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
                                    <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 pt-6">
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

                    {/* Sidebar - Benefits */}
                    <div className="hidden lg:block space-y-6">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="text-xl">What you'll get</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <CheckCircle2 className="size-5 text-primary mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-sm">Complete Project Management</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Full suite of tools to manage projects from start to finish
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <CheckCircle2 className="size-5 text-primary mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-sm">Team Collaboration</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Invite unlimited team members and collaborate in real-time
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <CheckCircle2 className="size-5 text-primary mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-sm">Advanced Analytics</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Track progress with insightful reports and dashboards
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <CheckCircle2 className="size-5 text-primary mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-sm">Secure & Compliant</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Enterprise-grade security with complete data isolation
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <CheckCircle2 className="size-5 text-primary mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-sm">24/7 Support</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Get help whenever you need it from our support team
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Already have an account?
                                    </p>
                                    <Button variant="outline" asChild className="w-full">
                                        <Link href="/auth/login">
                                            Sign in to your account
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Mobile - Login Link */}
                <div className="lg:hidden mt-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Already have an account?
                                </p>
                                <Button variant="outline" asChild className="w-full">
                                    <Link href="/auth/login">
                                        Sign in to your account
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
