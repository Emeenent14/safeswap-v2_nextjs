import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./src/app/lib/auth";


/**
 * Protected routes that require authentication
 * Maps to Django: Authentication middleware + permission decorators
 */
const PROTECTED_PATHS = [
  "/dashboard",
  "/admin", 
  "/profile",
  "/settings",
  "/savings",
  "/messages",
  "/disputes", 
  "/kyc",
  "/transactions",
  "/deals"
];

/**
 * API routes that require authentication
 * Maps to Django: @login_required decorators on views
 */
const PROTECTED_API_PATHS = [
  "/api/deals",
  "/api/user/profile", 
  "/api/user/trust-score",
  "/api/payments",
  "/api/upload"
];

/**
 * Admin-only routes
 * Maps to Django: @user_passes_test(lambda u: u.is_staff)
 */
const ADMIN_PATHS = [
  "/admin"
];

/**
 * Public routes that don't require authentication
 */
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register", 
  "/verify-email",
  "/verify-phone",
  "/forgot-password",
  "/legal",
  "/public-profile"
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth_token")?.value;

  // Check if route is protected
  const isProtectedPath = PROTECTED_PATHS.some((path) => 
    pathname.startsWith(path)
  );
  
  const isProtectedAPI = PROTECTED_API_PATHS.some((path) => 
    pathname.startsWith(path)
  );
  
  const isAdminPath = ADMIN_PATHS.some((path) => 
    pathname.startsWith(path)
  );

  // Handle API routes
  if (isProtectedAPI) {
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    try {
      const payload = await verifyToken(token);
      
      // Add user info to headers for API routes
      const response = NextResponse.next();
      response.headers.set("x-user-id", payload.sub);
      response.headers.set("x-user-email", payload.email);
      response.headers.set("x-user-role", payload.role || "user");
      
      return response;
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid authentication token" },
        { status: 401 }
      );
    }
  }

  // Handle protected UI routes
  if (isProtectedPath) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const payload = await verifyToken(token);
      
      // Check admin access for admin routes
      if (isAdminPath && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      
      return NextResponse.next();
    } catch (error) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (token && ["/login", "/register"].includes(pathname)) {
    try {
      await verifyToken(token);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch (error) {
      // Invalid token, allow access to auth pages
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

/**
 * Configure which paths the middleware should run on
 * Maps to Django: MIDDLEWARE setting + path matching
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};