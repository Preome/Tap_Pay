'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { transactionAPI } from '@/services/api';

const formatMoney = (v: any) => {
  const n = typeof v === 'string' ? Number(v) : v;
  if (n === null || n === undefined || Number.isNaN(n)) return '৳ 0';
  return `৳ ${Number(n).toLocaleString()}`;
};

const formatDateTime = (v: any) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOne = async () => {
      try {
        if (!params?.id) return;
        const res = await transactionAPI.getTransactionById(params.id);
        setTransaction(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchOne();
  }, [params?.id]);

  return (
    <DashboardLayout>
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
        <h1 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Transaction Details</h1>

        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : transaction ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-md font-medium text-gray-900 truncate">
                  {transaction.transaction_type}
                </h2>
                <p className="text-xs text-gray-500 mt-1 break-all">
                  ID: {transaction.transaction_id || transaction.id}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  {transaction.transaction_type === 'SEND_MONEY' || transaction.transaction_type === 'CASH_OUT' || transaction.transaction_type === 'MERCHANT_PAYMENT'
                    ? '-'
                    : '+'}{' '}
                  {formatMoney(transaction.amount)}
                </p>
                <p className="text-xs mt-1 px-2 py-0.5 inline-flex rounded-full text-gray-700 bg-gray-100">
                  {transaction.status}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Created</p>
                <p className="font-medium text-gray-900">{formatDateTime(transaction.created_at) || '-'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Reference</p>
                <p className="font-medium text-gray-900 break-all">{transaction.reference || '-'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Sender</p>
                <p className="font-medium text-gray-900">{transaction.sender_phone || transaction.sender || '-'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Receiver</p>
                <p className="font-medium text-gray-900">{transaction.receiver_phone || transaction.receiver || '-'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800">Raw</h3>
              <pre className="text-xs whitespace-pre-wrap break-words text-gray-800 mt-2 bg-gray-50 rounded-lg p-3 overflow-auto">
                {JSON.stringify(transaction, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Transaction not found.</div>
        )}
      </div>
    </DashboardLayout>
  );
}

