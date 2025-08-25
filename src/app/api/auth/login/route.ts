import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations'
import { 
  findUserByEmail, 
  verifyPassword, 
  generateToken, 
  setAuthCookie,
  MOCK_PASSWORD_HASH 
} from '@/lib/auth'
import type { LoginForm, ApiResponse, User } from '@/lib/types'

/**
 * POST /api/auth/login
 * 
 * Django mapping: POST /api/auth/login/
 * Schema: { email: string, password: string, remember?: boolean }
 * Response: { data: User, message: string, success: boolean }
 * Auth: None required (public endpoint)
 * 
 * Authenticates user with email/password and returns JWT token via HTTP-only cookie
 * Equivalent to Django's TokenObtainPairView with custom user serialization
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LoginForm

    // Validate input schema
    // Validate input schema
        try {
        await loginSchema.validate(body, { abortEarly: false })
        } catch (error: unknown) {
        const validationError = error as { errors?: string[] }

        return NextResponse.json(
            {
            success: false,
            message: 'Validation failed',
            errors: validationError.errors || ['Invalid input data']
            },
            { status: 400 }
        )
        }


    const { email, password, remember = false } = body

    // Find user by email
    const user = findUserByEmail(email.toLowerCase().trim())
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password'
        },
        { status: 401 }
      )
    }

    // Verify password (mock implementation uses same hash for all users)
    const isValidPassword = await verifyPassword(password, MOCK_PASSWORD_HASH)
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password'
        },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = await generateToken(user)

    // Create response with user data
    const response: ApiResponse<User> = {
      data: user,
      message: `Welcome back, ${user.firstName}!`,
      success: true
    }

    // Set HTTP-only cookie with token
    const cookieHeader = setAuthCookie(token)
    const nextResponse = NextResponse.json(response, { status: 200 })
    
    // Apply cookie header
    nextResponse.headers.set('Set-Cookie', cookieHeader)

    return nextResponse

  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Authentication failed. Please try again.'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/login
 * 
 * Django mapping: GET /api/auth/login/ (method not allowed)
 * Returns method not allowed for GET requests
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed. Use POST to login.'
    },
    { status: 405 }
  )
}