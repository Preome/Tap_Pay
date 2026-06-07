'use client';

import { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon, LanguageIcon, BellIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const [language, setLanguage] = useState('en');

  return (
    <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold">TAP PAY</div>
            <div className="hidden md:flex space-x-4">
              <span className="text-sm bg-blue-500 px-3 py-1 rounded-full">User: John Doe</span>
              <span className="text-sm bg-green-500 px-3 py-1 rounded-full">Verified</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 hover:bg-blue-700 rounded-lg transition-colors">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors">
                <LanguageIcon className="h-5 w-5" />
                <span>{language === 'en' ? 'EN' : 'BN'}</span>
              </Menu.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Menu.Items className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setLanguage('en')}
                          className={`${
                            active ? 'bg-blue-500 text-white' : 'text-gray-900'
                          } group flex w-full items-center px-4 py-2 text-sm`}
                        >
                          English
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setLanguage('bn')}
                          className={`${
                            active ? 'bg-blue-500 text-white' : 'text-gray-900'
                          } group flex w-full items-center px-4 py-2 text-sm`}
                        >
                          বাংলা
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            
            <button className="hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors">
              <UserCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}