'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { WalletWidget } from '@/components/wallet/WalletWidget';
import { TopUpModal } from '@/components/wallet/TopUpModal';
import { TransactionList } from '@/components/wallet/TransactionList';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Loader2 } from 'lucide-react';

export default function WalletPage() {
  const { balance, transactions, currency, isLoading, topUp, refetch } = useWallet();
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const handleTopUp = async (amount: number) => {
    await topUp({ amount });
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wing Wallet</h1>
        <p className="text-gray-600">
          Manage your mock Wing wallet balance and transactions
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Wallet Widget */}
        <div>
          <WalletWidget
            balance={balance}
            currency={currency}
            transactions={transactions.slice(0, 5)}
            onTopUp={() => setIsTopUpOpen(true)}
          />
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionList transactions={transactions} currency={currency} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Up Modal */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSubmit={handleTopUp}
      />
    </div>
  );
}
