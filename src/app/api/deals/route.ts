import { NextRequest, NextResponse } from "next/server";
import { 
  Deal, 
  DealStatus, 
  DealCategory,
  Milestone,
  MilestoneStatus,
  User,
  CreateDealForm,
  ApiResponse,
  PaginatedResponse
} from "@/lib/types";
import { createDealSchema, dealFilterSchema } from "@/lib/validations";
import { requireAuth, getCurrentUser, MOCK_USERS } from "@/lib/auth";

/**
 * Deal Management API Routes
 * Maps to Django: DealViewSet with nested serializers
 * 
 * Django equivalent:
 * - Model: Deal with ForeignKey to User (buyer, seller)
 * - ViewSet: DealViewSet(ModelViewSet) with filtering
 * - Serializer: DealSerializer with nested UserSerializer, MilestoneSerializer
 * - Permissions: IsAuthenticated, custom deal permissions
 * - Filters: django-filter with category, status, amount range
 * - Pagination: PageNumberPagination
 */

// Helper function to safely get user by index
function getUserByIndex(index: number): User {
  const user = MOCK_USERS[index];
  if (!user) {
    throw new Error(`User at index ${index} not found`);
  }
  return user;
}

// Mock deals database
const MOCK_DEALS: Deal[] = [
  {
    id: "deal_1",
    title: "Custom Website Development",
    description: "Need a responsive e-commerce website with payment integration, user authentication, and admin dashboard. Must support mobile devices and have SEO optimization.",
    category: "software" as DealCategory,
    amount: 2500.00,
    currency: "USD",
    buyerId: "user_1",
    sellerId: "user_2",
    buyer: getUserByIndex(0),
    seller: getUserByIndex(1),
    status: "in_progress" as DealStatus,
    escrowAmount: 2500.00,
    escrowFee: 75.00,
    milestones: [
      {
        id: "milestone_1",
        dealId: "deal_1",
        title: "Design & Wireframes",
        description: "Create mockups and wireframes for approval",
        amount: 500.00,
        status: "approved" as MilestoneStatus,
        dueDate: "2024-08-20T00:00:00Z",
        completedAt: "2024-08-18T14:30:00Z",
        approvedAt: "2024-08-19T09:15:00Z",
        order: 1
      },
      {
        id: "milestone_2",
        dealId: "deal_1", 
        title: "Frontend Development",
        description: "Implement responsive UI components",
        amount: 1000.00,
        status: "in_progress" as MilestoneStatus,
        dueDate: "2024-08-28T00:00:00Z",
        order: 2
      },
      {
        id: "milestone_3",
        dealId: "deal_1",
        title: "Backend & Database",
        description: "API development and database setup",
        amount: 800.00,
        status: "pending" as MilestoneStatus,
        dueDate: "2024-09-05T00:00:00Z",
        order: 3
      },
      {
        id: "milestone_4",
        dealId: "deal_1",
        title: "Testing & Deployment",
        description: "Quality assurance and production deployment",
        amount: 200.00,
        status: "pending" as MilestoneStatus,
        dueDate: "2024-09-10T00:00:00Z",
        order: 4
      }
    ],
    messages: [],
    files: [],
    createdAt: "2024-08-15T10:00:00Z",
    updatedAt: "2024-08-19T09:15:00Z",
    paymentIntentId: "pi_1234567890"
  },
  {
    id: "deal_2",
    title: "Logo Design & Branding Package",
    description: "Complete brand identity including logo, color palette, typography guidelines, and business card design. Need vector files and usage guidelines.",
    category: "design" as DealCategory,
    amount: 750.00,
    currency: "USD",
    buyerId: "user_2",
    sellerId: "user_1",
    buyer: getUserByIndex(1),
    seller: getUserByIndex(0),
    status: "completed" as DealStatus,
    escrowAmount: 750.00,
    escrowFee: 22.50,
    milestones: [
      {
        id: "milestone_5",
        dealId: "deal_2",
        title: "Initial Concepts",
        description: "3 logo concepts with variations",
        amount: 250.00,
        status: "approved" as MilestoneStatus,
        dueDate: "2024-08-10T00:00:00Z",
        completedAt: "2024-08-08T16:20:00Z",
        approvedAt: "2024-08-09T11:30:00Z",
        order: 1
      },
      {
        id: "milestone_6",
        dealId: "deal_2",
        title: "Final Logo & Brand Guidelines",
        description: "Refined logo and complete brand package",
        amount: 500.00,
        status: "approved" as MilestoneStatus,
        dueDate: "2024-08-17T00:00:00Z",
        completedAt: "2024-08-16T13:45:00Z",
        approvedAt: "2024-08-17T08:20:00Z",
        order: 2
      }
    ],
    messages: [],
    files: [],
    createdAt: "2024-08-05T14:00:00Z",
    updatedAt: "2024-08-17T08:20:00Z",
    completedAt: "2024-08-17T08:20:00Z"
  },
  {
    id: "deal_3",
    title: "Content Writing for Blog",
    description: "Need 10 SEO-optimized blog posts (1500+ words each) for technology startup. Must include keyword research and meta descriptions.",
    category: "writing" as DealCategory,
    amount: 1200.00,
    currency: "USD",
    buyerId: "user_1",
    sellerId: "user_2",
    buyer: getUserByIndex(0),
    seller: getUserByIndex(1),
    status: "created" as DealStatus,
    escrowAmount: 0,
    escrowFee: 36.00,
    milestones: [
      {
        id: "milestone_7",
        dealId: "deal_3",
        title: "First 3 Articles",
        description: "Initial batch with keyword research",
        amount: 360.00,
        status: "pending" as MilestoneStatus,
        dueDate: "2024-08-30T00:00:00Z",
        order: 1
      },
      {
        id: "milestone_8",
        dealId: "deal_3",
        title: "Next 4 Articles", 
        description: "Mid-batch with optimization",
        amount: 480.00,
        status: "pending" as MilestoneStatus,
        dueDate: "2024-09-10T00:00:00Z",
        order: 2
      },
      {
        id: "milestone_9",
        dealId: "deal_3",
        title: "Final 3 Articles",
        description: "Final batch with revisions",
        amount: 360.00,
        status: "pending" as MilestoneStatus,
        dueDate: "2024-09-20T00:00:00Z",
        order: 3
      }
    ],
    messages: [],
    files: [],
    createdAt: "2024-08-22T09:30:00Z",
    updatedAt: "2024-08-22T09:30:00Z"
  }
];

/**
 * GET /api/deals - List deals with filtering and pagination
 * Maps to Django: DealViewSet.list()
 * Auth: Required (any authenticated user)
 * Permissions: Can see deals where user is buyer or seller
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse and validate filters
    const filters = {
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      status: searchParams.get("status") || "",
      minAmount: searchParams.get("minAmount") ? Number(searchParams.get("minAmount")) : undefined,
      maxAmount: searchParams.get("maxAmount") ? Number(searchParams.get("maxAmount")) : undefined,
      sortBy: searchParams.get("sortBy") || "created_date",
      sortOrder: searchParams.get("sortOrder") || "desc"
    };

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));

    try {
      await dealFilterSchema.validate(filters);
    } catch (validationError) {
      const errorMessage = validationError instanceof Error ? validationError.message : "Invalid filters";
      return NextResponse.json(
        { success: false, message: "Invalid filters", errors: [errorMessage] },
        { status: 400 }
      );
    }

    // Filter deals based on user permissions and filters
    let filteredDeals = MOCK_DEALS.filter(deal => 
      deal.buyerId === user.id || deal.sellerId === user.id
    );

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredDeals = filteredDeals.filter(deal =>
        deal.title.toLowerCase().includes(searchLower) ||
        deal.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filters.category) {
      filteredDeals = filteredDeals.filter(deal => deal.category === filters.category);
    }

    // Apply status filter
    if (filters.status) {
      filteredDeals = filteredDeals.filter(deal => deal.status === filters.status);
    }

    // Apply amount range filters
    if (filters.minAmount !== undefined) {
      filteredDeals = filteredDeals.filter(deal => deal.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      filteredDeals = filteredDeals.filter(deal => deal.amount <= filters.maxAmount!);
    }

    // Apply sorting
    filteredDeals.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (filters.sortBy) {
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "created_date":
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (filters.sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const total = filteredDeals.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedDeals = filteredDeals.slice(offset, offset + limit);

    const response: PaginatedResponse<Deal> = {
      data: paginatedDeals,
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
    console.error("Error fetching deals:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/deals - Create new deal
 * Maps to Django: DealViewSet.create()
 * Auth: Required (authenticated user becomes buyer)
 * Validation: Deal creation schema with milestones
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    // Validate request body
    try {
      await createDealSchema.validate(body, { abortEarly: false });
    } catch (validationError) {
      const errors = (validationError as { inner?: { message: string }[] }).inner?.map(err => err.message) || 
                    [(validationError as Error).message];
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const dealData = body as CreateDealForm;

    // Validate milestone amounts sum equals total amount
    const milestoneTotal = dealData.milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
    if (Math.abs(milestoneTotal - dealData.amount) > 0.01) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Milestone amounts must equal total deal amount",
          errors: [`Expected: $${dealData.amount}, Got: $${milestoneTotal}`]
        },
        { status: 400 }
      );
    }

    // Generate new deal ID
    const dealId = `deal_${Date.now()}`;
    
    // Create milestones
    const milestones: Milestone[] = dealData.milestones.map((milestone, index) => {
      const newMilestone: Milestone = {
        id: `milestone_${dealId}_${index + 1}`,
        dealId,
        title: milestone.title,
        amount: milestone.amount,
        status: "pending" as MilestoneStatus,
        order: index + 1
      };

      // Only add optional properties if they have values
      if (milestone.description !== undefined) {
        newMilestone.description = milestone.description;
      }
      if (milestone.dueDate !== undefined) {
        newMilestone.dueDate = milestone.dueDate;
      }

      return newMilestone;
    });

    // Find seller if specified
    let seller: User | undefined;
    if (dealData.sellerId) {
      seller = MOCK_USERS.find(u => u.id === dealData.sellerId);
      if (!seller) {
        return NextResponse.json(
          { success: false, message: "Seller not found" },
          { status: 404 }
        );
      }
    }

    // Calculate escrow fee (3% of deal amount)
    const escrowFee = dealData.amount * 0.03;

    // Create a default empty user for cases where seller is not specified
    const defaultEmptyUser: User = {
      id: "",
      email: "",
      firstName: "",
      lastName: "",
      trustScore: 0,
      isVerified: false,
      kycStatus: "not_submitted",
      role: "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create new deal
    const newDeal: Deal = {
      id: dealId,
      title: dealData.title,
      description: dealData.description,
      category: dealData.category,
      amount: dealData.amount,
      currency: dealData.currency,
      buyerId: user.id,
      sellerId: dealData.sellerId || "",
      buyer: user,
      seller: seller || defaultEmptyUser,
      status: "created" as DealStatus,
      escrowAmount: 0, // Not funded yet
      escrowFee,
      milestones,
      messages: [],
      files: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In production: Save to database
    MOCK_DEALS.push(newDeal);

    const response: ApiResponse<Deal> = {
      data: newDeal,
      message: "Deal created successfully",
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

    console.error("Error creating deal:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create deal" },
      { status: 500 }
    );
  }
}