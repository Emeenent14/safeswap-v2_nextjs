import React, { useState } from 'react'
import { format } from 'date-fns'
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  DollarSign, 
  MessageSquare,
  ShoppingBag,
  Star,
  X,
  CheckCheck,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

import { useNotificationStore } from '@/store/notificationStore'
import { useNotifications } from '@/hooks/useNotifications'
import type { Notification, NotificationType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface NotificationCenterProps {
  compact?: boolean
  limit?: number
  showHeader?: boolean
  className?: string
}

const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
  deal_created: ShoppingBag,
  deal_accepted: CheckCircle,
  deal_funded: DollarSign,
  milestone_completed: CheckCircle,
  milestone_approved: CheckCircle,
  deal_completed: CheckCircle,
  dispute_created: AlertTriangle,
  dispute_resolved: CheckCircle,
  payment_received: DollarSign,
  message_received: MessageSquare,
  trust_score_updated: Star,
  kyc_approved: CheckCircle,
  kyc_rejected: AlertTriangle,
  savings_interest: DollarSign,
  system_announcement: Info
}

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  deal_created: 'text-blue-600',
  deal_accepted: 'text-green-600',
  deal_funded: 'text-green-600',
  milestone_completed: 'text-blue-600',
  milestone_approved: 'text-green-600',
  deal_completed: 'text-green-600',
  dispute_created: 'text-red-600',
  dispute_resolved: 'text-green-600',
  payment_received: 'text-green-600',
  message_received: 'text-blue-600',
  trust_score_updated: 'text-yellow-600',
  kyc_approved: 'text-green-600',
  kyc_rejected: 'text-red-600',
  savings_interest: 'text-green-600',
  system_announcement: 'text-gray-600'
}

export default function NotificationCenter({ 
  compact = false, 
  limit, 
  showHeader = true,
  className 
}: NotificationCenterProps) {
  const { notifications, unreadCount } = useNotificationStore()
  const { markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)

  // Filter and limit notifications
  const displayNotifications = React.useMemo(() => {
    let filtered = notifications

    if (showOnlyUnread) {
      filtered = filtered.filter(n => !n.isRead)
    }

    if (limit) {
      filtered = filtered.slice(0, limit)
    }

    return filtered
  }, [notifications, showOnlyUnread, limit])

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }
  }

  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteNotification(notificationId)
  }

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const Icon = NOTIFICATION_ICONS[notification.type] || Info
    const iconColor = NOTIFICATION_COLORS[notification.type] || 'text-gray-600'

    return (
      <div 
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
          !notification.isRead && "bg-blue-50 border border-blue-100"
        )}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className={cn("p-2 rounded-full bg-white border", iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className={cn(
              "font-medium text-sm truncate",
              !notification.isRead && "font-semibold"
            )}>
              {notification.title}
            </h4>
            
            <div className="flex items-center gap-1 ml-2">
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleDeleteNotification(notification.id, e)}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {format(new Date(notification.createdAt), 'MMM d, HH:mm')}
            </span>
            
            {/* Action button based on notification type */}
            {notification.type === 'deal_created' && (
              <Button variant="ghost" size="sm" className="text-xs h-6">
                View Deal
              </Button>
            )}
            {notification.type === 'message_received' && (
              <Button variant="ghost" size="sm" className="text-xs h-6">
                Reply
              </Button>
            )}
            {notification.type === 'dispute_created' && (
              <Button variant="ghost" size="sm" className="text-xs h-6">
                View Dispute
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Compact view for dashboard widget
  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => markAllAsRead()}>
              <CheckCheck className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {displayNotifications.length === 0 ? (
            <div className="text-center py-6">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
              
              {limit && notifications.length > limit && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View all {notifications.length} notifications
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Full notification center
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Stay updated with your deal activity
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={showOnlyUnread ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyUnread(!showOnlyUnread)}
              >
                Unread Only
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsRead()}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark All Read
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        {displayNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {showOnlyUnread ? 'No unread notifications' : 'No notifications'}
            </h3>
            <p className="text-muted-foreground">
              {showOnlyUnread 
                ? 'All caught up! Check back later for updates.'
                : 'Notifications about your deals and account will appear here.'
              }
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[500px]">
            <div className="p-4 space-y-2">
              {displayNotifications.map((notification, index) => (
                <div key={notification.id} className="group">
                  <NotificationItem notification={notification} />
                  {index < displayNotifications.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}