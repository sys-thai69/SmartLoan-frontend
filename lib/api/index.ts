import apiClient from './client';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Loan,
  LoanWithBalance,
  CreateLoanData,
  QuickLendData,
  Payment,
  LogPaymentData,
  WalletWithTransactions,
  TopUpData,
  TransferData,
  LoanTemplate,
  CreateTemplateData,
  ParseLoanRequest,
  ParseLoanResponse,
  PlatformStats,
  UserWithStats,
  RepaymentScheduleItem,
  OtpResponse,
} from '@/types';

// ===========================================
// Auth API
// ===========================================

export const authApi = {
  sendEmailOtp: async (email: string): Promise<OtpResponse> => {
    const response = await apiClient.post<OtpResponse>('/auth/send-email-otp', { email });
    return response.data;
  },

  sendSmsOtp: async (phoneNumber: string): Promise<OtpResponse> => {
    const response = await apiClient.post<OtpResponse>('/auth/send-sms-otp', { phoneNumber });
    return response.data;
  },

  verifyOtp: async (target: string, type: 'EMAIL' | 'SMS', code: string): Promise<OtpResponse> => {
    const response = await apiClient.post<OtpResponse>('/auth/verify-otp', { target, type, code });
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};

// ===========================================
// Loans API
// ===========================================

export const loansApi = {
  create: async (data: CreateLoanData): Promise<Loan> => {
    const response = await apiClient.post<Loan>('/loans', data);
    return response.data;
  },

  quickLend: async (data: QuickLendData): Promise<Loan> => {
    const response = await apiClient.post<Loan>('/loans/quick', data);
    return response.data;
  },

  getMyLoans: async (): Promise<Loan[]> => {
    const response = await apiClient.get<Loan[]>('/loans/mine');
    return response.data;
  },

  getById: async (id: string): Promise<LoanWithBalance> => {
    const response = await apiClient.get<LoanWithBalance>(`/loans/${id}`);
    return response.data;
  },

  accept: async (id: string): Promise<Loan> => {
    const response = await apiClient.patch<Loan>(`/loans/${id}/accept`);
    return response.data;
  },

  decline: async (id: string): Promise<Loan> => {
    const response = await apiClient.patch<Loan>(`/loans/${id}/decline`);
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<Loan> => {
    const response = await apiClient.patch<Loan>(`/loans/${id}/status`, { status });
    return response.data;
  },

  getOverdue: async (): Promise<RepaymentScheduleItem[]> => {
    const response = await apiClient.get<RepaymentScheduleItem[]>('/loans/overdue');
    return response.data;
  },
};

// ===========================================
// Payments API
// ===========================================

export const paymentsApi = {
  logPayment: async (loanId: string, data: LogPaymentData): Promise<Payment> => {
    const response = await apiClient.post<Payment>(`/loans/${loanId}/payments`, data);
    return response.data;
  },

  getPayments: async (loanId: string): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>(`/loans/${loanId}/payments`);
    return response.data;
  },

  deletePayment: async (loanId: string, paymentId: string): Promise<void> => {
    await apiClient.delete(`/loans/${loanId}/payments/${paymentId}`);
  },
};

// ===========================================
// Wallet API
// ===========================================

export const walletApi = {
  getMyWallet: async (): Promise<WalletWithTransactions> => {
    const response = await apiClient.get<WalletWithTransactions>('/wallet/me');
    return response.data;
  },

  topUp: async (data: TopUpData): Promise<WalletWithTransactions> => {
    const response = await apiClient.post<WalletWithTransactions>('/wallet/topup', data);
    return response.data;
  },

  transfer: async (data: TransferData): Promise<WalletWithTransactions> => {
    const response = await apiClient.post<WalletWithTransactions>('/wallet/transfer', data);
    return response.data;
  },
};

// ===========================================
// Templates API
// ===========================================

export const templatesApi = {
  getAll: async (): Promise<LoanTemplate[]> => {
    const response = await apiClient.get<LoanTemplate[]>('/templates');
    return response.data;
  },

  create: async (data: CreateTemplateData): Promise<LoanTemplate> => {
    const response = await apiClient.post<LoanTemplate>('/templates', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/templates/${id}`);
  },
};

// ===========================================
// AI API - Natural Language Loan Parser
// ===========================================

export const aiApi = {
  /**
   * Parse natural language loan input into structured fields
   * Example: "lend Channy $20, pay back in 2 weeks, no interest"
   * Returns: { borrowerName, amount, duration, interestRate, parsed }
   */
  parseLoan: async (data: ParseLoanRequest): Promise<ParseLoanResponse> => {
    const response = await apiClient.post<ParseLoanResponse>('/ai/parse-loan', data);
    return response.data;
  },
};

// ===========================================
// Admin API
// ===========================================

export const adminApi = {
  getStats: async (): Promise<PlatformStats> => {
    const response = await apiClient.get<PlatformStats>('/admin/stats');
    return response.data;
  },

  getUsers: async (): Promise<UserWithStats[]> => {
    const response = await apiClient.get<UserWithStats[]>('/admin/users');
    return response.data;
  },

  flagLoan: async (id: string): Promise<Loan> => {
    const response = await apiClient.patch<Loan>(`/admin/loans/${id}/flag`);
    return response.data;
  },
};
