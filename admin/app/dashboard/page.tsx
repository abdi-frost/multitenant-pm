'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Activity, TrendingUp, DollarSign, AlertCircle } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    {
      title: 'Total Tenants',
      value: '142',
      change: '+12%',
      trend: 'up',
      icon: Building2,
      description: 'Active organizations',
    },
    {
      title: 'Total Users',
      value: '3,847',
      change: '+18%',
      trend: 'up',
      icon: Users,
      description: 'Across all tenants',
    },
    {
      title: 'Active Projects',
      value: '1,249',
      change: '+8%',
      trend: 'up',
      icon: Activity,
      description: 'Currently in progress',
    },
    {
      title: 'Monthly Revenue',
      value: '$54,239',
      change: '+23%',
      trend: 'up',
      icon: DollarSign,
      description: 'Subscription income',
    },
  ]

  const recentActivity = [
    {
      tenant: 'Acme Corp',
      action: 'New subscription',
      plan: 'Enterprise',
      time: '2 minutes ago',
    },
    {
      tenant: 'TechStart Inc',
      action: 'Upgraded plan',
      plan: 'Professional',
      time: '15 minutes ago',
    },
    {
      tenant: 'DevTeam LLC',
      action: 'Added 5 users',
      plan: 'Team',
      time: '1 hour ago',
    },
    {
      tenant: 'BuildRight Co',
      action: 'Project milestone',
      plan: 'Enterprise',
      time: '2 hours ago',
    },
  ]

  const alerts = [
    {
      type: 'warning',
      message: 'TechVenture Ltd approaching user limit',
      time: '30 minutes ago',
    },
    {
      type: 'info',
      message: 'System maintenance scheduled for Dec 10',
      time: '2 hours ago',
    },
    {
      type: 'warning',
      message: 'Payment failed for GlobalSoft Inc',
      time: '3 hours ago',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here is an overview of your multi-tenant platform.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <div className="mt-2 flex items-center text-xs">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">{stat.change}</span>
                  <span className="ml-1 text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Activity */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest actions across all tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.tenant}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.action}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{activity.plan}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>
                Important notifications requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className="flex gap-3 border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <AlertCircle
                      className={`h-5 w-5 flex-shrink-0 ${
                        alert.type === 'warning'
                          ? 'text-yellow-500'
                          : 'text-blue-500'
                      }`}
                    />
                    <div className="space-y-1">
                      <p className="text-sm leading-none">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {alert.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
