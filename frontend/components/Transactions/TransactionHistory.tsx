'use client';

import { useEffect, useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon, CreditCardIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { transactionAPI } from '@/services/api';

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
  receiver_phone?: string;
}

export default function TransactionHistory() {
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
      case 'SEND_MONEY': return `Sent to ${data.receiver_phone || data.receiver}`;
      case 'CASH_IN': return `Cash In from ${data.sender_phone || data.sender}`;
      case 'CASH_OUT': return `Cash Out to ${data.receiver_phone || data.receiver}`;
      case 'MERCHANT_PAYMENT': return `Payment to merchant`;
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
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Transactions</option>
          <option value="SEND_MONEY">Send Money</option>
          <option value="CASH_IN">Cash In</option>
          <option value="CASH_OUT">Cash Out</option>
          <option value="MERCHANT_PAYMENT">Merchant Payment</option>
        </select>
      </div>
      
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transactions found
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  {getTransactionIcon(transaction.transaction_type)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {getTransactionTitle(transaction.transaction_type, transaction)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(transaction.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold ${
                  isMoneyOut(transaction.transaction_type) ? 'text-red-600' : 'text-green-600'
                }`}>
                  {isMoneyOut(transaction.transaction_type) ? '-' : '+'} 
                  ৳ {Number(transaction.amount).toLocaleString()}
                </p>
                <p className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                  transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                  transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {transaction.status}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
          View All Transactions →
        </button>
      </div>
    </div>
  );
}
