import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import { useDealStore } from '../store/dealStore'
import type { 
  WebSocketMessage, 
  Message, 
  Notification,
  Deal 
} from '../lib/types'

interface WebSocketState {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  lastMessage: WebSocketMessage | null
}

interface TypingState {
  dealId: string
  userId: string
  username: string
  timestamp: number
}

export const useWebSocket = () => {
  const [wsState, setWsState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastMessage: null
  })

  const [typingUsers, setTypingUsers] = useState<TypingState[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { user, isAuthenticated } = useAuthStore()
  const { addNotification, addToast } = useNotificationStore()
  const { setCurrentDeal, fetchDealById } = useDealStore()

  const MAX_RECONNECT_ATTEMPTS = 5
  const RECONNECT_DELAY = 3000
  const TYPING_TIMEOUT = 3000

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!isAuthenticated || !user) return

    // Check if WebSocket is enabled via environment variable
    if (process.env.NEXT_PUBLIC_FEATURE_WEBSOCKET_ENABLED !== 'true') {
      console.log('WebSocket is disabled via feature flag')
      return
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      return
    }

    setWsState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      // In a real app, this would be wss://your-websocket-server.com
      // For mock purposes, we'll simulate the connection
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? `wss://${window.location.host}/ws`
        : `ws://localhost:3001/ws`

      // Mock WebSocket connection for development
      if (process.env.NODE_ENV === 'development') {
        // Simulate successful connection after delay
        setTimeout(() => {
          setWsState(prev => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
            error: null
          }))

          addToast({
            type: 'success',
            title: 'Connected',
            message: 'Real-time features are now active',
            duration: 3000
          })

          reconnectAttemptsRef.current = 0
        }, 1000)

        return
      }

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setWsState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null
        }))

        // Send authentication message
        const authMessage: WebSocketMessage = {
          type: 'auth',
          data: { userId: user.id, token: 'auth_token_here' },
          timestamp: new Date().toISOString()
        }
        
        ws.send(JSON.stringify(authMessage))
        reconnectAttemptsRef.current = 0

        addToast({
          type: 'success',
          title: 'Connected',
          message: 'Real-time features are now active',
          duration: 3000
        })
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          handleWebSocketMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setWsState(prev => ({
          ...prev,
          error: 'Connection error occurred',
          isConnecting: false
        }))
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setWsState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false
        }))

        wsRef.current = null

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          scheduleReconnect()
        }
      }

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setWsState(prev => ({
        ...prev,
        error: 'Failed to connect to real-time services',
        isConnecting: false,
        isConnected: false
      }))
    }
  }, [isAuthenticated, user, addToast])

  // Schedule reconnection attempt
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current)
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current++
      console.log(`Reconnection attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`)
      connect()
    }, delay)
  }, [connect])

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    setWsState(prev => ({ ...prev, lastMessage: message }))

    switch (message.type) {
      case 'message':
        // Handle new chat message
        const chatMessage = message.data as Message
        addToast({
          type: 'info',
          title: 'New message',
          message: `${chatMessage.sender.firstName}: ${chatMessage.content.substring(0, 50)}...`,
          duration: 4000
        })
        break

      case 'notification':
        // Handle new notification
        const notification = message.data as Notification
        addNotification(notification)
        break

      case 'deal_update':
        // Handle deal status update
        const dealUpdate = message.data as { dealId: string; deal: Deal }
        fetchDealById(dealUpdate.dealId).catch(console.error)
        
        addToast({
          type: 'info',
          title: 'Deal updated',
          message: `Deal "${dealUpdate.deal.title}" has been updated`,
          duration: 4000
        })
        break

      case 'typing':
        // Handle typing indicator
        const typingData = message.data as TypingState
        handleTypingUpdate(typingData)
        break

      default:
        console.log('Unknown WebSocket message type:', message.type)
    }
  }, [addNotification, addToast, fetchDealById])

  // Handle typing updates
  const handleTypingUpdate = useCallback((typingData: TypingState) => {
    setTypingUsers(prev => {
      const filtered = prev.filter(user => 
        !(user.dealId === typingData.dealId && user.userId === typingData.userId)
      )
      
      return [...filtered, { ...typingData, timestamp: Date.now() }]
    })

    // Remove typing indicator after timeout
    setTimeout(() => {
      setTypingUsers(prev => 
        prev.filter(user => 
          !(user.dealId === typingData.dealId && user.userId === typingData.userId)
        )
      )
    }, TYPING_TIMEOUT)
  }, [])

  // Send WebSocket message
  const sendMessage = useCallback((message: Omit<WebSocketMessage, 'timestamp'>) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected')
      return false
    }

    try {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString()
      }
      
      wsRef.current.send(JSON.stringify(fullMessage))
      return true
    } catch (error) {
      console.error('Failed to send WebSocket message:', error)
      return false
    }
  }, [])

  // Send typing indicator
  const sendTypingIndicator = useCallback((dealId: string) => {
    if (!user) return

    const success = sendMessage({
      type: 'typing',
      data: {
        dealId,
        userId: user.id,
        username: `${user.firstName} ${user.lastName}`
      }
    })

    if (!success && process.env.NODE_ENV === 'development') {
      // Mock typing for development
      handleTypingUpdate({
        dealId,
        userId: user.id,
        username: `${user.firstName} ${user.lastName}`,
        timestamp: Date.now()
      })
    }
  }, [user, sendMessage, handleTypingUpdate])

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected')
      wsRef.current = null
    }

    setWsState({
      isConnected: false,
      isConnecting: false,
      error: null,
      lastMessage: null
    })

    setTypingUsers([])
    reconnectAttemptsRef.current = 0
  }, [])

  // Get typing users for a specific deal
  const getTypingUsersForDeal = useCallback((dealId: string) => {
    const now = Date.now()
    const currentUserId = user?.id
    return typingUsers
      .filter(user => 
        user.dealId === dealId && 
        user.userId !== currentUserId && // Exclude current user
        (now - user.timestamp) < TYPING_TIMEOUT
      )
      .map(user => user.username)
  }, [typingUsers, user?.id])

  // Format typing indicator text
  const formatTypingIndicator = useCallback((usernames: string[]): string => {
    if (usernames.length === 0) return ''
    if (usernames.length === 1) return `${usernames[0]} is typing...`
    if (usernames.length === 2) return `${usernames[0]} and ${usernames[1]} are typing...`
    return `${usernames[0]} and ${usernames.length - 1} others are typing...`
  }, [])

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [isAuthenticated, user, connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return {
    // State
    ...wsState,
    typingUsers,

    // Actions
    connect,
    disconnect,
    sendMessage,
    sendTypingIndicator,

    // Utilities
    getTypingUsersForDeal,
    formatTypingIndicator
  }
}