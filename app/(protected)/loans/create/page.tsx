'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoans } from '@/hooks/useLoans';
import { createLoanSchema, type CreateLoanFormData } from '@/lib/validations';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Select,
} from '@/components/ui';
import { formatCurrency, calculateTotalAmount, calculateInstallmentAmount } from '@/lib/utils';
import { ArrowLeft, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function CreateLoanPage() {
  const router = useRouter();
  const { createLoan } = useLoans();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateLoanFormData>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      borrowerEmail: '',
      principal: 0,
      interestRate: 0,
      installments: 1,
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      autoDebit: false,
    },
  });

  // Watch values for preview
  const principal = watch('principal') || 0;
  const interestRate = watch('interestRate') || 0;
  const installments = watch('installments') || 1;
  const frequency = watch('frequency');

  const totalAmount = calculateTotalAmount(principal, interestRate);
  const installmentAmount = calculateInstallmentAmount(totalAmount, installments);

  const onSubmit = async (data: CreateLoanFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createLoan(data);
      router.push('/loans');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create loan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const frequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/loans"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Loans
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Loan</CardTitle>
          <CardDescription>
            Fill in the details to create a new loan agreement.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Borrower Email */}
            <Input
              label="Borrower Email"
              type="email"
              placeholder="borrower@email.com"
              helperText="The borrower will receive a notification to accept this loan"
              error={errors.borrowerEmail?.message}
              {...register('borrowerEmail')}
            />

            {/* Amount & Interest */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Principal Amount (USD)"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                error={errors.principal?.message}
                {...register('principal', { valueAsNumber: true })}
              />
              <Input
                label="Interest Rate (%)"
                type="number"
                step="0.1"
                min="0"
                placeholder="0"
                helperText="Optional. Leave 0 for interest-free"
                error={errors.interestRate?.message}
                {...register('interestRate', { valueAsNumber: true })}
              />
            </div>

            {/* Repayment Schedule */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Number of Installments"
                type="number"
                min="1"
                placeholder="1"
                error={errors.installments?.message}
                {...register('installments', { valueAsNumber: true })}
              />
              <Select
                label="Payment Frequency"
                options={frequencyOptions}
                error={errors.frequency?.message}
                {...register('frequency')}
              />
            </div>

            {/* Start Date */}
            <Input
              label="Start Date"
              type="date"
              error={errors.startDate?.message}
              {...register('startDate')}
            />

            {/* Auto Debit */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoDebit"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                {...register('autoDebit')}
              />
              <label htmlFor="autoDebit" className="text-sm text-gray-700">
                Enable auto-debit from borrower&apos;s Wing wallet
              </label>
            </div>

            {/* Preview */}
            {principal > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Loan Preview</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-blue-600">Principal</p>
                    <p className="font-semibold text-blue-900">
                      {formatCurrency(principal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-600">Total Interest</p>
                    <p className="font-semibold text-blue-900">
                      {formatCurrency(totalAmount - principal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-600">Total Repayable</p>
                    <p className="font-semibold text-blue-900">
                      {formatCurrency(totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-600">Per Installment</p>
                    <p className="font-semibold text-blue-900">
                      {formatCurrency(installmentAmount)} / {frequency}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-3">
            <Link href="/loans">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={isSubmitting}>
              Create Loan
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
