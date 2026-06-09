'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { transactionAPI } from '@/services/api';
import { CreditCardIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface Transaction {
  id: number;
  transaction_id: string;
  transaction_type: string;
  amount: number;
  sender: number | null;
  receiver: number | null;
  status: string;
  created_at: string;
  sender_phone?: string;
}

export default function MerchantTransactionsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionAPI.getTransactions({ type: 'MERCHANT_PAYMENT' });
      setTransactions(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout basePath="/merchant-dashboard">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout basePath="/merchant-dashboard">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 md:p-6 text-white">
          <h1 className="text-xl md:text-2xl font-bold">{t('transaction.history')}</h1>
          <p className="mt-1 md:mt-2 opacity-90 text-sm md:text-base">
            {t('merchant.recentPayments')}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('transaction.noTransactions')}
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {transactions.map((transaction) => (
                <button
                  type="button"
                  key={transaction.id}
                  onClick={() => router.push(`/merchant-dashboard/transactions/${transaction.id}`)}
                  className="w-full text-left flex items-center justify-between p-3 md:p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                    <div className="p-1.5 md:p-2 bg-purple-100 rounded-full shrink-0">
                      <CreditCardIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm md:text-base font-medium text-gray-800 truncate">
                        {t('transaction.paymentToMerchant')} — {transaction.sender_phone || transaction.sender}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(transaction.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm md:text-base font-semibold text-green-600">
                      + ৳ {Number(transaction.amount).toLocaleString()}
                    </p>
                    <p className={`text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full inline-block mt-1 ${
                      transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                      transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {transaction.status === 'COMPLETED' ? t('transaction.completed') :
                       transaction.status === 'PENDING' ? t('transaction.pending') :
                       transaction.status === 'FAILED' ? t('transaction.failed') :
                       transaction.status}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
