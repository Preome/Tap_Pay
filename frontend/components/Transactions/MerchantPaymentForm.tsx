'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { CreditCardIcon, CameraIcon } from '@heroicons/react/24/outline';
import { transactionAPI, merchantAPI } from '@/services/api';
import QRScanner from '@/components/QR/QRScanner';

interface MerchantPaymentFormData {
  merchant_code: string;
  amount: number;
  pin: string;
}

interface MerchantPaymentFormProps {
  onSuccess?: () => void;
}

export default function MerchantPaymentForm({ onSuccess }: MerchantPaymentFormProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [merchantName, setMerchantName] = useState('');
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<MerchantPaymentFormData>();
  
  const lookupMerchant = async (code: string) => {
    if (!code) return;
    try {
      const res = await merchantAPI.lookup(code);
      setMerchantName(res.data.business_name);
    } catch {
      setMerchantName('');
    }
  };

  const handleScan = async (data: string) => {
    setScanning(false);
    const parts = data.split(':');
    const code = parts.length >= 3 ? parts[2] : data;
    setValue('merchant_code', code);
    await lookupMerchant(code);
  };

  const onSubmit = async (data: MerchantPaymentFormData) => {
    setLoading(true);
    try {
      await transactionAPI.merchantPayment({
        merchant_code: data.merchant_code,
        amount: data.amount,
      });
      toast.success(`${t('common.success')} ${data.amount} BDT`);
      reset();
      setMerchantName('');
      onSuccess?.();
    } catch (error: any) {
      const msg = error?.response?.data?.error || t('common.error');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <CreditCardIcon className="h-5 w-5 mr-2 text-purple-600" />
        {t('transaction.merchantPayment')}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('merchant.code')}
          </label>
          <div className="flex gap-2">
            <input
              {...register('merchant_code', { 
                required: t('form.required'),
                minLength: { value: 6, message: 'Invalid merchant code' },
              })}
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={t('form.enterCodeOrScan')}
            />
            <button
              type="button"
              onClick={() => setScanning(true)}
              className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
            >
              <CameraIcon className="h-5 w-5" />
            </button>
          </div>
          {merchantName && (
            <p className="mt-1 text-sm text-green-600">{t('merchant.businessName')}: {merchantName}</p>
          )}
          {errors.merchant_code && (
            <p className="mt-1 text-sm text-red-600">{errors.merchant_code.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('form.amount')} (BDT) *
          </label>
          <input
            {...register('amount', { 
              required: t('form.required'),
              min: { value: 0.01, message: t('form.minAmount') }
            })}
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="****"
          />
          {errors.pin && (
            <p className="mt-1 text-sm text-red-600">{errors.pin.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? t('transaction.processing') : t('form.payNow')}
        </button>
      </form>

      {scanning && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setScanning(false)}
        />
      )}
    </div>
  );
}
