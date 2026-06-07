import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import toast from 'react-hot-toast';

export const useTransactions = (params?: any) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/transactions/', { params });
      return data;
    },
  });
};

export const useTransactionSummary = () => {
  return useQuery({
    queryKey: ['transaction-summary'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/transactions/summary/');
      return data;
    },
  });
};

export const useSendMoney = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: any) => {
      const { data } = await api.post('/api/v1/transactions/send_money/', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
      toast.success('Money sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to send money');
    },
  });
};

export const useCashIn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: any) => {
      const { data } = await api.post('/api/v1/transactions/cash_in/', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success('Cash in successful!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Cash in failed');
    },
  });
};

export const useMerchantPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: any) => {
      const { data } = await api.post('/api/v1/transactions/merchant_payment/', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success('Payment successful!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Payment failed');
    },
  });
};