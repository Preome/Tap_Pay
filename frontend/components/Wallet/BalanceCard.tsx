'use client';

import { BanknotesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface BalanceCardProps {
  balance: number;
  currency?: string;
}

export default function BalanceCard({ balance, currency = 'BDT' }: BalanceCardProps) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm opacity-90">Total Balance</p>
          <h3 className="text-2xl font-bold mt-1">Wallet</h3>
        </div>
        <BanknotesIcon className="h-10 w-10 opacity-90" />
      </div>
      
      <div className="mt-4">
        <p className="text-4xl font-bold">
          {currency} {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-sm mt-2 opacity-80">Available Balance</p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-blue-400">
        <div className="flex justify-between text-sm">
          <span>Account Number: </span>
          <span className="font-mono">****1234</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span>Account Status: </span>
          <span className="text-green-300">Active ✓</span>
        </div>
      </div>
    </div>
  );
}