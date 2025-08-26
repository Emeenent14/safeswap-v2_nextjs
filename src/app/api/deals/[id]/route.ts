import { NextRequest, NextResponse } from "next/server";
import { 
  Deal, 
  DealStatus, 
  MilestoneStatus,
  ApiResponse
} from "@/lib/types";
import { requireAuth, getCurrentUser, isAdmin } from "@/lib/auth";

/**
 * Individual Deal Management API Routes
 * Maps to Django: DealViewSet detail actions (retrieve, update, destroy, custom actions)
 * 
 * Django equivalent:
 * - Model: Deal with custom methods for status transitions
 * - ViewSet: DealViewSet with custom actions (accept, reject, cancel, fund, complete)
 * - Serializer: DealSerializer with nested relationships
 * - Permissions: IsAuthenticated + custom deal permissions (IsParticipant)
 * - Validations: Custom clean methods for status transitions
 */

// Import the same mock data from the main deals route
// In production, this would come from database
const MOCK_DEALS: Deal[] = [
  // ... same mock data as in deals/route.ts ...
  // This would be replaced with actual database queries
];

/**
 * Helper function to find deal by ID with proper error handling
 */
function findDealById(dealId: string): Deal | null {
  const deal = MOCK_DEALS.find(d => d.id === dealId);
  return deal || null;
}

/**
 * GET /api/deals/[id] - Get deal by ID
 * Maps to Django: DealViewSet.retrieve()
 * Auth: Required (deal participants or admin)
 * Permissions: User must be buyer, seller, or admin
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const dealId = params.id;
    const deal = findDealById(dealId);

    if (!deal) {
      return NextResponse.json(
        { success: false, message: "Deal not found" },
        { status: 404 }
      );
    }

    // Check permissions - user must be participant or admin
    const isParticipant = deal.buyerId === user.id || deal.sellerId === user.id;
    const userIsAdmin = await isAdmin(request);
    
    if (!isParticipant && !userIsAdmin) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const response: ApiResponse<Deal> = {
      data: deal,
      success: true
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error fetching deal:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch deal" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/deals/[id] - Update deal (limited fields based on status)
 * Maps to Django: DealViewSet.partial_update()
 * Auth: Required (deal participants)
 * Permissions: Limited updates based on deal status and user role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const dealId = params.id;

    const deal = findDealById(dealId);
    if (!deal) {
      return NextResponse.json(
        { success: false, message: "Deal not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const isParticipant = deal.buyerId === user.id || deal.sellerId === user.id;
    const userIsAdmin = await isAdmin(request);
    
    if (!isParticipant && !userIsAdmin) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // Only allow certain updates based on deal status and user role
    const allowedUpdates: (keyof Deal)[] = [];
    
    if (deal.status === "created" && deal.buyerId === user.id) {
      allowedUpdates.push("title", "description", "milestones");
    }
    
    if (userIsAdmin) {
      allowedUpdates.push("status");
    }

    // Filter body to only include allowed updates with proper typing
    const updateData: Partial<Deal> = {};
    
    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
      if (allowedUpdates.includes(key as keyof Deal)) {
        (updateData as Record<string, unknown>)[key] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid updates provided" },
        { status: 400 }
      );
    }

    // Apply updates
    Object.assign(deal, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    const response: ApiResponse<Deal> = {
      data: deal,
      message: "Deal updated successfully",
      success: true
    };

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    console.error("Error updating deal:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update deal" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/deals/[id] - Delete/Cancel deal
 * Maps to Django: DealViewSet.destroy() with business logic
 * Auth: Required (deal participants or admin)
 * Permissions: Can only cancel deals in early stages
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    const dealId = params.id;

    const dealIndex = MOCK_DEALS.findIndex(d => d.id === dealId);
    if (dealIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Deal not found" },
        { status: 404 }
      );
    }

    const deal = MOCK_DEALS[dealIndex] as Deal; // Type assertion since we know it exists

    // Check permissions
    const isParticipant = deal.buyerId === user.id || deal.sellerId === user.id;
    const userIsAdmin = await isAdmin(request);
    
    if (!isParticipant && !userIsAdmin) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // Can only cancel deals that haven't been funded
    if (deal.status !== "created" && deal.status !== "accepted" && !userIsAdmin) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Deal cannot be cancelled at this stage" 
        },
        { status: 400 }
      );
    }

    // Update status to cancelled instead of actually deleting
    deal.status = "cancelled" as DealStatus;
    deal.updatedAt = new Date().toISOString();

    const response: ApiResponse<{ success: boolean }> = {
      data: { success: true },
      message: "Deal cancelled successfully",
      success: true
    };

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    console.error("Error deleting deal:", error);
    return NextResponse.json(
      { success: false, message: "Failed to cancel deal" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/deals/[id]/accept - Accept deal (seller only)
 * Maps to Django: Custom DealViewSet action
 * Auth: Required (seller only)
 * Business Logic: Changes status from 'created' to 'accepted'
 */
export async function acceptDeal(
  request: NextRequest,
  dealId: string
): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    const deal = findDealById(dealId);

    if (!deal) {
      return NextResponse.json(
        { success: false, message: "Deal not found" },
        { status: 404 }
      );
    }

    if (deal.sellerId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Only the seller can accept this deal" },
        { status: 403 }
      );
    }

    if (deal.status !== "created") {
      return NextResponse.json(
        { success: false, message: "Deal cannot be accepted in current status" },
        { status: 400 }
      );
    }

    // Update deal status
    deal.status = "accepted" as DealStatus;
    deal.updatedAt = new Date().toISOString();

    const response: ApiResponse<Deal> = {
      data: deal,
      message: "Deal accepted successfully",
      success: true
    };

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    console.error("Error accepting deal:", error);
    return NextResponse.json(
      { success: false, message: "Failed to accept deal" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/deals/[id]/fund - Fund escrow (buyer only)
 * Maps to Django: Custom DealViewSet action with Stripe integration
 * Auth: Required (buyer only)
 * Business Logic: Changes status from 'accepted' to 'funded', locks escrow
 */
export async function fundDeal(
  request: NextRequest,
  dealId: string
): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { paymentMethodId } = body;

    if (!paymentMethodId) {
      return NextResponse.json(
        { success: false, message: "Payment method required" },
        { status: 400 }
      );
    }

    const deal = findDealById(dealId);
    if (!deal) {
      return NextResponse.json(
        { success: false, message: "Deal not found" },
        { status: 404 }
      );
    }

    if (deal.buyerId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Only the buyer can fund this deal" },
        { status: 403 }
      );
    }

    if (deal.status !== "accepted") {
      return NextResponse.json(
        { success: false, message: "Deal must be accepted before funding" },
        { status: 400 }
      );
    }

    // In production: Process payment with Stripe
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round((deal.amount + deal.escrowFee) * 100),
    //   currency: deal.currency.toLowerCase(),
    //   payment_method: paymentMethodId,
    //   confirm: true
    // });

    // Mock successful payment
    const paymentIntentId = `pi_mock_${Date.now()}`;

    // Update deal status and escrow
    deal.status = "funded" as DealStatus;
    deal.escrowAmount = deal.amount;
    deal.paymentIntentId = paymentIntentId;
    deal.updatedAt = new Date().toISOString();

    // Update first milestone to in_progress
    if (deal.milestones && deal.milestones.length > 0) {
      deal.milestones[0]!.status = "in_progress" as MilestoneStatus;
    }

    const response: ApiResponse<Deal> = {
      data: deal,
      message: "Deal funded successfully",
      success: true
    };

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    console.error("Error funding deal:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fund deal" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/deals/[id]/milestones/[milestoneId]/complete - Complete milestone
 * Maps to Django: Custom MilestoneViewSet action  
 * Auth: Required (seller only)
 * Business Logic: Mark milestone as completed, await buyer approval
 */
export async function completeMilestone(
  request: NextRequest,
  dealId: string,
  milestoneId: string
): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    const deal = findDealById(dealId);

    if (!deal) {
      return NextResponse.json(
        { success: false, message: "Deal not found" },
        { status: 404 }
      );
    }

    if (deal.sellerId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Only the seller can complete milestones" },
        { status: 403 }
      );
    }

    const milestone = deal.milestones?.find(m => m.id === milestoneId);
    if (!milestone) {
      return NextResponse.json(
        { success: false, message: "Milestone not found" },
        { status: 404 }
      );
    }

    if (milestone.status !== "in_progress") {
      return NextResponse.json(
        { success: false, message: "Milestone is not in progress" },
        { status: 400 }
      );
    }

    // Mark milestone as completed
    milestone.status = "completed" as MilestoneStatus;
    milestone.completedAt = new Date().toISOString();
    deal.updatedAt = new Date().toISOString();

    // Update deal status
    if (deal.status === "funded") {
      deal.status = "in_progress" as DealStatus;
    } else if (deal.status === "in_progress") {
      deal.status = "milestone_completed" as DealStatus;
    }

    const response: ApiResponse<Deal> = {
      data: deal,
      message: "Milestone completed successfully",
      success: true
    };

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    console.error("Error completing milestone:", error);
    return NextResponse.json(
      { success: false, message: "Failed to complete milestone" },
      { status: 500 }
    );
  }
}