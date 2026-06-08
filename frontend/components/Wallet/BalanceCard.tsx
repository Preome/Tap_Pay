'use client';

import { BanknotesIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface BalanceCardProps {
  balance: number;
  currency?: string;
}

export default function BalanceCard({ balance, currency = 'BDT' }: BalanceCardProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div>
          <p className="text-xs md:text-sm opacity-90">{t('user.totalBalance')}</p>
          <h3 className="text-xl md:text-2xl font-bold mt-1">{t('nav.wallet')}</h3>
        </div>
        <BanknotesIcon className="h-8 w-8 md:h-10 md:w-10 opacity-90" />
      </div>
      
      <div className="mt-3 md:mt-4">
        <p className="text-2xl md:text-4xl font-bold">
          {currency} {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs md:text-sm mt-1 md:mt-2 opacity-80">{t('user.availableBalance')}</p>
      </div>
      
      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-blue-400">
        <div className="flex justify-between text-xs md:text-sm">
          <span>Account Number: </span>
          <span className="font-mono">****1234</span>
        </div>
        <div className="flex justify-between text-xs md:text-sm mt-1">
          <span>Account Status: </span>
          <span className="text-green-300">Active ✓</span>
        </div>
      </div>
    </div>
  );
}
