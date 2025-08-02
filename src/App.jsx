/**
 * Main App Component
 * Manages global state and routing between different screens
 * Handles user authentication and screen navigation
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

console.log('🔍 All components imported:');
console.log('  - LoginScreen:', typeof LoginScreen);
console.log('  - Dashboard:', typeof Dashboard);
console.log('  - PackSelection:', typeof PackSelection);
console.log('  - ClientSelection:', typeof ClientSelection);
console.log('  - SaleConfirmation:', typeof SaleConfirmation);
console.log('  - PackManagement:', typeof PackManagement);
console.log('  - ErrorBoundary:', typeof ErrorBoundary);

// Global click tracking function that logs to console (visible in terminal)
const trackUserAction = (action, details = {}) => {
  const timestamp = new Date().toISOString();
  const message = `🔍 [${timestamp}] USER ACTION: ${action}`;
  console.log('='.repeat(80));
  console.log(message);
  console.log('📋 Details:', details);
  console.log('🔍 Current URL:', window.location.href);
  console.log('📊 Current State:');
  console.log('  - Token exists:', !!localStorage.getItem('token'));
  console.log('  - User exists:', !!localStorage.getItem('currentUser'));
  console.log('='.repeat(80));
  
  // Also send to terminal watcher if available (only in development)
  if (process.env.NODE_ENV === 'development') {
    try {
      fetch('http://localhost:3002/console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          level: 'action', 
          message: `USER ACTION: ${action}`, 
          data: details 
        })
      }).catch(() => {}); // Ignore errors
    } catch (e) {}
  }
};

// Global console interceptor to send messages to terminal
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.log = (...args) => {
  originalConsoleLog(...args);
  try {
    const message = args.join(' ');
    if (process.env.NODE_ENV === 'development' && (message.includes('🔍') || message.includes('✅') || message.includes('❌') || message.includes('🔄'))) {
      fetch('http://localhost:3002/console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          level: 'log', 
          message: message,
          data: args.length > 1 ? args.slice(1) : null
        })
      }).catch(() => {});
    }
  } catch (e) {}
};

console.error = (...args) => {
  originalConsoleError(...args);
  if (process.env.NODE_ENV === 'development') {
    try {
      fetch('http://localhost:3002/console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          level: 'error', 
          message: args.join(' '),
          data: args.length > 1 ? args.slice(1) : null
        })
      }).catch(() => {});
    } catch (e) {}
  }
};

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// API helper function with token handling
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.reload();
    }
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

// Load data from database API
const loadData = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('🔄 Loading data from API...');
    console.log('🔑 Token exists:', !!token);
    console.log('🔑 Token preview:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
    console.log('📡 API Base URL:', API_BASE_URL);
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    
    console.log('� Headers being sent:', headers);
    
    // Test a single endpoint first
    console.log('🧪 Testing single clients endpoint...');
    const testResponse = await fetch(`${API_BASE_URL}/clients`, { headers });
    console.log('🧪 Test response status:', testResponse.status);
    console.log('🧪 Test response ok:', testResponse.ok);
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('🧪 Test response error:', errorText);
      throw new Error(`Test API call failed: ${testResponse.status} - ${errorText}`);
    }
    
    const testData = await testResponse.json();
    console.log('🧪 Test data received:', testData?.length || 0, 'clients');
    
    // If test passes, proceed with all endpoints
    console.log('✅ Test passed, loading all endpoints...');
    
    const responses = await Promise.all([
      fetch(`${API_BASE_URL}/clients`, { headers }),
      fetch(`${API_BASE_URL}/articles`, { headers }),
      fetch(`${API_BASE_URL}/gifts`, { headers }),
      fetch(`${API_BASE_URL}/packs`, { headers }),
      fetch(`${API_BASE_URL}/sales`, { headers }),
    ]);

    console.log('📊 Clients response status:', responses[0].status);
    console.log('📦 Articles response status:', responses[1].status);
    console.log('🎁 Gifts response status:', responses[2].status);
    console.log('📋 Packs response status:', responses[3].status);
    console.log('💰 Sales response status:', responses[4].status);

    // Check for any failed responses
    for (let i = 0; i < responses.length; i++) {
      if (!responses[i].ok) {
        const errorText = await responses[i].text();
        console.error(`❌ API Error ${i}:`, responses[i].status, errorText);
      }
    }

    const [clientsData, articlesData, giftsData, packsData, salesData] = await Promise.all([
      responses[0].ok ? responses[0].json() : [],
      responses[1].ok ? responses[1].json() : [],
      responses[2].ok ? responses[2].json() : [],
      responses[3].ok ? responses[3].json() : [],
      responses[4].ok ? responses[4].json() : [],
    ]);

    console.log('✅ Data loaded successfully:');
    console.log('📊 Clients data type:', typeof clientsData, 'length:', clientsData?.length || 0);
    console.log('📦 Articles data type:', typeof articlesData, 'length:', articlesData?.length || 0);
    console.log('🎁 Gifts data type:', typeof giftsData, 'length:', giftsData?.length || 0);
    console.log('📋 Packs data type:', typeof packsData, 'length:', packsData?.length || 0);
    console.log('💰 Sales data type:', typeof salesData, 'length:', salesData?.length || 0);

    // Log first few items for debugging
    console.log('📊 First client:', clientsData?.[0]);
    console.log('📋 First pack:', packsData?.[0]);

    const data = {
      clients: clientsData || [],
      articles: articlesData || [],
      gifts: giftsData || [],
      packs: packsData || [],
      sales: salesData || []
    };

    console.log('📊 Final data object keys:', Object.keys(data));
    console.log('📊 Final data object:', data);
    return data;
  } catch (error) {
    console.error("❌ Error loading data:", error);
    console.error("❌ Error stack:", error.stack);
    // Don't return empty arrays, throw the error so it can be handled properly
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
    
    console.log('🔍 App - Token found:', !!token);
    console.log('🔍 App - User data found:', !!userData);
    
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
    } else {
      console.log('ℹ️ App - No existing authentication found');
    }
    // Set loading to false even if no user is found
    setLoading(false);
  }, []);

  // Manual data loading function that can be called from anywhere
  const initializeData = useCallback(async (userOverride = null) => {
    console.log('🟡 App - initializeData called');
    
    // Use userOverride if provided, otherwise use currentUser
    const user = userOverride || currentUser;
    console.log('🟡 App - Using user:', user);
    console.log('🟡 App - currentUser:', currentUser);
    console.log('🟡 App - userOverride:', userOverride);
    
    if (!user) {
      console.log('ℹ️ App - No user available, skipping data initialization');
      return;
    }
    
    try {
      console.log('🔄 App - Initializing data for user:', user);
      console.log('🔍 App - Checking localStorage token:', !!localStorage.getItem('token'));
      console.log('🔍 App - Token value:', localStorage.getItem('token')?.substring(0, 50) + '...');
      setLoading(true);
      
      // Ensure token is available
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const initialData = await loadData();
      console.log('✅ App - Data loaded from API:', initialData);
      console.log('📊 App - Client count received:', initialData?.clients?.length);
      console.log('📋 App - Pack count received:', initialData?.packs?.length);
      
      // Validate that we actually got data
      if (initialData.clients?.length === 0 && initialData.packs?.length === 0) {
        console.warn('⚠️ App - Warning: Received empty data arrays');
      }
      
      setData(initialData);
      console.log('✅ App - Data state updated');
      console.log('🔍 App - Data state after update:', initialData);
      console.log('🔍 App - Clients in state:', initialData?.clients?.length);
      console.log('🔍 App - Packs in state:', initialData?.packs?.length);
    } catch (error) {
      console.error('❌ App - Failed to load data:', error);
      throw error; // Re-throw to allow retry logic to work
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we don't want this to recreate

  // Load initial data when user logs in - with retry logic
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const tryInitialize = async () => {
      console.log('🟢 App - tryInitialize called');
      console.log('🟢 App - currentUser in tryInitialize:', currentUser);
      
      if (!currentUser) {
        console.log('ℹ️ App - No current user, skipping data initialization');
        return;
      }
      
      console.log(`🔄 App - Attempt ${retryCount + 1}/${maxRetries} to initialize data`);
      
      try {
        console.log('🟢 App - About to call initializeData...');
        await initializeData(currentUser); // Pass currentUser directly
        console.log('✅ App - Data initialization completed');
      } catch (error) {
        console.error(`❌ App - Data initialization attempt ${retryCount + 1} failed:`, error);
        console.error(`❌ App - Error message:`, error.message);
        console.error(`❌ App - Error stack:`, error.stack);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`🔄 App - Retrying in ${1000 * retryCount}ms...`);
          setTimeout(tryInitialize, 1000 * retryCount);
        } else {
          console.error('❌ App - All data initialization attempts failed');
          console.log('📝 App - Setting empty data as fallback');
          setData({
            clients: [],
            articles: [],
            gifts: [],
            packs: [],
            sales: []
          });
          setLoading(false);
        }
      }
    };

    if (currentUser) {
      tryInitialize();
    }
  }, [currentUser]); // Remove initializeData from dependencies since it's now stable

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
    console.log(`Navigating to: ${screen}`);
    setCurrentScreen(screen);
  };

  // Reset application state (used for logout) with tracking
  const resetAppState = () => {
    trackUserAction('LOGOUT', {
      currentUser: currentUser ? currentUser.username : null,
      currentScreen,
      dataWasAvailable: !!data
    });
    setCurrentUser(null);
    setCurrentScreen('login');
    setSelectedPacks([]);
    setSelectedClient(null);
    setData(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  };

  // Screen rendering logic with enhanced tracking
  const renderCurrentScreen = () => {
    // Component validation before rendering
    const componentValidation = {
      LoginScreen: typeof LoginScreen,
      Dashboard: typeof Dashboard,
      PackSelection: typeof PackSelection,
      ClientSelection: typeof ClientSelection,
      SaleConfirmation: typeof SaleConfirmation,
      SalesReport: typeof SalesReport,
      EnhancedSalesReport: typeof EnhancedSalesReport,
      ClientManagement: typeof ClientManagement,
      PackManagement: typeof PackManagement,
      Settings: typeof Settings,
      AdminDashboard: typeof AdminDashboard,
      ErrorBoundary: typeof ErrorBoundary
    };
    
    console.log('🔍 App - Component validation:', componentValidation);
    
    // Check for invalid components
    const invalidComponents = Object.entries(componentValidation)
      .filter(([name, type]) => type !== 'function')
      .map(([name, type]) => `${name}: ${type}`);
    
    if (invalidComponents.length > 0) {
      console.error('❌ App - Invalid components detected:', invalidComponents);
      console.error('❌ This will cause "Element type is invalid" error');
    }

    trackUserAction('RENDER_SCREEN', {
      screen: currentScreen,
      loading: loading && currentUser,
      hasUser: !!currentUser,
      hasData: !!data,
      clientCount: data?.clients?.length || 0,
      packCount: data?.packs?.length || 0
    });

    // Only show loading when we have a user but no data yet
    if (loading && currentUser) {
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
        return <PackSelection {...screenProps} />;
      case 'clients':
        console.log('Rendering ClientSelection');
        console.log('🔍 App - Props for ClientSelection:', {
          data: !!data,
          setSelectedClient: typeof setSelectedClient,
          setCurrentScreen: typeof setCurrentScreen,
          dataClientsLength: data?.clients?.length
        });
        return <ClientSelection {...screenProps} />;
      case 'confirmation':
        console.log('Rendering SaleConfirmation');
        console.log('🔍 App - selectedPacks for confirmation:', selectedPacks);
        console.log('🔍 App - selectedClient for confirmation:', selectedClient);
        console.log('🔍 App - selectedPacks length:', selectedPacks?.length);
        console.log('🔍 App - selectedClient exists:', !!selectedClient);
        
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
        
        try {
          console.log('🔍 App - Rendering SaleConfirmation component');
          console.log('🔍 App - SaleConfirmation type:', typeof SaleConfirmation);
          console.log('🔍 App - SaleConfirmation is function:', typeof SaleConfirmation === 'function');
          console.log('🔍 App - SaleConfirmation:', SaleConfirmation);
          
          return <SaleConfirmation {...screenProps} />;
        } catch (error) {
          console.error('❌ App - Error rendering SaleConfirmation:', error);
          return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
              <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">خطأ في النظام</h2>
                <p className="text-gray-600 mb-4">حدث خطأ أثناء تحميل صفحة التأكيد</p>
                <button
                  onClick={() => setCurrentScreen('dashboard')}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 font-medium"
                >
                  العودة للوحة التحكم
                </button>
              </div>
            </div>
          );
        }
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