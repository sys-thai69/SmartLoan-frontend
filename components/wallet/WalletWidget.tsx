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
        return <Plus className="w-4 h-4 text-emerald-600" />;
      case 'transfer':
      case 'auto_debit':
        return <ArrowUpRight className="w-4 h-4 text-rose-500" />;
      case 'refund':
        return <RefreshCw className="w-4 h-4 text-indigo-600" />;
      default:
        return <ArrowDownLeft className="w-4 h-4 text-slate-600" />;
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
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">My Wallet</p>
              <p className="text-2xl font-bold text-slate-900">
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
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-700">
                Recent Transactions
              </h4>
              {!compact && (
                <Link
                  href="/wallet"
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                >
                  View All
                </Link>
              )}
            </div>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between text-sm group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <p className="text-slate-900 font-medium">
                        {tx.note || tx.type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatRelativeTime(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        tx.type === 'topup' || tx.type === 'refund'
                          ? 'text-emerald-600'
                          : 'text-slate-900'
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
          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-sm text-slate-400">No transactions yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
