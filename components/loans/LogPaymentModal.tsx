'use client';

import { useState } from 'react';
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
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Installment #{scheduleItem.installmentNo}
              </p>
              <p className="text-sm text-gray-600">
                Due: {formatDate(scheduleItem.dueDate)}
              </p>
              <p className="font-medium text-gray-900">
                Amount Due: {formatCurrency(scheduleItem.amountDue)}
              </p>
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
              placeholder={mode === 'pay' ? 'e.g., Wing transfer ref' : 'e.g., Wing transfer ref #123'}
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
