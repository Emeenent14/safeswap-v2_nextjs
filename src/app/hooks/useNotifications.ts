import { useCallback, useMemo, useEffect } from 'react'
import { useNotificationStore } from '../store/notificationStore'
import { useAuthStore } from '../store/authStore'
import type { 
  Notification, 
  NotificationType 
} from '../lib/types'

export const useNotifications = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    toasts,
    fetchNotifications,
    markAsRead: storeMarkAsRead,
    markAllAsRead: storeMarkAllAsRead,
    deleteNotification: storeDeleteNotification,
    clearAllNotifications: storeClearAllNotifications,
    addNotification,
    updateNotification,
    addToast,
    removeToast,
    clearToasts,
    clearError,
    setLoading
  } = useNotificationStore()

  const { user, isAuthenticated } = useAuthStore()

  // Enhanced mark as read with optimistic updates
  const markAsRead = useCallback(async (id: string) => {
    // Optimistically update the UI
    const notification = notifications.find(n => n.id === id)
    if (notification && !notification.isRead) {
      updateNotification(id, { isRead: true, readAt: new Date().toISOString() })
    }

    try {
      await storeMarkAsRead(id)
    } catch (error) {
      // Revert optimistic update on error
      if (notification) {
        updateNotification(id, { isRead: false })
      }
      throw error
    }
  }, [storeMarkAsRead, notifications, updateNotification])

  // Enhanced mark all as read with optimistic updates
  const markAllAsRead = useCallback(async () => {
    // Store original state for potential revert
    const originalNotifications = notifications.map(n => ({ id: n.id, isRead: n.isRead, readAt: n.readAt }))
    const readAt = new Date().toISOString()

    // Optimistically update all unread notifications
    notifications.forEach(notification => {
      if (!notification.isRead) {
        updateNotification(notification.id, { isRead: true, readAt })
      }
    })

    try {
      await storeMarkAllAsRead()
      addToast({
        type: 'success',
        title: 'All notifications marked as read',
        duration: 3000
      })
    } catch (error) {
      // Revert optimistic updates on error
      originalNotifications.forEach(({ id, isRead, readAt }) => {
        const updateObj: Partial<Notification> = { isRead }
        if (readAt !== undefined) {
          updateObj.readAt = readAt
        }
        updateNotification(id, updateObj)
      })
      
      addToast({
        type: 'error',
        title: 'Failed to mark all as read',
        message: error instanceof Error ? error.message : 'Please try again',
        duration: 5000
      })
      throw error
    }
  }, [storeMarkAllAsRead, notifications, updateNotification, addToast])

  // Enhanced delete notification with optimistic updates
  const deleteNotification = useCallback(async (id: string) => {
    // Store original notification for potential revert
    const originalNotification = notifications.find(n => n.id === id)
    if (!originalNotification) return

    // Optimistically remove from UI
    updateNotification(id, { isRead: true }) // This will effectively hide it from unread count

    try {
      await storeDeleteNotification(id)
      addToast({
        type: 'info',
        title: 'Notification deleted',
        duration: 2000
      })
    } catch (error) {
      // Revert optimistic update on error
      updateNotification(id, originalNotification)
      
      addToast({
        type: 'error',
        title: 'Failed to delete notification',
        message: error instanceof Error ? error.message : 'Please try again',
        duration: 5000
      })
      throw error
    }
  }, [storeDeleteNotification, notifications, updateNotification, addToast])

  // Enhanced clear all notifications
  const clearAllNotifications = useCallback(async () => {
    const originalNotifications = [...notifications]

    try {
      await storeClearAllNotifications()
      addToast({
        type: 'success',
        title: 'All notifications cleared',
        duration: 3000
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to clear notifications',
        message: error instanceof Error ? error.message : 'Please try again',
        duration: 5000
      })
      throw error
    }
  }, [storeClearAllNotifications, notifications, addToast])

  // Auto-fetch notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications().catch(() => {
        // Error handling is done in the store
      })
    }
  }, [isAuthenticated, user, fetchNotifications])

  // Group notifications by type
  const groupedNotifications = useMemo(() => {
    const groups: Record<NotificationType, Notification[]> = {
      deal_created: [],
      deal_accepted: [],
      deal_funded: [],
      milestone_completed: [],
      milestone_approved: [],
      deal_completed: [],
      dispute_created: [],
      dispute_resolved: [],
      payment_received: [],
      message_received: [],
      trust_score_updated: [],
      kyc_approved: [],
      kyc_rejected: [],
      savings_interest: [],
      system_announcement: []
    }

    notifications.forEach(notification => {
      if (groups[notification.type]) {
        groups[notification.type].push(notification)
      }
    })

    return groups
  }, [notifications])

  // Get recent notifications (last 24 hours)
  const recentNotifications = useMemo(() => {
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    return notifications.filter(notification => 
      new Date(notification.createdAt) > oneDayAgo
    ).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [notifications])

  // Get unread notifications
  const unreadNotifications = useMemo(() => {
    return notifications.filter(notification => !notification.isRead)
  }, [notifications])

  // Get notifications by priority (system > disputes > deals > others)
  const prioritizedNotifications = useMemo(() => {
    const priorityOrder: Record<NotificationType, number> = {
      system_announcement: 1,
      dispute_created: 2,
      dispute_resolved: 2,
      kyc_approved: 3,
      kyc_rejected: 3,
      deal_created: 4,
      deal_accepted: 4,
      deal_funded: 4,
      deal_completed: 4,
      milestone_completed: 5,
      milestone_approved: 5,
      payment_received: 6,
      message_received: 7,
      trust_score_updated: 8,
      savings_interest: 9
    }

    return [...notifications].sort((a, b) => {
      // First sort by read status (unread first)
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1
      }

      // Then by priority
      const priorityA = priorityOrder[a.type] || 10
      const priorityB = priorityOrder[b.type] || 10
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }

      // Finally by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [notifications])

  // Format notification time
  const formatNotificationTime = useCallback((dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString()
  }, [])

  // Get notification icon based on type
  const getNotificationIcon = useCallback((type: NotificationType): string => {
    const iconMap: Record<NotificationType, string> = {
      deal_created: '🤝',
      deal_accepted: '✅',
      deal_funded: '💰',
      milestone_completed: '🎯',
      milestone_approved: '✨',
      deal_completed: '🎉',
      dispute_created: '⚠️',
      dispute_resolved: '✅',
      payment_received: '💳',
      message_received: '💬',
      trust_score_updated: '⭐',
      kyc_approved: '✅',
      kyc_rejected: '❌',
      savings_interest: '💵',
      system_announcement: '📢'
    }

    return iconMap[type] || '📋'
  }, [])

  // Check if notifications are enabled (mock implementation)
  const areNotificationsEnabled = useMemo(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted'
    }
    return false
  }, [])

  // Request notification permission
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      addToast({
        type: 'error',
        title: 'Notifications not supported',
        message: 'Your browser does not support notifications.',
        duration: 5000
      })
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      
      if (permission === 'granted') {
        addToast({
          type: 'success',
          title: 'Notifications enabled',
          message: 'You will now receive browser notifications.',
          duration: 4000
        })
        return true
      } else {
        addToast({
          type: 'warning',
          title: 'Notifications denied',
          message: 'You can enable notifications in your browser settings.',
          duration: 5000
        })
        return false
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to request permission',
        message: 'Please check your browser settings.',
        duration: 5000
      })
      return false
    }
  }, [addToast])

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    error,
    toasts,

    // Enhanced actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
    updateNotification,
    addToast,
    removeToast,
    clearToasts,
    clearError,
    setLoading,

    // Computed values
    groupedNotifications,
    recentNotifications,
    unreadNotifications,
    prioritizedNotifications,
    areNotificationsEnabled,

    // Utilities
    formatNotificationTime,
    getNotificationIcon,
    requestNotificationPermission
  }
}