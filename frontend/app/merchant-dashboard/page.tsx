'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { QrCodeIcon, CurrencyBangladeshiIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { authAPI, transactionAPI, merchantAPI } from '@/services/api';

export default function MerchantDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [merchantCode, setMerchantCode] = useState('');
  const [merchantName, setMerchantName] = useState('');
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
      const ut = parsedUser.user_type || parsedUser.userType;
      if (ut !== 'MERCHANT') {
        router.push('/');
        return;
      }
      setUser(parsedUser);
      fetchDashboardData();
    } catch (error) {
      localStorage.removeItem('user');
      router.push('/');
    }
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const merchantRes = await merchantAPI.getMyMerchant().catch((e) => {
        console.error('Failed to load merchant profile:', e);
        return null;
      });
      const [profileRes, statsRes, txRes] = await Promise.all([
        authAPI.getProfile(),
        merchantAPI.getStats().catch((e) => {
          console.error('Failed to load merchant stats:', e);
          return null;
        }),
        transactionAPI.getTransactions({ page_size: 5 }),
      ]);

      const userData = profileRes.data;
      setBalance(userData.balance || 0);

      if (merchantRes?.data) {
        setMerchantCode(merchantRes.data.registration_number);
        setMerchantName(merchantRes.data.business_name);
      }

      if (statsRes?.data) {
        setStats({
          salesTotal: statsRes.data.today_sales || 0,
          customerCount: statsRes.data.total_customers || 0,
          revenueTotal: statsRes.data.total_revenue || 0,
          qrScans: statsRes.data.total_transactions || 0,
        });
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
    { label: t('merchant.todaysSales'), value: `৳ ${stats.salesTotal.toLocaleString()}`, icon: CurrencyBangladeshiIcon, change: '', color: 'bg-green-500' },
    { label: t('merchant.totalCustomers'), value: stats.customerCount.toString(), icon: UserGroupIcon, change: '', color: 'bg-blue-500' },
    { label: t('merchant.totalRevenue'), value: `৳ ${stats.revenueTotal.toLocaleString()}`, icon: ChartBarIcon, change: '', color: 'bg-purple-500' },
    { label: t('merchant.qrScans'), value: stats.qrScans.toString(), icon: QrCodeIcon, change: '', color: 'bg-orange-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loadingDashboard')}...</p>
        </div>
      </div>
    );
  }

  const qrImageUrl = merchantCode ? merchantAPI.getQrUrl(merchantCode) : null;

  return (
    <DashboardLayout basePath="/merchant-dashboard">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 md:p-6 text-white">
          <h1 className="text-xl md:text-2xl font-bold">{t('merchant.dashboard')}</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base">{t('merchant.welcomeBack')}, {user?.username || 'Merchant'}!</p>
          <div className="mt-3 md:mt-4 grid grid-cols-2 gap-2 md:gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg px-3 md:px-4 py-2">
              <p className="text-xs md:text-sm">{t('merchant.walletBalance')}</p>
              <p className="text-lg md:text-xl font-bold">৳ {balance.toLocaleString()}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg px-3 md:px-4 py-2">
              <p className="text-xs md:text-sm">{t('merchant.todaysEarnings')}</p>
              <p className="text-lg md:text-xl font-bold">৳ {stats.salesTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {dashboardStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
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

        <div className="bg-white rounded-xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">
              {(merchantName || 'Merchant')} {t('merchant.qrCode')}
            </h2>
            {qrImageUrl && (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(qrImageUrl);
                    const svg = await res.text();
                    const blob = new Blob([svg], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${merchantCode || 'merchant'}-qr.svg`;
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch {}
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium w-full sm:w-auto text-center"
              >
                {t('merchant.downloadQR')}
              </button>
            )}
          </div>
          <div className="flex items-center justify-center p-4 md:p-8 bg-white rounded-lg border-2 border-dashed border-gray-200">
            <div className="text-center">
              {qrImageUrl ? (
                <img
                  src={qrImageUrl}
                  alt={`QR Code for ${merchantName}`}
                  className="w-48 h-48 md:w-64 md:h-64 mx-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <div className="w-48 h-48 md:w-64 md:h-64 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                  <QrCodeIcon className="h-24 w-24 md:h-32 md:w-32 text-gray-400" />
                </div>
              )}
              <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600">
                {t('merchant.scanToPay')} @ {merchantName || user?.username || 'Your Store'}
              </p>
              {merchantCode && (
                <p className="mt-1 text-xs md:text-sm text-gray-400 font-mono">
                  {t('merchant.code')}: {merchantCode}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">{t('merchant.recentPayments')}</h2>
          <div className="space-y-3">
            {recentPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">{t('merchant.noRecentPayments')}</div>
            ) : (
              recentPayments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{t('merchant.paymentFrom')} {payment.sender_phone || payment.sender}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+ ৳ {Number(payment.amount).toLocaleString()}</p>
                    <p className="text-xs text-green-600">{payment.status === 'COMPLETED' ? t('transaction.completed') : payment.status}</p>
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
