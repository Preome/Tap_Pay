'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HomeIcon, 
  ArrowPathIcon, 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/I18n/LanguageSwitcher';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const primaryNav = [
    { name: t('nav.dashboard'), icon: HomeIcon, href: '#' },
    { name: t('nav.transactions'), icon: ArrowPathIcon, href: '#' },
    { name: t('nav.wallet'), icon: WalletIcon, href: '#' },
    { name: t('nav.profile'), icon: UserIcon, href: '#' },
  ];

  const bottomNav = [
    { name: t('nav.dashboard'), icon: HomeIcon, href: '#' },
    { name: t('nav.transactions'), icon: ArrowPathIcon, href: '#' },
    { name: t('nav.wallet'), icon: WalletIcon, href: '#' },
    { name: t('nav.profile'), icon: UserIcon, href: '#' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-64 bg-white shadow-lg flex-col z-30">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">{t('app.name')}</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {primaryNav.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </a>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2.5 text-red-600 rounded-lg hover:bg-red-50 transition-colors w-full"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 md:hidden">
        <div className="flex items-center justify-around h-16">
          {bottomNav.map((item, i) => (
            <a
              key={i}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-blue-600 active:text-blue-600 transition-colors"
            >
              <item.icon className="h-6 w-6" />
              <span className="text-[10px] mt-0.5">{item.name}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Mobile header */}
      <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 h-14">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">{t('app.name')}</h1>
          <div className="flex items-center space-x-2">
            <LanguageSwitcher />
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop header */}
      <header className="hidden md:block bg-white shadow-sm sticky top-0 z-10 md:ml-64">
        <div className="flex justify-between items-center px-8 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">{t('nav.dashboard')}</h2>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              U
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-200 ease-in-out md:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-lg font-bold text-gray-800">{t('app.name')}</h1>
            <button onClick={() => setSidebarOpen(false)} className="p-1 text-gray-500 hover:text-gray-800 rounded-lg">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {primaryNav.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-base">{item.name}</span>
              </a>
            ))}
          </nav>
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors w-full"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="text-base">{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:ml-64">
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
