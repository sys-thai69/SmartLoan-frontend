'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Loan, LoanWithBalance, CreateLoanData, QuickLendData, RepaymentScheduleItem } from '@/types';
import { loansApi } from '@/lib/api';

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await loansApi.getMyLoans();
      setLoans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch loans');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const createLoan = async (data: CreateLoanData) => {
    const newLoan = await loansApi.create(data);
    setLoans((prev) => [newLoan, ...prev]);
    return newLoan;
  };

  const quickLend = async (data: QuickLendData) => {
    const newLoan = await loansApi.quickLend(data);
    setLoans((prev) => [newLoan, ...prev]);
    return newLoan;
  };

  const acceptLoan = async (id: string) => {
    const updatedLoan = await loansApi.accept(id);
    setLoans((prev) =>
      prev.map((loan) => (loan.id === id ? updatedLoan : loan))
    );
    return updatedLoan;
  };

  const declineLoan = async (id: string) => {
    const updatedLoan = await loansApi.decline(id);
    setLoans((prev) =>
      prev.map((loan) => (loan.id === id ? updatedLoan : loan))
    );
    return updatedLoan;
  };

  // Filter helpers
  const lentLoans = loans.filter((loan) => loan.lenderId !== loan.borrowerId);
  const borrowedLoans = loans.filter((loan) => loan.borrowerId !== loan.lenderId);
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

  const fetchLoan = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await loansApi.getById(id);
      setLoan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch loan');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

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

  const fetchOverdue = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await loansApi.getOverdue();
      setSchedules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch overdue schedules');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
