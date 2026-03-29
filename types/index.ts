// ===========================================
// User & Auth Types
// ===========================================

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  trustScore: number;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phoneNumber?: string;
  password: string;
}

// ===========================================
// Loan Types
// ===========================================

export type LoanStatus =
  | 'pending_acceptance'
  | 'active'
  | 'overdue'
  | 'completed'
  | 'declined';

export type LoanFrequency = 'weekly' | 'monthly';

export interface Loan {
  id: string;
  lenderId: string;
  borrowerId: string;
  lender?: User;
  borrower?: User;
  principal: number;
  interestRate: number;
  totalAmount: number;
  installments: number;
  frequency: LoanFrequency;
  startDate: string;
  status: LoanStatus;
  autoDebit: boolean;
  isQuickLend: boolean;
  templateId?: string;
  createdAt: string;
  schedule?: RepaymentScheduleItem[];
  payments?: Payment[];
}

export interface LoanWithBalance extends Loan {
  totalPaid: number;
  remaining: number;
  percentPaid: number;
}

export interface CreateLoanData {
  borrowerEmail: string;
  principal: number;
  interestRate?: number;
  installments: number;
  frequency: LoanFrequency;
  startDate: string;
  autoDebit?: boolean;
  templateId?: string;
}

export interface QuickLendData {
  borrowerEmail: string;
  amount: number;
  templateId?: string;
}

// ===========================================
// Repayment Schedule Types
// ===========================================

export interface RepaymentScheduleItem {
  id: string;
  loanId: string;
  installmentNo: number;
  dueDate: string;
  amountDue: number;
  isPaid: boolean;
  paidAt?: string;
}

// ===========================================
// Payment Types
// ===========================================

export type PaymentType = 'manual' | 'auto_debit';

export interface Payment {
  id: string;
  loanId: string;
  paidBy: string;
  scheduleId?: string;
  amount: number;
  paymentDate: string;
  note?: string;
  type: PaymentType;
  createdAt: string;
}

export interface LogPaymentData {
  amount: number;
  paymentDate: string;
  note?: string;
  scheduleId?: string;
}

// ===========================================
// Wallet Types
// ===========================================

export type TransactionType = 'topup' | 'transfer' | 'auto_debit' | 'refund';

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  fromUser?: string;
  toUser: string;
  amount: number;
  type: TransactionType;
  loanId?: string;
  note?: string;
  createdAt: string;
}

export interface WalletWithTransactions extends Wallet {
  transactions: WalletTransaction[];
}

export interface TopUpData {
  amount: number;
}

export interface TransferData {
  toUserId: string;
  amount: number;
  note?: string;
}

// ===========================================
// Loan Template Types
// ===========================================

export interface LoanTemplate {
  id: string;
  userId: string;
  templateName: string;
  interestRate: number;
  frequency: LoanFrequency;
  installments: number;
  autoDebit: boolean;
  createdAt: string;
}

export interface CreateTemplateData {
  templateName: string;
  interestRate?: number;
  frequency: LoanFrequency;
  installments: number;
  autoDebit?: boolean;
}

// ===========================================
// AI Types - Natural Language Loan Parser
// ===========================================

export interface ParseLoanRequest {
  text: string;
}

export interface ParseLoanResponse {
  borrowerName?: string;
  borrowerEmail?: string;
  amount?: number;
  duration?: string;
  interestRate?: number;
  installments?: number;
  frequency?: string;
  parsed: boolean;
}

// ===========================================
// Admin Types
// ===========================================

export interface PlatformStats {
  totalUsers: number;
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  totalVolume: number;
  completedLoans: number;
}

export interface UserWithStats extends User {
  loanCount: number;
  borrowCount: number;
}

// ===========================================
// API Response Types
// ===========================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
