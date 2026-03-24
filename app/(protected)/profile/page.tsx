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
} from '@/components/ui';
import { formatDate } from '@/lib/utils';
import {
  User,
  Mail,
  Calendar,
  Star,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { loans } = useLoans();

  // Calculate stats
  const lentLoans = loans.filter((l) => l.lenderId === user?.id);
  const borrowedLoans = loans.filter((l) => l.borrowerId === user?.id);
  const completedLoans = loans.filter((l) => l.status === 'completed');
  const overdueLoans = loans.filter(
    (l) => l.status === 'overdue' && l.borrowerId === user?.id
  );

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">
          View your account details and statistics
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar name={user?.name || 'User'} size="xl" />
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  {user?.name}
                </h2>
                <p className="text-gray-500">{user?.email}</p>
                <Badge variant={user?.role === 'admin' ? 'secondary' : 'default'} className="mt-2">
                  {user?.role === 'admin' ? 'Administrator' : 'Member'}
                </Badge>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{user?.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Joined:</span>
                  <span className="font-medium text-gray-900">
                    {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Trust Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getTrustScoreColor(
                    user?.trustScore || 0
                  )}`}
                >
                  {user?.trustScore || 0}
                </div>
                <p className="mt-2 font-medium text-gray-900">
                  {getTrustScoreLabel(user?.trustScore || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Based on your payment history
                </p>
              </div>

              {overdueLoans.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>
                      You have {overdueLoans.length} overdue loan
                      {overdueLoans.length !== 1 ? 's' : ''} affecting your score
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats & AI Insights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {lentLoans.length}
                    </p>
                    <p className="text-sm text-gray-500">Loans Given</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {borrowedLoans.length}
                    </p>
                    <p className="text-sm text-gray-500">Loans Taken</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {completedLoans.length}
                    </p>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      overdueLoans.length > 0 ? 'bg-red-100' : 'bg-gray-100'
                    }`}
                  >
                    <AlertCircle
                      className={`w-5 h-5 ${
                        overdueLoans.length > 0 ? 'text-red-600' : 'text-gray-600'
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-2xl font-bold ${
                        overdueLoans.length > 0 ? 'text-red-600' : 'text-gray-900'
                      }`}
                    >
                      {overdueLoans.length}
                    </p>
                    <p className="text-sm text-gray-500">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
