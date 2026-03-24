'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { adminApi } from '@/lib/api';
import type { PlatformStats, UserWithStats } from '@/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Avatar,
} from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Loader2,
} from 'lucide-react';

export default function AdminPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statsData, usersData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
      ]);
      setStats(statsData);
      setUsers(usersData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Platform overview and user management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalUsers || 0}
                </p>
                <p className="text-xs text-gray-500">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalLoans || 0}
                </p>
                <p className="text-xs text-gray-500">Total Loans</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.activeLoans || 0}
                </p>
                <p className="text-xs text-gray-500">Active Loans</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {stats?.overdueLoans || 0}
                </p>
                <p className="text-xs text-gray-500">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.completedLoans || 0}
                </p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalVolume || 0)}
                </p>
                <p className="text-xs text-gray-500">Total Volume</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Email
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                    Role
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                    Trust Score
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                    Loans Given
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                    Loans Taken
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <span className="font-medium text-gray-900">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={user.role === 'admin' ? 'secondary' : 'default'}
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-medium ${
                          user.trustScore >= 80
                            ? 'text-green-600'
                            : user.trustScore >= 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {user.trustScore}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-700">
                      {user.loanCount}
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-700">
                      {user.borrowCount}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
