import { NextRequest, NextResponse } from "next/server";
import { 
  KYCSubmission, 
  KYCStatus,
  ApiResponse,
  User
} from "@/lib/types";
import { requireAdmin, getCurrentUser } from "@/lib/auth";

/**
 * Individual KYC Submission Management API Routes
 * Maps to Django: KYCSubmissionViewSet detail actions and admin review
 * 
 * Django equivalent:
 * - Model: KYCSubmission with status field and admin notes
 * - ViewSet: KYCSubmissionViewSet with custom actions (approve, reject)
 * - Serializer: KYCSubmissionSerializer with admin fields
 * - Permissions: IsAdminUser for review actions
 * - Signals: Post-save signal to update User.kyc_status and send notifications
 * - Audit: Admin action logging with timestamps and reasons
 */

// Import the same mock data from the main KYC route
// In production, this would come from database queries
const MOCK_KYC_SUBMISSIONS: KYCSubmission[] = [
  // ... same mock data as in kyc/route.ts ...
  // This would be replaced with actual database queries
];

/**
 * Helper function to find KYC submission by ID with proper error handling
 */
function findSubmissionById(submissionId: string): KYCSubmission | null {
  const submission = MOCK_KYC_SUBMISSIONS.find(s => s.id === submissionId);
  return submission || null;
}

/**
 * GET /api/kyc/[id] - Get KYC submission by ID
 * Maps to Django: KYCSubmissionViewSet.retrieve()
 * Auth: Required (submission owner or admin)
 * Permissions: User can view own submission, admin can view any
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const submissionId = params.id;
    const submission = findSubmissionById(submissionId);

    if (!submission) {
      return NextResponse.json(
        { success: false, message: "KYC submission not found" },
        { status: 404 }
      );
    }

    // Check permissions - user can only view own submission, admin can view any
    const isOwn = submission.userId === currentUser.id;
    const isAdmin = currentUser.role === "admin" || currentUser.role === "super_admin";

    if (!isOwn && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const response: ApiResponse<KYCSubmission> = {
      data: submission,
      success: true
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error fetching KYC submission:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch KYC submission" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/kyc/[id] - Update KYC submission (Admin only for status changes)
 * Maps to Django: KYCSubmissionViewSet.partial_update()
 * Auth: Required (Admin only for status updates, user for resubmission)
 * Business Logic: Admin can approve/reject, user can resubmit after rejection
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const submissionId = params.id;

    const submission = findSubmissionById(submissionId);
    if (!submission) {
      return NextResponse.json(
        { success: false, message: "KYC submission not found" },
        { status: 404 }
      );
    }

    const isAdmin = currentUser.role === "admin" || currentUser.role === "super_admin";
    const isOwn = submission.userId === currentUser.id;

    // Admin actions (approve/reject)
    if (body.status && isAdmin) {
      const { status, rejectionReason } = body;

      // Validate status transition
      if (!["approved", "rejected", "pending"].includes(status)) {
        return NextResponse.json(
          { success: false, message: "Invalid status" },
          { status: 400 }
        );
      }

      // Rejection must include reason
      if (status === "rejected" && !rejectionReason) {
        return NextResponse.json(
          { success: false, message: "Rejection reason is required" },
          { status: 400 }
        );
      }

      // Update submission
      submission.status = status as KYCStatus;
      submission.reviewedBy = currentUser.id;
      submission.reviewer = currentUser;
      submission.reviewedAt = new Date().toISOString();

      if (status === "rejected") {
        submission.rejectionReason = rejectionReason;
      }

      // In production: Update user's KYC status and send notification
      // await updateUserKYCStatus(submission.userId, status);
      // await sendKYCStatusNotification(submission.userId, status, rejectionReason);

      const message = status === "approved" 
        ? "KYC submission approved successfully"
        : status === "rejected"
        ? "KYC submission rejected"
        : "KYC submission status updated";

      const response: ApiResponse<KYCSubmission> = {
        data: submission,
        message,
        success: true
      };

      return NextResponse.json(response);
    }

    // User resubmission after rejection
    if (isOwn && submission.status === "rejected") {
      const allowedUpdates: (keyof KYCSubmission)[] = [
        "documentType",
        "documentNumber", 
        "documentImages",
        "selfieImage",
        "address",
        "dateOfBirth",
        "nationality"
      ];

      const updateData: Partial<KYCSubmission> = {};
      const typedBody = body as Record<string, unknown>;

      for (const [key, value] of Object.entries(typedBody)) {
        if (allowedUpdates.includes(key as keyof KYCSubmission)) {
          (updateData as Record<string, unknown>)[key] = value;
        }
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { success: false, message: "No valid updates provided" },
          { status: 400 }
        );
      }

      // Reset to pending status for resubmission
      Object.assign(submission, {
        ...updateData,
        status: "pending" as KYCStatus,
        rejectionReason: undefined,
        reviewedBy: undefined,
        reviewer: undefined,
        reviewedAt: undefined,
        submittedAt: new Date().toISOString()
      });

      const response: ApiResponse<KYCSubmission> = {
        data: submission,
        message: "KYC documents resubmitted successfully",
        success: true
      };

      return NextResponse.json(response);
    }

    // No valid actions available
    return NextResponse.json(
      { success: false, message: "No valid updates available for current status" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error updating KYC submission:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update KYC submission" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/kyc/[id] - Delete KYC submission (User only, pending submissions)
 * Maps to Django: KYCSubmissionViewSet.destroy()
 * Auth: Required (submission owner only)
 * Business Logic: Can only delete pending submissions
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const submissionId = params.id;
    const submissionIndex = MOCK_KYC_SUBMISSIONS.findIndex(s => s.id === submissionId);

    if (submissionIndex === -1) {
      return NextResponse.json(
        { success: false, message: "KYC submission not found" },
        { status: 404 }
      );
    }

    const submission = MOCK_KYC_SUBMISSIONS[submissionIndex] as KYCSubmission; // Safe since we checked index exists

    // Check ownership
    if (submission.userId !== currentUser.id) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // Can only delete pending submissions
    if (submission.status !== "pending") {
      return NextResponse.json(
        { 
          success: false, 
          message: "Can only delete pending submissions" 
        },
        { status: 400 }
      );
    }

    // Remove submission
    MOCK_KYC_SUBMISSIONS.splice(submissionIndex, 1);

    const response: ApiResponse<{ success: boolean }> = {
      data: { success: true },
      message: "KYC submission deleted successfully",
      success: true
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error deleting KYC submission:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete KYC submission" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/kyc/[id]/approve - Approve KYC submission (Admin only)
 * Maps to Django: Custom KYCSubmissionViewSet action
 * Auth: Required (Admin only)
 * Business Logic: Approve submission and update user verification status
 */
export async function approveKYC(
  request: NextRequest,
  submissionId: string
): Promise<NextResponse> {
  try {
    const admin = await requireAdmin(request);
    const body = await request.json();
    const { notes } = body;

    const submission = findSubmissionById(submissionId);
    if (!submission) {
      return NextResponse.json(
        { success: false, message: "KYC submission not found" },
        { status: 404 }
      );
    }

    if (submission.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "Submission is not pending review" },
        { status: 400 }
      );
    }

    // Approve submission
    submission.status = "approved" as KYCStatus;
    submission.reviewedBy = admin.id;
    submission.reviewer = admin;
    submission.reviewedAt = new Date().toISOString();

    // In production: 
    // - Update user's KYC status to 'approved'
    // - Update user's isVerified status to true
    // - Send approval notification
    // - Log admin action for audit trail

    const response: ApiResponse<KYCSubmission> = {
      data: submission,
      message: "KYC submission approved successfully",
      success: true
    };

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    console.error("Error approving KYC:", error);
    return NextResponse.json(
      { success: false, message: "Failed to approve KYC submission" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/kyc/[id]/reject - Reject KYC submission (Admin only)
 * Maps to Django: Custom KYCSubmissionViewSet action  
 * Auth: Required (Admin only)
 * Business Logic: Reject submission with reason, allow resubmission
 */
export async function rejectKYC(
  request: NextRequest,
  submissionId: string
): Promise<NextResponse> {
  try {
    const admin = await requireAdmin(request);
    const body = await request.json();
    const { rejectionReason, notes } = body;

    if (!rejectionReason) {
      return NextResponse.json(
        { success: false, message: "Rejection reason is required" },
        { status: 400 }
      );
    }

    const submission = findSubmissionById(submissionId);
    if (!submission) {
      return NextResponse.json(
        { success: false, message: "KYC submission not found" },
        { status: 404 }
      );
    }

    if (submission.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "Submission is not pending review" },
        { status: 400 }
      );
    }

    // Reject submission
    submission.status = "rejected" as KYCStatus;
    submission.rejectionReason = rejectionReason;
    submission.reviewedBy = admin.id;
    submission.reviewer = admin;
    submission.reviewedAt = new Date().toISOString();

    // In production:
    // - Update user's KYC status to 'rejected'
    // - Send rejection notification with reason
    // - Log admin action for audit trail
    // - Allow user to resubmit with corrections

    const response: ApiResponse<KYCSubmission> = {
      data: submission,
      message: "KYC submission rejected",
      success: true
    };

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    console.error("Error rejecting KYC:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reject KYC submission" },
      { status: 500 }
    );
  }
}