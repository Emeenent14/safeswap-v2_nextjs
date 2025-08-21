import * as yup from "yup";
import {
  DealCategory,
  DisputeReason,
} from "./types";

/**
 * Yup validation schemas for all forms in the application
 * Maps to Django: Form validation and model field validation
 * 
 * Production Django equivalent:
 * - Django Forms with clean_* methods
 * - Model field validators
 * - Custom validation functions
 * - Serializer validation in DRF
 */

// Common validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-\(\)]{10,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

/**
 * Authentication Forms Validation
 * Maps to Django: UserCreationForm, AuthenticationForm
 */

// Login form validation
export const loginSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .matches(EMAIL_REGEX, "Please enter a valid email address")
    .max(254, "Email must be less than 254 characters"),
  
  password: yup
    .string()
    .required("Password is required")
    .min(1, "Password is required"),
  
  remember: yup
    .boolean()
    .optional(),
});

// Register form validation
export const registerSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .matches(EMAIL_REGEX, "Please enter a valid email address")
    .max(254, "Email must be less than 254 characters"),
  
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .matches(
      PASSWORD_REGEX,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
  
  firstName: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .matches(
      /^[a-zA-Z\s'-]+$/,
      "First name can only contain letters, spaces, apostrophes, and hyphens"
    ),
  
  lastName: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .matches(
      /^[a-zA-Z\s'-]+$/,
      "Last name can only contain letters, spaces, apostrophes, and hyphens"
    ),
  
  phone: yup
    .string()
    .optional()
    .matches(PHONE_REGEX, "Please enter a valid phone number")
    .max(20, "Phone number must be less than 20 characters"),
  
  termsAccepted: yup
    .boolean()
    .required("You must agree to the terms and conditions")
    .oneOf([true], "You must agree to the terms and conditions"),
});

/**
 * Deal Management Validation
 * Maps to Django: Deal model form validation
 */

// Create deal form validation
export const createDealSchema = yup.object({
  title: yup
    .string()
    .required("Deal title is required")
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  
  description: yup
    .string()
    .required("Deal description is required")
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters"),
  
  category: yup
    .string()
    .required("Please select a category")
    .oneOf(
      ["digital_services", "freelancing", "goods", "consulting", "software", "design", "marketing", "writing", "other"] as DealCategory[],
      "Please select a valid category"
    ),
  
  amount: yup
    .number()
    .required("Deal amount is required")
    .min(10, "Minimum deal amount is $10")
    .max(1000000, "Maximum deal amount is $1,000,000")
    .test(
      "decimal-places",
      "Amount cannot have more than 2 decimal places",
      (value) => {
        if (value === undefined) return true;
        return (value * 100) % 1 === 0;
      }
    ),
  
  currency: yup
    .string()
    .required("Currency is required")
    .oneOf(["USD", "EUR", "GBP", "CAD"], "Please select a valid currency"),
  
  sellerId: yup
    .string()
    .optional(),
  
  milestones: yup
    .array()
    .of(
      yup.object({
        title: yup
          .string()
          .required("Milestone title is required")
          .min(3, "Title must be at least 3 characters")
          .max(100, "Title must be less than 100 characters"),
        
        description: yup
          .string()
          .optional()
          .max(500, "Description must be less than 500 characters"),
        
        amount: yup
          .number()
          .required("Milestone amount is required")
          .min(1, "Minimum milestone amount is $1")
          .test(
            "decimal-places",
            "Amount cannot have more than 2 decimal places",
            (value) => {
              if (value === undefined) return true;
              return (value * 100) % 1 === 0;
            }
          ),
        
        dueDate: yup
          .string()
          .optional(),
      })
    )
    .required("At least one milestone is required"),
});

// Create milestone form validation
export const createMilestoneSchema = yup.object({
  title: yup
    .string()
    .required("Milestone title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  
  description: yup
    .string()
    .optional()
    .max(500, "Description must be less than 500 characters"),
  
  amount: yup
    .number()
    .required("Milestone amount is required")
    .min(1, "Minimum milestone amount is $1")
    .test(
      "decimal-places",
      "Amount cannot have more than 2 decimal places",
      (value) => {
        if (value === undefined) return true;
        return (value * 100) % 1 === 0;
      }
    ),
  
  dueDate: yup
    .string()
    .optional(),
});

/**
 * Dispute Form Validation
 * Maps to Django: Dispute model form validation
 */

// Dispute form validation
export const disputeSchema = yup.object({
  reason: yup
    .string()
    .required("Please select a dispute reason")
    .oneOf(
      ["non_delivery", "quality_issues", "communication_breakdown", "payment_issues", "fraudulent_activity", "other"] as DisputeReason[],
      "Please select a valid dispute reason"
    ),
  
  description: yup
    .string()
    .required("Please describe the issue")
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters"),
  
  evidence: yup
    .array()
    .of(yup.mixed<File>().required())
    .required("Evidence files are required"),
});

/**
 * Profile and Settings Validation
 * Maps to Django: User profile form validation
 */

// User profile update validation
export const profileUpdateSchema = yup.object({
  firstName: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .matches(
      /^[a-zA-Z\s'-]+$/,
      "First name can only contain letters, spaces, apostrophes, and hyphens"
    ),
  
  lastName: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .matches(
      /^[a-zA-Z\s'-]+$/,
      "Last name can only contain letters, spaces, apostrophes, and hyphens"
    ),
  
  bio: yup
    .string()
    .optional()
    .max(500, "Bio must be less than 500 characters"),
  
  phone: yup
    .string()
    .optional()
    .matches(PHONE_REGEX, "Please enter a valid phone number")
    .max(20, "Phone number must be less than 20 characters"),
  
  location: yup
    .string()
    .optional()
    .max(100, "Location must be less than 100 characters"),
});

// Password change validation
export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required("Current password is required"),
  
  newPassword: yup
    .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .matches(
      PASSWORD_REGEX,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  
  confirmNewPassword: yup
    .string()
    .required("Please confirm your new password")
    .oneOf([yup.ref("newPassword")], "Passwords do not match"),
});

/**
 * KYC Verification Validation
 * Maps to Django: KYC document upload and verification forms
 */

// KYC document upload validation
export const kycDocumentSchema = yup.object({
  documentType: yup
    .string()
    .required("Please select a document type")
    .oneOf(
      ["passport", "drivers_license", "national_id"],
      "Please select a valid document type"
    ),
  
  documentNumber: yup
    .string()
    .when("documentType", {
      is: (val: string) => ["passport", "drivers_license", "national_id"].includes(val),
      then: (schema) => schema.required("Document number is required"),
      otherwise: (schema) => schema,
    })
    .max(50, "Document number must be less than 50 characters"),
  
  expiryDate: yup
    .date()
    .when("documentType", {
      is: (val: string) => ["passport", "drivers_license", "national_id"].includes(val),
      then: (schema) => schema
        .required("Expiry date is required")
        .min(new Date(), "Document must not be expired"),
      otherwise: (schema) => schema,
    }),
  
  notes: yup
    .string()
    .optional()
    .max(500, "Notes must be less than 500 characters"),
});

/**
 * Savings and Transfers Validation
 * Maps to Django: Savings and transfer form validation
 */

// Savings lock validation
export const savingsLockSchema = yup.object({
  amount: yup
    .number()
    .required("Amount is required")
    .min(10, "Minimum lock amount is $10")
    .max(100000, "Maximum lock amount is $100,000")
    .test(
      "decimal-places",
      "Amount cannot have more than 2 decimal places",
      (value) => {
        if (value === undefined) return true;
        return (value * 100) % 1 === 0;
      }
    ),
  
  lockPeriod: yup
    .number()
    .required("Lock period is required")
    .min(1, "Minimum lock period is 1 day")
    .max(365, "Maximum lock period is 365 days")
    .integer("Lock period must be a whole number of days"),
  
  purpose: yup
    .string()
    .optional()
    .max(200, "Purpose must be less than 200 characters"),
});

// Savings transfer validation
export const savingsTransferSchema = yup.object({
  recipientEmail: yup
    .string()
    .required("Recipient email is required")
    .matches(EMAIL_REGEX, "Please enter a valid email address")
    .max(254, "Email must be less than 254 characters"),
  
  amount: yup
    .number()
    .required("Transfer amount is required")
    .min(1, "Minimum transfer amount is $1")
    .test(
      "decimal-places",
      "Amount cannot have more than 2 decimal places",
      (value) => {
        if (value === undefined) return true;
        return (value * 100) % 1 === 0;
      }
    ),
  
  message: yup
    .string()
    .optional()
    .max(500, "Message must be less than 500 characters"),
});

/**
 * Search and Filter Validation
 * Maps to Django: Search form and filter validation
 */

// Deal search and filter validation
export const dealFilterSchema = yup.object({
  search: yup
    .string()
    .optional()
    .max(100, "Search term must be less than 100 characters"),
  
  category: yup
    .string()
    .optional()
    .oneOf(
      ["", "digital_services", "freelancing", "goods", "consulting", "software", "design", "marketing", "writing", "other"],
      "Please select a valid category"
    ),
  
  status: yup
    .string()
    .optional()
    .oneOf(
      ["", "created", "accepted", "funded", "in_progress", "milestone_completed", "completed", "cancelled", "disputed", "refunded"],
      "Please select a valid status"
    ),
  
  minAmount: yup
    .number()
    .optional()
    .min(0, "Minimum amount cannot be negative")
    .max(999999, "Minimum amount is too large"),
  
  maxAmount: yup
    .number()
    .optional()
    .min(0, "Maximum amount cannot be negative")
    .max(1000000, "Maximum amount is too large")
    .test(
      "min-max-validation",
      "Maximum amount must be greater than minimum amount",
      function(value) {
        const { minAmount } = this.parent;
        if (minAmount && value && value < minAmount) {
          return false;
        }
        return true;
      }
    ),
  
  sortBy: yup
    .string()
    .optional()
    .oneOf(
      ["", "created_date", "amount", "delivery_date", "title"],
      "Please select a valid sort option"
    ),
  
  sortOrder: yup
    .string()
    .optional()
    .oneOf(["asc", "desc"], "Please select a valid sort order"),
});

/**
 * Message and Communication Validation
 * Maps to Django: Message form validation
 */

// Deal message validation
export const messageSchema = yup.object({
  content: yup
    .string()
    .required("Message cannot be empty")
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be less than 2000 characters"),
  
  isPrivate: yup
    .boolean()
    .default(false),
});

/**
 * File Upload Validation
 * Maps to Django: File upload form validation
 */

// File upload validation
export const fileUploadSchema = yup.object({
  file: yup
    .mixed<File>()
    .required("Please select a file")
    .test("file-size", "File size must be less than 10MB", (value) => {
      if (!value) return true;
      return value.size <= 10 * 1024 * 1024; // 10MB
    })
    .test("file-type", "File type not supported", (value) => {
      if (!value) return true;
      const allowedTypes = [
        "image/jpeg",
        "image/png", 
        "image/webp",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];
      return allowedTypes.includes(value.type);
    }),
  
  description: yup
    .string()
    .optional()
    .max(200, "Description must be less than 200 characters"),
});

/**
 * Admin Panel Validation
 * Maps to Django: Admin forms and bulk actions
 */

// Admin user update validation
export const adminUserUpdateSchema = yup.object({
  firstName: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  
  lastName: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  
  email: yup
    .string()
    .required("Email is required")
    .matches(EMAIL_REGEX, "Please enter a valid email address")
    .max(254, "Email must be less than 254 characters"),
  
  role: yup
    .string()
    .required("Role is required")
    .oneOf(["user", "admin", "super_admin"], "Please select a valid role"),
  
  kycVerified: yup
    .boolean()
    .default(false),
  
  trustScore: yup
    .number()
    .min(0, "Trust score cannot be negative")
    .max(100, "Trust score cannot exceed 100")
    .integer("Trust score must be a whole number"),
});

/**
 * Email validation utility
 * Maps to Django: Email validation in forms and models
 */
export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

/**
 * Phone validation utility
 * Maps to Django: Phone number validation
 */
export const validatePhone = (phone: string): boolean => {
  return PHONE_REGEX.test(phone);
};

/**
 * Password strength validation utility
 * Maps to Django: Password validation in User model
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Form validation helpers
 */
export const validationHelpers = {
  /**
   * Get field error message from Yup validation error
   */
  getFieldError: (error: yup.ValidationError, field: string): string | undefined => {
    if (error.path === field) {
      return error.message;
    }
    return undefined;
  },

  /**
   * Format validation errors for display
   */
  formatErrors: (error: yup.ValidationError): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (error.inner?.length) {
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
    } else if (error.path) {
      errors[error.path] = error.message;
    }
    return errors;
  }
};