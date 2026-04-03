'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLoans } from '@/hooks/useLoans';
import { LoanCard } from '@/components/loans/LoanCard';
import { templatesApi } from '@/lib/api';
import type { LoanTemplate } from '@/types';
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  Badge,
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from '@/components/ui';
import type { LoanStatus } from '@/types';
import { Plus, Zap, FileText, Filter, Percent, Calendar, Search, X } from 'lucide-react';

type TabType = 'all' | 'lent' | 'borrowed';

export default function LoansPage() {
  const { user } = useAuth();
  const { loans, isLoading } = useLoans();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [statusFilter, setStatusFilter] = useState<LoanStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<LoanTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<LoanTemplate | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await templatesApi.getAll();
        setTemplates(data);
      } catch (err) {
        console.error('Failed to load templates:', err);
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    loadTemplates();
  }, []);

  const useTemplate = (template: LoanTemplate) => {
    setSelectedTemplate(template);
    setIsTemplateModalOpen(true);
  };

  // Filter loans based on tab, status, and search
  const filteredLoans = loans.filter((loan) => {
    // Tab filter
    if (activeTab === 'lent' && loan.lenderId !== user?.id) return false;
    if (activeTab === 'borrowed' && loan.borrowerId !== user?.id) return false;

    // Status filter
    if (statusFilter !== 'all' && loan.status !== statusFilter) return false;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const otherParty = loan.lenderId === user?.id ? loan.borrower : loan.lender;
      const personName = otherParty?.name?.toLowerCase() || '';
      const amountStr = loan.totalAmount.toString();

      const matchesName = personName.includes(query);
      const matchesAmount = amountStr.includes(query);

      if (!matchesName && !matchesAmount) return false;
    }

    return true;
  });

  // Count by status
  const statusCounts = {
    all: loans.length,
    pending_acceptance: loans.filter((l) => l.status === 'pending_acceptance').length,
    active: loans.filter((l) => l.status === 'active').length,
    overdue: loans.filter((l) => l.status === 'overdue').length,
    completed: loans.filter((l) => l.status === 'completed').length,
    declined: loans.filter((l) => l.status === 'declined').length,
    cancelled: loans.filter((l) => l.status === 'cancelled').length,
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All Loans' },
    { key: 'lent', label: 'Money I Lent' },
    { key: 'borrowed', label: 'Money I Borrowed' },
  ];

  const statusOptions: { key: LoanStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'All Status' },
    { key: 'pending_acceptance', label: 'Pending' },
    { key: 'active', label: 'Active' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'completed', label: 'Completed' },
    { key: 'declined', label: 'Declined' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Loans</h1>
          <p className="text-gray-600">
            Manage all your loans in one place
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or amount..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Templates Section */}
      {!isLoadingTemplates && templates.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Quick Start with Templates</h2>
          {/* Templates Carousel */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-auto pb-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => useTemplate(template)}
                className="text-left p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-gray-900 text-sm mb-2 truncate">
                  {template.templateName}
                </p>
                <div className="space-y-1 text-xs text-gray-700">
                  <div className="flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    <span>{template.interestRate}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{template.installments} {template.frequency}s</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    template.autoDebit
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {template.autoDebit ? '✓ Auto-debit' : 'Manual'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Filter by status:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setStatusFilter(option.key)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === option.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
              {option.key !== 'all' && (
                <Badge variant="secondary" className="ml-1">
                  {statusCounts[option.key as keyof typeof statusCounts]}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Loans List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-2 bg-gray-200 rounded w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredLoans.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredLoans.map((loan) => (
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
              icon={<FileText className="w-8 h-8 text-gray-400" />}
              title="No loans found"
              description={
                statusFilter !== 'all'
                  ? `No ${statusFilter.replace('_', ' ')} loans found. Try adjusting your filter.`
                  : 'Create your first loan to get started.'
              }
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

      {/* Template Usage Modal */}
      <Modal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)}>
        <ModalHeader onClose={() => setIsTemplateModalOpen(false)}>
          Use Template: {selectedTemplate?.templateName}
        </ModalHeader>
        <ModalContent className="text-center py-6">
          <p className="text-gray-700 mb-6">What do you want to do?</p>
          <div className="space-y-3">
            <Link href={`/loans/create?templateId=${selectedTemplate?.id}`}>
              <Button className="w-full mb-2" size="lg">
                <Zap className="w-4 h-4 mr-2" />
                Create Loan with This Template
              </Button>
            </Link>
            <Link href={`/loans/quick?templateId=${selectedTemplate?.id}`}>
              <Button variant="secondary" className="w-full" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Quick Lend with This Template
              </Button>
            </Link>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setIsTemplateModalOpen(false)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
