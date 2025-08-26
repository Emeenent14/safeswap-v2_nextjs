import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProfileCard } from "@/components/profile/ProfileCard"
import { TrustScoreDisplay } from "@/components/profile/TrustScoreDisplay"
import { UserStats } from "@/components/profile/UserStats"
import PublicLayout from "@/components/layout/PublicLayout"
import { MessageCircle, Shield, ArrowLeft } from "lucide-react"
import type { User, UserProfile } from "@/lib/types"

// Mock data for public profiles
const mockPublicUsers: (User & { profile: UserProfile })[] = [
  {
    id: "user_1",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    phone: "+1234567890",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=John%20Doe",
    trustScore: 85,
    isVerified: true,
    kycStatus: "approved",
    role: "user",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-08-15T14:30:00Z",
    profile: {
      bio: "Experienced full-stack developer specializing in React, Node.js, and cloud architecture. I help businesses build scalable web applications that drive growth and user engagement.",
      location: "San Francisco, CA",
      languages: ["English", "Spanish"],
      preferredCategories: ["software_development", "web_design", "consulting"],
      completedDeals: 47,
      successRate: 96,
      totalVolume: 125000,
    },
  },
  {
    id: "user_2",
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Smith",
    phone: "+1234567891",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Jane%20Smith",
    trustScore: 92,
    isVerified: true,
    kycStatus: "approved",
    role: "user",
    createdAt: "2024-02-10T08:00:00Z",
    updatedAt: "2024-08-14T16:45:00Z",
    profile: {
      bio: "Product manager with a passion for building user-centric SaaS tools. Skilled in agile methodologies, roadmap planning, and cross-functional leadership.",
      location: "London, UK",
      languages: ["English", "German"],
      preferredCategories: ["product_management", "business_consulting", "saas"],
      completedDeals: 58,
      successRate: 93,
      totalVolume: 102000,
    },
  },
  {
    id: "user_3",
    email: "mike@example.com",
    firstName: "Mike",
    lastName: "Chen",
    phone: "+1234567892",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Mike%20Chen",
    trustScore: 78,
    isVerified: true,
    kycStatus: "approved",
    role: "user",
    createdAt: "2024-03-05T12:00:00Z",
    updatedAt: "2024-08-10T09:15:00Z",
    profile: {
      bio: "Freelance graphic designer and brand consultant. I create visual identities that make businesses stand out and connect with their audience.",
      location: "Toronto, Canada",
      languages: ["English", "Mandarin"],
      preferredCategories: ["graphic_design", "branding", "consulting"],
      completedDeals: 28,
      successRate: 89,
      totalVolume: 45000,
    },
  },
]

async function getPublicUser(id: string): Promise<(User & { profile: UserProfile }) | null> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return mockPublicUsers.find(user => user.id === id) || null
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const user = await getPublicUser(params.id)
  if (!user) {
    return {
      title: "User Not Found | SafeSwap",
      description: "The requested user profile could not be found.",
    }
  }

  const displayName = `${user.firstName} ${user.lastName}`

  return {
    title: `${displayName} | SafeSwap Trust Profile`,
    description: `See ${displayName}'s verified trust history on SafeSwap. Trust score: ${user.trustScore}, ${user.profile.completedDeals} deals completed, ${user.profile.successRate}% success rate.`,
    keywords: `${displayName}, SafeSwap profile, trust score, freelancer, verified user, ${user.profile.preferredCategories.join(", ")}`,
    openGraph: {
      title: `${displayName} | SafeSwap Trust Profile`,
      description: `Trust score: ${user.trustScore} • ${user.profile.completedDeals} deals completed • ${user.profile.successRate}% success rate`,
      images: [
        {
          url: user.avatar!,
          width: 400,
          height: 400,
          alt: `${displayName} profile picture`,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${displayName} | SafeSwap Trust Profile`,
      description: `Trust score: ${user.trustScore} • ${user.profile.completedDeals} deals completed • ${user.profile.successRate}% success rate`,
      images: [user.avatar!],
    },
  }
}

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const user = await getPublicUser(params.id)

  if (!user) {
    notFound()
  }

  const displayName = `${user.firstName} ${user.lastName}`
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Back Navigation */}
        <div className="bg-white dark:bg-gray-800 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to SafeSwap
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Section */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Card */}
              <ProfileCard
                user={user}
                profile={user.profile}
                variant="public"
                showActions={true}
                showTrustScore={true}
                showStats={true}
                onMessage={() => {
                  window.location.href =
                    "/login?redirect=" + encodeURIComponent(`/messages/new?user=${user.id}`)
                }}
                onViewDeals={() => {
                  window.location.href =
                    "/login?redirect=" + encodeURIComponent(`/deals?user=${user.id}`)
                }}
              />

              {/* Detailed Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserStats user={user} profile={user.profile} variant="detailed" showComparison={false} />
                </CardContent>
              </Card>

              {/* Public Portfolio/Recent Work */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          E-commerce Website Development
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Completed successfully • $2,500
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-green-700 bg-green-100">
                        Completed
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Mobile App UI/UX Design
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Completed successfully • $1,800
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-green-700 bg-green-100">
                        Completed
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          API Integration Project
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Currently in progress • $3,200
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-blue-700 bg-blue-100">
                        In Progress
                      </Badge>
                    </div>

                    <div className="text-center py-4">
                      <Link href="/login">
                        <Button variant="outline">View All Deals</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trust Score Details */}
              <TrustScoreDisplay
                user={user}
                variant="detailed"
                showBreakdown={false}
                showTrend={false}
                showSuggestions={false}
              />

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Connect with {user.firstName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/login">
                    <Button className="w-full" size="lg">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </Link>

                  <Link href="/login">
                    <Button variant="outline" className="w-full" size="lg">
                      <Shield className="h-4 w-4 mr-2" />
                      Create Deal
                    </Button>
                  </Link>

                  <Separator />

                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    <div className="flex justify-between">
                      <span>Member since:</span>
                      <span className="font-medium">{joinDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Response time:</span>
                      <span className="font-medium">~2h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Languages:</span>
                      <span className="font-medium">{user.profile.languages.join(", ")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Notice */}
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        SafeSwap Protection
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        All deals are protected by escrow. Funds are held securely until both parties
                        complete their obligations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Call to Action for Non-Users */}
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                      New to SafeSwap?
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                      Join thousands of users making safe deals online
                    </p>
                    <Link href="/register">
                      <Button className="w-full bg-green-600 hover:bg-green-700">Sign Up Free</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
