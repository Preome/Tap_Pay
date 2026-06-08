'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import BalanceCard from '@/components/Wallet/BalanceCard';
import SendMoneyForm from '@/components/Transactions/SendMoneyForm';
import MerchantPaymentForm from '@/components/Transactions/MerchantPaymentForm';

import { ArrowPathIcon, ArrowUpIcon, ArrowDownIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { authAPI, transactionAPI } from '@/services/api';

export default function UserDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>(null);
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
    { icon: ArrowUpIcon, label: t('user.sendMoney'), color: 'bg-blue-500', tab: 'send' },
    { icon: ArrowDownIcon, label: t('user.cashIn'), color: 'bg-green-500', tab: 'cashin' },
    { icon: CreditCardIcon, label: t('user.payMerchant'), color: 'bg-purple-500', tab: 'merchant' },
    { icon: ArrowPathIcon, label: t('user.transactions'), color: 'bg-orange-500', tab: 'history' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loadingDashboard')}...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 md:p-6 text-white">
          <h1 className="text-xl md:text-2xl font-bold">{t('user.welcomeBack')}, {user?.username || 'User'}!</h1>
          <p className="mt-1 md:mt-2 opacity-90 text-sm md:text-base">{t('user.manageFinances')}</p>
        </div>

        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">{t('user.quickActions')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(action.tab)}
                className="bg-white rounded-xl p-3 md:p-4 text-center hover:shadow-lg transition-shadow"
              >
                <div className={`${action.color} w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2`}>
                  <action.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'send' && (
          <SendMoneyForm onSuccess={() => { fetchDashboardData(); setActiveTab(null); }} />
        )}

        {activeTab === 'cashin' && (
          <div className="bg-white rounded-xl p-4 md:p-6 text-center">
            <p className="text-sm md:text-base text-gray-500">{t('user.visitAgent')}</p>
          </div>
        )}

        {activeTab === 'merchant' && (
          <MerchantPaymentForm onSuccess={() => { fetchDashboardData(); setActiveTab(null); }} />
        )}

        {activeTab !== 'send' && (
          <div className="w-full">
            <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 flex flex-col items-stretch">


              <BalanceCard balance={balance} />
              <div className="bg-white rounded-xl p-3 md:p-4 w-full">

                <h3 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">{t('user.quickStats')}</h3>
                <div className="space-y-1.5 md:space-y-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">{t('user.totalSent')}:</span>
                    <span className="font-semibold">৳ {stats.totalSent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">{t('user.totalReceived')}:</span>
                    <span className="font-semibold">৳ {stats.totalReceived.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">{t('user.transactionCount')}:</span>
                    <span className="font-semibold">{stats.transactionCount}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Transactions moved to /user-dashboard/transactions */}
          
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
