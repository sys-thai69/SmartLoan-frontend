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
  AdminUserDetail,
  RepaymentScheduleItem,
  Notification,
} from '@/types';

// ===========================================
// Auth API
// ===========================================

export const authApi = {
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

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<User>('/users/profile', data);
    return response.data;
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
    interface LoanResponse {
      loan: Loan;
      totalPaid: number;
      remaining: number;
      percentPaid: number;
    }
    const response = await apiClient.get<LoanResponse>(`/loans/${id}`);
    // Backend returns { loan: {...}, totalPaid, remaining, percentPaid }
    // Flatten it to match frontend expectations
    if (response.data.loan) {
      return {
        ...response.data.loan,
        totalPaid: response.data.totalPaid,
        remaining: response.data.remaining,
        percentPaid: response.data.percentPaid,
      };
    }
    return response.data as unknown as LoanWithBalance;
  },

  accept: async (id: string): Promise<Loan> => {
    const response = await apiClient.patch<Loan>(`/loans/${id}/accept`);
    return response.data;
  },

  decline: async (id: string): Promise<Loan> => {
    const response = await apiClient.patch<Loan>(`/loans/${id}/decline`);
    return response.data;
  },

  cancel: async (id: string): Promise<Loan> => {
    const response = await apiClient.patch<Loan>(`/loans/${id}/cancel`);
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

  alertBorrower: async (id: string): Promise<void> => {
    await apiClient.post(`/loans/${id}/alert-borrower`, {});
  },

  sendDueReminder: async (id: string, scheduleId: string, customMessage?: string): Promise<void> => {
    await apiClient.post(`/loans/${id}/send-due-reminder`, {
      scheduleId,
      customMessage,
    });
  },

  sendOverdueAlert: async (id: string): Promise<void> => {
    await apiClient.post(`/loans/${id}/send-overdue-alert`, {});
  },

  report: async (id: string, reason: string): Promise<Loan> => {
    const response = await apiClient.post<Loan>(`/loans/${id}/report`, { reason });
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

  makePayment: async (loanId: string, data: LogPaymentData): Promise<Payment> => {
    const response = await apiClient.post<Payment>(`/loans/${loanId}/payments/pay`, data);
    return response.data;
  },

  initiateAutoDebit: async (loanId: string, data: LogPaymentData): Promise<Payment> => {
    const response = await apiClient.post<Payment>(`/loans/${loanId}/payments/auto-debit`, data);
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
// Notifications API
// ===========================================

export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/notifications');
    return response.data;
  },

  getUnread: async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/notifications/unread');
    return response.data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
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

  getUserDetail: async (id: string): Promise<AdminUserDetail> => {
    const response = await apiClient.get<AdminUserDetail>(`/admin/users/${id}`);
    return response.data;
  },

  getAllLoans: async (): Promise<Loan[]> => {
    const response = await apiClient.get<Loan[]>('/admin/loans');
    return response.data;
  },

  flagLoan: async (id: string): Promise<Loan> => {
    const response = await apiClient.patch<Loan>(`/admin/loans/${id}/flag`);
    return response.data;
  },

  unflagLoan: async (id: string): Promise<Loan> => {
    const response = await apiClient.patch<Loan>(`/admin/loans/${id}/unflag`);
    return response.data;
  },

  setUserRole: async (userId: string, role: 'user' | 'admin'): Promise<UserWithStats> => {
    const response = await apiClient.patch<UserWithStats>(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  bootstrap: async (key: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/admin/bootstrap', { key });
    return response.data;
  },
};

