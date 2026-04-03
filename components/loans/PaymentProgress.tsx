'use client';

import type { LoanFrequency } from '@/types';
import { Card, CardContent, Badge } from '@/components/ui';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface PaymentProgressProps {
  installments: number;
  paidInstallments: number;
  frequency: LoanFrequency;
  status: string;
}

export function PaymentProgress({
  installments,
  paidInstallments,
  frequency,
  status,
}: PaymentProgressProps) {
  const percentPaid = (paidInstallments / installments) * 100;
  const frequencyLabel = frequency === 'weekly' ? 'Week' : 'Month';
  const isCompleted = percentPaid === 100;
  const isInProgress = percentPaid > 0 && !isCompleted;
  const isPending = percentPaid === 0;
  const isOverdue = status === 'overdue';

  let bgColor = 'bg-gray-50';
  let borderColor = 'border-gray-200';
  let barColor = 'bg-gray-300';
  let textColor = 'text-gray-700';
  let statusText = '';
  let statusIcon = null;

  if (isCompleted) {
    bgColor = 'bg-green-50';
    borderColor = 'border-green-200';
    barColor = 'bg-green-400';
    textColor = 'text-green-700';
    statusText = 'All payments completed';
    statusIcon = <CheckCircle className="w-5 h-5 text-green-600" />;
  } else if (isInProgress) {
    bgColor = 'bg-yellow-50';
    borderColor = 'border-yellow-200';
    barColor = 'bg-yellow-400';
    textColor = 'text-yellow-700';
    statusText = `${paidInstallments} payment${paidInstallments !== 1 ? 's' : ''} done - ${frequencyLabel} ${paidInstallments} of ${installments}`;
    statusIcon = <Clock className="w-5 h-5 text-yellow-600" />;
  } else {
    statusText = `${frequencyLabel} 0 of ${installments} - Payment not started`;
    statusIcon = <Clock className="w-5 h-5 text-gray-400" />;
  }

  if (isOverdue && isInProgress) {
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
    barColor = 'bg-red-400';
    textColor = 'text-red-700';
    statusIcon = <AlertCircle className="w-5 h-5 text-red-600" />;
  }

  return (
    <Card className={`border-2 ${borderColor} ${bgColor}`}>
      <CardContent className="pt-6">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              {statusIcon}
              <span className={`font-medium ${textColor}`}>{statusText}</span>
            </div>
            <Badge variant="secondary" className={`${textColor} border-current`}>
              {Math.round(percentPaid)}%
            </Badge>
          </div>

          {/* Progress Bar Visual */}
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} transition-all duration-300`}
              style={{ width: `${percentPaid}%` }}
            />
          </div>
        </div>

        {/* Status Details */}
        <div className="text-sm space-y-1">
          <p className={`${textColor}`}>
            {paidInstallments} of {installments} installments paid
          </p>
          {isOverdue && !isCompleted && (
            <p className="text-red-600 font-medium">⚠ Payment is overdue</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
