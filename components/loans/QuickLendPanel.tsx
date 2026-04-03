'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LoanTemplate, ParseLoanResponse } from '@/types';
import { quickLendSchema, type QuickLendFormData } from '@/lib/validations';
import { aiApi, templatesApi } from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Input,
  Select,
} from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Sparkles, Zap } from 'lucide-react';

interface QuickLendPanelProps {
  onSubmit: (data: QuickLendFormData) => Promise<void>;
}

export function QuickLendPanel({ onSubmit }: QuickLendPanelProps) {
  const [templates, setTemplates] = useState<LoanTemplate[]>([]);
  const [isParsingAI, setIsParsingAI] = useState(false);
  const [nlInput, setNlInput] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ParseLoanResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuickLendFormData>({
    resolver: zodResolver(quickLendSchema),
    defaultValues: {
      borrowerEmail: '',
      amount: 0,
      templateId: '',
    },
  });

  const selectedTemplateId = watch('templateId');

  // Fetch templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await templatesApi.getAll();
        setTemplates(data);
      } catch {
        console.error('Failed to load templates');
      }
    };
    loadTemplates();
  }, []);

  // Apply template defaults when selected
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find((t) => t.id === selectedTemplateId);
      if (template) {
        // Template applies default settings, user still provides amount
      }
    }
  }, [selectedTemplateId, templates]);

  // AI Natural Language Parser
  const handleAIParse = async () => {
    if (!nlInput.trim()) return;

    try {
      setIsParsingAI(true);
      const result = await aiApi.parseLoan({ text: nlInput });
      setParsedPreview(result);

      if (result.parsed) {
        if (result.borrowerEmail) {
          setValue('borrowerEmail', result.borrowerEmail);
        }
        if (result.amount) {
          setValue('amount', result.amount);
        }
      }
    } catch {
      console.error('Failed to parse loan');
    } finally {
      setIsParsingAI(false);
    }
  };

  const handleFormSubmit = async (data: QuickLendFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const templateOptions = templates.map((t) => ({
    value: t.id,
    label: t.templateName,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <CardTitle>Quick Lend</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AI Natural Language Input */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              AI Smart Advisor
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., lend Dara $50, pay back in 2 weeks"
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAIParse}
              isLoading={isParsingAI}
            >
              Parse
            </Button>
          </div>
          {parsedPreview && parsedPreview.parsed && (
            <div className="mt-2 text-sm text-purple-700">
              Detected: {parsedPreview.borrowerEmail} - {formatCurrency(parsedPreview.amount || 0)}
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-400">or fill manually</div>

        <form id="quick-lend-form" onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4">
            <Input
              label="Borrower Email"
              type="email"
              placeholder="borrower@email.com"
              error={errors.borrowerEmail?.message}
              {...register('borrowerEmail')}
            />

            <Input
              label="Amount (USD)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />

            {templates.length > 0 && (
              <Select
                label="Use Template (optional)"
                options={[{ value: '', label: 'No template' }, ...templateOptions]}
                {...register('templateId')}
              />
            )}
          </div>
        </form>
      </CardContent>

      <CardFooter>
        <Button
          type="submit"
          form="quick-lend-form"
          className="w-full"
          isLoading={isSubmitting}
        >
          <Zap className="w-4 h-4 mr-2" />
          Quick Lend
        </Button>
      </CardFooter>
    </Card>
  );
}
