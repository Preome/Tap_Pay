'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { transactionAPI } from '@/services/api';

interface CashInFormData {
  receiver_phone: string;
  amount: number;
}

export default function CashInForm() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CashInFormData>();
  
  const onSubmit = async (data: CashInFormData) => {
    setLoading(true);
    try {
      const response = await transactionAPI.cashIn({
        receiver_phone: data.receiver_phone,
        amount: data.amount,
      });
      toast.success(`Successfully cashed in ${data.amount} BDT`);
      reset();
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Cash in failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-green-600" />
        Cash In
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Phone Number *
          </label>
          <input
            {...register('receiver_phone', { 
              required: 'Phone number is required',
              pattern: {
                value: /^01[3-9]\d{8}$/,
                message: 'Enter a valid Bangladesh phone number'
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
            Amount (BDT) *
          </label>
          <input
            {...register('amount', { 
              required: 'Amount is required',
              min: { value: 0.01, message: 'Minimum amount is 0.01 BDT' },
              max: { value: 100000, message: 'Maximum cash in is 100,000 BDT' }
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
          {loading ? 'Processing...' : 'Cash In'}
        </button>
      </form>
    </div>
  );
}
