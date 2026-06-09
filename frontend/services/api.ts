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
  getTransactionById: (id: string | number) =>
    api.get(`/api/v1/transactions/${id}/`),
  getSummary: () => 
    api.get('/api/v1/transactions/summary/'),
};

export const merchantAPI = {
  lookup: (code: string) =>
    api.get(`/api/v1/merchants/lookup/${code}/`),
  getMyMerchant: () =>
    api.get('/api/v1/merchants/my_merchant/'),
  getStats: () =>
    api.get('/api/v1/merchants/stats/'),
  getQrUrl: (code: string) =>
    `${API_BASE_URL}/api/v1/merchants/qr/${code}/`,
};

export default api;
