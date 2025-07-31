import React from 'react';
import { LogOut, User, Home, Settings } from 'lucide-react';
import { t } from '../../translations/arabic';

const Header = ({ currentUser, onLogout, title, setCurrentScreen }) => {
  return (
    <div className="bg-white shadow-sm border-b" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-4">
            {setCurrentScreen && (
              <button
                onClick={() => {
                  console.log('Dashboard button clicked');
                  setCurrentScreen('dashboard');
                }}
                className="flex items-center space-x-reverse space-x-1 text-indigo-600 hover:text-indigo-800"
                title={t('dashboard')}
              >
                <Home className="w-5 h-5" />
                <span className="text-sm">{t('dashboard')}</span>
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          {currentUser && (
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="flex items-center space-x-reverse space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {currentUser.RepresentName} ({currentUser.RepCode})
                </span>
              </div>
              {setCurrentScreen && (
                <button
                  onClick={() => setCurrentScreen('settings')}
                  className="flex items-center space-x-reverse space-x-1 text-gray-600 hover:text-gray-800"
                  title="الإعدادات"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">الإعدادات</span>
                </button>
              )}
              <button
                onClick={onLogout}
                className="flex items-center space-x-reverse space-x-1 text-red-600 hover:text-red-800"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">{t('logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;