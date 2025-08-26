import { NextRequest, NextResponse } from "next/server";
import { 
  KYCSubmission, 
  KYCStatus,
  KYCDocumentType,
  User,
  ApiResponse,
  PaginatedResponse
} from "@/lib/types";
import { kycDocumentSchema } from "@/lib/validations";
import { requireAuth, requireAdmin, getCurrentUser, MOCK_USERS } from "@/lib/auth";

/**
 * KYC (Know Your Customer) Management API Routes
 * Maps to Django: KYCSubmissionViewSet with document upload
 * 
 * Django equivalent:
 * - Model: KYCSubmission with FileField for documents
 * - ViewSet: KYCSubmissionViewSet(ModelViewSet) with custom actions
 * - Serializer: KYCSubmissionSerializer with nested UserSerializer
 * - Permissions: IsAuthenticated for creation, IsAdminUser for review
 * - File Upload: Django's FileSystemStorage or S3 backend
 * - Admin Actions: approve_kyc, reject_kyc with notifications
 */

// Mock KYC submissions database
const MOCK_KYC_SUBMISSIONS: KYCSubmission[] = [
  {
    id: "kyc_1",
    userId: "user_1",
    user: MOCK_USERS[0]!, // Non-null assertion since we know it exists
    documentType: "passport" as KYCDocumentType,
    documentNumber: "AB123456789",
    documentImages: [
      "/uploads/kyc/kyc_1_passport_front.jpg",
      "/uploads/kyc/kyc_1_passport_back.jpg"
    ],
    selfieImage: "/uploads/kyc/kyc_1_selfie.jpg",
    address: "123 Main Street, New York, NY 10001, USA",
    dateOfBirth: "1990-05-15",
    nationality: "United States",
    status: "approved" as KYCStatus,
    reviewedBy: "admin_1",
    reviewer: MOCK_USERS[2]!, // Non-null assertion for admin user
    submittedAt: "2024-08-10T09:00:00Z",
    reviewedAt: "2024-08-12T14:30:00Z"
  },
  {
    id: "kyc_2", 
    userId: "user_2",
    user: MOCK_USERS[1]!, // Non-null assertion since we know it exists
    documentType: "drivers_license" as KYCDocumentType,
    documentNumber: "DL987654321",
    documentImages: [
      "/uploads/kyc/kyc_2_license_front.jpg",
      "/uploads/kyc/kyc_2_license_back.jpg"
    ],
    selfieImage: "/uploads/kyc/kyc_2_selfie.jpg",
    address: "456 Oak Avenue, Los Angeles, CA 90210, USA",
    dateOfBirth: "1985-11-22",
    nationality: "United States", 
    status: "approved" as KYCStatus,
    reviewedBy: "admin_1",
    reviewer: MOCK_USERS[2]!, // Non-null assertion for admin user
    submittedAt: "2024-08-08T16:45:00Z",
    reviewedAt: "2024-08-09T10:20:00Z"
  },
  {
    id: "kyc_3",
    userId: "user_3",
    user: {
      id: "user_3",
      email: "bob@example.com",
      firstName: "Bob",
      lastName: "Johnson",
      phone: "+1234567893",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Bob%20Johnson",
      trustScore: 45,
      isVerified: false,
      kycStatus: 'pending',
      role: "user",
      createdAt: "2024-08-20T12:00:00Z",
      updatedAt: "2024-08-22T10:15:00Z",
    },
    documentType: "national_id" as KYCDocumentType,
    documentNumber: "ID456789123",
    documentImages: [
      "/uploads/kyc/kyc_3_id_front.jpg",
      "/uploads/kyc/kyc_3_id_back.jpg"
    ],
    selfieImage: "/uploads/kyc/kyc_3_selfie.jpg",
    address: "789 Pine Street, Chicago, IL 60601, USA",
    dateOfBirth: "1992-03-08",
    nationality: "United States",
    status: "pending" as KYCStatus,
    submittedAt: "2024-08-22T10:15:00Z"
  },
  {
    id: "kyc_4",
    userId: "user_4", 
    user: {
      id: "user_4",
      email: "alice@example.com",
      firstName: "Alice",
      lastName: "Brown",
      phone: "+1234567894",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Alice%20Brown",
      trustScore: 30,
      isVerified: false,
      kycStatus: 'rejected',
      role: "user",
      createdAt: "2024-08-18T08:30:00Z",
      updatedAt: "2024-08-21T15:45:00Z",
    },
    documentType: "passport" as KYCDocumentType,
    documentNumber: "XY987654321",
    documentImages: [
      "/uploads/kyc/kyc_4_passport_front.jpg"
    ],
    selfieImage: "/uploads/kyc/kyc_4_selfie.jpg",
    address: "321 Elm Street, Miami, FL 33101, USA",
    dateOfBirth: "1995-07-12",
    nationality: "United States",
    status: "rejected" as KYCStatus,
    rejectionReason: "Document image quality too low. Please resubmit with clearer photos.",
    reviewedBy: "admin_1",
    reviewer: MOCK_USERS[2]!, // Non-null assertion for admin user
    submittedAt: "2024-08-19T14:20:00Z",
    reviewedAt: "2024-08-21T15:45:00Z"
  }
];
/**
 * GET /api/kyc - List KYC submissions with filtering (Admin only)
 * Maps to Django: KYCSubmissionViewSet.list()
 * Auth: Required (Admin only)
 * Permissions: Admin users can view all submissions
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const status = searchParams.get("status") as KYCStatus | null;
    const documentType = searchParams.get("documentType") as KYCDocumentType | null;
    const search = searchParams.get("search") || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));

    // Filter submissions
    let filteredSubmissions = [...MOCK_KYC_SUBMISSIONS];

    // Apply status filter
    if (status) {
      filteredSubmissions = filteredSubmissions.filter(submission => 
        submission.status === status
      );
    }

    // Apply document type filter
    if (documentType) {
      filteredSubmissions = filteredSubmissions.filter(submission =>
        submission.documentType === documentType
      );
    }

    // Apply search filter (search by user name, email, or document number)
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSubmissions = filteredSubmissions.filter(submission =>
        submission.user.firstName.toLowerCase().includes(searchLower) ||
        submission.user.lastName.toLowerCase().includes(searchLower) ||
        submission.user.email.toLowerCase().includes(searchLower) ||
        submission.documentNumber.toLowerCase().includes(searchLower)
      );
    }

    // Sort by submission date (newest first)
    filteredSubmissions.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    // Apply pagination
    const total = filteredSubmissions.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedSubmissions = filteredSubmissions.slice(offset, offset + limit);

    const response: PaginatedResponse<KYCSubmission> = {
      data: paginatedSubmissions,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
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

    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    console.error("Error fetching KYC submissions:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch KYC submissions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/kyc - Submit KYC documents for verification
 * Maps to Django: KYCSubmissionViewSet.create()
 * Auth: Required (authenticated user)
 * Validation: Document type, images, and personal information
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);

    // Check if user already has a pending or approved submission
    const existingSubmission = MOCK_KYC_SUBMISSIONS.find(submission =>
      submission.userId === user.id && 
      (submission.status === "pending" || submission.status === "approved")
    );

    if (existingSubmission) {
      const message = existingSubmission.status === "approved" 
        ? "KYC verification already completed"
        : "KYC submission already pending review";
        
      return NextResponse.json(
        { success: false, message },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    try {
      await kycDocumentSchema.validate(body, { abortEarly: false });
    } catch (validationError: unknown) {
      const errors = (validationError as { inner?: Array<{ message: string }>, message?: string }).inner?.map((err) => err.message) || [(validationError as { message: string }).message];
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    // Validate required fields
    const { 
      documentType, 
      documentNumber, 
      documentImages, 
      selfieImage, 
      address, 
      dateOfBirth, 
      nationality 
    } = body;

    if (!documentImages || documentImages.length === 0) {
      return NextResponse.json(
        { success: false, message: "Document images are required" },
        { status: 400 }
      );
    }

    if (!selfieImage) {
      return NextResponse.json(
        { success: false, message: "Selfie image is required" },
        { status: 400 }
      );
    }

    // Validate date of birth (must be 18+ years old)
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (age < 18 || (age === 18 && monthDiff < 0) || 
        (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return NextResponse.json(
        { success: false, message: "You must be at least 18 years old" },
        { status: 400 }
      );
    }

    // Generate new submission ID
    const submissionId = `kyc_${Date.now()}`;

    // Create new KYC submission
    const newSubmission: KYCSubmission = {
      id: submissionId,
      userId: user.id,
      user: user,
      documentType,
      documentNumber,
      documentImages,
      selfieImage,
      address,
      dateOfBirth,
      nationality,
      status: "pending" as KYCStatus,
      submittedAt: new Date().toISOString()
    };

    // In production: Save to database and trigger admin notification
    MOCK_KYC_SUBMISSIONS.push(newSubmission);

    const response: ApiResponse<KYCSubmission> = {
      data: newSubmission,
      message: "KYC documents submitted successfully. Review typically takes 1-3 business days.",
      success: true
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    console.error("Error submitting KYC:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit KYC documents" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/kyc/user/[userId] - Get user's KYC submission (User or Admin)
 * Maps to Django: Custom view for user's own KYC status
 * Auth: Required (user for own submission, admin for any)
 */
export async function getUserKYC(
  request: NextRequest,
  userId: string
): Promise<NextResponse> {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Check permissions - user can only access their own, admin can access any
    const isOwn = currentUser.id === userId;
    const userIsAdmin = currentUser.role === "admin" || currentUser.role === "super_admin";

    if (!isOwn && !userIsAdmin) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // Find user's KYC submission (most recent)
    const userSubmission = MOCK_KYC_SUBMISSIONS
      .filter(submission => submission.userId === userId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];

    if (!userSubmission) {
      return NextResponse.json(
        { success: false, message: "No KYC submission found" },
        { status: 404 }
      );
    }

    const response: ApiResponse<KYCSubmission> = {
      data: userSubmission,
      success: true
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error fetching user KYC:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch KYC submission" },
      { status: 500 }
    );
  }
}