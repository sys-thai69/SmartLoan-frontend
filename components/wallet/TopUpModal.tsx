'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { topUpSchema, type TopUpFormData } from '@/lib/validations';
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  Input,
} from '@/components/ui';
import { CreditCard } from 'lucide-react';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
}

export function TopUpModal({ isOpen, onClose, onSubmit }: TopUpModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TopUpFormData>({
    resolver: zodResolver(topUpSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const quickAmounts = [10, 20, 50, 100];

  const handleFormSubmit = async (data: TopUpFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data.amount);
      reset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAmount = (amount: number) => {
    reset({ amount });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Top Up Wallet
        </div>
      </ModalHeader>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <ModalContent>
          <div className="space-y-4">
            {/* Quick Amount Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Select
              </label>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleQuickAmount(amount)}
                    className="py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Amount (USD)"
              type="number"
              step="0.01"
              min="1"
              placeholder="Enter amount"
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />

            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                This is a mock wallet for demonstration. No real money is involved.
              </p>
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Top Up
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
