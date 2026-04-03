'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AutoDebitToggleProps {
  loanId: string;
  isEnabled: boolean;
  autoDebitStatus?: {
    status: string;
    nextDebitDate: string;
    amount: number;
    failureCount?: number;
  };
  onEnable: (loanId: string) => Promise<void>;
  onDisable: (loanId: string) => Promise<void>;
  isLoading?: boolean;
}

export function AutoDebitToggle({
  loanId,
  isEnabled,
  autoDebitStatus,
  onEnable,
  onDisable,
  isLoading = false,
}: AutoDebitToggleProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    try {
      setIsToggling(true);
      setError(null);

      if (isEnabled) {
        await onDisable(loanId);
      } else {
        await onEnable(loanId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update auto-debit');
    } finally {
      setIsToggling(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PAUSED':
        return 'info';
      case 'FAILED':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <CardTitle>Auto-Debit Payment</CardTitle>
          </div>
          <Badge variant={isEnabled ? 'success' : 'default'}>
            {isEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <p className="text-sm text-gray-600">
          {isEnabled
            ? 'Automatic payments are enabled. Payments will be deducted from your wallet on due dates.'
            : 'Enable automatic debit to have payments deducted from your wallet automatically on due dates.'}
        </p>

        {isEnabled && autoDebitStatus && (
          <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              {autoDebitStatus.status === 'ACTIVE' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Next Payment: ${autoDebitStatus.amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-600">
                  Due: {formatDate(autoDebitStatus.nextDebitDate)}
                </p>
              </div>
            </div>

            {autoDebitStatus.failureCount && autoDebitStatus.failureCount > 0 && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                ⚠ {autoDebitStatus.failureCount} payment failure(s). Please ensure sufficient funds.
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleToggle}
          isLoading={isToggling}
          disabled={isLoading}
          variant={isEnabled ? 'outline' : 'primary'}
          className="w-full"
        >
          {isEnabled ? 'Disable Auto-Debit' : 'Enable Auto-Debit'}
        </Button>
      </CardContent>
    </Card>
  );
}
