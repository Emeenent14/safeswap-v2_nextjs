import { Suspense } from 'react'
import type { Metadata } from 'next'

import DashboardLayout from '@/components/layout/DashboardLayout'
import NotificationCenter from '@/components/dashboard/NotificationCenter'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

import { 
  Bell, 
  Settings, 
  Mail, 
  Phone, 
  MessageSquare,
  CheckCheck,
  Filter,
  Archive,
  Volume2,
  VolumeX
} from 'lucide-react'

import { useNotificationStore } from '@/store/notificationStore'
import { useUIStore } from '@/store/uiStore'

export const metadata: Metadata = {
  title: 'Notifications - SafeSwap',
  description: 'Manage your notifications and communication preferences',
  robots: 'noindex, nofollow'
}

// Loading skeleton for the notifications page
function NotificationsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-8 w-16 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64 mt-1" />
                    <Skeleton className="h-3 w-32 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const { unreadCount } = useNotificationStore()
  const { 
    notificationPreferences, 
    setNotificationPreference 
  } = useUIStore()

  return (
    <DashboardLayout title="Notifications">
      <Suspense fallback={<NotificationsPageSkeleton />}>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Bell className="h-6 w-6" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount} unread
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground">
                Stay updated with your deals, messages, and account activity
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            </div>
          </div>

          {/* Notification Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Unread</p>
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold mt-2">{unreadCount}</p>
                <p className="text-xs text-muted-foreground">
                  {unreadCount === 0 ? 'All caught up!' : 'Require attention'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <Bell className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold mt-2">23</p>
                <p className="text-xs text-muted-foreground">
                  +5 from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Archived</p>
                  <Archive className="h-4 w-4 text-gray-500" />
                </div>
                <p className="text-2xl font-bold mt-2">156</p>
                <p className="text-xs text-muted-foreground">
                  Total archived
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="notifications" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:w-[300px]">
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <NotificationCenter 
                compact={false}
                showHeader={false}
                className="border-0 shadow-none p-0"
              />
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Notification Channels */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Volume2 className="h-5 w-5" />
                      Notification Channels
                    </CardTitle>
                    <CardDescription>
                      Choose how you want to receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <Label htmlFor="in-app" className="font-medium">
                            In-App Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Show notifications within SafeSwap
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="in-app"
                        checked={notificationPreferences.inApp}
                        onCheckedChange={(checked) => 
                          setNotificationPreference('inApp', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <Label htmlFor="email" className="font-medium">
                            Email Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive updates via email
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="email"
                        checked={notificationPreferences.email}
                        onCheckedChange={(checked) => 
                          setNotificationPreference('email', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <Label htmlFor="sms" className="font-medium">
                            SMS Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Get text message alerts
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="sms"
                        checked={notificationPreferences.sms}
                        onCheckedChange={(checked) => 
                          setNotificationPreference('sms', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <Label htmlFor="push" className="font-medium">
                            Push Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Browser and mobile push alerts
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="push"
                        checked={notificationPreferences.push}
                        onCheckedChange={(checked) => 
                          setNotificationPreference('push', checked)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Notification Types */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Types</CardTitle>
                    <CardDescription>
                      Control what types of notifications you receive
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { 
                        key: 'deals', 
                        label: 'Deal Updates', 
                        description: 'New deals, status changes, milestones',
                        enabled: true 
                      },
                      { 
                        key: 'messages', 
                        label: 'Messages', 
                        description: 'New messages and chat activity',
                        enabled: true 
                      },
                      { 
                        key: 'payments', 
                        label: 'Payments', 
                        description: 'Payment confirmations and escrow updates',
                        enabled: true 
                      },
                      { 
                        key: 'disputes', 
                        label: 'Disputes', 
                        description: 'Dispute creation and resolution updates',
                        enabled: true 
                      },
                      { 
                        key: 'trust_score', 
                        label: 'Trust Score', 
                        description: 'Changes to your trust score',
                        enabled: false 
                      },
                      { 
                        key: 'marketing', 
                        label: 'Marketing Updates', 
                        description: 'Product news and feature announcements',
                        enabled: false 
                      }
                    ].map((type) => (
                      <div key={type.key} className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">{type.label}</Label>
                          <p className="text-sm text-muted-foreground">
                            {type.description}
                          </p>
                        </div>
                        <Switch defaultChecked={type.enabled} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Quiet Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <VolumeX className="h-5 w-5" />
                    Quiet Hours
                  </CardTitle>
                  <CardDescription>
                    Set times when you don&apos;t want to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Enable Quiet Hours</Label>
                      <p className="text-sm text-muted-foreground">
                        Pause non-urgent notifications during specified hours
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="grid grid-cols-2 gap-4 opacity-50">
                    <div>
                      <Label htmlFor="quiet-start">Start Time</Label>
                      <input
                        id="quiet-start"
                        type="time"
                        defaultValue="22:00"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="quiet-end">End Time</Label>
                      <input
                        id="quiet-end"
                        type="time"
                        defaultValue="08:00"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        disabled
                      />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Emergency notifications (security alerts, urgent disputes) will still be delivered during quiet hours.
                  </p>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button>
                  Save Preferences
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Suspense>
    </DashboardLayout>
  )
}