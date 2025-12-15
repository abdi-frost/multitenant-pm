'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Activity } from 'lucide-react'

export default function ActivityPage() {
  const activities = [
    {
      id: '1',
      tenant: 'Acme Corp',
      user: 'John Doe',
      action: 'Created new project',
      details: 'Website Redesign',
      timestamp: '2024-12-07 14:30:22',
      type: 'create',
    },
    {
      id: '2',
      tenant: 'TechStart Inc',
      user: 'Jane Smith',
      action: 'Updated subscription',
      details: 'Upgraded to Professional plan',
      timestamp: '2024-12-07 13:45:10',
      type: 'update',
    },
    {
      id: '3',
      tenant: 'DevTeam LLC',
      user: 'Mike Johnson',
      action: 'Added team member',
      details: 'Added sarah@devteam.com',
      timestamp: '2024-12-07 12:20:45',
      type: 'create',
    },
    {
      id: '4',
      tenant: 'BuildRight Co',
      user: 'System',
      action: 'Billing invoice generated',
      details: 'Invoice #INV-2024-1207',
      timestamp: '2024-12-07 00:00:01',
      type: 'system',
    },
    {
      id: '5',
      tenant: 'Acme Corp',
      user: 'John Doe',
      action: 'Deleted project',
      details: 'Old Marketing Campaign',
      timestamp: '2024-12-06 16:22:33',
      type: 'delete',
    },
  ]

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'create':
        return <Badge variant="default">Create</Badge>
      case 'update':
        return <Badge variant="secondary">Update</Badge>
      case 'delete':
        return <Badge variant="destructive">Delete</Badge>
      case 'system':
        return <Badge variant="outline">System</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
            <p className="text-muted-foreground">
              Monitor all activities across the platform
            </p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search activities..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">
                +23% from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                62% of total tenants
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Activities</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="update">Update</TabsTrigger>
            <TabsTrigger value="delete">Delete</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  All platform activities in chronological order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium">
                          {activity.tenant}
                        </TableCell>
                        <TableCell>{activity.user}</TableCell>
                        <TableCell>{activity.action}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {activity.details}
                        </TableCell>
                        <TableCell>{getActivityBadge(activity.type)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {activity.timestamp}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
