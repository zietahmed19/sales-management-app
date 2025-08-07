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
      console.log('ðŸ” LoginScreen - Attempting login with:', credentials.username);
      
      if (isAdminLogin) {
        // Admin login validation (use real API)
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${baseURL.replace('/api', '')}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        console.log('ðŸ” LoginScreen - Admin API Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('ðŸ” LoginScreen - Admin login failed:', errorText);
          trackUserAction('LOGIN_FAILED', { username: credentials.username, error: errorText, isAdmin: true });
          throw new Error('Invalid admin credentials');
        }

        const { token, user } = await response.json();
        
        // Verify this is actually an admin user (rep_code = 'ADMIN')
        if (user.rep_code !== 'ADMIN') {
          console.error('ðŸ” LoginScreen - User is not an admin:', user);
          throw new Error('Admin access required');
        }

        const adminUser = {
          id: user.id,
          username: user.username,
          role: 'admin',
          territory: 'All Regions',
          isAdmin: true,
          rep_code: user.rep_code,
          rep_name: user.rep_name || 'Administrator'
        };

        console.log('âœ… LoginScreen - Admin login successful');
        console.log('ðŸ‘¤ Admin user object:', adminUser);
        
        trackUserAction('LOGIN_SUCCESS', { 
          username: credentials.username, 
          user: adminUser,
          role: 'admin'
        });
        
        // Store admin data with real JWT token
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('territory', 'All Regions');
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        console.log('ðŸ”„ Setting currentUser...');
        setCurrentUser(adminUser);
        console.log('ðŸš€ Setting currentScreen to admin...');
        setCurrentScreen('admin');
        console.log('ðŸ“± Admin login process complete');
        
        trackUserAction('NAVIGATE_TO_ADMIN', { user: adminUser });
        
        if (initializeData) {
          setTimeout(() => {
            initializeData(adminUser);
          }, 100);
        }
      } else {
        // Delegate login validation (use existing API)
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${baseURL.replace('/api', '')}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        console.log('ðŸ” LoginScreen - Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('ðŸ” LoginScreen - Login failed:', errorText);
          trackUserAction('LOGIN_FAILED', { username: credentials.username, error: errorText });
          throw new Error('Invalid credentials');
        }

        const { token, user } = await response.json();
        
        console.log('âœ… LoginScreen - Delegate login successful');
        console.log('ðŸ”‘ LoginScreen - Token received:', !!token);
        console.log('ðŸ‘¤ LoginScreen - User received:', user);
        
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
        
        console.log('ðŸ’¾ LoginScreen - Data stored in localStorage');
        
        // Small delay to ensure localStorage is committed
        await new Promise(resolve => setTimeout(resolve, 50));
        
        setCurrentUser(user);
        setCurrentScreen('dashboard');
        
        trackUserAction('NAVIGATE_TO_DASHBOARD', { user: user });
        
        // Trigger manual data loading after successful login
        if (initializeData) {
          console.log('ðŸ”„ LoginScreen - Triggering data initialization...');
          trackUserAction('INITIALIZE_DATA_TRIGGER', { user: user });
          setTimeout(() => {
            initializeData(user);
          }, 100);
        }
      }
      
    } catch (error) {
      console.error('âŒ LoginScreen - Login error:', error);
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
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-purple-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-purple-900 drop-shadow-lg">
            نظام إدارة المبيعات
          </h2>
          <p className="mt-2 text-sm text-purple-600">
            {isAdminLogin ? 'دخول المدير' : t('login')} إلى حسابك
          </p>
        </div>

        {/* Login Type Switcher */}
        <div className="mb-4">
          <div className="flex rounded-lg bg-white bg-opacity-90 backdrop-blur-sm p-1 border border-purple-300 shadow-lg">
            <button
              type="button"
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                !isAdminLogin 
                  ? 'bg-purple-600 text-white shadow-lg transform scale-105' 
                  : 'text-purple-600 hover:text-purple-800 hover:bg-purple-100'
              }`}
              onClick={() => setIsAdminLogin(false)}
            >
              <Users className="w-4 h-4 mr-2" />
              دخول المندوب
            </button>
            <button
              type="button"
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                isAdminLogin 
                  ? 'bg-purple-500 text-white shadow-lg transform scale-105' 
                  : 'text-purple-600 hover:text-purple-800 hover:bg-purple-100'
              }`}
              onClick={() => setIsAdminLogin(true)}
            >
              <Shield className="w-4 h-4 mr-2" />
              دخول المدير
            </button>
          </div>
        </div>
        
        <form className="mt-8 space-y-6 bg-white bg-opacity-95 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-purple-200" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="sr-only">{t('username')}</label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-5 w-5 text-purple-500" />
                <input
                  type="text"
                  required
                  className="appearance-none rounded-lg relative block w-full px-10 py-3 border-2 border-purple-300 placeholder-purple-400 text-purple-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-right transition-all duration-300"
                  placeholder={isAdminLogin ? "mohcenacid" : t('username')}
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="sr-only">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-purple-500" />
                <input
                  type="password"
                  required
                  className="appearance-none rounded-lg relative block w-full px-10 py-3 border-2 border-purple-300 placeholder-purple-400 text-purple-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-right transition-all duration-300"
                  placeholder={isAdminLogin ? "admin1234" : t('password')}
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-900 bg-opacity-30 p-3 rounded-lg border border-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            {loading ? 'جاري تسجيل الدخول...' : (isAdminLogin ? 'دخول كمدير' : t('login'))}
          </button>
        </form>

        {/* Quick Access - Only show admin credentials */}
        {isAdminLogin && (
          <div className="text-center text-sm text-purple-700 bg-white bg-opacity-95 backdrop-blur-lg rounded-xl p-4 shadow-2xl border border-purple-200">
            <p className="mb-3 font-semibold text-purple-800">بيانات المديرين:</p>
            <div className="grid gap-2">
              {adminUsers.map(admin => (
                <button
                  key={admin}
                  className="w-full py-2 px-3 bg-purple-500 text-white rounded-lg text-xs transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-purple-300 hover:bg-purple-600"
                  onClick={() => fillCredentials(admin, adminPassword)}
                >
                  {admin}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isAdminLogin && (
          <div className="text-center text-sm text-purple-700 bg-white bg-opacity-95 backdrop-blur-lg rounded-xl p-4 shadow-2xl border border-purple-200">
            <p className="font-semibold text-purple-900">Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ù†Ø¯ÙˆØ¨ÙŠÙ† Ù…Ø­ÙÙˆØ¸Ø© ÙÙŠ Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª</p>
            <p className="text-purple-600">Ø§Ø³ØªØ®Ø¯Ù… Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ø¹ØªÙ…Ø§Ø¯Ùƒ Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ©</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
