'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CreditCardIcon } from '@heroicons/react/24/outline';

interface MerchantPaymentFormData {
  merchant_code: string;
  amount: number;
  pin: string;
}

export default function MerchantPaymentForm() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MerchantPaymentFormData>();
  
  const onSubmit = async (data: MerchantPaymentFormData) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Merchant Payment:', data);
      toast.success(`Payment of ${data.amount} BDT completed successfully`);
      reset();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <CreditCardIcon className="h-5 w-5 mr-2 text-purple-600" />
        Pay Merchant
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Merchant Code / QR *
          </label>
          <input
            {...register('merchant_code', { 
              required: 'Merchant code is required',
              minLength: { value: 6, message: 'Invalid merchant code' }
            })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter merchant code or scan QR"
          />
          {errors.merchant_code && (
            <p className="mt-1 text-sm text-red-600">{errors.merchant_code.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (BDT) *
          </label>
          <input
            {...register('amount', { 
              required: 'Amount is required',
              min: { value: 10, message: 'Minimum amount is 10 BDT' }
            })}
            type="number"
            step="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="0.00"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction PIN *
          </label>
          <input
            {...register('pin', { 
              required: 'PIN is required', 
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
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
}