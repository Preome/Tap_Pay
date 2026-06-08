import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const publicEndpoints = ['/api/v1/login/', '/api/v1/users/register/'];

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !publicEndpoints.some(endpoint => config.url?.includes(endpoint))) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (username: string, password: string) => 
    api.post('/api/v1/login/', { username, password }),
  register: (userData: any) => 
    api.post('/api/v1/users/register/', userData),
  getProfile: () => 
    api.get('/api/v1/users/me/'),
};

export const transactionAPI = {
  cashIn: (data: { receiver_phone: string; amount: number }) => 
    api.post('/api/v1/transactions/cash_in/', data),
  sendMoney: (data: any) => 
    api.post('/api/v1/transactions/send_money/', data),
  merchantPayment: (data: any) => 
    api.post('/api/v1/transactions/merchant_payment/', data),
  getTransactions: (params?: any) => 
    api.get('/api/v1/transactions/', { params }),
  getSummary: () => 
    api.get('/api/v1/transactions/summary/'),
};

export default api;
