import { useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import type { LoginForm, RegisterForm, UserProfile } from '../lib/types'

export const useAuth = () => {
  const {
    user,
    userProfile,
    isAuthenticated,
    isLoading,
    error,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    updateProfile: storeUpdateProfile,
    refreshUser,
    verifyEmail,
    verifyPhone,
    resendVerification,
    clearError,
    setLoading
  } = useAuthStore()

  const { addToast } = useNotificationStore()

  // Enhanced login with toast notifications
  const login = useCallback(async (credentials: LoginForm) => {
    try {
      await storeLogin(credentials)
      addToast({
        type: 'success',
        title: 'Welcome back!',
        message: `Successfully logged in as ${credentials.email}`,
        duration: 3000
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      addToast({
        type: 'error',
        title: 'Login failed',
        message: errorMessage,
        duration: 5000
      })
      throw error
    }
  }, [storeLogin, addToast])

  // Enhanced register with toast notifications
  const register = useCallback(async (userData: RegisterForm) => {
    try {
      await storeRegister(userData)
      addToast({
        type: 'success',
        title: 'Account created!',
        message: `Welcome to SafeSwap, ${userData.firstName}!`,
        duration: 4000
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      addToast({
        type: 'error',
        title: 'Registration failed',
        message: errorMessage,
        duration: 5000
      })
      throw error
    }
  }, [storeRegister, addToast])

  // Enhanced logout with toast notification
  const logout = useCallback(() => {
    const userName = user?.firstName || 'User'
    storeLogout()
    addToast({
      type: 'info',
      title: 'Logged out',
      message: `Goodbye, ${userName}! See you soon.`,
      duration: 3000
    })
  }, [storeLogout, addToast, user?.firstName])

  // Enhanced profile update with toast notifications
  const updateProfile = useCallback(async (profile: Partial<UserProfile>) => {
    try {
      await storeUpdateProfile(profile)
      addToast({
        type: 'success',
        title: 'Profile updated',
        message: 'Your profile has been successfully updated.',
        duration: 3000
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed'
      addToast({
        type: 'error',
        title: 'Update failed',
        message: errorMessage,
        duration: 5000
      })
      throw error
    }
  }, [storeUpdateProfile, addToast])

  // Enhanced email verification with toast notifications
  const handleVerifyEmail = useCallback(async (token: string) => {
    try {
      await verifyEmail(token)
      addToast({
        type: 'success',
        title: 'Email verified!',
        message: 'Your email address has been successfully verified.',
        duration: 4000
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed'
      addToast({
        type: 'error',
        title: 'Verification failed',
        message: errorMessage,
        duration: 5000
      })
      throw error
    }
  }, [verifyEmail, addToast])

  // Enhanced phone verification with toast notifications
  const handleVerifyPhone = useCallback(async (token: string) => {
    try {
      await verifyPhone(token)
      addToast({
        type: 'success',
        title: 'Phone verified!',
        message: 'Your phone number has been successfully verified.',
        duration: 4000
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Phone verification failed'
      addToast({
        type: 'error',
        title: 'Verification failed',
        message: errorMessage,
        duration: 5000
      })
      throw error
    }
  }, [verifyPhone, addToast])

  // Enhanced resend verification with toast notifications
  const handleResendVerification = useCallback(async (type: 'email' | 'phone') => {
    try {
      await resendVerification(type)
      addToast({
        type: 'success',
        title: 'Verification sent',
        message: `A new verification code has been sent to your ${type}.`,
        duration: 4000
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification'
      addToast({
        type: 'error',
        title: 'Send failed',
        message: errorMessage,
        duration: 5000
      })
      throw error
    }
  }, [resendVerification, addToast])

  // Check if user has required verification
  const needsEmailVerification = useCallback(() => {
    return user && !user.email.includes('@verified') // Simple mock verification check
  }, [user])

  const needsPhoneVerification = useCallback(() => {
    return user && user.phone && !user.phone.includes('verified') // Simple mock verification check
  }, [user])

  // Check if user can perform certain actions
  const canCreateDeals = useCallback(() => {
    return isAuthenticated && user?.isVerified && user?.kycStatus === 'approved'
  }, [isAuthenticated, user?.isVerified, user?.kycStatus])

  const canAccessSavings = useCallback(() => {
    return isAuthenticated && user?.isVerified
  }, [isAuthenticated, user?.isVerified])

  const isAdmin = useCallback(() => {
    return user?.role === 'admin' || user?.role === 'super_admin'
  }, [user?.role])

  const isSuperAdmin = useCallback(() => {
    return user?.role === 'super_admin'
  }, [user?.role])

  // Get user display name
  const getDisplayName = useCallback(() => {
    if (!user) return 'Guest'
    return `${user.firstName} ${user.lastName}`.trim()
  }, [user])

  // Get user initials for avatar fallback
  const getUserInitials = useCallback(() => {
    if (!user) return 'G'
    const firstInitial = user.firstName?.charAt(0) || ''
    const lastInitial = user.lastName?.charAt(0) || ''
    return `${firstInitial}${lastInitial}`.toUpperCase()
  }, [user])

  return {
    // State
    user,
    userProfile,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    verifyEmail: handleVerifyEmail,
    verifyPhone: handleVerifyPhone,
    resendVerification: handleResendVerification,
    clearError,
    setLoading,

    // Computed values and utilities
    needsEmailVerification,
    needsPhoneVerification,
    canCreateDeals,
    canAccessSavings,
    isAdmin,
    isSuperAdmin,
    getDisplayName,
    getUserInitials
  }
}