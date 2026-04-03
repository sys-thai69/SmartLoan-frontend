'use client';

import { Card, CardContent } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { TrendingDown } from 'lucide-react';

interface FeeBreakdownProps {
  principal: number;
  interest: number;
  totalAmount: number;
  currency?: string;
  showFeeInfo?: boolean;
}

export function FeeBreakdown({
  principal,
  interest,
  totalAmount,
  currency = 'USD',
  showFeeInfo = true,
}: FeeBreakdownProps) {
  // Fee calculation: 1.5% on transactions over $500
  const FEE_THRESHOLD = 500;
  const FEE_RATE = 0.015; // 1.5%

  const feeAmount = totalAmount > FEE_THRESHOLD ? totalAmount * FEE_RATE : 0;
  const borrowerTotal = totalAmount + feeAmount;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Payment Breakdown</h3>
        </div>

        <div className="space-y-3">
          {/* Principal */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700">Principal</span>
            <span className="font-medium text-gray-900">{formatCurrency(principal, currency)}</span>
          </div>

          {/* Interest */}
          {interest > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">Interest</span>
              <span className="font-medium text-gray-900">{formatCurrency(interest, currency)}</span>
            </div>
          )}

          {/* Subtotal */}
          <div className="border-t border-blue-200 pt-3 flex justify-between items-center text-sm">
            <span className="text-gray-700">Subtotal</span>
            <span className="font-medium text-gray-900">{formatCurrency(totalAmount, currency)}</span>
          </div>

          {/* Platform Fee */}
          {feeAmount > 0 && (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Platform Fee (1.5%)</span>
                <span className="font-medium text-orange-600">{formatCurrency(feeAmount, currency)}</span>
              </div>

              {showFeeInfo && (
                <div className="bg-white/60 rounded p-2 text-xs text-gray-600 border border-blue-200">
                  Platform fees support our lending infrastructure and fraud prevention.
                </div>
              )}
            </>
          )}

          {/* Total Borrower Pays */}
          <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total to Pay</span>
            <span className="text-lg font-bold text-blue-600">
              {formatCurrency(borrowerTotal, currency)}
            </span>
          </div>

          {/* Fee Note for Small Loans */}
          {totalAmount <= FEE_THRESHOLD && (
            <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-700">
              ✓ No platform fee for loans under ${FEE_THRESHOLD.toLocaleString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
