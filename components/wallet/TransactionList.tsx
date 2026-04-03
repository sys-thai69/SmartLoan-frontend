'use client';

import { useAuth } from '@/context/AuthContext';
import type { WalletTransaction } from '@/types';
import { Badge, EmptyState } from '@/components/ui';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft, Plus, RefreshCw, Receipt, Lock } from 'lucide-react';

interface TransactionListProps {
  transactions: WalletTransaction[];
  currency?: string;
}

export function TransactionList({ transactions, currency = 'USD' }: TransactionListProps) {
  const { user } = useAuth();
  const currentUserId = user?.id;
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="w-8 h-8 text-gray-400" />}
        title="No transactions yet"
        description="Your transaction history will appear here once you start using your wallet."
      />
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Plus className="w-5 h-5 text-green-600" />
          </div>
        );
      case 'transfer':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-blue-600" />
          </div>
        );
      case 'auto_debit':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-blue-600" />
          </div>
        );
      case 'refund':
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-purple-600" />
          </div>
        );
      case 'reserved':
        return (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-500" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5 text-gray-600" />
          </div>
        );
    }
  };

  const getTransactionLabel = (type: string) => {
    const labels: Record<string, string> = {
      topup: 'Wallet Top Up',
      transfer: 'Transfer',
      auto_debit: 'Auto Debit Payment',
      refund: 'Refund',
      reserved: 'Reserved',
    };
    return labels[type] || type;
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'topup':
      case 'refund':
        return 'text-green-600';
      case 'reserved':
        return 'text-gray-500';
      default:
        return 'text-gray-900';
    }
  };

  // Determine if transaction is incoming (credit) or outgoing (debit)
  const isCredit = (tx: WalletTransaction): boolean => {
    switch (tx.type) {
      case 'topup':
      case 'refund':
        return true; // Always incoming
      case 'transfer':
      case 'auto_debit':
        // Incoming if current user is the recipient
        return currentUserId ? tx.toUser === currentUserId : false;
      case 'reserved':
        return false; // Reserved funds are outgoing
      default:
        return false;
    }
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce<Record<string, WalletTransaction[]>>(
    (groups, tx) => {
      const date = formatDate(tx.createdAt, 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(tx);
      return groups;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(([date, txs]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            {formatDate(date, 'MMMM dd, yyyy')}
          </h3>
          <div className="space-y-3">
            {txs.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  {getTransactionIcon(tx.type)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {getTransactionLabel(tx.type)}
                    </p>
                    {tx.note && (
                      <p className="text-sm text-gray-500">{tx.note}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {formatRelativeTime(tx.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-semibold ${
                      tx.type === 'reserved'
                        ? 'text-gray-500'
                        : isCredit(tx)
                        ? 'text-green-600'
                        : 'text-gray-900'
                    }`}
                  >
                    {tx.type === 'reserved' ? '−' : isCredit(tx) ? '+' : '−'}
                    {formatCurrency(tx.amount, currency)}
                  </p>
                  <Badge
                    variant={
                      tx.type === 'topup'
                        ? 'success'
                        : tx.type === 'auto_debit'
                        ? 'info'
                        : tx.type === 'refund'
                        ? 'success'
                        : tx.type === 'reserved'
                        ? 'default'
                        : 'default'
                    }
                  >
                    {tx.type === 'reserved' ? 'reserved' : tx.type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
