'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { templatesApi } from '@/lib/api';
import { createTemplateSchema, type CreateTemplateFormData } from '@/lib/validations';
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
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  EmptyState,
} from '@/components/ui';
import { Plus, Trash2, FileText, Calendar, Percent, Loader2 } from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<LoanTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTemplateFormData>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      templateName: '',
      interestRate: 0,
      frequency: 'monthly',
      installments: 1,
      autoDebit: true,
    },
  });

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await templatesApi.getAll();
      setTemplates(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleCreateTemplate = async (data: CreateTemplateFormData) => {
    try {
      setIsSubmitting(true);
      const newTemplate = await templatesApi.create(data);
      setTemplates((prev) => [newTemplate, ...prev]);
      setIsModalOpen(false);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      setDeletingId(id);
      await templatesApi.delete(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const frequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Templates</h1>
          <p className="text-gray-600">
            Save common loan configurations for quick reuse
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Templates Grid */}
      {templates.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="text-base">{template.templateName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Percent className="w-4 h-4" />
                  <span>Interest: {template.interestRate}%</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {template.installments} {template.frequency} payments
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      template.autoDebit
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Auto-debit: {template.autoDebit ? 'On' : 'Off'}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteTemplate(template.id)}
                  isLoading={deletingId === template.id}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <EmptyState
              icon={<FileText className="w-8 h-8 text-gray-400" />}
              title="No templates yet"
              description="Create templates to speed up your loan creation process."
              action={
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Create Template Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader onClose={() => setIsModalOpen(false)}>
          Create New Template
        </ModalHeader>
        <form onSubmit={handleSubmit(handleCreateTemplate)}>
          <ModalContent className="space-y-4">
            <Input
              label="Template Name"
              placeholder="e.g., Hangout Loan"
              error={errors.templateName?.message}
              {...register('templateName')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Interest Rate (%)"
                type="number"
                step="0.1"
                min="0"
                error={errors.interestRate?.message}
                {...register('interestRate', { valueAsNumber: true })}
              />
              <Input
                label="Installments"
                type="number"
                min="1"
                error={errors.installments?.message}
                {...register('installments', { valueAsNumber: true })}
              />
            </div>

            <Select
              label="Payment Frequency"
              options={frequencyOptions}
              error={errors.frequency?.message}
              {...register('frequency')}
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoDebit"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                {...register('autoDebit')}
              />
              <label htmlFor="autoDebit" className="text-sm text-gray-700">
                Enable auto-debit by default
              </label>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Template
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
