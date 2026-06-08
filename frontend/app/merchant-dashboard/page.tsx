'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { QrCodeIcon, CurrencyBangladeshiIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { authAPI, transactionAPI } from '@/services/api';

export default function MerchantDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    salesTotal: 0,
    customerCount: 0,
    revenueTotal: 0,
    qrScans: 0,
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

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
      const [profileRes, summaryRes, txRes] = await Promise.all([
        authAPI.getProfile(),
        transactionAPI.getSummary().catch(() => null),
        transactionAPI.getTransactions({ page_size: 5 }),
      ]);

      const userData = profileRes.data;
      setBalance(userData.balance || 0);

      if (summaryRes?.data) {
        setStats(prev => ({
          ...prev,
          revenueTotal: summaryRes.data.total_received || 0,
          customerCount: summaryRes.data.transaction_count || 0,
        }));
      }

      const txs = txRes.data.results || txRes.data || [];
      setRecentPayments(txs);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    { label: 'Today\'s Sales', value: `৳ ${stats.salesTotal.toLocaleString()}`, icon: CurrencyBangladeshiIcon, change: '', color: 'bg-green-500' },
    { label: 'Total Customers', value: stats.customerCount.toString(), icon: UserGroupIcon, change: '', color: 'bg-blue-500' },
    { label: 'Total Revenue', value: `৳ ${stats.revenueTotal.toLocaleString()}`, icon: ChartBarIcon, change: '', color: 'bg-purple-500' },
    { label: 'QR Scans', value: stats.qrScans.toString(), icon: QrCodeIcon, change: '', color: 'bg-orange-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Merchant Dashboard</h1>
          <p className="mt-2">Welcome back, {user?.username || 'Merchant'}!</p>
          <div className="mt-4 flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <p className="text-sm">Wallet Balance</p>
              <p className="text-xl font-bold">৳ {balance.toLocaleString()}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <p className="text-sm">Today's Earnings</p>
              <p className="text-xl font-bold">৳ {stats.salesTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Merchant QR Code</h2>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              Download QR
            </button>
          </div>
          <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
                <QrCodeIcon className="h-32 w-32 text-gray-400" />
              </div>
              <p className="mt-4 text-gray-600">Scan to pay @ {user?.username || 'Your Store'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Payments</h2>
          <div className="space-y-3">
            {recentPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No recent payments</div>
            ) : (
              recentPayments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Payment from {payment.sender_phone || payment.sender}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+ ৳ {Number(payment.amount).toLocaleString()}</p>
                    <p className="text-xs text-green-600">{payment.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
