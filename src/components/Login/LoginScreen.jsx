import React, { useState } from 'react';
import { User, Lock, AlertCircle, Shield, Users } from 'lucide-react';
import { t } from '../../translations/arabic';

const LoginScreen = ({ setCurrentUser, setCurrentScreen, initializeData, trackUserAction }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  // Admin users list
  const adminUsers = ['mohcenacid', 'djalili', 'houcemacid'];
  const adminPassword = 'admin1234';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    trackUserAction('LOGIN_ATTEMPT', { username: credentials.username, isAdmin: isAdminLogin });

    try {
      console.log('🔐 LoginScreen - Attempting login with:', credentials.username);
      
      if (isAdminLogin) {
        // Admin login validation (local)
        if (adminUsers.includes(credentials.username) && credentials.password === adminPassword) {
          const user = {
            id: 'admin_' + credentials.username,
            username: credentials.username,
            role: 'admin',
            territory: 'All Regions',
            isAdmin: true
          };

          console.log('✅ LoginScreen - Admin login successful');
          
          trackUserAction('LOGIN_SUCCESS', { 
            username: credentials.username, 
            user: user,
            role: 'admin'
          });
          
          // Store admin data
          const token = 'admin-token-' + Date.now();
          localStorage.setItem('token', token);
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('territory', 'All Regions');
          
          await new Promise(resolve => setTimeout(resolve, 50));
          
          setCurrentUser(user);
          setCurrentScreen('admin');
          
          trackUserAction('NAVIGATE_TO_ADMIN', { user: user });
          
          if (initializeData) {
            setTimeout(() => {
              initializeData(user);
            }, 100);
          }
        } else {
          throw new Error('Invalid admin credentials');
        }
      } else {
        // Delegate login validation (use existing API)
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        console.log('🔐 LoginScreen - Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('🔐 LoginScreen - Login failed:', errorText);
          trackUserAction('LOGIN_FAILED', { username: credentials.username, error: errorText });
          throw new Error('Invalid credentials');
        }

        const { token, user } = await response.json();
        
        console.log('✅ LoginScreen - Delegate login successful');
        console.log('🔑 LoginScreen - Token received:', !!token);
        console.log('👤 LoginScreen - User received:', user);
        
        trackUserAction('LOGIN_SUCCESS', { 
          username: credentials.username, 
          user: user,
          tokenExists: !!token 
        });
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('userRole', 'delegate');
        localStorage.setItem('territory', user.territory);
        
        console.log('💾 LoginScreen - Data stored in localStorage');
        
        // Small delay to ensure localStorage is committed
        await new Promise(resolve => setTimeout(resolve, 50));
        
        setCurrentUser(user);
        setCurrentScreen('dashboard');
        
        trackUserAction('NAVIGATE_TO_DASHBOARD', { user: user });
        
        // Trigger manual data loading after successful login
        if (initializeData) {
          console.log('🔄 LoginScreen - Triggering data initialization...');
          trackUserAction('INITIALIZE_DATA_TRIGGER', { user: user });
          setTimeout(() => {
            initializeData(user);
          }, 100);
        }
      }
      
    } catch (error) {
      console.error('❌ LoginScreen - Login error:', error);
      trackUserAction('LOGIN_ERROR', { username: credentials.username, error: error.message });
      setError(isAdminLogin ? 'بيانات اعتماد المدير غير صحيحة' : 'بيانات الاعتماد غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (username, password) => {
    setCredentials({ username, password });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            نظام إدارة المبيعات
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isAdminLogin ? 'دخول المدير' : t('login')} إلى حسابك
          </p>
        </div>

        {/* Login Type Switcher */}
        <div className="mb-4">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isAdminLogin 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setIsAdminLogin(false)}
            >
              <Users className="w-4 h-4 mr-2" />
              دخول المندوب
            </button>
            <button
              type="button"
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isAdminLogin 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setIsAdminLogin(true)}
            >
              <Shield className="w-4 h-4 mr-2" />
              دخول المدير
            </button>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="sr-only">{t('username')}</label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
                  placeholder={isAdminLogin ? "mohcenacid" : t('username')}
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="sr-only">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
                  placeholder={isAdminLogin ? "admin1234" : t('password')}
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {loading ? 'جاري تسجيل الدخول...' : (isAdminLogin ? 'دخول كمدير' : t('login'))}
          </button>
        </form>

        {/* Quick Access - Only show admin credentials */}
        {isAdminLogin && (
          <div className="text-center text-sm text-gray-500">
            <p className="mb-3">بيانات المديرين:</p>
            <div className="grid gap-2">
              {adminUsers.map(admin => (
                <button
                  key={admin}
                  className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-xs transition-colors"
                  onClick={() => fillCredentials(admin, adminPassword)}
                >
                  {admin}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isAdminLogin && (
          <div className="text-center text-sm text-gray-500">
            <p>بيانات المندوبين محفوظة في قاعدة البيانات</p>
            <p>استخدم بيانات اعتمادك الحقيقية</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;