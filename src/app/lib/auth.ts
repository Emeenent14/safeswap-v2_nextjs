import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { User } from "@/lib/types";

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
export interface JWTPayload {
  sub: string; // User ID
  email: string;
  name: string;
  role: "user" | "admin";
  trustScore?: number;
  kycVerified?: boolean;
  iat: number;
  exp: number;
}

/**
 * Generate JWT token for user
 * Maps to Django: TokenObtainPairView with custom claims
 */
export async function generateToken(user: User): Promise<string> {
  const expirationTime = getExpirationTime(JWT_EXPIRES_IN);
  
  const payload: JWTPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    trustScore: user.trustScore,
    kycVerified: user.kycVerified,
    iat: Math.floor(Date.now() / 1000),
    exp: expirationTime,
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
    return payload as JWTPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
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
      const cookieStore = cookies();
      token = cookieStore.get("auth_token")?.value;
    }

    if (!token) return null;

    const payload = await verifyToken(token);
    
    // In a real app, this would fetch from database
    // For mock, we reconstruct user from JWT payload
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      trustScore: payload.trustScore || 50,
      kycVerified: payload.kycVerified || false,
      createdAt: new Date().toISOString(), // Mock data
      updatedAt: new Date().toISOString(),
      profile: {
        bio: "",
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${payload.name}`,
        phone: "",
        location: "",
        website: "",
        socialLinks: {}
      }
    };
  } catch (error) {
    return null;
  }
}

/**
 * Check if user has admin role
 * Maps to Django: user.is_staff or permission checks
 */
export async function isAdmin(request?: NextRequest): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user?.role === "admin";
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
  if (user.role !== "admin") {
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
  const payload = {
    sub: userId,
    email,
    type: "password_reset",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 15), // 15 minutes
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.exp)
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
    
    return {
      userId: payload.sub as string,
      email: payload.email as string,
    };
  } catch (error) {
    throw new Error("Invalid or expired reset token");
  }
}

/**
 * Generate email verification token
 * Maps to Django: Email verification token generation
 */
export async function generateVerificationToken(userId: string, email: string): Promise<string> {
  const payload = {
    sub: userId,
    email,
    type: "email_verification",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.exp)
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
    
    return {
      userId: payload.sub as string,
      email: payload.email as string,
    };
  } catch (error) {
    throw new Error("Invalid or expired verification token");
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
    name: "John Doe",
    role: "user",
    trustScore: 85,
    kycVerified: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-08-15T14:30:00Z",
    profile: {
      bio: "Experienced trader with focus on electronics and gadgets.",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=John Doe",
      phone: "+1234567890",
      location: "New York, NY",
      website: "https://johndoe.com",
      socialLinks: {
        twitter: "https://twitter.com/johndoe",
        linkedin: "https://linkedin.com/in/johndoe"
      }
    }
  },
  {
    id: "user_2",
    email: "jane@example.com",
    name: "Jane Smith", 
    role: "user",
    trustScore: 92,
    kycVerified: true,
    createdAt: "2024-02-10T08:00:00Z",
    updatedAt: "2024-08-14T16:45:00Z",
    profile: {
      bio: "Tech enthusiast and startup founder.",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Jane Smith",
      phone: "+1234567891",
      location: "San Francisco, CA",
      website: "https://janesmith.tech", 
      socialLinks: {
        twitter: "https://twitter.com/janesmith",
        github: "https://github.com/janesmith"
      }
    }
  },
  {
    id: "admin_1",
    email: "admin@safeswap.com",
    name: "Admin User",
    role: "admin",
    trustScore: 100,
    kycVerified: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-08-15T12:00:00Z", 
    profile: {
      bio: "SafeSwap platform administrator.",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Admin User",
      phone: "+1234567892",
      location: "Remote",
      website: "https://safeswap.com",
      socialLinks: {}
    }
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