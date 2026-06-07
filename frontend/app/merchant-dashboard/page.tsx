'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { QrCodeIcon, CurrencyBangladeshiIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function MerchantDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const stats = [
    { label: 'Today\'s Sales', value: '৳ 12,450', icon: CurrencyBangladeshiIcon, change: '+15%', color: 'bg-green-500' },
    { label: 'Total Customers', value: '1,234', icon: UserGroupIcon, change: '+23%', color: 'bg-blue-500' },
    { label: 'Total Revenue', value: '৳ 2,45,890', icon: ChartBarIcon, change: '+32%', color: 'bg-purple-500' },
    { label: 'QR Scans', value: '456', icon: QrCodeIcon, change: '+12%', color: 'bg-orange-500' },
  ];

  const recentPayments = [
    { id: 1, customer: '01712345678', amount: 450, time: '2 min ago', status: 'Success' },
    { id: 2, customer: '01812345678', amount: 1200, time: '15 min ago', status: 'Success' },
    { id: 3, customer: '01912345678', amount: 250, time: '1 hour ago', status: 'Success' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Merchant Dashboard</h1>
          <p className="mt-2">Welcome back, {user?.username || 'Merchant'}!</p>
          <div className="mt-4 flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <p className="text-sm">Wallet Balance</p>
              <p className="text-xl font-bold">৳ 45,890</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <p className="text-sm">Today's Earnings</p>
              <p className="text-xl font-bold">৳ 12,450</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-green-600 text-sm font-semibold">{stat.change}</span>
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
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Payment from {payment.customer}</p>
                  <p className="text-sm text-gray-500">{payment.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+ ৳ {payment.amount}</p>
                  <p className="text-xs text-green-600">{payment.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}