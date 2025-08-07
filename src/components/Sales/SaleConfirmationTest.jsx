import React from 'react';

const SaleConfirmationTest = ({ 
  selectedPacks, 
  selectedClient, 
  setCurrentScreen 
}) => {
  console.log('🚀 SaleConfirmationTest - Simple component starting');
  console.log('🚀 SaleConfirmationTest - React:', typeof React);
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-green-600 mb-4">✅ تم الوصول لصفحة التأكيد!</h2>
        <p className="text-gray-600 mb-4">
          العميل: {selectedClient?.FullName || 'غير محدد'}<br/>
          عدد الباقات: {selectedPacks?.length || 0}
        </p>
        <div className="space-y-2">
          <button
            onClick={() => setCurrentScreen('clients')}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 font-medium"
          >
            العودة لاختيار العميل
          </button>
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 font-medium"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleConfirmationTest;
