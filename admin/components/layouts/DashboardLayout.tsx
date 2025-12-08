'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Building2,
    Users,
    LayoutDashboard,
    Settings,
    Activity,
    CreditCard,
    FileText,
    BarChart3,
    Menu,
    Bell,
    Search,
    Moon,
    Sun,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { useTheme } from 'next-themes'
import { AUTH_API } from '@/api/constants'
import { coreApiClient } from '@/lib/api.client'
import { AccountDropdown } from './AccountDropdown'

const navigationItems = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        badge: null,
    },
    {
        title: 'Tenants',
        icon: Building2,
        href: '/dashboard/tenants',
        badge: null,
    },
    {
        title: 'Users',
        icon: Users,
        href: '/dashboard/users',
        badge: null,
    },
    {
        title: 'Subscriptions',
        icon: CreditCard,
        href: '/dashboard/subscriptions',
        badge: 'New',
    },
    {
        title: 'Analytics',
        icon: BarChart3,
        href: '/dashboard/analytics',
        badge: null,
    },
    {
        title: 'Activity Logs',
        icon: Activity,
        href: '/dashboard/activity',
        badge: null,
    },
    {
        title: 'Reports',
        icon: FileText,
        href: '/dashboard/reports',
        badge: null,
    },
    {
        title: 'Settings',
        icon: Settings,
        href: '/dashboard/settings',
        badge: null,
    },
]

interface DashboardLayoutProps {
    children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <SidebarProvider defaultOpen>
            <div className="flex min-h-screen w-full overflow-hidden bg-background">
                {/* Sidebar */}
                <Sidebar className="border-r border-border">
                    <SidebarHeader className="border-b border-border p-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">Admin Panel</span>
                                <span className="text-xs text-muted-foreground">Multi-Tenant PM</span>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent className="px-3 py-4">
                        <SidebarMenu>
                            {navigationItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            className="w-full"
                                        >
                                            <Link href={item.href} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <item.icon className="h-4 w-4" />
                                                    <span>{item.title}</span>
                                                </div>
                                                {item.badge && (
                                                    <Badge variant="secondary" className="ml-auto">
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarContent>

                    <SidebarFooter className="border-t border-border p-4">
                        <AccountDropdown />
                    </SidebarFooter>
                </Sidebar>

                {/* Main Content */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Header */}
                    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="h-8 w-8">
                                <Menu className="h-5 w-5" />
                            </SidebarTrigger>

                            <div className="relative w-64 max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search tenants, users..."
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {mounted && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                >
                                    {theme === 'dark' ? (
                                        <Sun className="h-5 w-5" />
                                    ) : (
                                        <Moon className="h-5 w-5" />
                                    )}
                                </Button>
                            )}

                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
                            </Button>

                            <Separator orientation="vertical" className="h-6" />

                            <AccountDropdown minimal />
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                        <div className="mx-auto max-w-[1600px]">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
