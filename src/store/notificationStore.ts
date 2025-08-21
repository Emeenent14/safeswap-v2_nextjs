import { create } from 'zustand'
import type {
  Notification,
  NotificationType,
  LoadingState,
  ErrorState
} from '../lib/types'

interface NotificationState {
  // State
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null

  // Actions
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  clearAllNotifications: () => Promise<void>
  
  // Real-time actions
  addNotification: (notification: Notification) => void
  updateNotification: (id: string, updates: Partial<Notification>) => void
  
  // Toast notifications (in-memory only)
  toasts: Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    title: string
    message?: string
    duration?: number
  }>
  addToast: (toast: Omit<NotificationState['toasts'][0], 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void

  // Utility actions
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  toasts: [],

  // Fetch notifications
  fetchNotifications: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch('/api/notifications')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch notifications')
      }

      const data = await response.json()
      
      set({
        notifications: data.data || data.notifications, // Handle both response structures
        unreadCount: (data.data || data.notifications).filter((n: Notification) => !n.isRead).length,
        isLoading: false,
        error: null
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
        isLoading: false
      })
      throw error
    }
  },

  // Mark single notification as read
  markAsRead: async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to mark notification as read')
      }

      set(state => {
        const notifications = state.notifications.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
        
        return {
          notifications,
          unreadCount: notifications.filter(n => !n.isRead).length,
          error: null
        }
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark notification as read'
      })
      throw error
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to mark all notifications as read')
      }

      const readAt = new Date().toISOString()
      
      set(state => ({
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true,
          readAt
        })),
        unreadCount: 0,
        isLoading: false,
        error: null
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark all notifications as read',
        isLoading: false
      })
      throw error
    }
  },

  // Delete single notification
  deleteNotification: async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete notification')
      }

      set(state => {
        const notifications = state.notifications.filter(n => n.id !== id)
        return {
          notifications,
          unreadCount: notifications.filter(n => !n.isRead).length,
          error: null
        }
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete notification'
      })
      throw error
    }
  },

  // Clear all notifications
  clearAllNotifications: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to clear all notifications')
      }

      set({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        error: null
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to clear all notifications',
        isLoading: false
      })
      throw error
    }
  },

  // Add notification (for real-time updates)
  addNotification: (notification: Notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1
    }))
  },

  // Update notification
  updateNotification: (id: string, updates: Partial<Notification>) => {
    set(state => {
      const notifications = state.notifications.map(notification =>
        notification.id === id 
          ? { ...notification, ...updates }
          : notification
      )
      
      return {
        notifications,
        unreadCount: notifications.filter(n => !n.isRead).length
      }
    })
  },

  // Add toast notification
  addToast: (toast: Omit<NotificationState['toasts'][0], 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast = { ...toast, id }
    
    set(state => ({
      toasts: [...state.toasts, newToast]
    }))

    // Auto-remove toast after duration (default 5 seconds)
    const duration = toast.duration || 5000
    setTimeout(() => {
      get().removeToast(id)
    }, duration)
  },

  // Remove toast notification
  removeToast: (id: string) => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }))
  },

  // Clear all toasts
  clearToasts: () => {
    set({ toasts: [] })
  },

  // Utility actions
  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading })
}))