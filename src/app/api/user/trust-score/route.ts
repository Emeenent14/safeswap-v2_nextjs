import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, findUserById, requireAdmin } from '@/lib/auth'
import type { ApiResponse, TrustScoreUpdate } from '@/lib/types'

/**
 * GET /api/user/trust-score?userId=optional
 * 
 * Django mapping: GET /api/user/trust-score/
 * Query params: { userId?: string }
 * Response: { data: { trustScore: number, updates: TrustScoreUpdate[], breakdown: object }, success: boolean }
 * Auth: Required (JWT token in cookie)
 * 
 * Retrieves trust score information for current user or specified user (admin only)
 * Equivalent to Django's TrustScoreDetailView with calculation breakdown
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required'
        },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const targetUserId = searchParams.get('userId')

    // If requesting another user's trust score, require admin privileges
    if (targetUserId && targetUserId !== currentUser.id) {
      try {
        await requireAdmin(request)
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: 'Admin access required to view other users trust scores'
          },
          { status: 403 }
        )
      }
    }

    const targetUser = targetUserId ? findUserById(targetUserId) : currentUser
    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found'
        },
        { status: 404 }
      )
    }

    // Mock trust score updates (in production, fetch from database)
    const mockUpdates: TrustScoreUpdate[] = [
      {
        id: 'ts_1',
        userId: targetUser.id,
        previousScore: 50,
        newScore: 55,
        reason: 'Account verified with KYC',
        createdAt: '2024-08-10T10:00:00Z'
      },
      {
        id: 'ts_2',
        userId: targetUser.id,
        previousScore: 55,
        newScore: 60,
        reason: 'Completed first deal successfully',
        dealId: 'deal_1',
        createdAt: '2024-08-12T15:30:00Z'
      },
      {
        id: 'ts_3',
        userId: targetUser.id,
        previousScore: 60,
        newScore: targetUser.trustScore,
        reason: 'Consistently positive feedback from buyers',
        createdAt: '2024-08-14T09:20:00Z'
      }
    ]

    // Mock trust score breakdown
    const breakdown = {
      baseScore: 50,
      kycVerification: targetUser.kycStatus === 'approved' ? 10 : 0,
      completedDeals: targetUser.id === 'user_1' ? 23 : targetUser.id === 'user_2' ? 18 : 0,
      dealCompletionBonus: (targetUser.id === 'user_1' ? 23 : targetUser.id === 'user_2' ? 18 : 0) * 2,
      positiveReviews: targetUser.id === 'user_1' ? 15 : targetUser.id === 'user_2' ? 12 : 0,
      onTimeDelivery: targetUser.id === 'user_1' ? 8 : targetUser.id === 'user_2' ? 10 : 0,
      disputePenalties: 0,
      currentScore: targetUser.trustScore
    }

    const response: ApiResponse<{
      trustScore: number
      updates: TrustScoreUpdate[]
      breakdown: typeof breakdown
      trend: 'increasing' | 'stable' | 'decreasing'
      percentile: number
    }> = {
      data: {
        trustScore: targetUser.trustScore,
        updates: mockUpdates,
        breakdown,
        trend: targetUser.trustScore > 70 ? 'increasing' : targetUser.trustScore > 40 ? 'stable' : 'decreasing',
        percentile: Math.min(95, Math.max(5, targetUser.trustScore + Math.random() * 10))
      },
      success: true
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Get trust score API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve trust score information'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user/trust-score
 * 
 * Django mapping: POST /api/admin/trust-score/update/
 * Schema: { userId: string, adjustment: number, reason: string, dealId?: string }
 * Response: { data: TrustScoreUpdate, message: string, success: boolean }
 * Auth: Admin required (JWT token in cookie)
 * 
 * Manually adjusts a user's trust score (admin only)
 * Equivalent to Django's AdminTrustScoreUpdateView with audit logging
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin privileges
    const adminUser = await requireAdmin(request)

    const body = await request.json()
    const { userId, adjustment, reason, dealId } = body

    // Validate input
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID is required'
        },
        { status: 400 }
      )
    }

    if (!adjustment || typeof adjustment !== 'number') {
      return NextResponse.json(
        {
          success: false,
          message: 'Adjustment amount is required and must be a number'
        },
        { status: 400 }
      )
    }

    if (Math.abs(adjustment) > 50) {
      return NextResponse.json(
        {
          success: false,
          message: 'Trust score adjustment cannot exceed ±50 points'
        },
        { status: 400 }
      )
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: 'Reason is required and must be at least 10 characters'
        },
        { status: 400 }
      )
    }

    // Find target user
    const targetUser = findUserById(userId)
    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found'
        },
        { status: 404 }
      )
    }

    // Calculate new trust score
    const previousScore = targetUser.trustScore
    const newScore = Math.max(0, Math.min(100, previousScore + adjustment))

    // Create trust score update record
    const trustScoreUpdate: TrustScoreUpdate = {
      id: `ts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: targetUser.id,
      previousScore,
      newScore,
      reason: reason.trim(),
      dealId: dealId || undefined,
      createdAt: new Date().toISOString()
    }

    // In production: 
    // 1. Update user's trust score in database
    // 2. Create audit log entry
    // 3. Send notification to user if significant change
    // await User.update({ id: userId }, { trustScore: newScore })
    // await TrustScoreUpdate.create(trustScoreUpdate)

    const response: ApiResponse<TrustScoreUpdate & { adminUser: string }> = {
      data: {
        ...trustScoreUpdate,
        adminUser: `${adminUser.firstName} ${adminUser.lastName}`
      },
      message: `Trust score ${adjustment > 0 ? 'increased' : 'decreased'} by ${Math.abs(adjustment)} points`,
      success: true
    }

    return NextResponse.json(response, { status: 200 })

    } catch (error: unknown) {
    if (error instanceof Error) {
        console.error('API error:', error.message)
    } else {
        console.error('API error (non-Error):', error)
    }

    return NextResponse.json(
        {
        success: false,
        message: 'Failed to retrieve trust score history'
        },
        { status: 500 }
    )
    }

}

/**
 * GET /api/user/trust-score/history?userId=required
 * 
 * Django mapping: GET /api/user/trust-score/history/
 * Query params: { userId: string, limit?: number, offset?: number }
 * Response: { data: TrustScoreUpdate[], pagination: object, success: boolean }
 * Auth: Admin required for other users, user can view own history
 * 
 * Retrieves trust score update history
 */
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required'
        },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const targetUserId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!targetUserId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID parameter is required'
        },
        { status: 400 }
      )
    }

    // Check permissions
    if (targetUserId !== currentUser.id) {
      try {
        await requireAdmin(request)
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: 'Admin access required to view other users trust score history'
          },
          { status: 403 }
        )
      }
    }

    // Verify target user exists
    const targetUser = findUserById(targetUserId)
    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found'
        },
        { status: 404 }
      )
    }

    // Mock trust score history (in production, fetch from database with pagination)
    const allUpdates: TrustScoreUpdate[] = [
      {
        id: 'ts_1',
        userId: targetUserId,
        previousScore: 50,
        newScore: 60,
        reason: 'Account verified with KYC documents',
        createdAt: '2024-08-01T10:00:00Z'
      },
      {
        id: 'ts_2',
        userId: targetUserId,
        previousScore: 60,
        newScore: 65,
        reason: 'Successfully completed first deal',
        dealId: 'deal_1',
        createdAt: '2024-08-05T15:30:00Z'
      },
      {
        id: 'ts_3',
        userId: targetUserId,
        previousScore: 65,
        newScore: targetUser.trustScore,
        reason: 'Consistent positive feedback from trading partners',
        createdAt: '2024-08-10T09:20:00Z'
      }
    ]

    const paginatedUpdates = allUpdates.slice(offset, offset + limit)

    const response = {
      data: paginatedUpdates,
      pagination: {
        limit,
        offset,
        total: allUpdates.length,
        hasMore: offset + limit < allUpdates.length
      },
      success: true
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Trust score history API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve trust score history'
      },
      { status: 500 }
    )
  }
}