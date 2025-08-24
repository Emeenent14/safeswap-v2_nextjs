import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import  Header  from '@/components/common/Header'
import  Footer  from '@/components/common/Footer'
import { useAuth } from '@/hooks/useAuth'
import { 
  Users, 
  FileText, 
  ShieldCheck, 
  AlertTriangle,
  ArrowLeft,
  Settings,
  BarChart3
} from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backHref?: string
}

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    description: 'Overview and statistics'
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'Manage user accounts'
  },
  {
    title: 'Disputes',
    href: '/admin/disputes',
    icon: AlertTriangle,
    description: 'Handle user disputes'
  },
  {
    title: 'KYC Reviews',
    href: '/admin/kyc',
    icon: ShieldCheck,
    description: 'Document verification'
  },
  {
    title: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Configure platform settings'
  }
]

export default function AdminLayout({ 
  children, 
  title = 'Admin Panel',
  subtitle,
  showBackButton = false,
  backHref = '/dashboard'
}: AdminLayoutProps) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth()

  // Redirect if not authenticated or not admin
  if (!isLoading && (!isAuthenticated || !isAdmin())) {
    redirect('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="h-full py-6 px-4 space-y-6">
            {/* Admin Badge */}
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-red-600" />
              <Badge variant="destructive" className="text-xs">
                ADMIN
              </Badge>
            </div>

            <Separator />

            {/* Navigation */}
            <nav className="space-y-2">
              {adminNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-red-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-red-600">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </nav>

            <Separator />

            {/* Back to Dashboard */}
            <div className="pt-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    {showBackButton && (
                      <Link href={backHref}>
                        <Button variant="ghost" size="sm">
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="h-6 w-6 text-red-600" />
                      {title}
                    </h1>
                  </div>
                  {subtitle && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {subtitle}
                    </p>
                  )}
                </div>

                {/* Admin Badge - Mobile */}
                <div className="lg:hidden">
                  <Badge variant="destructive" className="text-xs">
                    ADMIN
                  </Badge>
                </div>
              </div>
            </div>

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  )
}