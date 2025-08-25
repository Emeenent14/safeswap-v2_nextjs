import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations'
import { 
  findUserByEmail, 
  hashPassword, 
  generateToken, 
  setAuthCookie,
  generateVerificationToken 
} from '@/lib/auth'
import type { RegisterForm, ApiResponse, User } from '@/lib/types'
import { ValidationError } from 'yup'  // 👈 add this

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RegisterForm

    // Validate input schema
    try {
      await registerSchema.validate(body, { abortEarly: false })
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json(
          {
            success: false,
            message: 'Validation failed',
            errors: error.errors
          },
          { status: 400 }
        )
      }
      throw error // 👈 rethrow unexpected errors
    }

    const { email, password, firstName, lastName, phone, termsAccepted } = body

    if (!termsAccepted) {
      return NextResponse.json(
        {
          success: false,
          message: 'You must accept the terms and conditions to create an account'
        },
        { status: 400 }
      )
    }

    const existingUser = findUserByEmail(email.toLowerCase().trim())
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'An account with this email address already exists'
        },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newUser: User = {
      id: userId,
      email: email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim() ?? '',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firstName + ' ' + lastName)}`,
      trustScore: 50,
      isVerified: false,
      kycStatus: 'not_submitted',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const verificationToken = await generateVerificationToken(newUser.id, newUser.email)
    const authToken = await generateToken(newUser)

    const response: ApiResponse<User & { verificationRequired: boolean }> = {
      data: {
        ...newUser,
        verificationRequired: true
      },
      message: `Welcome to SafeSwap, ${firstName}! Please check your email to verify your account.`,
      success: true
    }

    const cookieHeader = setAuthCookie(authToken)
    const nextResponse = NextResponse.json(response, { status: 201 })
    nextResponse.headers.set('Set-Cookie', cookieHeader)

    return nextResponse

  } catch (error) {
    console.error('Registration API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Account creation failed. Please try again.'
      },
      { status: 500 }
    )
  }
}
