'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLoans } from '@/hooks/useLoans';
import { useWallet } from '@/hooks/useWallet';
import { LoanCard } from '@/components/loans/LoanCard';
import { WalletWidget } from '@/components/wallet/WalletWidget';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  EmptyState,
} from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import {
  Plus,
  Zap,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  FileText,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { loans, activeLoans, overdueLoans, pendingLoans, isLoading } = useLoans();
  const { balance, transactions } = useWallet();

  // Calculate stats
  const totalLent = loans
    .filter((l) => l.lenderId === user?.id)
    .reduce((sum, l) => sum + l.totalAmount, 0);

  const totalBorrowed = loans
    .filter((l) => l.borrowerId === user?.id)
    .reduce((sum, l) => sum + l.totalAmount, 0);

  const recentLoans = loans.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening with your loans today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/loans/quick">
            <Button variant="outline">
              <Zap className="w-4 h-4 mr-2" />
              Quick Lend
            </Button>
          </Link>
          <Link href="/loans/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Loan
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Lent</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(totalLent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Borrowed</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(totalBorrowed)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Loans</p>
                <p className="text-xl font-bold text-gray-900">
                  {activeLoans.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                overdueLoans.length > 0 ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                {overdueLoans.length > 0 ? (
                  <Clock className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Overdue</p>
                <p className={`text-xl font-bold ${
                  overdueLoans.length > 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {overdueLoans.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Loans */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Loans</h2>
            <Link
              href="/loans"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentLoans.length > 0 ? (
            <div className="space-y-4">
              {recentLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  currentUserId={user?.id || ''}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent>
                <EmptyState
                  icon={<FileText className="w-8 h-8 text-gray-400" />}
                  title="No loans yet"
                  description="Create your first loan to start tracking payments."
                  action={
                    <Link href="/loans/create">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Loan
                      </Button>
                    </Link>
                  }
                />
              </CardContent>
            </Card>
          )}

          {/* Pending Acceptance */}
          {pendingLoans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  Pending Acceptance ({pendingLoans.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingLoans.map((loan) => (
                  <LoanCard
                    key={loan.id}
                    loan={loan}
                    currentUserId={user?.id || ''}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Wallet Widget */}
        <div>
          <WalletWidget
            balance={balance}
            transactions={transactions}
            onTopUp={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
