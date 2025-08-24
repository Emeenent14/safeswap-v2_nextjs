import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import  Header  from '@/components/common/Header'
import  Sidebar  from '@/components/common/Sidebar'
import  Footer  from '@/components/common/Footer'
import { useAuth } from '@/hooks/useAuth'

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  showSidebar?: boolean
}

export default function DashboardLayout({ 
  children, 
  title = 'Dashboard',
  showSidebar = true 
}: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth()

  // Redirect if not authenticated (this would be handled by middleware in production)
  if (!isLoading && !isAuthenticated) {
    redirect('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex">
        {showSidebar && (
          <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
            <div className="h-full">
              <Sidebar />
            </div>
          </aside>
        )}
        
        <main className="flex-1 min-w-0">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {title && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  )
}