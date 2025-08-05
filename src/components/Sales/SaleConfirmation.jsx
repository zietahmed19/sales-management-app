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
  setData 
}) => {
  console.log('🚀 SaleConfirmation - Function component starting');
  console.log('🚀 SaleConfirmation - React:', typeof React);
  console.log('🚀 SaleConfirmation - useState:', typeof useState);
  // console.log('🚀 SaleConfirmation - ArrowLeft:', typeof ArrowLeft);
  // console.log('🚀 SaleConfirmation - CheckCircle:', typeof CheckCircle);
  console.log('🚀 SaleConfirmation - t function:', typeof t);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [saleCompleted, setSaleCompleted] = useState(false);

  // Debug logging on component mount
  console.log('🔍 SaleConfirmation - Component rendered');
  console.log('🔍 SaleConfirmation - selectedPacks:', selectedPacks);
  console.log('🔍 SaleConfirmation - selectedClient:', selectedClient);
  console.log('🔍 SaleConfirmation - currentUser:', currentUser);
  console.log('🔍 SaleConfirmation - selectedPacks length:', selectedPacks?.length);
  console.log('🔍 SaleConfirmation - selectedClient exists:', !!selectedClient);

  // Validate required functions exist
  if (typeof setCurrentScreen !== 'function') {
    console.error('❌ SaleConfirmation - setCurrentScreen is not a function');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">خطأ في النظام</h2>
          <p className="text-gray-600 mb-4">حدث خطأ في تحميل الصفحة</p>
          <button onClick={() => window.location.reload()}>إعادة تحميل</button>
        </div>
      </div>
    );
  }

  // Safety check - if missing required data, show error state
  if (!selectedPacks || selectedPacks.length === 0) {
    console.log('❌ SaleConfirmation - No selected packs, returning to pack selection');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">خطأ في البيانات</h2>
          <p className="text-gray-600 mb-4">لم يتم اختيار أي حزم. يرجى العودة واختيار حزمة أولاً.</p>
          <button
            onClick={() => setCurrentScreen('packs')}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 font-medium"
          >
            العودة لاختيار الحزم
          </button>
        </div>
      </div>
    );
  }

  if (!selectedClient) {
    console.log('❌ SaleConfirmation - No selected client, returning to client selection');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">خطأ في البيانات</h2>
          <p className="text-gray-600 mb-4">لم يتم اختيار عميل. يرجى العودة واختيار عميل.</p>
          <button
            onClick={() => setCurrentScreen('clients')}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 font-medium"
          >
            العودة لاختيار العميل
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

    console.log('💰 Completing sale with data:', newSale);

    // Send to database API
    const token = localStorage.getItem('token');
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    const apiBase = baseURL.replace('/api', '');
    
    const response = await fetch(`${apiBase}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newSale),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server response:', errorData);
      throw new Error(errorData.message || `Failed to save sale: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('✅ Sale saved successfully:', responseData);

    setSaleCompleted(true);
  } catch (error) {
    console.error('❌ Error saving sale:', error);
    alert(`Failed to complete sale: ${error.message}`);
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
            <div className="w-16 h-16 text-green-500 mx-auto mb-4 flex items-center justify-center text-4xl">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('saleCompleted')}</h2>
            <p className="text-gray-600">{t('saleRecordedSuccessfully')}</p>
          </div>
          <button
            onClick={handleNewSale}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 font-medium"
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
              <span className="text-xl">←</span>
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
              <h3 className="font-semibold text-gray-900 mb-3">معلومات العميل</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p><span className="font-medium">{t('clientName')}:</span> {selectedClient.FullName}</p>
                <p><span className="font-medium">الرقم:</span> {selectedClient.ClientID}</p>
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
                    className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    title="فتح في خرائط جوجل"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>خريطة</span>
                  </button>
                </div>
                <p><span className="font-medium">{t('phone')}:</span> {selectedClient.AllPhones}</p>
                {selectedClient.Location && (
                  <div className="flex items-start justify-between bg-gray-50 p-2 rounded-md">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">العنوان الكامل:</span> {selectedClient.Location}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const location = `${selectedClient.Location}, ${selectedClient.City}, ${selectedClient.Wilaya}`;
                        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
                        window.open(googleMapsUrl, '_blank');
                      }}
                      className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap mr-2"
                      title="فتح العنوان الكامل في خرائط جوجل"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>عنوان كامل</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">المندوب</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p><span className="font-medium">الاسم:</span> {currentUser.rep_name}</p>
                <p><span className="font-medium">{t('wilaya')}:</span> {currentUser.wilaya}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">الحزم المختارة</h3>
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