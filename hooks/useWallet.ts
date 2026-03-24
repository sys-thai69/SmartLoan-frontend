'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WalletWithTransactions, TopUpData, TransferData } from '@/types';
import { walletApi } from '@/lib/api';

export function useWallet() {
  const [wallet, setWallet] = useState<WalletWithTransactions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await walletApi.getMyWallet();
      setWallet(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const topUp = async (data: TopUpData) => {
    const updatedWallet = await walletApi.topUp(data);
    setWallet(updatedWallet);
    return updatedWallet;
  };

  const transfer = async (data: TransferData) => {
    const updatedWallet = await walletApi.transfer(data);
    setWallet(updatedWallet);
    return updatedWallet;
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
