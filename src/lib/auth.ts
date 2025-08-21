import { SignJWT, jwtVerify, JWTPayload as JoseJWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { User, UserRole } from "./types";

/**
 * JWT Authentication utilities for mock implementation
 * Maps to Django: django.contrib.auth + JWT tokens
 * 
 * Production Django equivalent:
 * - User model with authentication
 * - JWT token generation and verification  
 * - Permission system with roles
 */

// JWT secret key from environment
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your_super_secret_jwt_key_here_min_32_chars"
);

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * JWT payload interface
 * Maps to Django: Custom JWT claims
 */
export interface JWTPayload extends JoseJWTPayload {
  sub: string; // User ID
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  trustScore?: number;
  isVerified?: boolean;
  iat: number;
  exp: number;
  type?: "access" | "password_reset" | "email_verification";
  iss?: string;
  aud?: string | string[];
  jti?: string;
}

/**
 * Generate JWT token for user
 * Maps to Django: TokenObtainPairView with custom claims
 */
export async function generateToken(user: User): Promise<string> {
  const expirationTime = getExpirationTime(JWT_EXPIRES_IN);
  
  const payload: Partial<JWTPayload> = {
    sub: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    trustScore: user.trustScore,
    isVerified: user.isVerified,
    type: "access",
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token and return payload
 * Maps to Django: JWT token verification middleware
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Type assertion with runtime validation
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.firstName !== 'string' ||
      typeof payload.lastName !== 'string' ||
      !['user', 'admin', 'super_admin'].includes(payload.role as string) ||
      typeof payload.iat !== 'number' ||
      typeof payload.exp !== 'number'
    ) {
      throw new Error("Invalid token payload structure");
    }
    
    return payload as JWTPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
    console.log("Token verification error:", error);
  }
}

/**
 * Get current user from request cookies
 * Maps to Django: request.user after authentication middleware
 */
export async function getCurrentUser(request?: NextRequest): Promise<User | null> {
  try {
    let token: string | undefined;
    
    if (request) {
      // Server-side request
      token = request.cookies.get("auth_token")?.value;
    } else {
      // Server component
      const cookieStore = await cookies();
      const authCookie = cookieStore.get("auth_token");
      token = authCookie?.value;
    }

    if (!token) return null;

    const payload = await verifyToken(token);
    
    // In a real app, this would fetch from database
    // For mock, we reconstruct user from JWT payload
    return {
      id: payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: "", // Mock data - would come from DB
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.firstName + ' ' + payload.lastName)}`,
      trustScore: payload.trustScore || 50,
      isVerified: payload.isVerified || false,
      kycStatus: 'not_submitted', // Mock data
      role: payload.role,
      createdAt: new Date().toISOString(), // Mock data
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return null;
    console.log("Error getting current user, auth.ts line 136 :", error);
  }
}

/**
 * Check if user has admin role
 * Maps to Django: user.is_staff or permission checks
 */
export async function isAdmin(request?: NextRequest): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user?.role === "admin" || user?.role === "super_admin";
}

/**
 * Require authentication (throw if not authenticated)
 * Maps to Django: @login_required decorator
 */
export async function requireAuth(request?: NextRequest): Promise<User> {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

/**
 * Require admin role (throw if not admin)
 * Maps to Django: @user_passes_test(lambda u: u.is_staff)
 */
export async function requireAdmin(request?: NextRequest): Promise<User> {
  const user = await requireAuth(request);
  if (user.role !== "admin" && user.role !== "super_admin") {
    throw new Error("Admin access required");
  }
  return user;
}

/**
 * Set authentication cookie
 * Maps to Django: Login view setting session/JWT cookie
 */
export function setAuthCookie(token: string): string {
  const maxAge = getMaxAgeFromExpiration(JWT_EXPIRES_IN);
  
  return `auth_token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict; ${
    process.env.NODE_ENV === "production" ? "Secure;" : ""
  }`;
}

/**
 * Clear authentication cookie
 * Maps to Django: Logout view clearing session
 */
export function clearAuthCookie(): string {
  return `auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict;`;
}

/**
 * Hash password (mock implementation)
 * Maps to Django: django.contrib.auth.hashers
 */
export async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt or similar
  // This is a simple mock for development
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "mock_salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verify password against hash
 * Maps to Django: User.check_password()
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Generate password reset token
 * Maps to Django: PasswordResetTokenGenerator
 */
export async function generateResetToken(userId: string, email: string): Promise<string> {
  const expirationTime = Math.floor(Date.now() / 1000) + (60 * 15); // 15 minutes
  
  const payload: Partial<JWTPayload> = {
    sub: userId,
    email,
    type: "password_reset",
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(JWT_SECRET);
}

/**
 * Verify password reset token
 * Maps to Django: Token validation in password reset view
 */
export async function verifyResetToken(token: string): Promise<{ userId: string; email: string }> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (payload.type !== "password_reset") {
      throw new Error("Invalid token type");
    }
    
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
      throw new Error("Invalid token payload");
    }
    
    return {
      userId: payload.sub,
      email: payload.email,
    };
  } catch (error) {
    throw new Error("Invalid or expired reset token");
    console.log("Password reset token verification error auth.ts line 258:", error);
  }
}

/**
 * Generate email verification token
 * Maps to Django: Email verification token generation
 */
export async function generateVerificationToken(userId: string, email: string): Promise<string> {
  const expirationTime = Math.floor(Date.now() / 1000) + (60 * 60 * 24); // 24 hours
  
  const payload: Partial<JWTPayload> = {
    sub: userId,
    email,
    type: "email_verification",
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(JWT_SECRET);
}

/**
 * Verify email verification token
 * Maps to Django: Email verification view
 */
export async function verifyEmailToken(token: string): Promise<{ userId: string; email: string }> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (payload.type !== "email_verification") {
      throw new Error("Invalid token type");
    }
    
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
      throw new Error("Invalid token payload");
    }
    
    return {
      userId: payload.sub,
      email: payload.email,
    };
  } catch (error) {
    throw new Error("Invalid or expired verification token");
    console.log("Email verification token verification error auth.ts line 304:", error);
  }
}

/**
 * Helper function to get expiration time from duration string
 */
function getExpirationTime(duration: string): number {
  const now = Math.floor(Date.now() / 1000);
  
  if (duration.endsWith('d')) {
    const days = parseInt(duration.slice(0, -1));
    return now + (days * 24 * 60 * 60);
  } else if (duration.endsWith('h')) {
    const hours = parseInt(duration.slice(0, -1));
    return now + (hours * 60 * 60);
  } else if (duration.endsWith('m')) {
    const minutes = parseInt(duration.slice(0, -1));
    return now + (minutes * 60);
  }
  
  // Default to 7 days
  return now + (7 * 24 * 60 * 60);
}

/**
 * Helper function to get max age for cookie from duration string
 */
function getMaxAgeFromExpiration(duration: string): number {
  if (duration.endsWith('d')) {
    const days = parseInt(duration.slice(0, -1));
    return days * 24 * 60 * 60;
  } else if (duration.endsWith('h')) {
    const hours = parseInt(duration.slice(0, -1));
    return hours * 60 * 60;
  } else if (duration.endsWith('m')) {
    const minutes = parseInt(duration.slice(0, -1));
    return minutes * 60;
  }
  
  // Default to 7 days
  return 7 * 24 * 60 * 60;
}

/**
 * Mock user database for development
 * Maps to Django: User model in database
 */
export const MOCK_USERS: User[] = [
  {
    id: "user_1",
    email: "john@example.com", 
    firstName: "John",
    lastName: "Doe",
    phone: "+1234567890",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=John%20Doe",
    trustScore: 85,
    isVerified: true,
    kycStatus: 'approved',
    role: "user",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-08-15T14:30:00Z",
  },
  {
    id: "user_2",
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Smith", 
    phone: "+1234567891",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Jane%20Smith",
    trustScore: 92,
    isVerified: true,
    kycStatus: 'approved',
    role: "user",
    createdAt: "2024-02-10T08:00:00Z",
    updatedAt: "2024-08-14T16:45:00Z",
  },
  {
    id: "admin_1",
    email: "admin@safeswap.com",
    firstName: "Admin",
    lastName: "User",
    phone: "+1234567892",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Admin%20User",
    trustScore: 100,
    isVerified: true,
    kycStatus: 'approved',
    role: "admin",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-08-15T12:00:00Z", 
  }
];

/**
 * Mock password hashes (password is "password123" for all users)
 * Maps to Django: User password field with hashed values
 */
export const MOCK_PASSWORD_HASH = "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f";

/**
 * Find user by email (mock database query)
 * Maps to Django: User.objects.get(email=email)
 */
export function findUserByEmail(email: string): User | null {
  return MOCK_USERS.find(user => user.email === email) || null;
}

/**
 * Find user by ID (mock database query) 
 * Maps to Django: User.objects.get(id=user_id)
 */
export function findUserById(id: string): User | null {
  return MOCK_USERS.find(user => user.id === id) || null;
}