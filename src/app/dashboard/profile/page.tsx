import { Suspense } from 'react'
import type { Metadata } from 'next'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { EditProfileForm } from '@/components/profile/EditProfileForm'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { TrustScoreDisplay } from '@/components/profile/TrustScoreDisplay'
import { UserStats } from '@/components/profile/UserStats'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { 
  User, 
  Settings, 
  Shield, 
  Star, 
  Camera,
  Edit3,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Profile - SafeSwap',
  description: 'Manage your profile information and account settings',
  robots: 'noindex, nofollow'
}

// Mock user data - in real app this would come from useAuth or API
const mockUser = {
  id: '1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1 (555) 123-4578',
  avatar: undefined,
  trustScore: 87,
  isVerified: true,
  kycStatus: 'approved' as const,
  role: 'user' as const,
  createdAt: '2023-06-15T10:30:00Z',
  updatedAt: '2024-01-15T14:45:00Z'
}

const mockProfile = {
  bio: 'Experienced freelancer specializing in web development and digital marketing.',
  location: 'San Francisco, CA',
  completedDeals: 23,
  successRate: 95,
  totalVolume: 12500,
  languages: ['English', 'Spanish', 'French'],
  preferredCategories: ['digital_services', 'software', 'marketing']
}

// Loading skeleton for the profile page
function ProfilePageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile header skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32 mt-2" />
                  <div className="flex gap-2 mt-3">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16 mt-2" />
            <div className="space-y-2 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
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

export default function ProfilePage() {
  return (
    <DashboardLayout title="Profile Management">
      <Suspense fallback={<ProfilePageSkeleton />}>
        <div className="space-y-6">
          {/* Profile Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProfileCard 
                user={mockUser}
                profile={mockProfile}
                showActions={true}
                showStats={true}
                variant="default" // Changed from "detailed" to "default"
              />
            </div>
            
            <div>
              <TrustScoreDisplay 
                user={mockUser}
                showBreakdown={false}
                showTrend={false} // Changed from showHistory to showTrend
                variant="compact"
              />
            </div>
          </div>

          {/* Profile Stats */}
          <UserStats 
            user={mockUser}
            profile={mockProfile}
            variant="default" // Removed showChartsEnabled and timeRange, added required props
            className="grid-cols-2 lg:grid-cols-4"
          />

          {/* Profile Management Tabs */}
          <Tabs defaultValue="edit" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>

            {/* Edit Profile Tab */}
            <TabsContent value="edit" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and profile details. Changes will be reflected across SafeSwap.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EditProfileForm 
                    user={mockUser}
                    profile={mockProfile}
                    onSave={(updatedUser, updatedProfile) => {
                      // Handle success - toast notification will be shown by the form
                      console.log('Profile updated:', { updatedUser, updatedProfile })
                    }} 
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Account Verification */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Account Verification
                    </CardTitle>
                    <CardDescription>
                      Verify your account to increase trust and unlock features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Email Verification</p>
                          <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Phone Verification</p>
                          <p className="text-sm text-muted-foreground">+1 (555) ***-**78</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        Not Verified
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">KYC Verification</p>
                          <p className="text-sm text-muted-foreground">Identity documents</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Approved
                      </Badge>
                    </div>

                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Verify Phone Number
                    </Button>
                  </CardContent>
                </Card>

                {/* Password & Security */}
                <Card>
                  <CardHeader>
                    <CardTitle>Password & Security</CardTitle>
                    <CardDescription>
                      Manage your password and security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Last changed 2 months ago
                      </p>
                      <Button variant="outline" size="sm">
                        Change Password
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                      <Button variant="outline" size="sm">
                        Enable 2FA
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium">Login Sessions</p>
                      <p className="text-sm text-muted-foreground">
                        Manage active sessions across devices
                      </p>
                      <Button variant="outline" size="sm">
                        View Sessions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Preferences</CardTitle>
                    <CardDescription>
                      Control how your profile appears to other users
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Show Trust Score</p>
                        <p className="text-sm text-muted-foreground">
                          Display your trust score on your public profile
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Toggle
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Show Deal History</p>
                        <p className="text-sm text-muted-foreground">
                          Allow others to see your completed deals count
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Toggle
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Show Location</p>
                        <p className="text-sm text-muted-foreground">
                          Display your city on your profile
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Toggle
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Communication Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Communication</CardTitle>
                    <CardDescription>
                      Choose how you want to be contacted
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about your deals via email
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enabled
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Get important updates via text message
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Disabled
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Updates</p>
                        <p className="text-sm text-muted-foreground">
                          Receive news and feature updates from SafeSwap
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enabled
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Danger Zone */}
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions that will affect your account permanently
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg dark:border-red-800">
                    <div>
                      <p className="font-medium text-red-600 dark:text-red-400">Delete Account</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg dark:border-red-800">
                    <div>
                      <p className="font-medium text-red-600 dark:text-red-400">Export Data</p>
                      <p className="text-sm text-muted-foreground">
                        Download a copy of all your data before deletion
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Suspense>
    </DashboardLayout>
  )
}