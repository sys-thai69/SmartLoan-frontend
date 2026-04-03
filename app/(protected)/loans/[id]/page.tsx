"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLoan } from "@/hooks/useLoans";
import { paymentsApi, loansApi } from "@/lib/api";
import { RepaymentTable } from "@/components/loans/RepaymentTable";
import { LogPaymentModal } from "@/components/loans/LogPaymentModal";
import { BalanceChart } from "@/components/loans/BalanceChart";
import { PaymentProgress } from "@/components/loans/PaymentProgress";
import { AutoDebitToggle } from "@/components/loans/AutoDebitToggle";
import { FeeBreakdown } from "@/components/loans/FeeBreakdown";
import type { RepaymentScheduleItem } from "@/types";
import type { LogPaymentFormData } from "@/lib/validations";
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
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui";
import {
  formatCurrency,
  formatDate,
  formatStatus,
  getDaysOverdue,
} from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Percent,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Flag,
} from "lucide-react";

export default function LoanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { loan, isLoading, error, refetch } = useLoan(params.id as string);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedScheduleItem, setSelectedScheduleItem] =
    useState<RepaymentScheduleItem | null>(null);
  const [isActioning, setIsActioning] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"log" | "pay" | "auto-debit">(
    "log",
  );
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  // Auto-debit state
  const [autoDebitStatus, setAutoDebitStatus] = useState<{ status: string; amount?: number } | null>(null);
  const [isLoadingAutoDebit, setIsLoadingAutoDebit] = useState(false);

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
              {error ||
                "This loan does not exist or you do not have access to it."}
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
  const canAcceptDecline = isBorrower && loan.status === "pending_acceptance";
  const canCancelLoan = isLender && loan.status === "pending_acceptance";
  const canLogPayment = isLender && ["active", "overdue"].includes(loan.status);
  const canMakePayment =
    isBorrower && ["active", "overdue"].includes(loan.status);
  const canInitiateAutoDebit =
    isLender && ["active", "overdue"].includes(loan.status);

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
      router.push("/loans");
    } finally {
      setIsActioning(false);
    }
  };

  const handleCancelLoan = async () => {
    if (!confirm("Are you sure you want to cancel this loan?")) {
      return;
    }
    try {
      setIsActioning(true);
      alert("Loan cancellation initiated");
      refetch();
    } finally {
      setIsActioning(false);
    }
  };

  const handleAlertBorrower = async () => {
    if (!confirm("Alert borrower about overdue payment?")) {
      return;
    }
    try {
      setIsActioning(true);
      await loansApi.alertBorrower(loan.id);
      alert("Overdue alert sent to borrower");
    } catch (err) {
      alert("Failed to send alert. Please try again.");
      console.error(err);
    } finally {
      setIsActioning(false);
    }
  };

  // Auto-debit handlers
  const handleEnableAutoDebit = async (loanId: string) => {
    try {
      setIsLoadingAutoDebit(true);
      const response = await fetch(`/api/auto-debit/${loanId}/enable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to enable auto-debit");

      const data = await response.json();
      setAutoDebitStatus(data);
      refetch();
      alert("Auto-debit enabled successfully");
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to enable auto-debit");
    } finally {
      setIsLoadingAutoDebit(false);
    }
  };

  const handleDisableAutoDebit = async (loanId: string) => {
    try {
      setIsLoadingAutoDebit(true);
      const response = await fetch(`/api/auto-debit/${loanId}/disable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to disable auto-debit");

      setAutoDebitStatus(null);
      refetch();
      alert("Auto-debit disabled successfully");
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to disable auto-debit");
    } finally {
      setIsLoadingAutoDebit(false);
    }
  };

  const handleLogPayment = (item: RepaymentScheduleItem | null) => {
    setSelectedScheduleItem(item);
    setPaymentMode("log");
    setIsPaymentModalOpen(true);
  };

  const getFirstUnpaidSchedule = () => {
    return loan.schedule?.find((s) => !s.isPaid) || loan.schedule?.[0] || null;
  };

  const handleMakePayment = () => {
    const firstUnpaid = getFirstUnpaidSchedule();
    setSelectedScheduleItem(firstUnpaid);
    setPaymentMode("pay");
    setIsPaymentModalOpen(true);
  };

  const handleInitiateAutoDebit = () => {
    const firstUnpaid = getFirstUnpaidSchedule();
    setSelectedScheduleItem(firstUnpaid);
    setPaymentMode("auto-debit");
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (data: LogPaymentFormData) => {
    try {
      setIsActioning(true);
      if (paymentMode === "pay") {
        await paymentsApi.makePayment(loan.id, data);
      } else if (paymentMode === "auto-debit") {
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
  const overdueSchedules =
    loan.schedule?.filter((s) => !s.isPaid && getDaysOverdue(s.dueDate) > 0) ||
    [];
  const hasOverdue = overdueSchedules.length > 0;

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
              <Avatar name={otherParty?.name || "Unknown"} size="lg" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {otherParty?.name || "Unknown User"}
                </h1>
                <p className="text-gray-500">
                  {isLender ? "Borrower" : "Lender"}
                </p>
              </div>
            </div>
            <Badge
              variant={getStatusBadgeVariant(loan.status)}
              className="text-sm py-1 px-3"
            >
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
                {formatDate(loan.startDate, "MMM dd")}
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
            <PaymentProgress
              installments={loan.installments}
              paidInstallments={loan.schedule?.filter((s) => s.isPaid).length || 0}
              frequency={loan.frequency}
              status={loan.status}
            />
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

        {canCancelLoan && (
          <CardFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleCancelLoan}
              disabled={isActioning}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Loan Request
            </Button>
          </CardFooter>
        )}

        {/* Payment Actions */}
        {(canMakePayment || canInitiateAutoDebit) && (
          <CardFooter className="flex justify-end gap-3 border-t border-gray-200">
            {canMakePayment && (
              <Button onClick={handleMakePayment} disabled={isActioning}>
                Pay Now
              </Button>
            )}
            {canInitiateAutoDebit && (
              <Button
                variant="secondary"
                onClick={handleInitiateAutoDebit}
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
            {isLender && hasOverdue && (
              <Button
                variant="outline"
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                onClick={handleAlertBorrower}
                disabled={isActioning}
              >
                Alert Borrower
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
                          {payment.type === "manual"
                            ? "💳 Manual Payment"
                            : "🔄 Auto-Debit"}
                        </p>
                        {payment.note && (
                          <p className="text-xs text-gray-500 mt-1">
                            {payment.note}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-700">
                          {formatDate(payment.paymentDate, "MMM dd, yyyy")}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Paid by {isLender ? "borrower" : "you"}
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

          {/* Fee Breakdown */}
          {loan.principal && loan.interestRate && loan.totalAmount && (
            <FeeBreakdown
              principal={loan.principal}
              interest={(loan.principal * loan.interestRate * loan.installments) / 100}
              totalAmount={loan.totalAmount}
              showFeeInfo={true}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Auto-Debit Toggle */}
          {["active", "overdue"].includes(loan.status) && (
            <AutoDebitToggle
              loanId={loan.id}
              isEnabled={loan.autoDebit || false}
              autoDebitStatus={autoDebitStatus}
              onEnable={handleEnableAutoDebit}
              onDisable={handleDisableAutoDebit}
              isLoading={isLoadingAutoDebit}
            />
          )}

          {/* Loan Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Loan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Loan ID</span>
                <span className="font-mono text-gray-700">
                  {loan.id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700">
                  {formatDate(loan.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Auto-Debit</span>
                <span
                  className={
                    loan.autoDebit ? "text-green-600" : "text-gray-500"
                  }
                >
                  {loan.autoDebit ? "Enabled" : "Disabled"}
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
          {/* Report Loan */}
          {(isLender || isBorrower) && ["active", "overdue", "completed"].includes(loan.status) && (
            <Card className={loan.flagged ? 'border-red-200 bg-red-50/50' : ''}>
              <CardContent className="p-4">
                {loan.flagged ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-700">
                      <Flag className="w-4 h-4" />
                      <span className="font-semibold text-sm">Loan Reported</span>
                    </div>
                    {loan.flagReason && (
                      <p className="text-xs text-red-600 bg-red-100 p-2 rounded-lg">
                        &ldquo;{loan.flagReason}&rdquo;
                      </p>
                    )}
                    <p className="text-[10px] text-red-400">Admin has been notified</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Report Issue
                  </button>
                )}
              </CardContent>
            </Card>
          )}
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

      {/* Report Loan Modal */}
      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)}>
        <ModalHeader onClose={() => setIsReportModalOpen(false)}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Report Loan Issue
          </div>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Report a concern or issue with this loan. An admin will review the report.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Describe the issue
            </label>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="e.g., Incorrect amount, suspicious activity, payment dispute..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{reportReason.length}/500</p>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsReportModalOpen(false);
              setReportReason("");
            }}
            disabled={isReporting}
          >
            Cancel
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={async () => {
              if (!reportReason.trim()) return;
              try {
                setIsReporting(true);
                await loansApi.report(loan.id, reportReason.trim());
                setIsReportModalOpen(false);
                setReportReason("");
                refetch();
              } catch (err) {
                console.error(err);
              } finally {
                setIsReporting(false);
              }
            }}
            isLoading={isReporting}
            disabled={!reportReason.trim() || isReporting}
          >
            Submit Report
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
