'use client';

import type { RepaymentScheduleItem } from '@/types';
import { Button, Badge } from '@/components/ui';
import { formatCurrency, formatDate, isOverdue, getDaysOverdue } from '@/lib/utils';
import { Check, AlertCircle, Clock } from 'lucide-react';

interface RepaymentTableProps {
  schedule: RepaymentScheduleItem[];
  onLogPayment?: (scheduleItem: RepaymentScheduleItem) => void;
  canLogPayment?: boolean;
}

export function RepaymentTable({
  schedule,
  onLogPayment,
  canLogPayment = false,
}: RepaymentTableProps) {
  const getRowStatus = (item: RepaymentScheduleItem) => {
    if (item.isPaid) return 'paid';
    if (isOverdue(item.dueDate)) return 'overdue';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (item: RepaymentScheduleItem) => {
    const status = getRowStatus(item);
    if (status === 'paid') {
      return <Badge variant="success">Paid</Badge>;
    }
    if (status === 'overdue') {
      const days = getDaysOverdue(item.dueDate);
      return <Badge variant="danger">{days} days overdue</Badge>;
    }
    return <Badge variant="default">Pending</Badge>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              #
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              Due Date
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
              Amount
            </th>
            <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
              Status
            </th>
            {canLogPayment && (
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {schedule.map((item) => {
            const status = getRowStatus(item);
            return (
              <tr
                key={item.id}
                className={`border-b border-gray-100 ${
                  status === 'overdue' ? 'bg-red-50' : ''
                }`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="text-sm font-medium text-gray-900">
                      {item.installmentNo}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  {formatDate(item.dueDate)}
                </td>
                <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                  {formatCurrency(item.amountDue)}
                </td>
                <td className="py-3 px-4 text-center">
                  {getStatusBadge(item)}
                </td>
                {canLogPayment && (
                  <td className="py-3 px-4 text-right">
                    {!item.isPaid && onLogPayment && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onLogPayment(item)}
                      >
                        Log Payment
                      </Button>
                    )}
                    {item.isPaid && item.paidAt && (
                      <span className="text-xs text-gray-500">
                        {formatDate(item.paidAt)}
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
