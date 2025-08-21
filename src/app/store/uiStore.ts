import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  ModalState,
  TabState,
  LoadingState,
  ErrorState 
} from '../lib/types'

interface UIState {
  // Theme and display preferences
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  
  // Modal management
  modals: Record<string, ModalState>
  
  // Tab management
  activeTabs: Record<string, TabState>
  
  // Loading states for different UI sections
  loadingStates: Record<string, LoadingState>
  
  // Search and filter states
  searchQuery: string
  activeFilters: Record<string, string | number | boolean | null>
  
  // Mobile responsiveness
  isMobileMenuOpen: boolean
  isMobile: boolean
  
  // Notification preferences
  notificationPreferences: {
    email: boolean
    push: boolean
    sms: boolean
    inApp: boolean
  }
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  
  // Modal actions
  openModal: (modalId: string, data?: unknown) => void
  closeModal: (modalId: string) => void
  closeAllModals: () => void
  updateModal: (modalId: string, updates: Partial<ModalState>) => void
  
  // Tab actions
  setActiveTab: (groupId: string, tabId: string) => void
  
  // Loading actions
  setLoading: (key: string, state: LoadingState) => void
  clearLoading: (key: string) => void
  clearAllLoading: () => void
  
  // Search and filter actions
  setSearchQuery: (query: string) => void
  setFilter: (key: string, value: string | number | boolean | null) => void
  clearFilter: (key: string) => void
  clearAllFilters: () => void
  
  // Mobile actions
  setMobileMenuOpen: (open: boolean) => void
  setIsMobile: (mobile: boolean) => void
  
  // Notification preferences
  setNotificationPreference: (type: keyof UIState['notificationPreferences'], enabled: boolean) => void
  updateNotificationPreferences: (preferences: Partial<UIState['notificationPreferences']>) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'system',
      sidebarCollapsed: false,
      modals: {},
      activeTabs: {},
      loadingStates: {},
      searchQuery: '',
      activeFilters: {},
      isMobileMenuOpen: false,
      isMobile: false,
      notificationPreferences: {
        email: true,
        push: true,
        sms: false,
        inApp: true
      },

      // Theme actions
      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme })
        
        // Apply theme to document (with SSR safety check)
        if (typeof window !== 'undefined' && document.documentElement) {
          const root = document.documentElement
          if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            root.classList.add('dark')
          } else {
            root.classList.remove('dark')
          }
        }
      },

      // Sidebar actions
      toggleSidebar: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }))
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed })
      },

      // Modal actions - Fixed to match ModalState interface
      openModal: (modalId: string, data?: unknown) => {
        set(state => ({
          modals: {
            ...state.modals,
            [modalId]: {
              isOpen: true,
              data: data
            }
          }
        }))
      },

      closeModal: (modalId: string) => {
        set(state => {
          const { [modalId]: removed, ...remainingModals } = state.modals
          return { modals: remainingModals }
        })
      },

      closeAllModals: () => {
        set({ modals: {} })
      },

      updateModal: (modalId: string, updates: Partial<ModalState>) => {
        set(state => ({
          modals: {
            ...state.modals,
            [modalId]: {
              ...(state.modals[modalId] || { isOpen: false }),
              ...updates
            }
          }
        }))
      },

      // Tab actions - Fixed to match TabState interface
      setActiveTab: (groupId: string, tabId: string) => {
        set(state => ({
          activeTabs: {
            ...state.activeTabs,
            [groupId]: {
              activeTab: tabId
            }
          }
        }))
      },

      // Removed closeTab as it doesn't align with current TabState interface
      // If you need tab closing functionality, consider updating the TabState interface

      // Loading actions
      setLoading: (key: string, state: LoadingState) => {
        set(prevState => ({
          loadingStates: {
            ...prevState.loadingStates,
            [key]: state
          }
        }))
      },

      clearLoading: (key: string) => {
        set(state => {
          const { [key]: removed, ...remainingStates } = state.loadingStates
          return { loadingStates: remainingStates }
        })
      },

      clearAllLoading: () => {
        set({ loadingStates: {} })
      },

      // Search and filter actions - Improved type safety
      setSearchQuery: (query: string) => {
        set({ searchQuery: query })
      },

      setFilter: (key: string, value: string | number | boolean | null) => {
        set(state => ({
          activeFilters: {
            ...state.activeFilters,
            [key]: value
          }
        }))
      },

      clearFilter: (key: string) => {
        set(state => {
          const { [key]: removed, ...remainingFilters } = state.activeFilters
          return { activeFilters: remainingFilters }
        })
      },

      clearAllFilters: () => {
        set({ activeFilters: {}, searchQuery: '' })
      },

      // Mobile actions
      setMobileMenuOpen: (open: boolean) => {
        set({ isMobileMenuOpen: open })
      },

      setIsMobile: (mobile: boolean) => {
        set({ isMobile: mobile })
      },

      // Notification preference actions
      setNotificationPreference: (type: keyof UIState['notificationPreferences'], enabled: boolean) => {
        set(state => ({
          notificationPreferences: {
            ...state.notificationPreferences,
            [type]: enabled
          }
        }))
      },

      updateNotificationPreferences: (preferences: Partial<UIState['notificationPreferences']>) => {
        set(state => ({
          notificationPreferences: {
            ...state.notificationPreferences,
            ...preferences
          }
        }))
      }
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        notificationPreferences: state.notificationPreferences
      })
    }
  )
)