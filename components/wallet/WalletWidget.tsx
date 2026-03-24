'use client';

import Link from 'next/link';
import type { WalletTransaction } from '@/types';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, RefreshCw } from 'lucide-react';

interface WalletWidgetProps {
  balance: number;
  currency?: string;
  transactions?: WalletTransaction[];
  onTopUp?: () => void;
  compact?: boolean;
}

export function WalletWidget({
  balance,
  currency = 'USD',
  transactions = [],
  onTopUp,
  compact = false,
}: WalletWidgetProps) {
  const recentTransactions = transactions.slice(0, compact ? 3 : 5);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'transfer':
      case 'auto_debit':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'refund':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default:
        return <ArrowDownLeft className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionBadge = (type: string) => {
    const variants: Record<string, 'success' | 'danger' | 'info' | 'default'> = {
      topup: 'success',
      transfer: 'default',
      auto_debit: 'info',
      refund: 'success',
    };
    return <Badge variant={variants[type] || 'default'}>{type.replace('_', ' ')}</Badge>;
  };

  return (
    <Card>
      <CardContent className={compact ? 'p-4' : 'p-6'}>
        {/* Balance Display */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Wing Wallet Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(balance, currency)}
              </p>
            </div>
          </div>
          {onTopUp && (
            <Button onClick={onTopUp} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Top Up
            </Button>
          )}
        </div>

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">
                Recent Transactions
              </h4>
              {!compact && (
                <Link
                  href="/wallet"
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  View All
                </Link>
              )}
            </div>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">
                        {tx.note || tx.type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatRelativeTime(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        tx.type === 'topup' || tx.type === 'refund'
                          ? 'text-green-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {tx.type === 'topup' || tx.type === 'refund' ? '+' : '-'}
                      {formatCurrency(tx.amount, currency)}
                    </p>
                    {getTransactionBadge(tx.type)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentTransactions.length === 0 && (
          <div className="border-t border-gray-200 pt-4 text-center">
            <p className="text-sm text-gray-500">No transactions yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
