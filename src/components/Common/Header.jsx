import React from 'react';
import { LogOut, User, Home, Settings } from 'lucide-react';
import { t } from '../../translations/arabic';

const Header = ({ currentUser, onLogout, title, setCurrentScreen }) => {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-amber-500 shadow-xl border-b border-purple-300" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-4">
            {setCurrentScreen && (
              <button
                onClick={() => {
                  console.log('Dashboard button clicked');
                  setCurrentScreen('dashboard');
                }}
                className="flex items-center space-x-reverse space-x-1 text-white hover:text-amber-200 transition-all duration-300 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-2 hover:bg-opacity-30"
                title={t('dashboard')}
              >
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium">{t('dashboard')}</span>
              </button>
            )}
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">{title}</h1>
          </div>
          {currentUser && (
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="flex items-center space-x-reverse space-x-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-2">
                <User className="w-5 h-5 text-amber-200" />
                <span className="text-sm text-white font-medium">
                  {currentUser.RepresentName} ({currentUser.RepCode})
                </span>
              </div>
              {setCurrentScreen && (
                <button
                  onClick={() => setCurrentScreen('settings')}
                  className="flex items-center space-x-reverse space-x-1 text-white hover:text-amber-200 transition-all duration-300 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-2 hover:bg-opacity-30"
                  title="الإعدادات"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">الإعدادات</span>
                </button>
              )}
              <button
                onClick={onLogout}
                className="flex items-center space-x-reverse space-x-1 text-white hover:text-red-200 transition-all duration-300 bg-red-500 bg-opacity-80 backdrop-blur-sm rounded-lg px-3 py-2 hover:bg-red-600 hover:bg-opacity-90"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">{t('logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;