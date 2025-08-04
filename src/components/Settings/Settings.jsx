import React, { useState, useEffect } from 'react';
import { User, Save, Key, Bell, Globe, Shield } from 'lucide-react';
import Header from '../Common/Header';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const Settings = ({ 
  currentUser, 
  setCurrentUser,
  data,
  setData,
  setCurrentScreen, 
  resetAppState,
  apiRequest 
}) => {
  const { language, changeLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    RepresentName: currentUser.rep_name || currentUser.RepresentName || '',
    Phone: currentUser.phone || currentUser.Phone || '',
    City: currentUser.city || currentUser.City || '',
    Wilaya: currentUser.wilaya || currentUser.Wilaya || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [appSettings, setAppSettings] = useState({
    language: language,
    currency: localStorage.getItem('app_currency') || 'DA',
    notifications: localStorage.getItem('app_notifications') !== 'false',
    theme: theme
  });

  // Sync with context changes
  useEffect(() => {
    setAppSettings(prev => ({
      ...prev,
      language: language,
      theme: theme
    }));
  }, [language, theme]);

  // Apply theme immediately when component mounts
  useEffect(() => {
    applyTheme(appSettings.theme);
    applyLanguage(appSettings.language);
  }, []);

  // Function to apply theme changes
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    
    // Update CSS variables based on theme
    const root = document.documentElement;
    if (theme === 'dark') {
      root.style.setProperty('--bg-primary', '#1a1a1a');
      root.style.setProperty('--bg-secondary', '#2d2d2d');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#b0b0b0');
      root.style.setProperty('--border-color', '#404040');
    } else {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8f9fa');
      root.style.setProperty('--text-primary', '#212529');
      root.style.setProperty('--text-secondary', '#6c757d');
      root.style.setProperty('--border-color', '#dee2e6');
    }
  };

  // Function to apply language changes
  const applyLanguage = (language) => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  };

  // Handle theme change with immediate application
  const handleThemeChange = (newTheme) => {
    setAppSettings(prev => ({ ...prev, theme: newTheme }));
    setTheme(newTheme);
    localStorage.setItem('app_theme', newTheme);
  };

  // Handle language change with immediate application
  const handleLanguageChange = (newLanguage) => {
    setAppSettings(prev => ({ ...prev, language: newLanguage }));
    changeLanguage(newLanguage);
    localStorage.setItem('app_language', newLanguage);
  };

  const handleSaveProfile = async () => {
    try {
      // Update via API
      const userId = currentUser.id || currentUser.iD;
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const apiBase = baseURL.replace('/api', '');
      
      const response = await fetch(`${apiBase}/api/representatives/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        // Update current user
        const updatedUser = { ...currentUser, ...profileData };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        alert('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleSaveAppSettings = () => {
    // Save all settings to localStorage
    localStorage.setItem('app_language', appSettings.language);
    localStorage.setItem('app_currency', appSettings.currency);
    localStorage.setItem('app_notifications', appSettings.notifications.toString());
    localStorage.setItem('app_theme', appSettings.theme);
    
    // Apply theme and language
    applyTheme(appSettings.theme);
    applyLanguage(appSettings.language);
    
    alert('Application settings saved successfully!');
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert('Please fill in all password fields');
      return;
    }
    
    if (passwordData.currentPassword !== currentUser.password) {
      alert('Current password is incorrect');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }
    
    // Update password
    const updatedUser = { ...currentUser, password: passwordData.newPassword };
    setCurrentUser(updatedUser);
    
    const updatedRepresentatives = data.representatives.map(rep => 
      rep.iD === currentUser.iD ? updatedUser : rep
    );
    setData({ ...data, representatives: updatedRepresentatives });
    
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    alert('Password changed successfully!');
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'preferences', name: 'Preferences', icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentUser={currentUser} 
        onLogout={resetAppState}
        title="Settings"
        setCurrentScreen={setCurrentScreen}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.RepresentName}
                      onChange={(e) => setProfileData({ ...profileData, RepresentName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Representative Code
                    </label>
                    <input
                      type="text"
                      value={currentUser.RepCode}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Representative code cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={profileData.Phone}
                      onChange={(e) => setProfileData({ ...profileData, Phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={currentUser.username}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={profileData.City}
                      onChange={(e) => setProfileData({ ...profileData, City: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wilaya
                    </label>
                    <input
                      type="text"
                      value={profileData.Wilaya}
                      onChange={(e) => setProfileData({ ...profileData, Wilaya: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center space-x-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Profile</span>
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <button
                    onClick={handleChangePassword}
                    className="flex items-center space-x-2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                  >
                    <Key className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Sale Notifications</h4>
                      <p className="text-sm text-gray-500">Get notified when a sale is completed</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Client Updates</h4>
                      <p className="text-sm text-gray-500">Get notified about client information changes</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Weekly Reports</h4>
                      <p className="text-sm text-gray-500">Receive weekly sales performance reports</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Application Preferences</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select 
                      value={appSettings.language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ar">العربية</option>
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Changes apply immediately</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select 
                      value={appSettings.currency}
                      onChange={(e) => setAppSettings({ ...appSettings, currency: e.target.value })}
                      className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="DA">DA (د.ج)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <select 
                      value={appSettings.theme}
                      onChange={(e) => handleThemeChange(e.target.value)}
                      className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Changes apply immediately</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="notifications"
                      checked={appSettings.notifications}
                      onChange={(e) => setAppSettings({ ...appSettings, notifications: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                      Enable notifications
                    </label>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      onClick={handleSaveAppSettings}
                      className="flex items-center space-x-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save All Preferences</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
