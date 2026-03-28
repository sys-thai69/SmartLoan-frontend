'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WalletWithTransactions, TopUpData, TransferData } from '@/types';
import { walletApi } from '@/lib/api';
import { useError } from '@/context/ErrorContext';

export function useWallet() {
  const [wallet, setWallet] = useState<WalletWithTransactions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addError } = useError();

  const fetchWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await walletApi.getMyWallet();
      setWallet(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wallet';
      setError(errorMessage);
      addError(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addError]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const topUp = async (data: TopUpData) => {
    try {
      const updatedWallet = await walletApi.topUp(data);
      setWallet(updatedWallet);
      addError('Wallet topped up successfully!', 'success', 3000);
      return updatedWallet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to top up wallet';
      addError(errorMessage, 'error');
      throw err;
    }
  };

  const transfer = async (data: TransferData) => {
    try {
      const updatedWallet = await walletApi.transfer(data);
      setWallet(updatedWallet);
      addError('Transfer successful!', 'success', 3000);
      return updatedWallet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to transfer funds';
      addError(errorMessage, 'error');
      throw err;
    }
  };

  return {
    wallet,
    balance: wallet?.balance ?? 0,
    transactions: wallet?.transactions ?? [],
    currency: wallet?.currency ?? 'USD',
    isLoading,
    error,
    refetch: fetchWallet,
    topUp,
    transfer,
  };
}
