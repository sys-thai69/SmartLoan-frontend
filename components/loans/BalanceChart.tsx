'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Payment, RepaymentScheduleItem } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface BalanceChartProps {
  totalAmount: number;
  payments: Payment[];
  schedule: RepaymentScheduleItem[];
}

export function BalanceChart({
  totalAmount,
  payments,
  schedule,
}: BalanceChartProps) {
  // Build data points from payments
  const chartData = [];

  // Start point
  chartData.push({
    date: schedule[0]?.dueDate || new Date().toISOString(),
    balance: totalAmount,
    label: 'Start',
  });

  // Add payment points
  let runningBalance = totalAmount;
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
  );

  for (const payment of sortedPayments) {
    runningBalance -= payment.amount;
    chartData.push({
      date: payment.paymentDate,
      balance: Math.max(0, runningBalance),
      label: formatDate(payment.paymentDate, 'MMM dd'),
    });
  }

  // Format data for display
  const formattedData = chartData.map((point) => ({
    ...point,
    formattedDate: formatDate(point.date, 'MMM dd'),
    formattedBalance: formatCurrency(point.balance),
  }));

  if (formattedData.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Not enough data to display chart
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="formattedDate"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value) => [formatCurrency(Number(value)), 'Balance']}
            labelStyle={{ color: '#374151', fontWeight: 500 }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#2563EB' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
