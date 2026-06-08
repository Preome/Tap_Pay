'use client';

import DashboardLayout from '@/components/Layout/DashboardLayout';
import TransactionHistory from '@/components/Transactions/TransactionHistory';

export default function UserTransactionsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <TransactionHistory />
      </div>
    </DashboardLayout>
  );
}

