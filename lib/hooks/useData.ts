import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { loansApi, walletApi, templatesApi, adminApi, paymentsApi } from '@/lib/api';
import type {
  Loan,
  LoanWithBalance,
  WalletWithTransactions,
  LoanTemplate,
  PlatformStats,
  UserWithStats,
  RepaymentScheduleItem,
  Payment,
  CreateLoanData,
  QuickLendData,
  TopUpData,
  TransferData,
  CreateTemplateData,
  LogPaymentData,
} from '@/types';

// SWR Configuration
export const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000, // 5 seconds
  errorRetryCount: 3,
};

// ===========================================
// Loans Hooks
// ===========================================

export function useMyLoans() {
  return useSWR<Loan[]>('loans/mine', () => loansApi.getMyLoans(), swrConfig);
}

export function useLoan(id: string | null) {
  return useSWR<LoanWithBalance>(
    id ? `loans/${id}` : null,
    () => loansApi.getById(id!),
    swrConfig
  );
}

export function useOverdueSchedules() {
  return useSWR<RepaymentScheduleItem[]>(
    'loans/overdue',
    () => loansApi.getOverdue(),
    swrConfig
  );
}

// Mutation hooks for loans
export function useCreateLoan() {
  return useSWRMutation(
    'loans/mine',
    (_key: string, { arg }: { arg: CreateLoanData }) => loansApi.create(arg)
  );
}

export function useQuickLend() {
  return useSWRMutation(
    'loans/mine',
    (_key: string, { arg }: { arg: QuickLendData }) => loansApi.quickLend(arg)
  );
}

export function useAcceptLoan(id: string) {
  return useSWRMutation(
    `loans/${id}`,
    () => loansApi.accept(id)
  );
}

export function useDeclineLoan(id: string) {
  return useSWRMutation(
    `loans/${id}`,
    () => loansApi.decline(id)
  );
}

// ===========================================
// Wallet Hooks
// ===========================================

export function useWallet() {
  return useSWR<WalletWithTransactions>(
    'wallet/me',
    () => walletApi.getMyWallet(),
    swrConfig
  );
}

export function useTopUp() {
  return useSWRMutation(
    'wallet/me',
    (_key: string, { arg }: { arg: TopUpData }) => walletApi.topUp(arg)
  );
}

export function useTransfer() {
  return useSWRMutation(
    'wallet/me',
    (_key: string, { arg }: { arg: TransferData }) => walletApi.transfer(arg)
  );
}

// ===========================================
// Templates Hooks
// ===========================================

export function useTemplates() {
  return useSWR<LoanTemplate[]>(
    'templates',
    () => templatesApi.getAll(),
    swrConfig
  );
}

export function useCreateTemplate() {
  return useSWRMutation(
    'templates',
    (_key: string, { arg }: { arg: CreateTemplateData }) => templatesApi.create(arg)
  );
}

export function useDeleteTemplate() {
  return useSWRMutation(
    'templates',
    (_key: string, { arg }: { arg: string }) => templatesApi.delete(arg)
  );
}

// ===========================================
// Payments Hooks
// ===========================================

export function usePayments(loanId: string | null) {
  return useSWR<Payment[]>(
    loanId ? `loans/${loanId}/payments` : null,
    () => paymentsApi.getPayments(loanId!),
    swrConfig
  );
}

export function useLogPayment(loanId: string) {
  return useSWRMutation(
    `loans/${loanId}/payments`,
    (_key: string, { arg }: { arg: LogPaymentData }) => paymentsApi.logPayment(loanId, arg)
  );
}

// ===========================================
// Admin Hooks
// ===========================================

export function useAdminStats() {
  return useSWR<PlatformStats>(
    'admin/stats',
    () => adminApi.getStats(),
    swrConfig
  );
}

export function useAdminUsers() {
  return useSWR<UserWithStats[]>(
    'admin/users',
    () => adminApi.getUsers(),
    swrConfig
  );
}
