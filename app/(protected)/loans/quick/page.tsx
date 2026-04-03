'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoans } from '@/hooks/useLoans';
import { templatesApi } from '@/lib/api';
import { NLLoanInput } from '@/components/loans/NLLoanInput';
import type { ParsedLoanData } from '@/lib/nlParser';
import { createLoanSchema, type CreateLoanFormData } from '@/lib/validations';
import type { LoanTemplate } from '@/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Input,
  Select,
  Badge,
} from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowLeft,
  CheckCircle,
  Sparkles,
  PenLine,
  ArrowRight,
  Calculator,
  Loader2,
} from 'lucide-react';

type InputMode = 'natural' | 'manual';

export default function QuickLendPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const { createLoan } = useLoans();
  const [mode, setMode] = useState<InputMode>('natural');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedLoanData | null>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(!!templateId);
  const [templateData, setTemplateData] = useState<LoanTemplate | null>(null);

  // Form for manual mode AND for editing parsed data
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
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

  // Load template if templateId is provided
  useEffect(() => {
    if (templateId) {
      const loadTemplate = async () => {
        try {
          const templates = await templatesApi.getAll();
          const found = templates.find((t) => t.id === templateId);
          if (found) {
            setTemplateData(found);
            // Reset form with template data
            reset({
              borrowerEmail: '',
              principal: 0,
              interestRate: found.interestRate,
              installments: found.installments,
              frequency: found.frequency,
              startDate: new Date().toISOString().split('T')[0],
              autoDebit: found.autoDebit,
              templateId: found.id,
            });
            setMode('manual'); // Switch to manual mode when template is loaded
          }
        } catch (err) {
          console.error('Failed to load template:', err);
        } finally {
          setIsLoadingTemplate(false);
        }
      };
      loadTemplate();
    }
  }, [templateId, reset]);

  const principal = watch('principal') || 0;
  const interestRate = watch('interestRate') || 0;
  const installments = watch('installments') || 1;
  const frequency = watch('frequency');

  // Handle NL parsed data
  const handleParsed = useCallback((data: ParsedLoanData) => {
    setParsedData(data);
  }, []);

  // Handle NL confirm - populate form and switch to review mode
  const handleNLConfirm = useCallback((data: ParsedLoanData) => {
    // Use the resolved email from backend (NLLoanInput now resolves name → email via API)
    if (data.borrowerEmail) {
      setValue('borrowerEmail', data.borrowerEmail);
    } else {
      // No email resolved — leave empty so user can fill it in manually
      setValue('borrowerEmail', '');
    }
    if (data.amount) setValue('principal', data.amount);
    if (data.interestRate !== undefined) setValue('interestRate', data.interestRate);
    if (data.installments) setValue('installments', data.installments);
    if (data.frequency) setValue('frequency', data.frequency);
    setValue('startDate', new Date().toISOString().split('T')[0]);
    setValue('autoDebit', true);

    // Switch to manual mode for review/edit
    setMode('manual');
  }, [setValue]);

  // Submit loan
  const onSubmit = async (data: CreateLoanFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createLoan(data);
      setSuccess(true);
      setTimeout(() => {
        router.push('/loans');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create loan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Loan Created!
            </h2>
            <p className="text-gray-600 mb-4">
              The borrower will receive a notification to accept this loan.
            </p>
            <p className="text-sm text-gray-500">Redirecting to loans...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalAmount = principal * (1 + interestRate / 100);
  const perInstallment = totalAmount / (installments || 1);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/loans"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Loans
      </Link>

      {/* Header with mode toggle */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quick Lend</h1>
          <p className="text-gray-600">
            {templateData
              ? `Using template: ${templateData.templateName}. Just enter borrower email and amount.`
              : 'Create a loan in seconds'
            }
          </p>
        </div>
        {!templateData && (
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setMode('natural')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'natural'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Natural
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'manual'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <PenLine className="w-4 h-4" />
              Form
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Natural Language Mode - Only if no template */}
      {mode === 'natural' && !templateData && (
        <div className="space-y-4">
          <NLLoanInput onParsed={handleParsed} onConfirm={handleNLConfirm} />

          <p className="text-center text-sm text-gray-500">
            Or{' '}
            <button
              onClick={() => setMode('manual')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              fill out the form manually
            </button>
          </p>
        </div>
      )}

      {/* Manual/Review Mode */}
      {mode === 'manual' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {parsedData ? 'Review & Confirm' : 'Loan Details'}
              </CardTitle>
              {parsedData && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Filled
                </Badge>
              )}
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <Input
                label="Borrower Email"
                type="email"
                placeholder="borrower@email.com or phone number"
                helperText="Tip: Use Natural mode above to search by phone number"
                error={errors.borrowerEmail?.message}
                {...register('borrowerEmail')}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Amount (USD)"
                  type="number"
                  step="0.01"
                  min="0.01"
                  error={errors.principal?.message}
                  {...register('principal', { valueAsNumber: true })}
                />
                <Input
                  label="Interest Rate (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  error={errors.interestRate?.message}
                  {...register('interestRate', { valueAsNumber: true })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Installments"
                  type="number"
                  min="1"
                  error={errors.installments?.message}
                  {...register('installments', { valueAsNumber: true })}
                />
                <Select
                  label="Frequency"
                  options={[
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                  ]}
                  error={errors.frequency?.message}
                  {...register('frequency')}
                />
              </div>

              <Input
                label="Start Date"
                type="date"
                error={errors.startDate?.message}
                {...register('startDate')}
              />

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoDebit"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  {...register('autoDebit')}
                />
                <label htmlFor="autoDebit" className="text-sm text-gray-700">
                  Enable auto-debit from borrower&apos;s wallet
                </label>
              </div>

              {/* Preview */}
              {principal > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Loan Summary
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-blue-600">Total:</span>{' '}
                      <span className="font-semibold text-blue-900">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-600">Per {frequency?.slice(0, -2)}:</span>{' '}
                      <span className="font-semibold text-blue-900">
                        {formatCurrency(perInstallment)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              {parsedData && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMode('natural');
                    reset();
                    setParsedData(null);
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                type="submit"
                className={parsedData ? '' : 'w-full'}
                isLoading={isSubmitting}
              >
                Create Loan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Link to full form */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Need more options?{' '}
          <Link
            href="/loans/create"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create a full loan
          </Link>
        </p>
      </div>
    </div>
  );
}
