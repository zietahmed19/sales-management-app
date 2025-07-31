/**
 * Main App Component
 * Manages global state and routing between different screens
 * Handles user authentication and screen navigation
 */

import React, { useState, useEffect } from 'react';
import LoginScreen from './components/Login/LoginScreen';
import Dashboard from './components/Dashboard/Dashboard';
import PackSelection from './components/Sales/PackSelection';
import ClientSelection from './components/Sales/ClientSelection';
import SaleConfirmation from './components/Sales/SaleConfirmation';

// Mock data loading function - replaces external service
 

const loadData = async () => {
  try {
    const [repRes, clientRes, articleRes, giftRes, packRes,salesRes] = await Promise.all([
      fetch("/Data/represents.json"),
      fetch("/Data/clients.json"),
      fetch("/Data/articles.json"),
      fetch("/Data/gifts.json"),
      fetch("/Data/packs.json"),
      fetch("/Data/sales.json"),
      
    ]);
console.log("data....");
    const [repData, clientData, articleData, giftData, packData,salesData] = await Promise.all([
      repRes.json(),
      clientRes.json(),
      articleRes.json(),
      giftRes.json(),
      packRes.json(),
      salesRes.json(),
    ]);

console.log("data fetched....");

    return {
      representatives: repData ?? [],
      clients: clientData ?? [],
      articles: articleData ?? [],
      gifts: giftData ?? [],
      packs: packData ?? [],
      sales: salesData  ?? []
    };
  } catch (error) {
    console.error("❌ Error loading data:", error);
    return {
      representatives: [],
      clients: [],
      articles: [],
      gifts: [],
      packs: [],
      sales: []
    };
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

  // Load initial data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const initialData = await loadData();
        setData(initialData);
      } catch (error) {
        console.error('Failed to load data:', error);
        // Set mock data as fallback
        setData(loadData());
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Navigation helper function
  const navigateTo = (screen) => {
    setCurrentScreen(screen);
  };

  // Reset application state (used for logout)
  const resetAppState = () => {
    setCurrentUser(null);
    setCurrentScreen('login');
    setSelectedPacks([]);
    setSelectedClient(null);
  };

  // Screen rendering logic
  const renderCurrentScreen = () => {
    if (loading) {
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
      setData
    };

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
      {renderCurrentScreen()}
    </div>
  );
};

export default App;