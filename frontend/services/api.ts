import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
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
  sendMoney: (data: any) => 
    api.post('/api/v1/transactions/send_money/', data),
  cashIn: (data: any) => 
    api.post('/api/v1/transactions/cash_in/', data),
  merchantPayment: (data: any) => 
    api.post('/api/v1/transactions/merchant_payment/', data),
  getTransactions: (params?: any) => 
    api.get('/api/v1/transactions/', { params }),
  getSummary: () => 
    api.get('/api/v1/transactions/summary/'),
};

export default api;