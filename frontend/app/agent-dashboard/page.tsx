'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { 
  UserPlusIcon, 
  BanknotesIcon, 
  UsersIcon, 
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import CashInForm from '@/components/Transactions/CashInForm';
import TransactionHistory from '@/components/Transactions/TransactionHistory';
import { authAPI, transactionAPI } from '@/services/api';
import toast from 'react-hot-toast';

export default function AgentDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cashin');
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({
    cashInTotal: 0,
    cashOutTotal: 0,
    customersServed: 0,
    commission: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      
      if ((parsedUser.user_type || parsedUser.userType) !== 'AGENT') {
        toast.error(t('auth.accessDenied'));
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
      const [profileRes, summaryRes, txRes] = await Promise.all([
        authAPI.getProfile(),
        transactionAPI.getSummary().catch(() => null),
        transactionAPI.getTransactions({ page_size: 5 }),
      ]);

      const userData = profileRes.data;
      setBalance(userData.balance || 0);

      if (summaryRes?.data) {
        setStats({
          cashInTotal: summaryRes.data.total_sent || 0,
          cashOutTotal: summaryRes.data.total_received || 0,
          customersServed: summaryRes.data.transaction_count || 0,
          commission: 0,
        });
      }

      const txs = txRes.data.results || txRes.data || [];
      setRecentTransactions(txs);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    { label: t('agent.todaysCashIn'), value: `৳ ${stats.cashInTotal.toLocaleString()}`, icon: BanknotesIcon, change: '', color: 'bg-green-500' },
    { label: t('agent.todaysCashOut'), value: `৳ ${stats.cashOutTotal.toLocaleString()}`, icon: ArrowTrendingUpIcon, change: '', color: 'bg-red-500' },
    { label: t('agent.customersServed'), value: stats.customersServed.toString(), icon: UsersIcon, change: '', color: 'bg-blue-500' },
    { label: t('agent.commissionEarned'), value: `৳ ${stats.commission.toLocaleString()}`, icon: UserPlusIcon, change: '', color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout basePath="/agent-dashboard">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 md:p-6 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl md:text-2xl font-bold">{t('agent.dashboard')}</h1>
              <div className="mt-2">
                <p className="text-base md:text-lg">{t('agent.welcomeBack')}, {user?.username || 'Agent'}!</p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs md:text-sm">
                  <span className="bg-white bg-opacity-20 px-2 md:px-3 py-1 rounded-full">
                    {t('common.phone')}: {user?.phone_number}
                  </span>
                  <span className="bg-white bg-opacity-20 px-2 md:px-3 py-1 rounded-full">
                    {t('common.id')}: {user?.id}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden sm:block text-right shrink-0">
              <div className="bg-white bg-opacity-20 rounded-lg px-3 md:px-4 py-2">
                <p className="text-xs md:text-sm">{t('common.today')}</p>
                <p className="text-base md:text-lg font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-3 md:mt-4 grid grid-cols-2 gap-2 md:gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg px-3 md:px-4 py-2 md:py-3">
              <p className="text-xs md:text-sm opacity-90">{t('agent.agentBalance')}</p>
              <p className="text-xl md:text-2xl font-bold">৳ {balance.toLocaleString()}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg px-3 md:px-4 py-2 md:py-3">
              <p className="text-xs md:text-sm opacity-90">{t('agent.todaysCommission')}</p>
              <p className="text-xl md:text-2xl font-bold">৳ {stats.commission.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {dashboardStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
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

        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b overflow-x-auto">
            <div className="flex px-4 md:px-6 min-w-max">
              <button
                onClick={() => setActiveTab('cashin')}
                className={`py-3 px-3 md:px-4 font-medium transition-colors whitespace-nowrap text-sm md:text-base ${
                  activeTab === 'cashin'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BanknotesIcon className="h-4 w-4 inline mr-1 md:mr-2" />
                {t('agent.cashInService')}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-3 px-3 md:px-4 font-medium transition-colors whitespace-nowrap text-sm md:text-base ${
                  activeTab === 'history'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <ArrowPathIcon className="h-4 w-4 inline mr-1 md:mr-2" />
                {t('agent.transactionHistory')}
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className={`py-3 px-3 md:px-4 font-medium transition-colors whitespace-nowrap text-sm md:text-base ${
                  activeTab === 'customers'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <UsersIcon className="h-4 w-4 inline mr-1 md:mr-2" />
                {t('agent.myCustomers')}
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`py-3 px-3 md:px-4 font-medium transition-colors whitespace-nowrap text-sm md:text-base ${
                  activeTab === 'activities'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <ClockIcon className="h-4 w-4 inline mr-1 md:mr-2" />
                {t('agent.recentActivities')}
              </button>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {activeTab === 'cashin' && <CashInForm />}
            {activeTab === 'history' && <TransactionHistory />}
            {activeTab === 'customers' && (
              <div className="text-center py-8">
                <UsersIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">{t('common.comingSoon')}</p>
              </div>
            )}
            {activeTab === 'activities' && (
              <div className="space-y-3">
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">{t('agent.noRecentActivities')}</div>
                ) : (
                  recentTransactions.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 md:p-4 border rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm md:text-base font-medium text-gray-800 truncate">
                          {tx.transaction_type === 'CASH_IN' ? t('transaction.cashIn') : tx.transaction_type} - {tx.receiver_phone || tx.sender_phone || ''}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(tx.created_at).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+ ৳ {Number(tx.amount).toLocaleString()}</p>
                        <p className={`text-xs ${
                          tx.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {tx.status === 'COMPLETED' ? t('transaction.completed') : tx.status}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
