'use client';

import Link from 'next/link';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface OverdueBannerProps {
  overdueCount: number;
  totalOverdueAmount?: number;
}

export function OverdueBanner({ overdueCount, totalOverdueAmount }: OverdueBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || overdueCount === 0) {
    return null;
  }

  return (
    <div className="bg-red-600 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            You have{' '}
            <span className="font-bold">{overdueCount} overdue</span> payment
            {overdueCount !== 1 ? 's' : ''}
            {totalOverdueAmount && (
              <span> totaling ${totalOverdueAmount.toFixed(2)}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/loans?status=overdue"
            className="text-sm font-medium underline hover:no-underline"
          >
            View Details
          </Link>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-red-700 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
