'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { transactionAPI } from '@/services/api';

interface SendMoneyFormData {
  receiver_phone: string;
  amount: number;
  pin: string;
}

interface SendMoneyFormProps {
  onSuccess?: () => void;
}

export default function SendMoneyForm({ onSuccess }: SendMoneyFormProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SendMoneyFormData>();
  
  const onSubmit = async (data: SendMoneyFormData) => {
    setLoading(true);
    try {
      await transactionAPI.sendMoney({
        receiver_phone: data.receiver_phone,
        amount: data.amount,
      });
      toast.success(`${t('common.success')} ${data.amount} BDT`);
      reset();
      onSuccess?.();
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
        <PaperAirplaneIcon className="h-5 w-5 mr-2 text-blue-600" />
        {t('form.sendMoney')}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('form.receiverPhone')} *
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              max: { value: 50000, message: t('form.maxSend') }
            })}
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('form.transactionPin')} *
          </label>
          <input
            {...register('pin', { 
              required: t('form.required'), 
              minLength: { value: 4, message: 'PIN must be 4 digits' },
              maxLength: { value: 4, message: 'PIN must be 4 digits' }
            })}
            type="password"
            maxLength={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="****"
          />
          {errors.pin && (
            <p className="mt-1 text-sm text-red-600">{errors.pin.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('transaction.processing')}
            </span>
          ) : (
            t('form.sendMoney')
          )}
        </button>
      </form>
    </div>
  );
}
