'use client';

import { useAuth } from '@/context/AuthContext';
import { useLoans } from '@/hooks/useLoans';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Avatar,
  Badge,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  getStatusBadgeVariant,
} from '@/components/ui';
import { formatCurrency, formatDate, formatRelativeTime, formatStatus } from '@/lib/utils';
import { authApi } from '@/lib/api';
import { updateProfileSchema } from '@/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Star,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Pencil,
  Shield,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  Lock,
  DollarSign,
  Clock,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { loans } = useLoans();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
    },
  });

  // Calculate stats
  const lentLoans = loans.filter((l) => l.lenderId === user?.id);
  const borrowedLoans = loans.filter((l) => l.borrowerId === user?.id);
  const completedLoans = loans.filter((l) => l.status === 'completed');
  const overdueLoans = loans.filter(
    (l) => l.status === 'overdue' && l.borrowerId === user?.id
  );
  const activeLoans = loans.filter((l) => l.status === 'active');

  // Financial summary
  const financials = useMemo(() => {
    const totalLent = lentLoans.reduce((sum, l) => sum + l.principal, 0);
    const totalBorrowed = borrowedLoans.reduce((sum, l) => sum + l.principal, 0);
    const netPosition = totalLent - totalBorrowed;
    const totalInterestEarned = lentLoans
      .filter((l) => l.status === 'completed')
      .reduce((sum, l) => sum + (l.totalAmount - l.principal), 0);
    return { totalLent, totalBorrowed, netPosition, totalInterestEarned };
  }, [lentLoans, borrowedLoans]);

  // Recent loans (last 5)
  const recentLoans = useMemo(() => {
    return [...loans]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [loans]);

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrustScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const onEditClick = () => {
    setError(null);
    setSuccess(false);
    setPreviewImage(null);
    reset({
      name: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
    });
    setIsEditModalOpen(true);
  };

  const onProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPreviewImage(base64);
        setValue('profilePicture', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const onEditSubmit = async (data: any) => {
    try {
      setError(null);
      setIsSaving(true);
      const updateData: any = { name: data.name };
      if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
      if (data.profilePicture) updateData.profilePicture = data.profilePicture;
      await authApi.updateProfile(updateData);
      await refreshUser();
      setIsEditModalOpen(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Your account details, activity, and financial overview
          </p>
        </div>
        <Button variant="outline" onClick={onEditClick}>
          <Pencil className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm text-green-700">✓ Profile updated successfully</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile + Trust Score + Security */}
        <div className="lg:col-span-1 space-y-4">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar
                    name={user?.name || 'User'}
                    size="xl"
                    src={user?.profilePicture || undefined}
                  />
                  <button
                    onClick={onEditClick}
                    className="absolute -bottom-1 -right-1 p-2 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-full hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg"
                    title="Edit profile"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                <Badge variant={user?.role === 'admin' ? 'secondary' : 'default'} className="mt-2">
                  {user?.role === 'admin' ? 'Administrator' : 'Member'}
                </Badge>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100 space-y-3.5">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Name</p>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>
                {user?.phoneNumber && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900">{user.phoneNumber}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Joined</p>
                    <p className="font-medium text-gray-900">
                      {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="w-4 h-4 text-yellow-500" />
                Trust Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold ${getTrustScoreColor(
                    user?.trustScore || 0
                  )}`}
                >
                  {user?.trustScore || 0}
                </div>
                <p className="mt-2 font-semibold text-gray-900 text-sm">
                  {getTrustScoreLabel(user?.trustScore || 0)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Based on your payment history</p>
              </div>
              {overdueLoans.length > 0 && (
                <div className="mt-3 p-2.5 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2 text-red-700 text-xs">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>
                      {overdueLoans.length} overdue loan{overdueLoans.length !== 1 ? 's' : ''} affecting score
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="w-4 h-4 text-slate-500" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Email</span>
                </div>
                <span className={`font-medium text-xs px-2 py-0.5 rounded-full ${
                  user?.emailVerified
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {user?.emailVerified ? '✓ Verified' : 'Unverified'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Phone</span>
                </div>
                <span className={`font-medium text-xs px-2 py-0.5 rounded-full ${
                  user?.phoneVerified
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {user?.phoneVerified ? '✓ Verified' : 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Role</span>
                </div>
                <span className="font-medium text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  {user?.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats + Financial Summary + Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{lentLoans.length}</p>
                    <p className="text-xs text-gray-500">Loans Given</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <ArrowDownLeft className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{borrowedLoans.length}</p>
                    <p className="text-xs text-gray-500">Loans Taken</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{completedLoans.length}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    overdueLoans.length > 0 ? 'bg-red-50' : 'bg-gray-50'
                  }`}>
                    <AlertCircle className={`w-5 h-5 ${
                      overdueLoans.length > 0 ? 'text-red-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${
                      overdueLoans.length > 0 ? 'text-red-600' : 'text-gray-900'
                    }`}>{overdueLoans.length}</p>
                    <p className="text-xs text-gray-500">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="w-4 h-4 text-indigo-500" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                  <p className="text-xs text-green-600 font-medium">Total Lent</p>
                  <p className="text-lg font-bold text-green-700 mt-1">
                    {formatCurrency(financials.totalLent)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                  <p className="text-xs text-purple-600 font-medium">Total Borrowed</p>
                  <p className="text-lg font-bold text-purple-700 mt-1">
                    {formatCurrency(financials.totalBorrowed)}
                  </p>
                </div>
                <div className={`p-3 rounded-xl border ${
                  financials.netPosition >= 0
                    ? 'bg-blue-50 border-blue-100'
                    : 'bg-orange-50 border-orange-100'
                }`}>
                  <p className={`text-xs font-medium ${
                    financials.netPosition >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`}>Net Position</p>
                  <p className={`text-lg font-bold mt-1 ${
                    financials.netPosition >= 0 ? 'text-blue-700' : 'text-orange-700'
                  }`}>
                    {financials.netPosition >= 0 ? '+' : ''}{formatCurrency(financials.netPosition)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-xs text-amber-600 font-medium">Interest Earned</p>
                  <p className="text-lg font-bold text-amber-700 mt-1">
                    {formatCurrency(financials.totalInterestEarned)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  Recent Activity
                </CardTitle>
                <Link
                  href="/loans"
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View all →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentLoans.length > 0 ? (
                <div className="space-y-2.5">
                  {recentLoans.map((loan) => {
                    const isLender = loan.lenderId === user?.id;
                    const other = isLender ? loan.borrower : loan.lender;
                    return (
                      <Link
                        key={loan.id}
                        href={`/loans/${loan.id}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isLender ? 'bg-green-100' : 'bg-purple-100'
                          }`}>
                            {isLender ? (
                              <ArrowUpRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ArrowDownLeft className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {isLender ? 'Lent to' : 'Borrowed from'}{' '}
                              {other?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatRelativeTime(loan.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 text-sm">
                            {formatCurrency(loan.principal)}
                          </p>
                          <Badge variant={getStatusBadgeVariant(loan.status)} className="text-[10px]">
                            {formatStatus(loan.status)}
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No loan activity yet</p>
                  <Link href="/loans/create" className="text-xs text-indigo-600 hover:underline mt-1 block">
                    Create your first loan
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Loans Quick View */}
          {activeLoans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  Active Loans ({activeLoans.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {activeLoans.slice(0, 4).map((loan) => {
                    const isLender = loan.lenderId === user?.id;
                    const other = isLender ? loan.borrower : loan.lender;
                    const paidCount = loan.schedule?.filter((s) => s.isPaid).length || 0;
                    const totalCount = loan.schedule?.length || loan.installments;
                    return (
                      <Link
                        key={loan.id}
                        href={`/loans/${loan.id}`}
                        className="p-3 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {other?.name || 'Unknown'}
                          </span>
                          <span className={`text-xs font-medium ${isLender ? 'text-green-600' : 'text-purple-600'}`}>
                            {isLender ? 'Lending' : 'Borrowing'}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(loan.principal)}</p>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1.5 rounded-full"
                            style={{ width: `${totalCount > 0 ? (paidCount / totalCount) * 100 : 0}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{paidCount}/{totalCount} paid</p>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalHeader onClose={() => setIsEditModalOpen(false)}>
          Edit Profile
        </ModalHeader>
        <form onSubmit={handleSubmit(onEditSubmit)}>
          <ModalContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <div>
              <Input label="Name" type="text" placeholder="Your name" error={errors.name?.message} {...register('name')} />
            </div>
            <div>
              <Input label="Phone Number (Optional)" type="tel" placeholder="+1234567890" error={errors.phoneNumber?.message} {...register('phoneNumber')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={onProfilePictureChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
              />
              {previewImage && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <img src={previewImage} alt="Profile preview" className="w-24 h-24 rounded-full object-cover border border-gray-200" />
                </div>
              )}
            </div>
          </ModalContent>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button type="submit" isLoading={isSaving} disabled={isSaving}>Save Changes</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
