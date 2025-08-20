import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiResponse, ApiError, PaginatedResponse, User, LoginForm, RegisterForm } from "./types";

/**
 * API Client configuration and utilities
 * Maps to Django: DRF API client with authentication headers
 * 
 * Production Django equivalent:
 * - Django REST Framework ViewSets
 * - Token/JWT authentication headers
 * - Pagination and error handling
 * - CORS configuration
 */

// Create base axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.API_BASE_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor to add authentication token
 * Maps to Django: Authentication middleware adding user context
 */
api.interceptors.request.use(
  (config) => {
    // Get token from cookie (client-side) or headers (server-side)
    if (typeof window !== "undefined") {
      const token = getCookieValue("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling and token refresh
 * Maps to Django: Custom exception handling and token refresh logic
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized responses
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear invalid token and redirect to login
      if (typeof window !== "undefined") {
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        window.location.href = "/login";
      }
    }

    // Transform error response to match our ApiError type
    const apiError: ApiError = {
      message: error.response?.data?.message || error.response?.data?.error || error.message || "An unexpected error occurred",
      field: error.response?.data?.field,
      code: error.response?.data?.code || error.response?.status?.toString(),
    };

    return Promise.reject(apiError);
  }
);

/**
 * Generic API response wrapper
 * Maps to Django: DRF Response format standardization
 */
export class ApiClient {
  /**
   * GET request with type safety
   */
  static async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await api.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request with type safety
   */
  static async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await api.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PUT request with type safety
   */
  static async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await api.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PATCH request with type safety
   */
  static async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await api.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE request with type safety
   */
  static async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await api.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * File upload with progress tracking
   * Maps to Django: File upload views with progress
   */
  static async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post<ApiResponse<T>>(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Paginated GET request
   * Maps to Django: DRF PageNumberPagination
   */
  static async getPaginated<T>(
    url: string,
    page: number = 1,
    pageSize: number = 20,
    params?: Record<string, unknown>
  ): Promise<PaginatedResponse<T>> {
    try {
      const response = await api.get<PaginatedResponse<T>>(url, {
        params: {
          page,
          page_size: pageSize,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Error handler to standardize error responses
   */
  private static handleError(error: unknown): ApiError {
    // If it's already our ApiError type from interceptor
    if (this.isApiError(error)) {
      return error;
    }

    // Handle axios errors
    if (axios.isAxiosError(error)) {
      return {
        message: error.response?.data?.message || error.message || "Network error",
        field: error.response?.data?.field,
        code: error.response?.data?.code || error.response?.status?.toString(),
      };
    }

    // Handle generic errors
    return {
      message: error instanceof Error ? error.message : "An unexpected error occurred",
      code: "500",
    };
  }

  /**
   * Type guard for ApiError
   */
  private static isApiError(error: unknown): error is ApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as ApiError).message === 'string'
    );
  }
}

/**
 * Authentication API endpoints
 * Maps to Django: django.contrib.auth views + custom auth endpoints
 */
export const authApi = {
  /**
   * Login user
   * Maps to Django: TokenObtainPairView or custom login view
   */
  login: (email: string, password: string) =>
    ApiClient.post<{ token: string; user: User }>("/auth/login", {
      email,
      password,
    }),

  /**
   * Login with form data
   */
  loginWithForm: (data: LoginForm) =>
    ApiClient.post<{ token: string; user: User }>("/auth/login", data),

  /**
   * Register new user
   * Maps to Django: CreateUserView with validation
   */
  register: (data: RegisterForm) => 
    ApiClient.post<{ user: User }>("/auth/register", data),

  /**
   * Verify email
   * Maps to Django: Email verification view
   */
  verifyEmail: (token: string) =>
    ApiClient.post<{ success: boolean }>("/auth/verify", { token }),

  /**
   * Request password reset
   * Maps to Django: PasswordResetView
   */
  requestPasswordReset: (email: string) =>
    ApiClient.post<{ success: boolean }>("/auth/forgot-password", { email }),

  /**
   * Reset password with token
   * Maps to Django: PasswordResetConfirmView
   */
  resetPassword: (token: string, password: string) =>
    ApiClient.post<{ success: boolean }>("/auth/reset-password", {
      token,
      password,
    }),

  /**
   * Logout user
   * Maps to Django: Logout view
   */
  logout: () =>
    ApiClient.post<{ success: boolean }>("/auth/logout"),

  /**
   * Get current user
   * Maps to Django: Current user view
   */
  getCurrentUser: () =>
    ApiClient.get<User>("/auth/me"),
};

/**
 * Deals API endpoints
 * Maps to Django: Deal model ViewSet with nested relationships
 */
export const dealsApi = {
  /**
   * Get all deals with filtering
   * Maps to Django: DealViewSet.list() with django-filter
   */
  getAll: (filters?: {
    status?: string;
    category?: string;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
  }) => ApiClient.getPaginated("/deals", 1, 20, filters),

  /**
   * Get deal by ID
   * Maps to Django: DealViewSet.retrieve()
   */
  getById: (id: string) => ApiClient.get(`/deals/${id}`),

  /**
   * Create new deal
   * Maps to Django: DealViewSet.create()
   */
  create: (data: unknown) => ApiClient.post("/deals", data),

  /**
   * Update deal
   * Maps to Django: DealViewSet.partial_update()
   */
  update: (id: string, data: unknown) => ApiClient.patch(`/deals/${id}`, data),

  /**
   * Delete deal
   * Maps to Django: DealViewSet.destroy()
   */
  delete: (id: string) => ApiClient.delete(`/deals/${id}`),

  /**
   * Accept deal
   * Maps to Django: Custom deal action
   */
  accept: (id: string) => ApiClient.post(`/deals/${id}/accept`),

  /**
   * Fund deal
   * Maps to Django: Escrow funding action
   */
  fund: (id: string, paymentMethodId: string) => 
    ApiClient.post(`/deals/${id}/fund`, { paymentMethodId }),

  /**
   * Complete milestone
   * Maps to Django: Milestone completion action
   */
  completeMilestone: (dealId: string, milestoneId: string) =>
    ApiClient.post(`/deals/${dealId}/milestones/${milestoneId}/complete`),
};

/**
 * User API endpoints
 * Maps to Django: User profile views and trust score calculations
 */
export const userApi = {
  /**
   * Get current user profile
   * Maps to Django: UserProfileView
   */
  getProfile: () => ApiClient.get<User>("/user/profile"),

  /**
   * Update user profile
   * Maps to Django: UserProfileUpdateView
   */
  updateProfile: (data: Partial<User>) => ApiClient.patch<User>("/user/profile", data),

  /**
   * Get user trust score
   * Maps to Django: TrustScoreView with calculations
   */
  getTrustScore: () => ApiClient.get<{ trustScore: number; history: unknown[] }>("/user/trust-score"),

  /**
   * Get user by ID
   * Maps to Django: Public user profile view
   */
  getById: (id: string) => ApiClient.get<User>(`/users/${id}`),
};

/**
 * Payments API endpoints
 * Maps to Django: Stripe integration views
 */
export const paymentsApi = {
  /**
   * Create Stripe payment intent
   * Maps to Django: StripePaymentIntentView
   */
  createPaymentIntent: (data: {
    amount: number;
    currency: string;
    dealId: string;
  }) => ApiClient.post<{ clientSecret: string; paymentIntentId: string }>("/payments/stripe/create-intent", data),

  /**
   * Confirm payment
   * Maps to Django: Payment confirmation view
   */
  confirmPayment: (paymentIntentId: string) =>
    ApiClient.post<{ success: boolean }>("/payments/confirm", { paymentIntentId }),

  /**
   * Get payment methods
   * Maps to Django: User payment methods view
   */
  getPaymentMethods: () =>
    ApiClient.get<{ paymentMethods: unknown[] }>("/payments/methods"),
};

/**
 * File upload API
 * Maps to Django: File upload view with validation
 */
export const uploadApi = {
  /**
   * Upload file
   * Maps to Django: FileUploadView with size/type validation
   */
  uploadFile: (file: File, onProgress?: (progress: number) => void) =>
    ApiClient.uploadFile<{ url: string; filename: string }>("/upload", file, onProgress),

  /**
   * Upload avatar
   * Maps to Django: Avatar upload with image processing
   */
  uploadAvatar: (file: File, onProgress?: (progress: number) => void) =>
    ApiClient.uploadFile<{ url: string }>("/upload/avatar", file, onProgress),
};

/**
 * Notifications API
 * Maps to Django: Notification system
 */
export const notificationsApi = {
  /**
   * Get user notifications
   */
  getAll: (page: number = 1, unreadOnly: boolean = false) =>
    ApiClient.getPaginated("/notifications", page, 20, { unread_only: unreadOnly }),

  /**
   * Mark notification as read
   */
  markAsRead: (id: string) =>
    ApiClient.patch(`/notifications/${id}`, { isRead: true }),

  /**
   * Mark all as read
   */
  markAllAsRead: () =>
    ApiClient.post("/notifications/mark-all-read"),
};

/**
 * Utility function to get cookie value (client-side only)
 */
function getCookieValue(name: string): string | null {
  if (typeof window === "undefined") return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

/**
 * Raw axios instance for custom requests
 */
export { api };

/**
 * Default export
 */
export default ApiClient;