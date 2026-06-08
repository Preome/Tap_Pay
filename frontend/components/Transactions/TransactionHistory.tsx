'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ArrowUpIcon, ArrowDownIcon, CreditCardIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { transactionAPI } from '@/services/api';

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
  agent_phone?: string;
}

type TransactionHistoryProps = {
  mode?: 'dashboard' | 'page';
};

export default function TransactionHistory({ mode = 'dashboard' }: TransactionHistoryProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
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

  const filteredTransactions = transactions.filter(t => 
    filter === 'all' || t.transaction_type === filter
  );
  
  const getTransactionIcon = (type: string) => {
    switch(type) {
      case 'SEND_MONEY': return <ArrowUpIcon className="h-5 w-5 text-red-500" />;
      case 'CASH_IN': return <ArrowDownIcon className="h-5 w-5 text-green-500" />;
      case 'CASH_OUT': return <ArrowUpIcon className="h-5 w-5 text-red-500" />;
      case 'MERCHANT_PAYMENT': return <CreditCardIcon className="h-5 w-5 text-blue-500" />;
      default: return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getTransactionTitle = (type: string, data: Transaction) => {
    switch(type) {
      case 'SEND_MONEY': return `${t('transaction.sentTo')} ${data.receiver_phone || data.receiver}`;
      case 'CASH_IN': return `${t('transaction.cashInFrom')} ${data.agent_phone || data.agent || 'Agent'}`;
      case 'CASH_OUT': return `${t('transaction.cashOutTo')} ${data.receiver_phone || data.receiver}`;
      case 'MERCHANT_PAYMENT': return t('transaction.paymentToMerchant');
      default: return 'Transaction';
    }
  };

  const isMoneyOut = (type: string) => {
    return type === 'SEND_MONEY' || type === 'CASH_OUT' || type === 'MERCHANT_PAYMENT';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">{t('transaction.history')}</h2>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">{t('transaction.all')}</option>
          <option value="SEND_MONEY">{t('transaction.sendMoney')}</option>
          <option value="CASH_IN">{t('transaction.cashIn')}</option>
          <option value="CASH_OUT">{t('transaction.cashOut')}</option>
          <option value="MERCHANT_PAYMENT">{t('transaction.merchantPayment')}</option>
        </select>
      </div>
      
      <div className="space-y-2 md:space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('transaction.noTransactions')}
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
              <button
                type="button"
                key={transaction.id}
                onClick={() => router.push(`/user-dashboard/transactions/${transaction.id}`)}
                className="w-full text-left flex items-center justify-between p-3 md:p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                  <div className="p-1.5 md:p-2 bg-gray-100 rounded-full shrink-0">
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm md:text-base font-medium text-gray-800 truncate">
                      {getTransactionTitle(transaction.transaction_type, transaction)}
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
                  <p className={`text-sm md:text-base font-semibold ${
                    isMoneyOut(transaction.transaction_type) ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {isMoneyOut(transaction.transaction_type) ? '-' : '+'} 
                    ৳ {Number(transaction.amount).toLocaleString()}
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
          ))
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
          {t('transaction.viewAll')}
        </button>
      </div>
    </div>
  );
}
