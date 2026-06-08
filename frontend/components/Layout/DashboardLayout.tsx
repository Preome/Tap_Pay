'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HomeIcon, 
  ArrowPathIcon, 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  BellIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/I18n/LanguageSwitcher';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const navigation = [
    { name: t('nav.dashboard'), icon: HomeIcon, href: '#' },
    { name: t('nav.transactions'), icon: ArrowPathIcon, href: '#' },
    { name: t('nav.wallet'), icon: CreditCardIcon, href: '#' },
    { name: t('nav.profile'), icon: UserIcon, href: '#' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <span className="text-2xl"></span>
            <h1 className="text-xl font-bold text-gray-800">{t('app.name')}</h1>
          </div>
          
          <nav className="space-y-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </a>
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors w-full"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      <div className="ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex justify-between items-center px-8 py-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">{t('nav.dashboard')}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  U
                </div>
                <span className="text-sm font-medium text-gray-700"></span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
