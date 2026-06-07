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
import CashInForm from '@/components/Transactions/CashInForm';
import TransactionHistory from '@/components/Transactions/TransactionHistory';
import toast from 'react-hot-toast';

export default function AgentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cashin');

  useEffect(() => {
    console.log('Agent Dashboard - Component mounted');
    console.log('Checking localStorage...');
    
    const userData = localStorage.getItem('user');
    console.log('Raw user data from localStorage:', userData);
    
    if (!userData) {
      console.log('No user data found, redirecting to login...');
      router.push('/');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      console.log('Parsed user data:', parsedUser);
      console.log('User type:', parsedUser.userType);
      
      if (parsedUser.userType !== 'AGENT') {
        console.error('User is not an agent! User type:', parsedUser.userType);
        toast.error('Access denied. Agent only area.');
        router.push('/');
        return;
      }
      
      setUser(parsedUser);
      console.log('Agent dashboard loaded successfully for:', parsedUser.name);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const stats = [
    { label: "Today's Cash In", value: '৳ 1,25,000', icon: BanknotesIcon, change: '+23%', color: 'bg-green-500' },
    { label: "Today's Cash Out", value: '৳ 85,000', icon: ArrowTrendingUpIcon, change: '+12%', color: 'bg-red-500' },
    { label: 'Customers Served', value: '156', icon: UsersIcon, change: '+34%', color: 'bg-blue-500' },
    { label: 'Commission Earned', value: '৳ 2,450', icon: UserPlusIcon, change: '+18%', color: 'bg-purple-500' },
  ];

  const recentActivities = [
    { id: 1, type: 'Cash In', customer: '01712345678', amount: 5000, time: '2 min ago', status: 'Completed' },
    { id: 2, type: 'Cash Out', customer: '01812345678', amount: 2000, time: '15 min ago', status: 'Completed' },
    { id: 3, type: 'Cash In', customer: '01912345678', amount: 10000, time: '1 hour ago', status: 'Completed' },
    { id: 4, type: 'Cash In', customer: '01612345678', amount: 3000, time: '2 hours ago', status: 'Pending' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Agent Dashboard</h1>
              <div className="mt-2">
                <p className="text-lg">Welcome back, {user?.username || 'Agent'}!</p>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    Phone: {user?.phone_number}
                  </span>
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    ID: {user?.id}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                <p className="text-sm">Today's Date</p>
                <p className="text-lg font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-3">
              <p className="text-sm opacity-90">Agent Balance</p>
              <p className="text-2xl font-bold">৳ 1,25,890</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-3">
              <p className="text-sm opacity-90">Today's Commission</p>
              <p className="text-2xl font-bold">৳ 2,450</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-green-600 text-sm font-semibold flex items-center">
                  <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b">
            <div className="flex space-x-4 px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('cashin')}
                className={`py-3 px-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'cashin'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BanknotesIcon className="h-4 w-4 inline mr-2" />
                Cash In Service
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-3 px-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <ArrowPathIcon className="h-4 w-4 inline mr-2" />
                Transaction History
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className={`py-3 px-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'customers'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <UsersIcon className="h-4 w-4 inline mr-2" />
                My Customers
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`py-3 px-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'activities'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <ClockIcon className="h-4 w-4 inline mr-2" />
                Recent Activities
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'cashin' && <CashInForm />}
            {activeTab === 'history' && <TransactionHistory />}
            {activeTab === 'customers' && (
              <div className="text-center py-8">
                <UsersIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">Your customer list will appear here</p>
                <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  + Add New Customer
                </button>
              </div>
            )}
            {activeTab === 'activities' && (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">
                        {activity.type} - {activity.customer}
                      </p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+ ৳ {activity.amount.toLocaleString()}</p>
                      <p className={`text-xs ${
                        activity.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {activity.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}