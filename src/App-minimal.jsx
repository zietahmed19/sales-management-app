import React, { useState, useEffect } from 'react';

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

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [selectedPacks, setSelectedPacks] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Simple reset
  const resetAppState = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setCurrentScreen('login');
    setSelectedPacks([]);
    setSelectedClient(null);
    setData(null);
  };

  // Simple API helper
  const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3001/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    });
    return await response.json();
  };

  // Check for existing auth
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('currentUser');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setCurrentScreen('dashboard');
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  // Screen props
  const screenProps = {
    currentUser,
    setCurrentUser,
    setCurrentScreen,
    resetAppState,
    selectedPacks,
    setSelectedPacks,
    selectedClient,
    setSelectedClient,
    data,
    setData,
    apiRequest,
    loading
  };

  // Simple render logic
  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen {...screenProps} />;
      case 'dashboard':
        return <Dashboard {...screenProps} />;
      case 'packs':
        return <PackSelection {...screenProps} />;
      case 'clients':
        return <ClientSelection {...screenProps} />;
      case 'confirmation':
        return <SaleConfirmation {...screenProps} />;
      case 'reports':
        return <SalesReport {...screenProps} />;
      case 'enhanced-reports':
        return <EnhancedSalesReport {...screenProps} />;
      case 'client-management':
        return <ClientManagement {...screenProps} />;
      case 'pack-management':
        return <PackManagement {...screenProps} />;
      case 'settings':
        return <Settings {...screenProps} />;
      case 'admin':
        return <AdminDashboard {...screenProps} />;
      default:
        return <LoginScreen {...screenProps} />;
    }
  };

  return (
    <ErrorBoundary onRetry={() => setCurrentScreen('dashboard')}>
      <div className="App">
        {renderScreen()}
      </div>
    </ErrorBoundary>
  );
};

export default App;
