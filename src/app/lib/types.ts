// SafeSwap Core Types
// Shared TypeScript interfaces used across the application

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  trustScore: number;
  isVerified: boolean;
  kycStatus: KYCStatus;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  completedDeals: number;
  successRate: number;
  totalVolume: number;
  languages: string[];
  preferredCategories: string[];
}

export type UserRole = 'user' | 'admin' | 'super_admin';

export type KYCStatus = 'pending' | 'approved' | 'rejected' | 'not_submitted';

export interface Deal {
  id: string;
  title: string;
  description: string;
  category: DealCategory;
  amount: number;
  currency: string;
  buyerId: string;
  sellerId: string;
  buyer: User;
  seller: User;
  status: DealStatus;
  escrowAmount: number;
  escrowFee: number;
  milestones: Milestone[];
  messages: Message[];
  files: DealFile[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  disputeId?: string;
  paymentIntentId?: string;
}

export type DealStatus = 
  | 'created'
  | 'accepted'
  | 'funded'
  | 'in_progress'
  | 'milestone_completed'
  | 'completed'
  | 'cancelled'
  | 'disputed'
  | 'refunded';

export type DealCategory = 
  | 'digital_services'
  | 'freelancing' 
  | 'goods'
  | 'consulting'
  | 'software'
  | 'design'
  | 'marketing'
  | 'writing'
  | 'other';

export interface Milestone {
  id: string;
  dealId: string;
  title: string;
  description?: string;
  amount: number;
  status: MilestoneStatus;
  dueDate?: string;
  completedAt?: string;
  approvedAt?: string;
  order: number;
}

export type MilestoneStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'approved'
  | 'disputed';

export interface Message {
  id: string;
  dealId: string;
  senderId: string;
  sender: User;
  content: string;
  type: MessageType;
  files?: MessageFile[];
  createdAt: string;
  readAt?: string;
}

export type MessageType = 'text' | 'system' | 'milestone' | 'dispute';

export interface MessageFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface DealFile {
  id: string;
  dealId: string;
  uploadedBy: string;
  name: string;
  size: number;
  type: string;
  url: string;
  description?: string;
  uploadedAt: string;
}

export interface Transaction {
  id: string;
  dealId?: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  stripeIntentId?: string;
  description: string;
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
  refundedAt?: string;
}

export type TransactionType = 
  | 'escrow_deposit'
  | 'escrow_release'
  | 'escrow_refund'
  | 'fee_payment'
  | 'savings_deposit'
  | 'savings_withdrawal'
  | 'peer_transfer';

export type TransactionStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface Dispute {
  id: string;
  dealId: string;
  deal: Deal;
  initiatedBy: string;
  initiator: User;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  resolution?: string;
  resolvedBy?: string;
  resolver?: User;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  evidence: DisputeEvidence[];
}

export type DisputeReason = 
  | 'non_delivery'
  | 'quality_issues'
  | 'communication_breakdown'
  | 'payment_issues'
  | 'fraudulent_activity'
  | 'other';

export type DisputeStatus = 
  | 'open'
  | 'investigating'
  | 'awaiting_response'
  | 'resolved_buyer'
  | 'resolved_seller'
  | 'resolved_split'
  | 'closed';

export interface DisputeEvidence {
  id: string;
  disputeId: string;
  submittedBy: string;
  submitter: User;
  type: EvidenceType;
  description: string;
  files: MessageFile[];
  submittedAt: string;
}

export type EvidenceType = 'screenshot' | 'document' | 'communication' | 'other';

export interface Savings {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isLocked: boolean;
  lockAmount?: number;
  lockDuration?: number;
  lockStartDate?: string;
  lockEndDate?: string;
  interestRate: number;
  totalEarned: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsTransfer {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: User;
  toUser: User;
  amount: number;
  currency: string;
  message?: string;
  status: TransactionStatus;
  createdAt: string;
  completedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown> ; //dont forget to check the type before use
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export type NotificationType = 
  | 'deal_created'
  | 'deal_accepted'
  | 'deal_funded'
  | 'milestone_completed'
  | 'milestone_approved'
  | 'deal_completed'
  | 'dispute_created'
  | 'dispute_resolved'
  | 'payment_received'
  | 'message_received'
  | 'trust_score_updated'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'savings_interest'
  | 'system_announcement';

export interface KYCSubmission {
  id: string;
  userId: string;
  user: User;
  documentType: KYCDocumentType;
  documentNumber: string;
  documentImages: string[];
  selfieImage: string;
  address: string;
  dateOfBirth: string;
  nationality: string;
  status: KYCStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewer?: User;
  submittedAt: string;
  reviewedAt?: string;
}

export type KYCDocumentType = 'passport' | 'drivers_license' | 'national_id';

export interface TrustScoreUpdate {
  id: string;
  userId: string;
  previousScore: number;
  newScore: number;
  reason: string;
  dealId?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  field?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  termsAccepted: boolean;
}

export interface CreateDealForm {
  title: string;
  description: string;
  category: DealCategory;
  amount: number;
  currency: string;
  sellerId?: string;
  milestones: CreateMilestoneForm[];
}

export interface CreateMilestoneForm {
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
}

export interface DisputeForm {
  reason: DisputeReason;
  description: string;
  evidence: File[];
}

// UI/State Types
export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
}

export interface ErrorState {
  hasError: boolean;
  error?: string | ApiError[];
}

export interface ModalState {
  isOpen: boolean;
  data?: unknown; //dont forget to check the type before use
}

export interface TabState {
  activeTab: string;
}

// Stripe Types
export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'message' | 'notification' | 'deal_update' | 'typing';
  data: unknown;// dont forget to check the type before use
  timestamp: string;
}

// Search/Filter Types
export interface DealFilters {
  category?: DealCategory | undefined;
  minAmount?: number | undefined;
  maxAmount?: number | undefined;
  status?: DealStatus | undefined;
  userId?: string | undefined;
  search?: string | undefined;
}

export interface UserFilters {
  role?: UserRole;
  kycStatus?: KYCStatus;
  minTrustScore?: number;
  search?: string;
}