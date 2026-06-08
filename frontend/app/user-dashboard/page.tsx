'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import BalanceCard from '@/components/Wallet/BalanceCard';
import SendMoneyForm from '@/components/Transactions/SendMoneyForm';
import TransactionHistory from '@/components/Transactions/TransactionHistory';
import { ArrowPathIcon, ArrowUpIcon, ArrowDownIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { authAPI, transactionAPI } from '@/services/api';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSent: 0, totalReceived: 0, transactionCount: 0 });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchDashboardData();
    } catch (error) {
      localStorage.removeItem('user');
      router.push('/');
    }
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, summaryRes] = await Promise.all([
        authAPI.getProfile(),
        transactionAPI.getSummary().catch(() => null),
      ]);

      const userData = profileRes.data;
      setBalance(userData.balance || 0);
      localStorage.setItem('user', JSON.stringify(userData));

      if (summaryRes?.data) {
        setStats({
          totalSent: summaryRes.data.total_sent || 0,
          totalReceived: summaryRes.data.total_received || 0,
          transactionCount: summaryRes.data.transaction_count || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: ArrowUpIcon, label: 'Send Money', color: 'bg-blue-500', action: 'send' },
    { icon: ArrowDownIcon, label: 'Cash In', color: 'bg-green-500', action: 'cashin' },
    { icon: CreditCardIcon, label: 'Pay Merchant', color: 'bg-purple-500', action: 'merchant' },
    { icon: ArrowPathIcon, label: 'Transactions', color: 'bg-orange-500', action: 'history' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome back, {user?.username || 'User'}!</h1>
          <p className="mt-2 opacity-90">Manage your finances, send money, and make payments easily.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="bg-white rounded-xl p-4 text-center hover:shadow-lg transition-shadow"
              >
                <div className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <BalanceCard balance={balance} />
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Sent:</span>
                  <span className="font-semibold">৳ {stats.totalSent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Received:</span>
                  <span className="font-semibold">৳ {stats.totalReceived.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transactions:</span>
                  <span className="font-semibold">{stats.transactionCount}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <TransactionHistory />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
