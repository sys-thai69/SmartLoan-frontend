'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLoans } from '@/hooks/useLoans';
import { LoanCard } from '@/components/loans/LoanCard';
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  Badge,
} from '@/components/ui';
import type { LoanStatus } from '@/types';
import { Plus, Zap, FileText, Filter } from 'lucide-react';

type TabType = 'all' | 'lent' | 'borrowed';

export default function LoansPage() {
  const { user } = useAuth();
  const { loans, isLoading } = useLoans();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [statusFilter, setStatusFilter] = useState<LoanStatus | 'all'>('all');

  // Filter loans based on tab and status
  const filteredLoans = loans.filter((loan) => {
    // Tab filter
    if (activeTab === 'lent' && loan.lenderId !== user?.id) return false;
    if (activeTab === 'borrowed' && loan.borrowerId !== user?.id) return false;

    // Status filter
    if (statusFilter !== 'all' && loan.status !== statusFilter) return false;

    return true;
  });

  // Count by status
  const statusCounts = {
    all: loans.length,
    pending_acceptance: loans.filter((l) => l.status === 'pending_acceptance').length,
    active: loans.filter((l) => l.status === 'active').length,
    overdue: loans.filter((l) => l.status === 'overdue').length,
    completed: loans.filter((l) => l.status === 'completed').length,
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
    </div>
  );
}
