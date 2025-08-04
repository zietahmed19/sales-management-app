/**
 * Backup of current App.jsx
 */
import React, { useState, useEffect, useCallback } from 'react';

// Import all necessary components
import LoginScreen from './components/Login/LoginScreen';
import Dashboard from './components/Dashboard/Dashboard';
import PackSelection from './components/Sales/PackSelection';
import ClientSelection from './components/Sales/ClientSelection';
import SaleConfirmation from './components/Sales/SaleConfirmationMinimal';
import SalesReport from './components/Reports/SalesReport';
import EnhancedSalesReport from './components/Dashboard/EnhancedSalesReport';
import ClientManagement from './components/Clients/ClientManagement';
import PackManagement from './components/Products/PackManagement';
import Settings from './components/Settings/Settings';
import AdminDashboard from './components/Admin/AdminDashboard';
import ErrorBoundary from './components/Common/ErrorBoundary';

// Simple tracking function for debugging
const trackUserAction = (action, details = {}) => {
  console.log(`🔍 USER ACTION: ${action}`, details);
};

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Load data from database API
const loadData = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('🔄 Loading data from API...');
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    
    const responses = await Promise.all([
      fetch(`${API_BASE_URL}/clients`, { headers }),
      fetch(`${API_BASE_URL}/articles`, { headers }),
      fetch(`${API_BASE_URL}/gifts`, { headers }),
      fetch(`${API_BASE_URL}/packs`, { headers }),
      fetch(`${API_BASE_URL}/sales`, { headers }),
    ]);

    // Check for any failed responses
    for (let i = 0; i < responses.length; i++) {
      if (!responses[i].ok) {
        const errorText = await responses[i].text();
        console.error(`❌ API Error ${i}:`, responses[i].status, errorText);
        throw new Error(`API call failed: ${responses[i].status} - ${errorText}`);
      }
    }

    const [clientsData, articlesData, giftsData, packsData, salesData] = await Promise.all([
      responses[0].json(),
      responses[1].json(),
      responses[2].json(),
      responses[3].json(),
      responses[4].json(),
    ]);

    console.log('✅ Data loaded successfully');
    console.log('📊 Clients:', clientsData?.length || 0);
    console.log('📋 Packs:', packsData?.length || 0);

    const data = {
      clients: clientsData || [],
      articles: articlesData || [],
      gifts: giftsData || [],
      packs: packsData || [],
      sales: salesData || []
    };

    return data;
  } catch (error) {
    console.error("❌ Error loading data:", error);
    throw error;
  }
};




const App = () => {
  // Global state management
  const [currentUser, setCurrentUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [selectedPacks, setSelectedPacks] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    console.log('🔄 App - Checking for existing authentication...');
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('currentUser');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        console.log('✅ App - Setting current user:', user);
        setCurrentUser(user);
        setCurrentScreen('dashboard');
      } catch (error) {
        console.error('❌ App - Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  // Manual data loading function that can be called from anywhere
  const initializeData = useCallback(async (userOverride = null) => {
    console.log('🟡 App - initializeData called');
    
    const user = userOverride || currentUser;
    
    if (!user) {
      console.log('ℹ️ App - No user available, skipping data initialization');
      return;
    }
    
    try {
      console.log('🔄 App - Initializing data for user:', user);
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const initialData = await loadData();
      console.log('✅ App - Data loaded from API:', {
        clients: initialData?.clients?.length,
        packs: initialData?.packs?.length
      });
      
      setData(initialData);
      console.log('✅ App - Data state updated');
    } catch (error) {
      console.error('❌ App - Failed to load data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentUser]); // Add currentUser to dependencies

  // Load initial data when user logs in - with retry logic
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const tryInitialize = async () => {
      if (!currentUser) {
        console.log('ℹ️ App - No current user, skipping data initialization');
        return;
      }
      
      console.log(`🔄 App - Attempt ${retryCount + 1}/${maxRetries} to initialize data`);
      
      try {
        await initializeData(currentUser);
        console.log('✅ App - Data initialization completed');
      } catch (error) {
        console.error(`❌ App - Data initialization attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`🔄 App - Retrying in ${1000 * retryCount}ms...`);
          setTimeout(tryInitialize, 1000 * retryCount);
        } else {
          console.error('❌ App - All data initialization attempts failed');
          console.log('📝 App - User can still use the app, components will show loading states');
          // Don't set empty data - let components handle null data gracefully
          setLoading(false);
        }
      }
    };

    if (currentUser) {
      tryInitialize();
    }
  }, [currentUser, initializeData]);

  // Navigation helper function with tracking
  const navigateTo = (screen) => {
    trackUserAction('NAVIGATE', { 
      from: currentScreen, 
      to: screen,
      currentUser: currentUser ? currentUser.username : null,
      dataAvailable: !!data,
      clientCount: data?.clients?.length || 0,
      packCount: data?.packs?.length || 0
    });
  };

  // Reset application state (used for logout) with tracking
  const resetAppState = () => {
    trackUserAction('LOGOUT', { 
      user: currentUser ? currentUser.username : null 
    });
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setCurrentScreen('login');
    setSelectedPacks([]);
    setSelectedClient(null);
    setData(null);
    setLoading(false);
  };

  // Enhanced API request helper function
  const apiRequest = async (endpoint, options = {}) => {
    try {
      const token = localStorage.getItem('token');
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: { ...defaultOptions.headers, ...options.headers },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  };

  // Screen rendering logic with enhanced tracking
  const renderCurrentScreen = () => {
    console.log('🎯 App.jsx - renderCurrentScreen called');
    console.log('📺 Current screen:', currentScreen);
    console.log('👤 Current user:', currentUser);

    trackUserAction('RENDER_SCREEN', {
      screen: currentScreen,
      loading: loading && currentUser,
      hasUser: !!currentUser,
      hasData: !!data,
      clientCount: data?.clients?.length || 0,
      packCount: data?.packs?.length || 0
    });

    // Show loading when we have a user but no data yet OR when explicitly loading
    if ((loading && currentUser) || (currentUser && !data)) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading application...</p>
          </div>
        </div>
      );
    }

    // Common props passed to all screens
    const screenProps = {
      currentUser,
      setCurrentUser,
      navigateTo,
      setCurrentScreen,
      resetAppState,
      selectedPacks,
      setSelectedPacks,
      selectedClient,
      setSelectedClient,
      data,
      setData,
      apiRequest, // Add API helper to props
      initializeData, // Add manual data loading function
      trackUserAction // Add tracking function to all components
    };

    switch (currentScreen) {
      case 'login':
        console.log('Rendering LoginScreen');
        return <LoginScreen {...screenProps} />;
      case 'dashboard':
        console.log('Rendering Dashboard');
        return <Dashboard {...screenProps} />;
      case 'packs':
        console.log('Rendering PackSelection');
        console.log('🔍 App - Data for PackSelection:', data);
        console.log('🔍 App - Data exists:', !!data);
        console.log('🔍 App - Packs exists:', !!data?.packs);
        console.log('🔍 App - Packs length:', data?.packs?.length);
        console.log('🔍 App - Packs content:', data?.packs);
        return <PackSelection {...screenProps} />;
      case 'clients':
        console.log('Rendering ClientSelection');
        return <ClientSelection {...screenProps} />;
      case 'confirmation':
        console.log('Rendering SaleConfirmation');
        
        // Additional validation
        if (!selectedPacks || selectedPacks.length === 0) {
          console.warn('⚠️ App - No selected packs, redirecting to pack selection');
          setCurrentScreen('packs');
          return null;
        }
        
        if (!selectedClient) {
          console.warn('⚠️ App - No selected client, redirecting to client selection');
          setCurrentScreen('clients');
          return null;
        }
        
        return <SaleConfirmation {...screenProps} />;
      case 'reports':
        console.log('Rendering SalesReport');
        return <SalesReport {...screenProps} />;
      case 'enhanced-reports':
        console.log('Rendering EnhancedSalesReport');
        return <EnhancedSalesReport {...screenProps} />;
      case 'client-management':
        console.log('Rendering ClientManagement');
        return <ClientManagement {...screenProps} />;
      case 'pack-management':
        console.log('Rendering PackManagement');
        return <PackManagement {...screenProps} />;
      case 'settings':
        console.log('Rendering Settings');
        return <Settings {...screenProps} />;
      case 'admin':
        console.log('Rendering AdminDashboard');
        return <AdminDashboard {...screenProps} />;
      default:
        console.log('Rendering default LoginScreen');
        return <LoginScreen {...screenProps} />;
    }
  };

  return (
    <ErrorBoundary onRetry={() => setCurrentScreen('dashboard')}>
      <div className="App">
        {renderCurrentScreen()}
      </div>
    </ErrorBoundary>
  );
};

export default App;
