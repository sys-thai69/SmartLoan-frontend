'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLoan } from '@/hooks/useLoans';
import { paymentsApi, loansApi } from '@/lib/api';
import { RepaymentTable } from '@/components/loans/RepaymentTable';
import { LogPaymentModal } from '@/components/loans/LogPaymentModal';
import { BalanceChart } from '@/components/loans/BalanceChart';
import type { RepaymentScheduleItem } from '@/types';
import type { LogPaymentFormData } from '@/lib/validations';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Badge,
  getStatusBadgeVariant,
  Avatar,
} from '@/components/ui';
import { formatCurrency, formatDate, formatStatus, getDaysOverdue } from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  Percent,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

export default function LoanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { loan, isLoading, error, refetch } = useLoan(params.id as string);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedScheduleItem, setSelectedScheduleItem] = useState<RepaymentScheduleItem | null>(null);
  const [isActioning, setIsActioning] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'log' | 'pay' | 'auto-debit'>('log');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Loan Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              {error || 'This loan does not exist or you do not have access to it.'}
            </p>
            <Link href="/loans">
              <Button>Back to Loans</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLender = loan.lenderId === user?.id;
  const isBorrower = loan.borrowerId === user?.id;
  const otherParty = isLender ? loan.borrower : loan.lender;
const canAcceptDecline = isBorrower && loan.status === 'pending_acceptance';
  const canLogPayment = isLender && ['active', 'overdue'].includes(loan.status);
  const canMakePayment = isBorrower && ['active', 'overdue'].includes(loan.status);
  const canInitiateAutoDebit = isLender && ['active', 'overdue'].includes(loan.status);

  const handleAccept = async () => {
    try {
      setIsActioning(true);
      await loansApi.accept(loan.id);
      refetch();
    } finally {
      setIsActioning(false);
    }
  };

  const handleDecline = async () => {
    try {
      setIsActioning(true);
      await loansApi.decline(loan.id);
      router.push('/loans');
    } finally {
      setIsActioning(false);
    }
  };

  const handleLogPayment = (item: RepaymentScheduleItem | null) => {
    setSelectedScheduleItem(item);
    setPaymentMode('log');
    setIsPaymentModalOpen(true);
  };

  const handleMakePayment = (item: RepaymentScheduleItem | null) => {
    setSelectedScheduleItem(item);
    setPaymentMode('pay');
    setIsPaymentModalOpen(true);
  };

  const handleInitiateAutoDebit = (item: RepaymentScheduleItem | null) => {
    setSelectedScheduleItem(item);
    setPaymentMode('auto-debit');
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (data: LogPaymentFormData) => {
    try {
      setIsActioning(true);
      if (paymentMode === 'pay') {
        await paymentsApi.makePayment(loan.id, data);
      } else if (paymentMode === 'auto-debit') {
        await paymentsApi.initiateAutoDebit(loan.id, data);
      } else {
        await paymentsApi.logPayment(loan.id, data);
      }
      setIsPaymentModalOpen(false);
      refetch();
    } finally {
      setIsActioning(false);
    }
  };

  // Check for overdue schedules (used for future features)
  const _overdueSchedules = loan.schedule?.filter(
    (s) => !s.isPaid && getDaysOverdue(s.dueDate) > 0
  ) || [];
  void _overdueSchedules;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/loans"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Loans
      </Link>

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={otherParty?.name || 'Unknown'} size="lg" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {otherParty?.name || 'Unknown User'}
                </h1>
                <p className="text-gray-500">
                  {isLender ? 'Borrower' : 'Lender'}
                </p>
              </div>
            </div>
            <Badge variant={getStatusBadgeVariant(loan.status)} className="text-sm py-1 px-3">
              {formatStatus(loan.status)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
                <span>Principal</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(loan.principal)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
                <Percent className="w-4 h-4" />
                <span>Interest</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {loan.interestRate}%
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                <span>Start Date</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {formatDate(loan.startDate, 'MMM dd')}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
                <Clock className="w-4 h-4" />
                <span>Schedule</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {loan.installments} {loan.frequency}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Payment Progress
              </span>
              <span className="text-sm text-gray-500">
                {formatCurrency(loan.totalPaid)} / {formatCurrency(loan.totalAmount)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${loan.percentPaid}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {loan.percentPaid.toFixed(1)}% completed
              </span>
              <span className="text-xs font-medium text-gray-700">
                {formatCurrency(loan.remaining)} remaining
              </span>
            </div>
          </div>
        </CardContent>

        {/* Actions */}
        {canAcceptDecline && (
          <CardFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleDecline}
              disabled={isActioning}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Decline
            </Button>
            <Button onClick={handleAccept} isLoading={isActioning}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept Loan
            </Button>
          </CardFooter>
        )}

        {/* Payment Actions */}
        {(canMakePayment || canInitiateAutoDebit) && (
          <CardFooter className="flex justify-end gap-3 border-t border-gray-200">
            {canMakePayment && (
              <Button
                onClick={() => handleMakePayment(loan.schedule?.[0] || null)}
                disabled={isActioning}
              >
                Pay Now
              </Button>
            )}
            {canInitiateAutoDebit && (
              <Button
                variant="secondary"
                onClick={() => handleInitiateAutoDebit(loan.schedule?.[0] || null)}
                disabled={isActioning}
              >
                Initiate Auto-Debit
              </Button>
            )}
            {canLogPayment && (
              <Button
                variant="outline"
                onClick={() => handleLogPayment(loan.schedule?.[0] || null)}
                disabled={isActioning}
              >
                Log Manual Payment
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Repayment Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Repayment Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {loan.schedule && loan.schedule.length > 0 ? (
                <RepaymentTable
                  schedule={loan.schedule}
                  onLogPayment={handleLogPayment}
                  canLogPayment={canLogPayment}
                />
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No schedule available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Balance Chart */}
          {loan.payments && loan.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Balance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <BalanceChart
                  totalAmount={loan.totalAmount}
                  payments={loan.payments}
                  schedule={loan.schedule || []}
                />
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {loan.payments && loan.payments.length > 0 ? (
                <div className="space-y-3">
                  {loan.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {payment.type === 'manual' ? '💳 Manual Payment' : '🔄 Auto-Debit'}
                        </p>
                        {payment.note && (
                          <p className="text-xs text-gray-500 mt-1">{payment.note}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-700">
                          {formatDate(payment.paymentDate, 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Paid by {isLender ? 'borrower' : 'you'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No payments yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Loan Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Loan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Loan ID</span>
                <span className="font-mono text-gray-700">{loan.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700">{formatDate(loan.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Auto-Debit</span>
                <span className={loan.autoDebit ? 'text-green-600' : 'text-gray-500'}>
                  {loan.autoDebit ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              {loan.isQuickLend && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <Badge variant="secondary">Quick Lend</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Log Payment Modal */}
      <LogPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        scheduleItem={selectedScheduleItem}
        maxAmount={loan.remaining}
        onSubmit={handlePaymentSubmit}
        mode={paymentMode}
      />
    </div>
  );
}
