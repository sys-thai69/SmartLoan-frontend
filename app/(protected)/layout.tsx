'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { OverdueBanner } from '@/components/loans/OverdueBanner';
import { useOverdueSchedules } from '@/hooks/useLoans';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <ProtectedContent>{children}</ProtectedContent>
    </ProtectedRoute>
  );
}

function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { schedules } = useOverdueSchedules();
  const overdueCount = schedules.length;
  const totalOverdue = schedules.reduce((sum, s) => sum + s.amountDue, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      {overdueCount > 0 && (
        <OverdueBanner overdueCount={overdueCount} totalOverdueAmount={totalOverdue} />
      )}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
