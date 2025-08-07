import React, { useState } from 'react';
// Temporarily remove lucide-react imports to test
// import { ArrowLeft, CheckCircle } from 'lucide-react';
import { t } from '../../translations/arabic';

const SaleConfirmation = ({ 
  selectedPacks, 
  selectedClient, 
  currentUser, 
  setCurrentScreen, 
  setSelectedPacks, 
  setSelectedClient, 
  data, 
  setData,
  refreshSalesData // Add the refresh function
}) => {
  console.log('ðŸš€ SaleConfirmation - Function component starting');
  console.log('ðŸš€ SaleConfirmation - React:', typeof React);
  console.log('ðŸš€ SaleConfirmation - useState:', typeof useState);
  // console.log('ðŸš€ SaleConfirmation - ArrowLeft:', typeof ArrowLeft);
  // console.log('ðŸš€ SaleConfirmation - CheckCircle:', typeof CheckCircle);
  console.log('ðŸš€ SaleConfirmation - t function:', typeof t);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [saleCompleted, setSaleCompleted] = useState(false);

  // Debug logging on component mount
  console.log('ðŸ” SaleConfirmation - Component rendered');
  console.log('ðŸ” SaleConfirmation - selectedPacks:', selectedPacks);
  console.log('ðŸ” SaleConfirmation - selectedClient:', selectedClient);
  console.log('ðŸ” SaleConfirmation - currentUser:', currentUser);
  console.log('ðŸ” SaleConfirmation - selectedPacks length:', selectedPacks?.length);
  console.log('ðŸ” SaleConfirmation - selectedClient exists:', !!selectedClient);

  // Validate required functions exist
  if (typeof setCurrentScreen !== 'function') {
    console.error('âŒ SaleConfirmation - setCurrentScreen is not a function');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ù†Ø¸Ø§Ù…</h2>
          <p className="text-gray-600 mb-4">Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØµÙØ­Ø©</p>
          <button onClick={() => window.location.reload()}>Ø¥Ø¹Ø§Ø¯Ø© ØªØ­Ù…ÙŠÙ„</button>
        </div>
      </div>
    );
  }

  // Safety check - if missing required data, show error state
  if (!selectedPacks || selectedPacks.length === 0) {
    console.log('âŒ SaleConfirmation - No selected packs, returning to pack selection');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª</h2>
          <p className="text-gray-600 mb-4">Ù„Ù… ÙŠØªÙ… Ø§Ø®ØªÙŠØ§Ø± Ø£ÙŠ Ø­Ø²Ù…. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ø¹ÙˆØ¯Ø© ÙˆØ§Ø®ØªÙŠØ§Ø± Ø­Ø²Ù…Ø© Ø£ÙˆÙ„Ø§Ù‹.</p>
          <button
            onClick={() => setCurrentScreen('packs')}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 font-medium"
          >
            Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø­Ø²Ù…
          </button>
        </div>
      </div>
    );
  }

  if (!selectedClient) {
    console.log('âŒ SaleConfirmation - No selected client, returning to client selection');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª</h2>
          <p className="text-gray-600 mb-4">Ù„Ù… ÙŠØªÙ… Ø§Ø®ØªÙŠØ§Ø± Ø¹Ù…ÙŠÙ„. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ø¹ÙˆØ¯Ø© ÙˆØ§Ø®ØªÙŠØ§Ø± Ø¹Ù…ÙŠÙ„.</p>
          <button
            onClick={() => setCurrentScreen('clients')}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 font-medium"
          >
            Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø¹Ù…ÙŠÙ„
          </button>
        </div>
      </div>
    );
  }

  const getTotalPrice = () => {
    return selectedPacks.reduce((total, pack) => {
      const price = pack.TotalPackPrice || pack.total_price || 0;
      return total + price;
    }, 0);
  };

const handleCompleteSale = async () => {
  setIsProcessing(true);

  try {
    // Prepare sale data with correct structure
    const newSale = {
      client_id: selectedClient.ClientID || selectedClient.id,
      pack_id: selectedPacks[0].Id || selectedPacks[0].id,
      total_amount: getTotalPrice()
    };

    console.log('ðŸ’° SaleConfirmation - Starting sale completion...');
    console.log('ðŸ’° SaleConfirmation - Sale data:', newSale);
    console.log('ðŸ’° SaleConfirmation - Selected client:', selectedClient);
    console.log('ðŸ’° SaleConfirmation - Selected packs:', selectedPacks);

    // Send to database API
    const token = localStorage.getItem('token');
    console.log('ðŸ”‘ SaleConfirmation - Token exists:', !!token);
    console.log('ðŸ”‘ SaleConfirmation - Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
    
    if (!token || token === 'demo-token') {
      throw new Error('No valid authentication token found. Please log in again.');
    }

    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    const apiBase = baseURL.replace('/api', '');
    const apiUrl = `${apiBase}/api/sales`;
    
    console.log('ðŸŒ SaleConfirmation - API URL:', apiUrl);
    console.log('ðŸŒ SaleConfirmation - Making API request...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newSale),
    });
    
    console.log('ðŸ“¡ SaleConfirmation - API Response status:', response.status);
    console.log('ðŸ“¡ SaleConfirmation - API Response ok:', response.ok);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('âŒ SaleConfirmation - Server response error:', errorData);
      throw new Error(errorData.message || `Failed to save sale: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('âœ… SaleConfirmation - Sale saved successfully:', responseData);
    console.log('ðŸŽ‰ SaleConfirmation - Sale ID:', responseData.saleId);

    // Refresh sales data to show the new sale
    if (refreshSalesData) {
      console.log('ðŸ”„ SaleConfirmation - Refreshing sales data after successful sale...');
      await refreshSalesData();
    }

    setSaleCompleted(true);
  } catch (error) {
    console.error('âŒ SaleConfirmation - Error saving sale:', error);
    console.error('âŒ SaleConfirmation - Error details:', error.message);
    alert(`Failed to complete sale: ${error.message}\n\nPlease check the console for details and try logging in again.`);
  } finally {
    setIsProcessing(false);
  }
};

  const handleNewSale = () => {
    setSelectedPacks([]);
    setSelectedClient(null);
    setSaleCompleted(false);
    setCurrentScreen('dashboard');
  };

  if (saleCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <div className="mb-6">
            {/* <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" /> */}
            <div className="w-16 h-16 text-green-500 mx-auto mb-4 flex items-center justify-center text-4xl">âœ…</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('saleCompleted')}</h2>
            <p className="text-gray-600">{t('saleRecordedSuccessfully')}</p>
          </div>
          <button
            onClick={handleNewSale}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 font-medium"
          >
            {t('makeAnotherSale')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => setCurrentScreen('clients')}
              className="ml-4 p-2 hover:bg-gray-100 rounded-full"
            >
              {/* <ArrowLeft className="w-5 h-5 transform rotate-180" /> */}
              <span className="text-xl">â†</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{t('confirmSale')}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">{t('salesSummary')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø¹Ù…ÙŠÙ„</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p><span className="font-medium">{t('clientName')}:</span> {selectedClient.FullName}</p>
                <p><span className="font-medium">Ø§Ù„Ø±Ù‚Ù…:</span> {selectedClient.ClientID}</p>
                <div className="flex items-center justify-between">
                  <p>
                    <span className="font-medium">{t('location')}:</span> {selectedClient.City}, {selectedClient.Wilaya}
                  </p>
                  <button
                    onClick={() => {
                      const location = selectedClient.Location ? 
                        `${selectedClient.Location}, ${selectedClient.City}, ${selectedClient.Wilaya}` : 
                        `${selectedClient.City}, ${selectedClient.Wilaya}`;
                      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
                      window.open(googleMapsUrl, '_blank');
                    }}
                    className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    title="ÙØªØ­ ÙÙŠ Ø®Ø±Ø§Ø¦Ø· Ø¬ÙˆØ¬Ù„"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>Ø®Ø±ÙŠØ·Ø©</span>
                  </button>
                </div>
                <p><span className="font-medium">{t('phone')}:</span> {selectedClient.AllPhones}</p>
                {selectedClient.Location && (
                  <div className="flex items-start justify-between bg-gray-50 p-2 rounded-md">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Ø§Ù„Ø¹Ù†ÙˆØ§Ù† Ø§Ù„ÙƒØ§Ù…Ù„:</span> {selectedClient.Location}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const location = `${selectedClient.Location}, ${selectedClient.City}, ${selectedClient.Wilaya}`;
                        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
                        window.open(googleMapsUrl, '_blank');
                      }}
                      className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap mr-2"
                      title="ÙØªØ­ Ø§Ù„Ø¹Ù†ÙˆØ§Ù† Ø§Ù„ÙƒØ§Ù…Ù„ ÙÙŠ Ø®Ø±Ø§Ø¦Ø· Ø¬ÙˆØ¬Ù„"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>Ø¹Ù†ÙˆØ§Ù† ÙƒØ§Ù…Ù„</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Ø§Ù„Ù…Ù†Ø¯ÙˆØ¨</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p><span className="font-medium">Ø§Ù„Ø§Ø³Ù…:</span> {currentUser.rep_name}</p>
                <p><span className="font-medium">{t('wilaya')}:</span> {currentUser.wilaya}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Ø§Ù„Ø­Ø²Ù… Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©</h3>
            <div className="space-y-3">
              {selectedPacks.map(pack => {
                const packId = pack.Id || pack.id;
                const packName = pack.PackName || pack.pack_name;
                const totalPrice = pack.TotalPackPrice || pack.total_price;
                
                return (
                  <div key={packId} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                    <span className="font-medium">{packName}</span>
                    <span className="text-green-600 font-semibold">{totalPrice?.toLocaleString('ar-DZ')} {t('currency')}</span>
                  </div>
                );
              })}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>{t('total')}:</span>
                  <span className="text-green-600">{getTotalPrice().toLocaleString('ar-DZ')} {t('currency')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentScreen('clients')}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 font-medium"
            >
              {t('back')}
            </button>
            <button
              onClick={handleCompleteSale}
              disabled={isProcessing}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 font-medium disabled:opacity-50"
            >
              {isProcessing ? t('processingSale') : t('completeSale')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleConfirmation;
