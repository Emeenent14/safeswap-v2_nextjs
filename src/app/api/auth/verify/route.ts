import { NextRequest, NextResponse } from 'next/server'
import { 
  verifyEmailToken, 
  generateVerificationToken, 
  findUserById,
  findUserByEmail,
  generateToken,
  setAuthCookie
} from '@/lib/auth'
import type { ApiResponse, User } from '@/lib/types'

/**
 * POST /api/auth/verify
 * 
 * Django mapping: POST /api/auth/verify-email/
 * Schema: { token: string, type: 'email' | 'phone' }
 * Response: { data: User, message: string, success: boolean }
 * Auth: None required (public endpoint with token validation)
 * 
 * Verifies user email or phone with token
 * Equivalent to Django's email verification view with token validation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, type = 'email' } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Verification token is required'
        },
        { status: 400 }
      )
    }

    if (type !== 'email' && type !== 'phone') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid verification type. Must be "email" or "phone"'
        },
        { status: 400 }
      )
    }

    try {
      // Verify the token (currently only email verification implemented)
      const { userId, email } = await verifyEmailToken(token)

      // Find user by ID
      const user = findUserById(userId)
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: 'User not found'
          },
          { status: 404 }
        )
      }

      // Check if email matches
      if (user.email !== email) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid verification token'
          },
          { status: 400 }
        )
      }

      // Update user verification status (in production, this would update the database)
      const updatedUser: User = {
        ...user,
        isVerified: true,
        updatedAt: new Date().toISOString()
      }

      // In production: await User.update({ id: userId }, { isVerified: true, emailVerifiedAt: new Date() })

      // Generate new JWT token with updated user info
      const authToken = await generateToken(updatedUser)

      const response: ApiResponse<User> = {
        data: updatedUser,
        message: type === 'email' 
          ? 'Email verified successfully! Your account is now active.'
          : 'Phone number verified successfully!',
        success: true
      }

      // Set updated auth cookie
      const cookieHeader = setAuthCookie(authToken)
      const nextResponse = NextResponse.json(response, { status: 200 })
      nextResponse.headers.set('Set-Cookie', cookieHeader)

      return nextResponse

    } catch (tokenError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired verification token'
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Verification API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Verification failed. Please try again.'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/verify?type=email&email=user@example.com
 * 
 * Django mapping: POST /api/auth/resend-verification/
 * Query params: { type: 'email' | 'phone', email: string }
 * Response: { message: string, success: boolean }
 * Auth: None required (public endpoint)
 * 
 * Resends verification token for email or phone
 * Equivalent to Django's resend verification view
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') as 'email' | 'phone'
    const email = searchParams.get('email')

    if (!type || !email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Type and email parameters are required'
        },
        { status: 400 }
      )
    }

    if (type !== 'email' && type !== 'phone') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid verification type. Must be "email" or "phone"'
        },
        { status: 400 }
      )
    }

    // Find user by email
    const user = findUserByEmail(email.toLowerCase().trim())
    if (!user) {
      // Return success message even if user not found (security best practice)
      return NextResponse.json(
        {
          success: true,
          message: `If an account exists with this email, a verification ${type === 'email' ? 'email' : 'SMS'} will be sent.`
        },
        { status: 200 }
      )
    }

    // Check if already verified
    if (type === 'email' && user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message: 'This account is already verified'
        },
        { status: 400 }
      )
    }

    // Generate new verification token
    const verificationToken = await generateVerificationToken(user.id, user.email)

    // In production: send verification email/SMS here
    // if (type === 'email') {
    //   await sendVerificationEmail(user.email, verificationToken)
    // } else {
    //   await sendVerificationSMS(user.phone, verificationToken)
    // }

    return NextResponse.json(
      {
        success: true,
        message: `Verification ${type === 'email' ? 'email' : 'SMS'} has been sent successfully.`
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Resend verification API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to resend verification. Please try again.'
      },
      { status: 500 }
    )
  }
}