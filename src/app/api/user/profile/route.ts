import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, findUserById, generateToken, setAuthCookie } from '@/lib/auth'
import { profileUpdateSchema } from '@/lib/validations'
import type { ApiResponse, User, UserProfile } from '@/lib/types'

/**
 * GET /api/user/profile
 * 
 * Django mapping: GET /api/user/profile/
 * Response: { data: UserProfile, success: boolean }
 * Auth: Required (JWT token in cookie)
 * 
 * Retrieves current user's profile with extended information
 * Equivalent to Django's UserProfileView with serialized user data
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user from JWT token
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required'
        },
        { status: 401 }
      )
    }

    // In production, this would fetch additional profile data from database
    // For now, we'll create mock extended profile data
    const userProfile: UserProfile = {
      ...user,
      bio: user.id === 'user_1' ? 'Experienced freelancer specializing in digital marketing and content creation.' :
           user.id === 'user_2' ? 'Software developer with 5+ years of experience in web applications.' :
           user.id === 'admin_1' ? 'SafeSwap platform administrator.' : '',
      location: user.id === 'user_1' ? 'New York, NY' :
                user.id === 'user_2' ? 'Toronto, ON' :
                user.id === 'admin_1' ? 'San Francisco, CA' : '',
      completedDeals: user.id === 'user_1' ? 23 :
                     user.id === 'user_2' ? 18 :
                     user.id === 'admin_1' ? 0 : 0,
      successRate: user.id === 'user_1' ? 95.7 :
                   user.id === 'user_2' ? 100 :
                   user.id === 'admin_1' ? 0 : 0,
      totalVolume: user.id === 'user_1' ? 45780 :
                   user.id === 'user_2' ? 32150 :
                   user.id === 'admin_1' ? 0 : 0,
      languages: user.id === 'user_1' ? ['English', 'Spanish'] :
                 user.id === 'user_2' ? ['English', 'French'] :
                 user.id === 'admin_1' ? ['English'] : ['English'],
      preferredCategories: user.id === 'user_1' ? ['marketing', 'writing', 'design'] :
                          user.id === 'user_2' ? ['software', 'freelancing'] :
                          user.id === 'admin_1' ? [] : []
    }

    const response: ApiResponse<UserProfile> = {
      data: userProfile,
      success: true
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Get profile API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve profile'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/user/profile
 * 
 * Django mapping: PUT /api/user/profile/
 * Schema: { firstName?: string, lastName?: string, bio?: string, phone?: string, location?: string }
 * Response: { data: UserProfile, message: string, success: boolean }
 * Auth: Required (JWT token in cookie)
 * 
 * Updates current user's profile information
 * Equivalent to Django's UserProfileUpdateView with validation
 */
export async function PUT(request: NextRequest) {
  try {
    // Get current user from JWT token
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required'
        },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input schema
    try {
      await profileUpdateSchema.validate(body, { abortEarly: false })
    } catch (validationError: unknown) {
      // Type guard to check if error has the expected structure
      const isYupError = (error: unknown): error is { errors?: string[] } => {
        return typeof error === 'object' && error !== null && 'errors' in error
      }
      
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: isYupError(validationError) ? validationError.errors || ['Invalid input data'] : ['Invalid input data']
        },
        { status: 400 }
      )
    }

    const { firstName, lastName, bio, phone, location } = body

    // Generate the avatar URL - ensure it's always a string
    const newAvatar = firstName || lastName ? 
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent((firstName || user.firstName) + ' ' + (lastName || user.lastName))}` :
      user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.firstName + ' ' + user.lastName)}`

    // Create updated user object
    const updatedUser: User = {
      ...user,
      firstName: firstName?.trim() || user.firstName,
      lastName: lastName?.trim() || user.lastName,
      phone: phone?.trim() || user.phone,
      avatar: newAvatar,
      updatedAt: new Date().toISOString()
    }

    // In production: await User.update({ id: user.id }, updatedUser)

    // Create updated profile with additional fields
    const updatedProfile: UserProfile = {
      ...updatedUser,
      bio: bio?.trim() || '',
      location: location?.trim() || '',
      // Keep existing extended profile data (in production, fetch from database)
      completedDeals: user.id === 'user_1' ? 23 :
                     user.id === 'user_2' ? 18 : 0,
      successRate: user.id === 'user_1' ? 95.7 :
                   user.id === 'user_2' ? 100 : 0,
      totalVolume: user.id === 'user_1' ? 45780 :
                   user.id === 'user_2' ? 32150 : 0,
      languages: user.id === 'user_1' ? ['English', 'Spanish'] :
                 user.id === 'user_2' ? ['English', 'French'] : ['English'],
      preferredCategories: user.id === 'user_1' ? ['marketing', 'writing', 'design'] :
                          user.id === 'user_2' ? ['software', 'freelancing'] : []
    }

    // Generate new JWT token with updated user data
    const newToken = await generateToken(updatedUser)

    const response: ApiResponse<UserProfile> = {
      data: updatedProfile,
      message: 'Profile updated successfully',
      success: true
    }

    // Set updated auth cookie
    const cookieHeader = setAuthCookie(newToken)
    const nextResponse = NextResponse.json(response, { status: 200 })
    nextResponse.headers.set('Set-Cookie', cookieHeader)

    return nextResponse

  } catch (error) {
    console.error('Update profile API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update profile'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user/profile
 * 
 * Django mapping: DELETE /api/user/profile/
 * Response: { message: string, success: boolean }
 * Auth: Required (JWT token in cookie)
 * 
 * Deletes current user's account (soft delete in production)
 * Equivalent to Django's account deletion with cascade handling
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get current user from JWT token
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required'
        },
        { status: 401 }
      )
    }

    // Check if user has active deals
    // In production: check for active deals, pending transactions, etc.
    // For now, prevent admin account deletion
    if (user.role === 'admin' || user.role === 'super_admin') {
      return NextResponse.json(
        {
          success: false,
          message: 'Admin accounts cannot be deleted through this endpoint'
        },
        { status: 403 }
      )
    }

    // In production: 
    // 1. Check for active deals/transactions
    // 2. Handle or transfer any pending obligations
    // 3. Soft delete user account
    // 4. Send account deletion confirmation email
    // await User.softDelete({ id: user.id })

    const response = {
      success: true,
      message: 'Account deletion request has been processed. You will receive an email confirmation.'
    }

    // Clear auth cookie
    const nextResponse = NextResponse.json(response, { status: 200 })
    nextResponse.headers.set('Set-Cookie', 'auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict;')

    return nextResponse

  } catch (error) {
    console.error('Delete profile API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process account deletion'
      },
      { status: 500 }
    )
  }
}