'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { transactionAPI } from '@/services/api';

interface CashInFormData {
  receiver_phone: string;
  amount: number;
}

export default function CashInForm() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CashInFormData>();
  
  const onSubmit = async (data: CashInFormData) => {
    setLoading(true);
    try {
      const response = await transactionAPI.cashIn({
        receiver_phone: data.receiver_phone,
        amount: data.amount,
      });
      toast.success(`${t('common.success')} ${data.amount} BDT`);
      reset();
    } catch (error: any) {
      const msg = error?.response?.data?.error || t('common.error');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800 flex items-center">
        <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-green-600" />
        {t('transaction.cashIn')}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('form.userPhone')} *
          </label>
          <input
            {...register('receiver_phone', { 
              required: t('form.required'),
              pattern: {
                value: /^01[3-9]\d{8}$/,
                message: t('form.invalidPhone')
              }
            })}
            type="tel"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="01XXXXXXXXX"
          />
          {errors.receiver_phone && (
            <p className="mt-1 text-sm text-red-600">{errors.receiver_phone.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('form.amount')} (BDT) *
          </label>
          <input
            {...register('amount', { 
              required: t('form.required'),
              min: { value: 0.01, message: t('form.minAmount') },
              max: { value: 100000, message: t('form.maxCashIn') }
            })}
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="0.00"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? t('transaction.processing') : t('form.cashIn')}
        </button>
      </form>
    </div>
  );
}
