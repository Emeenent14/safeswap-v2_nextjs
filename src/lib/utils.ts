import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, parseISO } from "date-fns";

/**
 * Utility function to merge Tailwind CSS classes
 * Used throughout components for conditional styling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amounts consistently across the app
 * Maps to Django: Custom template filters for currency formatting
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format numbers with commas for better readability
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Date formatting utilities
 * Maps to Django: Custom date filters and timezone handling
 */
export const dateUtils = {
  /**
   * Format date relative to now (e.g., "2 hours ago")
   */
  relative(date: string | Date): string {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  },

  /**
   * Format date in readable format
   */
  readable(date: string | Date): string {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "PPP"); // e.g., "April 29, 2024"
  },

  /**
   * Format date with time
   */
  withTime(date: string | Date): string {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "PPP 'at' p"); // e.g., "April 29, 2024 at 2:30 PM"
  },

  /**
   * Format date for form inputs
   */
  forInput(date: string | Date): string {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "yyyy-MM-dd");
  },

  /**
   * Check if date is today
   */
  isToday(date: string | Date): boolean {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const today = new Date();
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  }
};

/**
 * String utilities
 */
export const stringUtils = {
  /**
   * Truncate text with ellipsis
   */
  truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  },

  /**
   * Capitalize first letter of each word
   */
  capitalize(text: string): string {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  },

  /**
   * Generate initials from name
   */
  initials(name: string): string {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  },

  /**
   * Generate slug from text
   */
  slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  }
};

/**
 * File utilities
 * Maps to Django: File upload validation and processing
 */
export const fileUtils = {
  /**
   * Format file size in human-readable format
   */
  formatSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  },

  /**
   * Check if file type is allowed
   */
  isAllowedType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  },

  /**
   * Check if file size is within limit
   */
  isWithinSizeLimit(file: File, maxSizeBytes: number): boolean {
    return file.size <= maxSizeBytes;
  },

  /**
   * Get file extension from filename
   */
  getExtension(filename: string): string {
    return filename.split(".").pop()?.toLowerCase() || "";
  }
};

/**
 * Generate deterministic avatar URL
 * Maps to Django: User profile avatar generation
 */
export function generateAvatarUrl(userId: string, name: string): string {
  // Using DiceBear API for consistent avatar generation
  const seed = userId || name.replace(/\s+/g, "");
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=3B82F6,EF4444,10B981,F59E0B,8B5CF6&textColor=ffffff`;
}

/**
 * Wait/delay utility for testing and mock APIs
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random ID for mock data (deterministic based on seed)
 */
export function generateMockId(seed: string = ""): string {
  // Simple hash function for consistent IDs in development
  let hash = 0;
  const str = seed + Date.now().toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (simple validation)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Calculate trust score based on user activity
 * Maps to Django: Trust score calculation algorithm
 */
export function calculateTrustScore(data: {
  completedDeals: number;
  totalDeals: number;
  disputesLost: number;
  accountAge: number; // in days
  kycVerified: boolean;
}): number {
  const { completedDeals, totalDeals, disputesLost, accountAge, kycVerified } = data;
  
  let score = 50; // Base score
  
  // Completion rate bonus (0-25 points)
  if (totalDeals > 0) {
    const completionRate = completedDeals / totalDeals;
    score += Math.round(completionRate * 25);
  }
  
  // Account age bonus (0-10 points)
  score += Math.min(Math.round(accountAge / 30), 10);
  
  // KYC verification bonus (15 points)
  if (kycVerified) score += 15;
  
  // Dispute penalty (-5 points per lost dispute)
  score -= disputesLost * 5;
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Get trust score color and label
 */
export function getTrustScoreDisplay(score: number): {
  color: string;
  label: string;
  bgColor: string;
} {
  if (score >= 80) {
    return {
      color: "text-green-600",
      label: "Excellent",
      bgColor: "bg-green-50 border-green-200"
    };
  } else if (score >= 60) {
    return {
      color: "text-blue-600", 
      label: "Good",
      bgColor: "bg-blue-50 border-blue-200"
    };
  } else if (score >= 40) {
    return {
      color: "text-yellow-600",
      label: "Fair",
      bgColor: "bg-yellow-50 border-yellow-200"
    };
  } else {
    return {
      color: "text-red-600",
      label: "Poor", 
      bgColor: "bg-red-50 border-red-200"
    };
  }
}