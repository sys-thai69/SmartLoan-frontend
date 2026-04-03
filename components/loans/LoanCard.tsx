'use client';

import Link from 'next/link';
import type { Loan } from '@/types';
import { Card, CardContent, Badge, getStatusBadgeVariant, Avatar } from '@/components/ui';
import { formatCurrency, formatDate, formatStatus, calculatePercentPaid } from '@/lib/utils';
import { Calendar, TrendingUp } from 'lucide-react';

interface LoanCardProps {
  loan: Loan;
  currentUserId: string;
  totalPaid?: number;
}

export function LoanCard({ loan, currentUserId, totalPaid }: LoanCardProps) {
  const isLender = loan.lenderId === currentUserId;
  const otherParty = isLender ? loan.borrower : loan.lender;

  // Calculate actually paid from schedule if not provided
  let actualTotalPaid = totalPaid;
  if (actualTotalPaid === undefined && loan.schedule) {
    actualTotalPaid = loan.schedule
      .filter((s) => s.isPaid)
      .reduce((sum, s) => sum + s.amountDue, 0);
  }
  actualTotalPaid = actualTotalPaid || 0;

  const percentPaid = calculatePercentPaid(actualTotalPaid, loan.totalAmount);
  const remaining = loan.totalAmount - actualTotalPaid;

  return (
    <Link href={`/loans/${loan.id}`}>
      <Card className="hover:shadow-lg hover:-translate-y-0.5 cursor-pointer transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar name={otherParty?.name || 'Unknown'} size="md" />
              <div>
                <p className="font-semibold text-slate-900">
                  {otherParty?.name || 'Unknown User'}
                </p>
                <p className="text-sm text-slate-500">
                  {isLender ? 'Borrower' : 'Lender'}
                </p>
              </div>
            </div>
            <Badge variant={getStatusBadgeVariant(loan.status)}>
              {formatStatus(loan.status)}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Total Amount</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(loan.totalAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Remaining</span>
              <span className="font-medium text-slate-700">
                {formatCurrency(remaining)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${percentPaid}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-500">
                {loan.schedule && loan.schedule.length > 0
                  ? (() => {
                      const paidCount = loan.schedule.filter((s) => s.isPaid).length;
                      const totalCount = loan.schedule.length;
                      const period = loan.frequency === 'weekly' ? 'weeks' : 'months';
                      return `${paidCount} of ${totalCount} ${period} paid`;
                    })()
                  : `${percentPaid.toFixed(0)}% paid`}
              </span>
              {percentPaid > 0 && percentPaid < 100 && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold ring-1 ring-amber-600/10">
                  In Progress
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(loan.startDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{loan.installments} {loan.frequency}</span>
            </div>
            {loan.isQuickLend && (
              <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full text-xs font-semibold ring-1 ring-violet-600/10">
                Quick Lend
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
