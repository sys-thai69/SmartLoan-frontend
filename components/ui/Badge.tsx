import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'secondary';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10',
  danger: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/10',
  info: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/10',
  secondary: 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/10',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// Helper to map loan status to badge variant
export function getStatusBadgeVariant(status: string): BadgeVariant {
  const statusMap: Record<string, BadgeVariant> = {
    pending_acceptance: 'warning',
    active: 'info',
    overdue: 'danger',
    completed: 'success',
    declined: 'secondary',
    cancelled: 'default',
  };
  return statusMap[status] || 'default';
}
