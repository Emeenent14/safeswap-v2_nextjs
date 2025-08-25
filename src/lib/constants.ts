/**
 * SafeSwap Application Constants
 * Shared constants used across the application
 * Maps to Django: settings.py and app-level constants
 */

// Application Configuration
export const APP_CONFIG = {
  name: 'SafeSwap',
  description: 'Secure escrow and savings platform',
  version: '1.0.0',
  support_email: 'support@safeswap.com',
  admin_email: 'admin@safeswap.com',
} as const;

// API Configuration
export const API_CONFIG = {
  base_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  timeout: 30000,
  retry_attempts: 3,
  pagination: {
    default_limit: 20,
    max_limit: 100,
  },
} as const;

// Authentication Constants
export const AUTH_CONFIG = {
  token_name: 'auth_token',
  session_timeout: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  password_min_length: 8,
  max_login_attempts: 5,
  lockout_duration: 15 * 60 * 1000, // 15 minutes
} as const;

// Deal Constants
export const DEAL_CONFIG = {
  min_amount: 10,
  max_amount: 1000000,
  max_milestones: 10,
  escrow_fee_percentage: 2.5, // 2.5%
  dispute_timeout_days: 14,
  completion_timeout_days: 30,
} as const;

// File Upload Constants
export const FILE_CONFIG = {
  max_size: 10 * 1024 * 1024, // 10MB
  max_files_per_message: 5,
  max_files_per_deal: 20,
  allowed_types: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  image_types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  document_types: [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const;

// Trust Score Constants
export const TRUST_SCORE_CONFIG = {
  initial_score: 50,
  min_score: 0,
  max_score: 100,
  kyc_bonus: 10,
  deal_completion_bonus: 2,
  dispute_penalty: -5,
  late_delivery_penalty: -1,
  excellent_rating_bonus: 3,
} as const;

// KYC Constants
export const KYC_CONFIG = {
  required_documents: ['identity', 'address_proof'],
  max_file_size: 5 * 1024 * 1024, // 5MB
  allowed_formats: ['image/jpeg', 'image/png', 'application/pdf'],
  review_timeout_days: 7,
  resubmission_limit: 3,
} as const;

// Savings Constants
export const SAVINGS_CONFIG = {
  min_deposit: 10,
  max_deposit: 100000,
  min_lock_days: 1,
  max_lock_days: 365,
  base_interest_rate: 0.05, // 5% annually
  lock_bonus_rates: {
    30: 0.01,  // 1% bonus for 30+ days
    90: 0.02,  // 2% bonus for 90+ days
    180: 0.03, // 3% bonus for 180+ days
    365: 0.05, // 5% bonus for 365 days
  },
} as const;

// Notification Constants
export const NOTIFICATION_CONFIG = {
  toast_duration: 5000,
  max_notifications: 100,
  auto_mark_read_delay: 5000,
  real_time_enabled: process.env.FEATURE_WEBSOCKET_ENABLED === 'true',
} as const;

// Pagination Constants
export const PAGINATION_CONFIG = {
  deals_per_page: 12,
  transactions_per_page: 20,
  messages_per_page: 50,
  notifications_per_page: 20,
  users_per_page: 25,
  disputes_per_page: 15,
} as const;

// Status Options
export const DEAL_STATUSES = [
  { value: 'created', label: 'Created', color: 'blue' },
  { value: 'accepted', label: 'Accepted', color: 'green' },
  { value: 'funded', label: 'Funded', color: 'purple' },
  { value: 'in_progress', label: 'In Progress', color: 'orange' },
  { value: 'milestone_completed', label: 'Milestone Completed', color: 'cyan' },
  { value: 'completed', label: 'Completed', color: 'emerald' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
  { value: 'disputed', label: 'Disputed', color: 'red' },
  { value: 'refunded', label: 'Refunded', color: 'yellow' },
] as const;

export const KYC_STATUSES = [
  { value: 'not_submitted', label: 'Not Submitted', color: 'gray' },
  { value: 'pending', label: 'Under Review', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
] as const;

export const TRANSACTION_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'processing', label: 'Processing', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
  { value: 'refunded', label: 'Refunded', color: 'orange' },
] as const;

// Category Options
export const DEAL_CATEGORIES = [
  { value: 'digital_services', label: 'Digital Services', icon: 'Monitor' },
  { value: 'freelancing', label: 'Freelancing', icon: 'Users' },
  { value: 'goods', label: 'Physical Goods', icon: 'Package' },
  { value: 'consulting', label: 'Consulting', icon: 'MessageCircle' },
  { value: 'software', label: 'Software Development', icon: 'Code' },
  { value: 'design', label: 'Design & Creative', icon: 'Palette' },
  { value: 'marketing', label: 'Marketing', icon: 'TrendingUp' },
  { value: 'writing', label: 'Writing & Content', icon: 'PenTool' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal' },
] as const;

// Currency Options
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
] as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication errors
  auth: {
    invalid_credentials: 'Invalid email or password',
    account_not_found: 'Account not found',
    account_disabled: 'Account has been disabled',
    email_already_exists: 'An account with this email already exists',
    password_too_weak: 'Password does not meet security requirements',
    verification_required: 'Please verify your account before continuing',
    session_expired: 'Your session has expired. Please log in again',
    unauthorized: 'You are not authorized to perform this action',
  },
  
  // Validation errors
  validation: {
    required_field: 'This field is required',
    invalid_email: 'Please enter a valid email address',
    invalid_phone: 'Please enter a valid phone number',
    passwords_dont_match: 'Passwords do not match',
    amount_too_small: 'Amount is too small',
    amount_too_large: 'Amount is too large',
    file_too_large: 'File size exceeds the maximum limit',
    invalid_file_type: 'File type is not supported',
  },
  
  // Deal errors
  deals: {
    not_found: 'Deal not found',
    access_denied: 'You do not have access to this deal',
    already_accepted: 'This deal has already been accepted',
    cannot_cancel: 'This deal cannot be cancelled at this stage',
    insufficient_funds: 'Insufficient funds to complete this transaction',
    milestone_not_ready: 'This milestone is not ready for completion',
  },
  
  // System errors
  system: {
    server_error: 'Something went wrong. Please try again later',
    network_error: 'Network error. Please check your connection',
    maintenance_mode: 'System is under maintenance. Please try again later',
    rate_limit_exceeded: 'Too many requests. Please wait before trying again',
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  auth: {
    login_success: 'Successfully logged in',
    logout_success: 'Successfully logged out',
    registration_success: 'Account created successfully',
    verification_sent: 'Verification code sent',
    email_verified: 'Email verified successfully',
    phone_verified: 'Phone number verified successfully',
    password_reset: 'Password reset successfully',
  },
  
  deals: {
    created: 'Deal created successfully',
    accepted: 'Deal accepted successfully',
    cancelled: 'Deal cancelled successfully',
    completed: 'Deal completed successfully',
    milestone_completed: 'Milestone completed successfully',
    payment_processed: 'Payment processed successfully',
  },
  
  profile: {
    updated: 'Profile updated successfully',
    kyc_submitted: 'KYC documents submitted for review',
    settings_saved: 'Settings saved successfully',
  },
} as const;

// Route Constants
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_PHONE: '/verify-phone',
  FORGOT_PASSWORD: '/forgot-password',
  TERMS: '/legal/terms',
  PRIVACY: '/legal/privacy',
  
  // Dashboard routes
  DASHBOARD: '/dashboard',
  DEALS: '/dashboard/deals',
  CREATE_DEAL: '/dashboard/deals/create',
  DEAL_DETAILS: (id: string) => `/dashboard/deals/${id}`,
  TRANSACTIONS: '/dashboard/transactions',
  TRANSACTION_DETAILS: (id: string) => `/dashboard/transactions/${id}`,
  MESSAGES: '/dashboard/messages',
  DEAL_MESSAGES: (dealId: string) => `/dashboard/messages/${dealId}`,
  DISPUTES: '/dashboard/disputes',
  DISPUTE_DETAILS: (id: string) => `/dashboard/disputes/${id}`,
  SAVINGS: '/dashboard/savings',
  KYC: '/dashboard/kyc',
  PROFILE: '/dashboard/profile',
  SETTINGS: '/dashboard/settings',
  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_DISPUTES: '/admin/disputes',
  ADMIN_DISPUTE_DETAILS: (id: string) => `/admin/disputes/${id}`,
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAILS: (id: string) => `/admin/users/${id}`,
  ADMIN_KYC: '/admin/kyc',
  ADMIN_KYC_DETAILS: (id: string) => `/admin/kyc/${id}`,
  
  // API routes
  API: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      VERIFY: '/api/auth/verify',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
    },
    USER: {
      PROFILE: '/api/user/profile',
      TRUST_SCORE: '/api/user/trust-score',
    },
    DEALS: '/api/deals',
    DEAL_DETAILS: (id: string) => `/api/deals/${id}`,
    PAYMENTS: {
      CREATE_INTENT: '/api/payments/stripe/create-intent',
      WEBHOOK: '/api/payments/stripe/webhook',
    },
    UPLOAD: '/api/upload',
  },
} as const;

// Feature Flags
export const FEATURES = {
  SAVINGS_ENABLED: process.env.FEATURE_SAVINGS_ENABLED === 'true',
  ADMIN_PANEL_ENABLED: process.env.FEATURE_ADMIN_PANEL_ENABLED === 'true',
  KYC_ENABLED: process.env.FEATURE_KYC_ENABLED === 'true',
  WEBSOCKET_ENABLED: process.env.FEATURE_WEBSOCKET_ENABLED === 'true',
  DARK_MODE_ENABLED: true,
  MULTI_CURRENCY_ENABLED: true,
  FILE_UPLOAD_ENABLED: true,
} as const;

// Time Constants
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'safeswap_theme',
  SIDEBAR_COLLAPSED: 'safeswap_sidebar_collapsed',
  ONBOARDING_COMPLETED: 'safeswap_onboarding_completed',
  NOTIFICATION_PREFERENCES: 'safeswap_notification_preferences',
  RECENT_SEARCHES: 'safeswap_recent_searches',
} as const;