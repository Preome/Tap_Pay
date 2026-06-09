'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PhoneIcon, UserIcon, BriefcaseIcon, BuildingStorefrontIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { authAPI } from '@/services/api';
import LanguageSwitcher from '@/components/I18n/LanguageSwitcher';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('USER');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData && token) {
      try {
        const user = JSON.parse(userData);
        document.cookie = `token=${token}; path=/; max-age=86400`;
        document.cookie = `user=${encodeURIComponent(userData)}; path=/; max-age=86400`;

        const ut = user.user_type || user.userType;
        if (ut === 'MERCHANT') router.push('/merchant-dashboard');
        else if (ut === 'AGENT') router.push('/agent-dashboard');
        else if (ut === 'USER') router.push('/user-dashboard');
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, [router]);

  const [loginData, setLoginData] = useState({ phone: '', pin: '' });

  const [signupData, setSignupData] = useState({
    name: '', phone: '', email: '', pin: '', confirmPin: '',
    userType: 'USER', businessName: '', registrationNumber: '',
    businessType: '', businessAddress: '', agentCode: '', nidNumber: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: tokenData } = await authAPI.login(loginData.phone, loginData.pin);
      localStorage.setItem('token', tokenData.token);
      const { data: userData } = await authAPI.getProfile();
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userType', userData.user_type || userData.userType);
      document.cookie = `token=${tokenData.token}; path=/; max-age=86400`;
      document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400`;

      toast.success(`${t('common.welcome')} ${userData.username || 'User'}!`);

      const ut = userData.user_type || userData.userType;
      if (ut === 'MERCHANT') window.location.href = '/merchant-dashboard';
      else if (ut === 'AGENT') window.location.href = '/agent-dashboard';
      else if (ut === 'USER') window.location.href = '/user-dashboard';
      else window.location.href = '/';
    } catch (error: any) {
      const msg = error?.response?.data?.non_field_errors?.[0] || t('auth.loginFailed');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.pin !== signupData.confirmPin) { toast.error(t('auth.pinMismatch')); return; }
    if (signupData.pin.length !== 4) { toast.error(t('auth.pinMustBe4Digits')); return; }
    if (signupData.userType === 'MERCHANT') {
      if (!signupData.registrationNumber || signupData.registrationNumber.length < 6) {
        toast.error('Valid organization registration number is required!'); return;
      }
      if (!signupData.businessName) { toast.error('Business name is required!'); return; }
    }
    if (signupData.userType === 'AGENT') {
      if (!signupData.nidNumber || signupData.nidNumber.length < 10) {
        toast.error('Valid NID number is required for agent verification!'); return;
      }
      if (!signupData.agentCode) { toast.error('Agent code is required!'); return; }
    }
    setLoading(true);
    try {
      await authAPI.register({
        username: signupData.phone, password: signupData.pin, password2: signupData.confirmPin,
        phone_number: signupData.phone, email: signupData.email || undefined,
        user_type: signupData.userType, nid_number: signupData.nidNumber || undefined,
        address: signupData.businessAddress || undefined,
        business_name: signupData.businessName || undefined,
        registration_number: signupData.registrationNumber || undefined,
        business_type: signupData.businessType || undefined,
        business_address: signupData.businessAddress || undefined,
      });
      toast.success('Account created successfully! Please login.');
      setIsLogin(true);
      setSignupData({ name: '', phone: '', email: '', pin: '', confirmPin: '', userType: 'USER', businessName: '', registrationNumber: '', businessType: '', businessAddress: '', agentCode: '', nidNumber: '' });
    } catch (error: any) {
      const errData = error?.response?.data;
      if (errData) {
        const firstError = Object.values(errData).flat()[0];
        toast.error(String(firstError) || t('auth.signupFailed'));
      } else {
        toast.error(t('auth.signupFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const UserTypeButton = ({ type, label, icon: Icon, color }: any) => (
    <button type="button" onClick={() => setUserType(type)}
      className={`flex-1 py-3 md:py-3.5 px-2 md:px-4 rounded-lg transition-all text-xs md:text-sm ${
        userType === type ? `${color} text-white shadow-lg transform scale-105` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
      <Icon className={`h-5 w-5 mx-auto mb-1 ${userType === type ? 'text-white' : 'text-gray-600'}`} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl md:text-2xl font-bold">{t('app.name')}</h1>
            <div className="flex items-center gap-2 md:gap-3">
              <LanguageSwitcher />
              <div className="hidden sm:flex items-center text-xs md:text-sm">
                <span className="whitespace-nowrap">{isLogin ? t('auth.newUser') : t('auth.alreadyHaveAccount')}</span>
                <button onClick={() => setIsLogin(!isLogin)} className="ml-1 md:ml-2 text-yellow-300 hover:text-yellow-200 font-semibold whitespace-nowrap">
                  {isLogin ? t('auth.createAccount') : t('auth.login')}
                </button>
              </div>
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="sm:hidden text-yellow-300 hover:text-yellow-200 text-xs font-semibold px-2 py-1 border border-yellow-300 rounded"
              >
                {isLogin ? t('auth.createAccount') : t('auth.login')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <div className="bg-blue-100 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <PhoneIcon className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
            </h2>
            <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
              {isLogin ? t('auth.loginToAccess') : t('auth.joinNow')}
            </p>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl p-4 md:p-8">
              <div className="mb-4 md:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">{t('auth.loginAs')}</label>
                <div className="flex gap-2 md:gap-3">
                  <UserTypeButton type="USER" label={t('auth.userType_user')} icon={UserIcon} color="bg-blue-600" />
                  <UserTypeButton type="MERCHANT" label={t('auth.userType_merchant')} icon={BuildingStorefrontIcon} color="bg-purple-600" />
                  <UserTypeButton type="AGENT" label={t('auth.userType_agent')} icon={BriefcaseIcon} color="bg-green-600" />
                </div>
              </div>
              <div className="mb-3 md:mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">{t('auth.phoneNumber')}</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="tel" required value={loginData.phone} onChange={(e) => setLoginData({...loginData, phone: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="01XXXXXXXXX" />
                </div>
              </div>
              <div className="mb-4 md:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">{t('auth.pinNumber')}</label>
                <input type="password" required maxLength={4} value={loginData.pin} onChange={(e) => setLoginData({...loginData, pin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="****" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold text-sm md:text-base">
                {loading ? t('auth.loggingIn') : t('auth.login')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="bg-white rounded-2xl shadow-xl p-4 md:p-8">
              <div className="mb-4 md:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">{t('auth.loginAs')}</label>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {[
                    { type: 'USER', label: t('auth.userType_user'), icon: UserIcon, color: 'blue' },
                    { type: 'MERCHANT', label: t('auth.userType_merchant'), icon: BuildingStorefrontIcon, color: 'purple' },
                    { type: 'AGENT', label: t('auth.userType_agent'), icon: BriefcaseIcon, color: 'green' },
                  ].map((item) => (
                    <button key={item.type} type="button" onClick={() => setSignupData({...signupData, userType: item.type})}
                      className={`py-3 px-2 md:px-4 rounded-lg transition-all text-xs md:text-sm ${
                        signupData.userType === item.type ? `bg-${item.color}-600 text-white shadow-lg` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      <item.icon className={`h-5 w-5 mx-auto mb-1 ${signupData.userType === item.type ? 'text-white' : 'text-gray-600'}`} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.fullName')}</label>
                <input type="text" required value={signupData.name} onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('auth.fullName')} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.phoneNumber')}</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="tel" required value={signupData.phone} onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="01XXXXXXXXX" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.emailOptional')}</label>
                <input type="email" value={signupData.email} onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com" />
              </div>

              {signupData.userType === 'MERCHANT' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('merchant.businessName')} *</label>
                    <input type="text" required value={signupData.businessName}
                      onChange={(e) => setSignupData({...signupData, businessName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Official Business Name" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('merchant.registrationNumber')} *</label>
                    <div className="relative">
                      <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input type="text" required value={signupData.registrationNumber}
                        onChange={(e) => setSignupData({...signupData, registrationNumber: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., REG-2024-001234" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('merchant.businessType')}</label>
                    <select value={signupData.businessType}
                      onChange={(e) => setSignupData({...signupData, businessType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">Select Business Type</option>
                      <option value="RETAIL">Retail Store</option>
                      <option value="RESTAURANT">Restaurant</option>
                      <option value="SERVICE">Service Provider</option>
                      <option value="E_COMMERCE">E-commerce</option>
                      <option value="WHOLESALE">Wholesale</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('merchant.businessAddress')}</label>
                    <textarea value={signupData.businessAddress}
                      onChange={(e) => setSignupData({...signupData, businessAddress: e.target.value})}
                      rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Full business address" />
                  </div>
                </>
              )}

              {signupData.userType === 'AGENT' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Agent Code *</label>
                    <input type="text" required value={signupData.agentCode}
                      onChange={(e) => setSignupData({...signupData, agentCode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter agent code" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">NID Number *</label>
                    <div className="relative">
                      <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input type="text" required value={signupData.nidNumber}
                        onChange={(e) => setSignupData({...signupData, nidNumber: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="XXXXXXXXXXXXXXX" />
                    </div>
                  </div>
                </>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">4-Digit PIN</label>
                <input type="password" required maxLength={4} value={signupData.pin}
                  onChange={(e) => setSignupData({...signupData, pin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="****" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.confirmPin')}</label>
                <input type="password" required maxLength={4} value={signupData.confirmPin}
                  onChange={(e) => setSignupData({...signupData, confirmPin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="****" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold">
                {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
              </button>
              <p className="text-xs text-gray-500 text-center mt-4">{t('auth.terms')}</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
