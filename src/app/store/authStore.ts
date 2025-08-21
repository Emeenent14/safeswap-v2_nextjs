import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  User, 
  UserProfile, 
  LoginForm, 
  RegisterForm,
  LoadingState,
  ErrorState, 
} from '../lib/types'

interface AuthState {
  // State
  user: User | null
  userProfile: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (credentials: LoginForm) => Promise<void>
  register: (userData: RegisterForm) => Promise<void>
  logout: () => void
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
  
  // Verification actions
  verifyEmail: (token: string) => Promise<void>
  verifyPhone: (token: string) => Promise<void>
  resendVerification: (type: 'email' | 'phone') => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      userProfile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (credentials: LoginForm) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Login failed')
          }

          const data = await response.json()
          
          set({
            user: data.user,
            userProfile: data.profile,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
            userProfile: null,
          })
          throw error
        }
      },

      // Register action
      register: async (userData: RegisterForm) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Registration failed')
          }

          const data = await response.json()
          
          set({
            user: data.user,
            userProfile: data.profile,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
            userProfile: null,
          })
          throw error
        }
      },

      // Logout action
      logout: () => {
        // Clear auth cookie
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        
        set({
          user: null,
          userProfile: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      },

      // Update profile action
      updateProfile: async (profile: Partial<UserProfile>) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Profile update failed')
          }

          const data = await response.json()
          
          set({
            userProfile: data.profile,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Profile update failed',
            isLoading: false,
          })
          throw error
        }
      },

      // Refresh user data
      refreshUser: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch('/api/user/profile')
          
          if (!response.ok) {
            throw new Error('Failed to fetch user data')
          }

          const data = await response.json()
          
          set({
            user: data.user,
            userProfile: data.profile,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to refresh user data',
            isLoading: false,
            isAuthenticated: false,
            user: null,
            userProfile: null,
          })
        }
      },

      // Verify email
      verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, type: 'email' }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Email verification failed')
          }

          const data = await response.json()
          
          set({
            user: data.user,
            userProfile: data.profile,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Email verification failed',
            isLoading: false,
          })
          throw error
        }
      },

      // Verify phone
      verifyPhone: async (token: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, type: 'phone' }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Phone verification failed')
          }

          const data = await response.json()
          
          set({
            user: data.user,
            userProfile: data.profile,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Phone verification failed',
            isLoading: false,
          })
          throw error
        }
      },

      // Resend verification
      resendVerification: async (type: 'email' | 'phone') => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch('/api/auth/resend-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to resend verification')
          }

          set({ isLoading: false, error: null })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to resend verification',
            isLoading: false,
          })
          throw error
        }
      },

      // Utility actions
      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        userProfile: state.userProfile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)