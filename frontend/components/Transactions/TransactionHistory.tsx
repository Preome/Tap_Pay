'use client';

import { useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon, CreditCardIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const mockTransactions = [
  { id: 'TXN001', type: 'SEND_MONEY', amount: 500, receiver: '01812345678', status: 'COMPLETED', date: '2024-01-15T10:30:00' },
  { id: 'TXN002', type: 'CASH_IN', amount: 1000, agent: '01712345678', status: 'COMPLETED', date: '2024-01-14T15:20:00' },
  { id: 'TXN003', type: 'MERCHANT_PAYMENT', amount: 250, merchant: 'Bkash Merchant', status: 'COMPLETED', date: '2024-01-13T09:45:00' },
  { id: 'TXN004', type: 'SEND_MONEY', amount: 1000, receiver: '01912345678', status: 'PENDING', date: '2024-01-12T18:15:00' },
  { id: 'TXN005', type: 'CASH_OUT', amount: 2000, agent: '01787654321', status: 'COMPLETED', date: '2024-01-11T11:00:00' },
];

export default function TransactionHistory() {
  const [filter, setFilter] = useState('all');
  
  const filteredTransactions = mockTransactions.filter(t => 
    filter === 'all' || t.type === filter
  );
  
  const getTransactionIcon = (type: string) => {
    switch(type) {
      case 'SEND_MONEY': return <ArrowUpIcon className="h-5 w-5 text-red-500" />;
      case 'CASH_IN': return <ArrowDownIcon className="h-5 w-5 text-green-500" />;
      case 'MERCHANT_PAYMENT': return <CreditCardIcon className="h-5 w-5 text-blue-500" />;
      default: return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getTransactionTitle = (type: string, data: any) => {
    switch(type) {
      case 'SEND_MONEY': return `Sent to ${data.receiver}`;
      case 'CASH_IN': return `Cash In from ${data.agent}`;
      case 'MERCHANT_PAYMENT': return `Payment to ${data.merchant}`;
      default: return 'Transaction';
    }
  };
  
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
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {getTransactionTitle(transaction.type, transaction)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(transaction.date).toLocaleString('en-US', {
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
                  transaction.type === 'SEND_MONEY' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {transaction.type === 'SEND_MONEY' ? '-' : '+'} 
                  ৳ {transaction.amount.toLocaleString()}
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