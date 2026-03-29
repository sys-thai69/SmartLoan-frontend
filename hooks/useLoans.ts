'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Loan, LoanWithBalance, CreateLoanData, QuickLendData, RepaymentScheduleItem } from '@/types';
import { loansApi } from '@/lib/api';
import { useError } from '@/context/ErrorContext';
import { useAuth } from '@/context/AuthContext';

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addError } = useError();
  const { user } = useAuth();

  const fetchLoans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await loansApi.getMyLoans();
      setLoans(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch loans';
      setError(errorMessage);
      addError(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addError]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const createLoan = async (data: CreateLoanData) => {
    try {
      const newLoan = await loansApi.create(data);
      setLoans((prev) => [newLoan, ...prev]);
      addError('Loan created successfully!', 'success', 3000);
      return newLoan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create loan';
      addError(errorMessage, 'error');
      throw err;
    }
  };

  const quickLend = async (data: QuickLendData) => {
    try {
      const newLoan = await loansApi.quickLend(data);
      setLoans((prev) => [newLoan, ...prev]);
      addError('Quick lend created successfully!', 'success', 3000);
      return newLoan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create quick lend';
      addError(errorMessage, 'error');
      throw err;
    }
  };

  const acceptLoan = async (id: string) => {
    try {
      const updatedLoan = await loansApi.accept(id);
      setLoans((prev) =>
        prev.map((loan) => (loan.id === id ? updatedLoan : loan))
      );
      addError('Loan accepted!', 'success', 3000);
      return updatedLoan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept loan';
      addError(errorMessage, 'error');
      throw err;
    }
  };

  const declineLoan = async (id: string) => {
    try {
      const updatedLoan = await loansApi.decline(id);
      setLoans((prev) =>
        prev.map((loan) => (loan.id === id ? updatedLoan : loan))
      );
      addError('Loan declined', 'info', 3000);
      return updatedLoan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to decline loan';
      addError(errorMessage, 'error');
      throw err;
    }
  };

  // Filter helpers - Compare to current user ID
  const currentUserId = user?.id || '';
  const lentLoans = loans.filter((loan) => loan.lenderId === currentUserId);
  const borrowedLoans = loans.filter((loan) => loan.borrowerId === currentUserId);
  const activeLoans = loans.filter((loan) => loan.status === 'active');
  const overdueLoans = loans.filter((loan) => loan.status === 'overdue');
  const pendingLoans = loans.filter((loan) => loan.status === 'pending_acceptance');

  return {
    loans,
    isLoading,
    error,
    fetchLoans,
    createLoan,
    quickLend,
    acceptLoan,
    declineLoan,
    lentLoans,
    borrowedLoans,
    activeLoans,
    overdueLoans,
    pendingLoans,
  };
}

export function useLoan(id: string) {
  const [loan, setLoan] = useState<LoanWithBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addError } = useError();

  const fetchLoan = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await loansApi.getById(id);
      setLoan(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch loan';
      setError(errorMessage);
      addError(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [id, addError]);

  useEffect(() => {
    if (id) {
      fetchLoan();
    }
  }, [id, fetchLoan]);

  return {
    loan,
    isLoading,
    error,
    refetch: fetchLoan,
  };
}

export function useOverdueSchedules() {
  const [schedules, setSchedules] = useState<RepaymentScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addError } = useError();

  const fetchOverdue = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await loansApi.getOverdue();
      setSchedules(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch overdue schedules';
      setError(errorMessage);
      addError(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addError]);

  useEffect(() => {
    fetchOverdue();
  }, [fetchOverdue]);

  return {
    schedules,
    isLoading,
    error,
    refetch: fetchOverdue,
    hasOverdue: schedules.length > 0,
  };
}
