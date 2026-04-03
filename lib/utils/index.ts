import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast, differenceInDays } from 'date-fns';

// Merge Tailwind classes without conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date
export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  return format(new Date(date), formatStr);
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// Check if date is past
export function isOverdue(date: string | Date): boolean {
  return isPast(new Date(date));
}

// Get days overdue
export function getDaysOverdue(date: string | Date): number {
  const days = differenceInDays(new Date(), new Date(date));
  return days > 0 ? days : 0;
}

// Calculate loan interest
export function calculateTotalAmount(
  principal: number,
  interestRate: number = 0
): number {
  return principal * (1 + interestRate / 100);
}

// Calculate installment amount
export function calculateInstallmentAmount(
  totalAmount: number,
  installments: number
): number {
  return totalAmount / installments;
}

// Calculate payment percentage
export function calculatePercentPaid(totalPaid: number, totalAmount: number): number {
  if (totalAmount === 0) return 0;
  return Math.min((totalPaid / totalAmount) * 100, 100);
}

// Generate initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Truncate text
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Status color mapping
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending_acceptance: 'bg-yellow-100 text-yellow-800',
    active: 'bg-blue-100 text-blue-800',
    overdue: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
    declined: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-slate-100 text-slate-600',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// Format status for display
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Delay utility for async operations
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Local storage helpers with error handling
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error(`Failed to save ${key} to localStorage`);
    }
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      console.error(`Failed to remove ${key} from localStorage`);
    }
  },
};
