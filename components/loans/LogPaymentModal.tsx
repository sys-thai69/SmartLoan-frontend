'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { RepaymentScheduleItem } from '@/types';
import { logPaymentSchema, type LogPaymentFormData } from '@/lib/validations';
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  Input,
} from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';

interface LogPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleItem: RepaymentScheduleItem | null;
  maxAmount: number;
  onSubmit: (data: LogPaymentFormData) => Promise<void>;
  mode?: 'log' | 'pay' | 'auto-debit';
}

export function LogPaymentModal({
  isOpen,
  onClose,
  scheduleItem,
  maxAmount,
  onSubmit,
  mode = 'log',
}: LogPaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTitle = () => {
    if (mode === 'pay') return 'Make Payment';
    if (mode === 'auto-debit') return 'Initiate Auto-Debit';
    return 'Log Payment';
  };

  const getSubmitLabel = () => {
    if (mode === 'pay') return 'Pay Now';
    if (mode === 'auto-debit') return 'Initiate Auto-Debit';
    return 'Log Payment';
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LogPaymentFormData>({
    resolver: zodResolver(logPaymentSchema),
    defaultValues: {
      amount: scheduleItem?.amountDue || 0,
      paymentDate: new Date().toISOString().split('T')[0],
      note: '',
      scheduleId: scheduleItem?.id,
    },
  });

  // Update form values when scheduleItem changes (when modal opens/changes)
  useEffect(() => {
    if (scheduleItem) {
      setValue('amount', scheduleItem.amountDue);
      setValue('scheduleId', scheduleItem.id);
    }
  }, [scheduleItem, setValue]);

  const watchAmount = watch('amount');

  const handleFormSubmit = async (data: LogPaymentFormData) => {
    if (data.amount > maxAmount) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...data,
        scheduleId: scheduleItem?.id,
      });
      reset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>{getTitle()}</ModalHeader>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <ModalContent>
          {scheduleItem && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-blue-900">
                  Installment: Week {scheduleItem.installmentNo}
                </p>
                <span className={`text-xs px-2 py-1 rounded ${
                  scheduleItem.isPaid
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {scheduleItem.isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
              <p className="text-sm text-blue-700 mb-1">
                Due: {formatDate(scheduleItem.dueDate)}
              </p>
              <p className="font-medium text-gray-900">
                Amount Due: {formatCurrency(scheduleItem.amountDue)}
              </p>
              {mode === 'pay' && (
                <p className="text-xs text-blue-600 mt-2">
                  ℹ️ This payment will be deducted from your wallet
                </p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0.01"
              max={maxAmount}
              error={errors.amount?.message}
              helperText={`Maximum: ${formatCurrency(maxAmount)}`}
              {...register('amount', { valueAsNumber: true })}
            />

            {mode === 'log' && (
              <Input
                label="Payment Date"
                type="date"
                error={errors.paymentDate?.message}
                {...register('paymentDate')}
              />
            )}

            <Input
              label="Note (optional)"
              placeholder={mode === 'pay' ? 'e.g., Transaction reference' : 'e.g., Transaction reference #123'}
              error={errors.note?.message}
              {...register('note')}
            />
          </div>
        </ModalContent>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {getSubmitLabel()}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
