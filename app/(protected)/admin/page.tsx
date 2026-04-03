'use client';

import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '@/lib/api';
import type { PlatformStats, UserWithStats, Loan, AdminUserDetail } from '@/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Avatar,
  getStatusBadgeVariant,
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from '@/components/ui';
import { formatCurrency, formatDate, formatStatus, formatRelativeTime } from '@/lib/utils';
import {
  Users,
  FileText,
  Flag,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Search,
  Shield,
  ShieldOff,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Loader2,
  RefreshCw,
  XCircle,
  Activity,
  Banknote,
  Lock,
} from 'lucide-react';

type Tab = 'users' | 'loans' | 'flagged';

export default function AdminPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [allLoans, setAllLoans] = useState<Loan[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loadError, setLoadError] = useState<string | null>(null);

  // User detail modal
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Actions
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [s, u, l] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getAllLoans(),
      ]);
      setStats(s);
      setUsers(u);
      setAllLoans(l);
    } catch (err: unknown) {
      console.error('Failed to load admin data', err);
      // Extract meaningful error message
      const error = err as { status?: number; message?: string };
      if (error?.status === 403) {
        setLoadError('Access Denied: You need admin privileges to view this page. If you are the first admin, use the admin setup flow.');
      } else if (error?.status === 401) {
        setLoadError('Authentication required. Please log in again.');
      } else {
        setLoadError(error?.message || 'Failed to load admin data. Please check if the backend server is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  // Filtered loans
  const filteredLoans = useMemo(() => {
    let result = allLoans;
    if (activeTab === 'flagged') {
      result = result.filter((l) => l.flagged);
    }
    if (statusFilter !== 'all') {
      result = result.filter((l) => l.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.lender?.name?.toLowerCase().includes(q) ||
          l.borrower?.name?.toLowerCase().includes(q) ||
          l.lender?.email?.toLowerCase().includes(q) ||
          l.borrower?.email?.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allLoans, searchQuery, statusFilter, activeTab]);

  // Flagged count
  const flaggedCount = allLoans.filter((l) => l.flagged).length;

  // Open user detail
  const openUserDetail = async (userId: string) => {
    setSelectedUserId(userId);
    setIsLoadingDetail(true);
    try {
      const detail = await adminApi.getUserDetail(userId);
      setUserDetail(detail);
    } catch (err) {
      console.error('Failed to fetch user detail', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Role toggle
  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const action = newRole === 'admin' ? 'promote to admin' : 'demote to user';
    if (!confirm(`Are you sure you want to ${action}?`)) return;
    setActioningId(userId);
    try {
      const updated = await adminApi.setUserRole(userId, newRole as 'user' | 'admin');
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
    } catch (err) {
      console.error('Failed to update role', err);
    } finally {
      setActioningId(null);
    }
  };

  // Unflag loan
  const handleUnflag = async (loanId: string) => {
    if (!confirm('Remove the flag from this loan?')) return;
    setActioningId(loanId);
    try {
      await adminApi.unflagLoan(loanId);
      setAllLoans((prev) =>
        prev.map((l) =>
          l.id === loanId ? { ...l, flagged: false, flagReason: undefined } : l
        )
      );
    } catch (err) {
      console.error('Failed to unflag', err);
    } finally {
      setActioningId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Error state — show clear error message
  if (loadError) {
    return (
      <div className="max-w-lg mx-auto mt-20">
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Cannot Load Admin Dashboard</h2>
            <p className="text-gray-600 mb-6 text-sm">{loadError}</p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" onClick={fetchData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'loans', label: 'All Loans', icon: <FileText className="w-4 h-4" /> },
    {
      id: 'flagged',
      label: 'Flagged',
      icon: <Flag className="w-4 h-4" />,
      count: flaggedCount,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage users, loans, and flagged reports
          </p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <StatCard
            icon={<Users className="w-5 h-5 text-indigo-500" />}
            label="Users"
            value={stats.totalUsers}
            bg="bg-indigo-50"
          />
          <StatCard
            icon={<FileText className="w-5 h-5 text-blue-500" />}
            label="Total Loans"
            value={stats.totalLoans}
            bg="bg-blue-50"
          />
          <StatCard
            icon={<Activity className="w-5 h-5 text-green-500" />}
            label="Active"
            value={stats.activeLoans}
            bg="bg-green-50"
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5 text-orange-500" />}
            label="Overdue"
            value={stats.overdueLoans}
            bg="bg-orange-50"
          />
          <StatCard
            icon={<Flag className="w-5 h-5 text-red-500" />}
            label="Flagged"
            value={stats.flaggedLoans}
            bg="bg-red-50"
            highlight={stats.flaggedLoans > 0}
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
            label="Volume"
            value={formatCurrency(stats.totalVolume)}
            bg="bg-emerald-50"
            isString
          />
          <StatCard
            icon={<Banknote className="w-5 h-5 text-violet-500" />}
            label="Revenue"
            value={formatCurrency(stats.platformRevenue || 0)}
            bg="bg-violet-50"
            isString
            highlight={(stats.platformRevenue || 0) > 0}
            highlightColor="text-violet-600"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-cyan-500" />}
            label="Fee Txns"
            value={stats.totalFeeTransactions || 0}
            bg="bg-cyan-50"
          />
        </div>
      )}

      {/* Platform Fee Info Banner */}
      {stats && (stats.platformRevenue || 0) > 0 && (
        <div className="p-3 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-900">
              Platform Revenue: {formatCurrency(stats.platformRevenue || 0)}
            </span>
            <span className="text-xs text-violet-600">
              from {stats.totalFeeTransactions || 0} transactions (1.5% fee on payments above $500)
            </span>
          </div>
        </div>
      )}

      {/* Tab Bar + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'users'
                ? 'Search users by name or email...'
                : 'Search loans by name, email, or ID...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status filter (Loans/Flagged tabs only) */}
        {activeTab !== 'users' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="pending_acceptance">Pending</option>
            <option value="active">Active</option>
            <option value="overdue">Overdue</option>
            <option value="completed">Completed</option>
            <option value="declined">Declined</option>
            <option value="cancelled">Cancelled</option>
          </select>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <UsersTable
          users={filteredUsers}
          actioningId={actioningId}
          onRoleToggle={handleRoleToggle}
          onViewUser={openUserDetail}
        />
      )}
      {(activeTab === 'loans' || activeTab === 'flagged') && (
        <LoansTable
          loans={filteredLoans}
          actioningId={actioningId}
          onUnflag={handleUnflag}
          onViewUser={openUserDetail}
          isFlaggedTab={activeTab === 'flagged'}
        />
      )}

      {/* User Detail Modal */}
      <Modal
        isOpen={!!selectedUserId}
        onClose={() => {
          setSelectedUserId(null);
          setUserDetail(null);
        }}
        className="max-w-2xl"
      >
        <ModalHeader
          onClose={() => {
            setSelectedUserId(null);
            setUserDetail(null);
          }}
        >
          User Details
        </ModalHeader>
        <ModalContent>
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : userDetail ? (
            <UserDetailView detail={userDetail} />
          ) : (
            <p className="text-center text-gray-500 py-8">Could not load user details.</p>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

/* ─── Stat Card ──────────────────────────────────────── */
function StatCard({
  icon,
  label,
  value,
  bg,
  highlight,
  highlightColor,
  isString,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bg: string;
  highlight?: boolean;
  highlightColor?: string;
  isString?: boolean;
}) {
  return (
    <Card className={highlight ? 'ring-2 ring-red-200' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <p className={`text-lg font-bold ${highlight ? (highlightColor || 'text-red-600') : 'text-gray-900'}`}>
              {isString ? value : Number(value).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Users Table ────────────────────────────────────── */
function UsersTable({
  users,
  actioningId,
  onRoleToggle,
  onViewUser,
}: {
  users: UserWithStats[];
  actioningId: string | null;
  onRoleToggle: (id: string, currentRole: string) => void;
  onViewUser: (id: string) => void;
}) {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          No users found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left p-3 font-medium text-gray-500">User</th>
              <th className="text-left p-3 font-medium text-gray-500">Role</th>
              <th className="text-center p-3 font-medium text-gray-500">Lent</th>
              <th className="text-center p-3 font-medium text-gray-500">Borrowed</th>
              <th className="text-center p-3 font-medium text-gray-500">Trust</th>
              <th className="text-left p-3 font-medium text-gray-500">Joined</th>
              <th className="text-right p-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-3">
                  <button
                    onClick={() => onViewUser(u.id)}
                    className="flex items-center gap-2.5 hover:underline text-left"
                  >
                    <Avatar name={u.name || 'U'} size="sm" />
                    <div>
                      <p className="font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </button>
                </td>
                <td className="p-3">
                  <Badge variant={u.role === 'admin' ? 'secondary' : 'default'}>
                    {u.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                </td>
                <td className="p-3 text-center font-medium">{u.loanCount}</td>
                <td className="p-3 text-center font-medium">{u.borrowCount}</td>
                <td className="p-3 text-center">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                      (u.trustScore || 0) >= 80
                        ? 'bg-green-100 text-green-700'
                        : (u.trustScore || 0) >= 60
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {u.trustScore || 0}
                  </span>
                </td>
                <td className="p-3 text-gray-500 text-xs">
                  {u.createdAt ? formatDate(u.createdAt) : 'N/A'}
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onViewUser(u.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRoleToggle(u.id, u.role || 'user')}
                      disabled={actioningId === u.id}
                      className={`p-1.5 rounded-lg transition-colors ${
                        u.role === 'admin'
                          ? 'text-orange-400 hover:text-orange-600 hover:bg-orange-50'
                          : 'text-green-400 hover:text-green-600 hover:bg-green-50'
                      }`}
                      title={u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                    >
                      {actioningId === u.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : u.role === 'admin' ? (
                        <ShieldOff className="w-4 h-4" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ─── Loans Table ────────────────────────────────────── */
function LoansTable({
  loans,
  actioningId,
  onUnflag,
  onViewUser,
  isFlaggedTab,
}: {
  loans: Loan[];
  actioningId: string | null;
  onUnflag: (id: string) => void;
  onViewUser: (id: string) => void;
  isFlaggedTab: boolean;
}) {
  if (loans.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          {isFlaggedTab ? (
            <div>
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No flagged loans</p>
              <p className="text-xs text-gray-400 mt-1">All loans are clear 🎉</p>
            </div>
          ) : (
            <p className="text-gray-500">No loans found.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left p-3 font-medium text-gray-500">ID</th>
              <th className="text-left p-3 font-medium text-gray-500">Lender</th>
              <th className="text-left p-3 font-medium text-gray-500">Borrower</th>
              <th className="text-right p-3 font-medium text-gray-500">Principal</th>
              <th className="text-right p-3 font-medium text-gray-500">Total</th>
              <th className="text-center p-3 font-medium text-gray-500">Status</th>
              {isFlaggedTab && (
                <th className="text-left p-3 font-medium text-gray-500">Reason</th>
              )}
              <th className="text-left p-3 font-medium text-gray-500">Created</th>
              <th className="text-right p-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr
                key={loan.id}
                className={`border-b border-gray-50 transition-colors ${
                  loan.flagged
                    ? 'bg-red-50/40 hover:bg-red-50/70'
                    : 'hover:bg-slate-50/50'
                }`}
              >
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    {loan.flagged && <Flag className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                    <span className="font-mono text-xs text-gray-500">
                      {loan.id.slice(0, 8)}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => loan.lenderId && onViewUser(loan.lenderId)}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <Avatar name={loan.lender?.name || 'U'} size="sm" />
                    <span className="text-gray-900 font-medium text-xs">
                      {loan.lender?.name || 'Unknown'}
                    </span>
                  </button>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => loan.borrowerId && onViewUser(loan.borrowerId)}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <Avatar name={loan.borrower?.name || 'U'} size="sm" />
                    <span className="text-gray-900 font-medium text-xs">
                      {loan.borrower?.name || 'Unknown'}
                    </span>
                  </button>
                </td>
                <td className="p-3 text-right font-medium text-gray-900">
                  {formatCurrency(loan.principal)}
                </td>
                <td className="p-3 text-right text-gray-600 text-xs">
                  {formatCurrency(loan.totalAmount)}
                </td>
                <td className="p-3 text-center">
                  <Badge variant={getStatusBadgeVariant(loan.status)} className="text-[10px]">
                    {formatStatus(loan.status)}
                  </Badge>
                </td>
                {isFlaggedTab && (
                  <td className="p-3">
                    <p className="text-xs text-red-600 max-w-[200px] truncate" title={loan.flagReason}>
                      {loan.flagReason || 'No reason provided'}
                    </p>
                  </td>
                )}
                <td className="p-3 text-gray-500 text-xs">
                  {formatRelativeTime(loan.createdAt)}
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-1.5">
                    {loan.flagged && (
                      <button
                        onClick={() => onUnflag(loan.id)}
                        disabled={actioningId === loan.id}
                        className="p-1.5 rounded-lg text-green-500 hover:text-green-700 hover:bg-green-50 transition-colors"
                        title="Remove flag"
                      >
                        {actioningId === loan.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ─── User Detail View (inside modal) ────────────────── */
function UserDetailView({ detail }: { detail: AdminUserDetail }) {
  const { user, loansAsLender, loansAsBorrower } = detail;
  const [loanTab, setLoanTab] = useState<'lender' | 'borrower'>('lender');
  const displayedLoans = loanTab === 'lender' ? loansAsLender : loansAsBorrower;

  return (
    <div className="space-y-5">
      {/* User Info */}
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
        <Avatar name={user.name || 'U'} size="lg" />
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={user.role === 'admin' ? 'secondary' : 'default'}>
              {user.role === 'admin' ? 'Admin' : 'User'}
            </Badge>
            <span className="text-xs text-gray-400">
              Joined {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-full text-xl font-bold ${
              (user.trustScore || 0) >= 80
                ? 'bg-green-100 text-green-700'
                : (user.trustScore || 0) >= 60
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {user.trustScore || 0}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Trust</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-center">
          <ArrowUpRight className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-green-700">{user.loanCount}</p>
          <p className="text-xs text-green-600">Loans Given</p>
        </div>
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-center">
          <ArrowDownLeft className="w-5 h-5 text-purple-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-purple-700">{user.borrowCount}</p>
          <p className="text-xs text-purple-600">Loans Taken</p>
        </div>
      </div>

      {/* Loan Tabs */}
      <div>
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg mb-3">
          <button
            onClick={() => setLoanTab('lender')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
              loanTab === 'lender'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            As Lender ({loansAsLender.length})
          </button>
          <button
            onClick={() => setLoanTab('borrower')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
              loanTab === 'borrower'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            As Borrower ({loansAsBorrower.length})
          </button>
        </div>

        {displayedLoans.length > 0 ? (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {displayedLoans.map((loan) => {
              const other =
                loanTab === 'lender' ? loan.borrower : loan.lender;
              return (
                <div
                  key={loan.id}
                  className={`p-3 rounded-xl border transition-colors ${
                    loan.flagged
                      ? 'border-red-200 bg-red-50/50'
                      : 'border-gray-100 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {loan.flagged && <Flag className="w-3 h-3 text-red-500" />}
                      <span className="font-medium text-gray-900 text-sm">
                        {other?.name || 'Unknown'}
                      </span>
                    </div>
                    <Badge
                      variant={getStatusBadgeVariant(loan.status)}
                      className="text-[10px]"
                    >
                      {formatStatus(loan.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatCurrency(loan.principal)}</span>
                    <span>
                      {loan.interestRate}% • {loan.installments}{' '}
                      {loan.frequency}
                    </span>
                  </div>
                  {loan.flagged && loan.flagReason && (
                    <p className="text-[10px] text-red-500 mt-1.5 bg-red-100 px-2 py-1 rounded">
                      ⚠ {loan.flagReason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 text-sm">
            No loans as {loanTab}
          </div>
        )}
      </div>
    </div>
  );
}
