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
  Sparkles,
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
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-slate-500">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card className="group hover:-translate-y-0.5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Lent</p>
                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(totalLent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:-translate-y-0.5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-md shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Borrowed</p>
                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(totalBorrowed)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:-translate-y-0.5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Active Loans</p>
                <p className="text-xl font-bold text-slate-900">
                  {activeLoans.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:-translate-y-0.5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 ${
                overdueLoans.length > 0
                  ? 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/20'
                  : 'bg-gradient-to-br from-slate-300 to-slate-400 shadow-slate-400/20'
              }`}>
                {overdueLoans.length > 0 ? (
                  <Clock className="w-5 h-5 text-white" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm text-slate-500">Overdue</p>
                <p className={`text-xl font-bold ${
                  overdueLoans.length > 0 ? 'text-rose-600' : 'text-slate-900'
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
            <h2 className="text-lg font-semibold text-slate-900">Recent Loans</h2>
            <Link
              href="/loans"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-slate-200 rounded-full w-1/3" />
                      <div className="h-3 bg-slate-200 rounded-full w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentLoans.length > 0 ? (
            <div className="space-y-4 stagger-children">
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
                  icon={<FileText className="w-8 h-8 text-slate-400" />}
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
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
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
          />
        </div>
      </div>
    </div>
  );
}
