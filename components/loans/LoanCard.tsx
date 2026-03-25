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

export function LoanCard({ loan, currentUserId, totalPaid = 0 }: LoanCardProps) {
  const isLender = loan.lenderId === currentUserId;
  const otherParty = isLender ? loan.borrower : loan.lender;
  const percentPaid = calculatePercentPaid(totalPaid, loan.totalAmount);
  const remaining = loan.totalAmount - totalPaid;

  return (
    <Link href={`/loans/${loan.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar name={otherParty?.name || 'Unknown'} size="md" />
              <div>
                <p className="font-medium text-gray-900">
                  {otherParty?.name || 'Unknown User'}
                </p>
                <p className="text-sm text-gray-500">
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
              <span className="text-sm text-gray-500">Total Amount</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(loan.totalAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Remaining</span>
              <span className="font-medium text-gray-700">
                {formatCurrency(remaining)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${percentPaid}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-right">
              {percentPaid.toFixed(0)}% paid
            </p>
          </div>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(loan.startDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{loan.installments} {loan.frequency}</span>
            </div>
            {loan.isQuickLend && (
              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                Quick Lend
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
