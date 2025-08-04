import React, { useState, useEffect } from 'react';

// Import all necessary components
import LoginScreen from './components/Login/LoginScreen';
import Dashboard from './components/Dashboard/Dashboard';
import PackSelection from './components/Sales/PackSelection';
import ClientSelection from './components/Sales/ClientSelection';
import SaleConfirmation from './components/Sales/SaleConfirmationMinimal';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [selectedPacks, setSelectedPacks] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Simple navigation
  const setCurrentScreen = (screen) => {
    setCurrentScreen(screen);
  };

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
    const response = await fetch(`http://localhost:3001${endpoint}`, {
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
      default:
        return <LoginScreen {...screenProps} />;
    }
  };

  return (
    <div className="App">
      {renderScreen()}
    </div>
  );
};

export default App;
