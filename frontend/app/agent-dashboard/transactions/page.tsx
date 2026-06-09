'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { transactionAPI } from '@/services/api';
import { BanknotesIcon, ArrowPathIcon, CreditCardIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface Transaction {
  id: number;
  transaction_id: string;
  transaction_type: string;
  amount: number;
  sender: number | null;
  receiver: number | null;
  agent: number | null;
  status: string;
  created_at: string;
  sender_phone?: string;
  receiver_phone?: string;
}

export default function AgentTransactionsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionAPI.getTransactions();
      setTransactions(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch(type) {
      case 'CASH_IN': return <ArrowPathIcon className="h-5 w-5 text-red-500" />;
      case 'CASH_OUT': return <ArrowPathIcon className="h-5 w-5 text-red-500" />;
      case 'SEND_MONEY': return <ArrowPathIcon className="h-5 w-5 text-blue-500" />;
      case 'MERCHANT_PAYMENT': return <CreditCardIcon className="h-5 w-5 text-purple-500" />;
      default: return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const isOutgoing = (type: string) => {
    return type === 'CASH_IN' || type === 'CASH_OUT' || type === 'SEND_MONEY';
  };

  const getTransactionTitle = (tx: Transaction) => {
    switch(tx.transaction_type) {
      case 'CASH_IN': return `Cash In to ${tx.receiver_phone || tx.receiver}`;
      case 'SEND_MONEY': return `${t('transaction.sendMoney')} — ${tx.receiver_phone || tx.receiver}`;
      case 'MERCHANT_PAYMENT': return t('transaction.paymentToMerchant');
      default: return tx.transaction_type;
    }
  };

  if (loading) {
    return (
      <DashboardLayout basePath="/agent-dashboard">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout basePath="/agent-dashboard">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 md:p-6 text-white">
          <h1 className="text-xl md:text-2xl font-bold">{t('transaction.history')}</h1>
          <p className="mt-1 md:mt-2 opacity-90 text-sm md:text-base">
            {t('agent.transactionHistory')}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('transaction.noTransactions')}
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {transactions.map((tx) => (
                <button
                  type="button"
                  key={tx.id}
                  onClick={() => router.push(`/agent-dashboard/transactions/${tx.id}`)}
                  className="w-full text-left flex items-center justify-between p-3 md:p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                    <div className="p-1.5 md:p-2 bg-gray-100 rounded-full shrink-0">
                      {getTransactionIcon(tx.transaction_type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm md:text-base font-medium text-gray-800 truncate">
                        {getTransactionTitle(tx)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(tx.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <p className={`text-sm md:text-base font-semibold ${
                      isOutgoing(tx.transaction_type) ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isOutgoing(tx.transaction_type) ? '-' : '+'} ৳ {Number(tx.amount).toLocaleString()}
                    </p>
                    <p className={`text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full inline-block mt-1 ${
                      tx.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                      tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {tx.status === 'COMPLETED' ? t('transaction.completed') :
                       tx.status === 'PENDING' ? t('transaction.pending') :
                       tx.status === 'FAILED' ? t('transaction.failed') :
                       tx.status}
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
