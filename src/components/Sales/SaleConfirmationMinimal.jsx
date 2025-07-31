import React, { useState } from 'react';

const SaleConfirmationMinimal = ({ 
  selectedPacks, 
  selectedClient, 
  setCurrentScreen,
  setSelectedPacks,
  setSelectedClient,
  initializeData, // Add this prop to refresh data after sale
  apiRequest // Add apiRequest prop
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [saleCompleted, setSaleCompleted] = useState(false);
  
  console.log('✅ MINIMAL SaleConfirmation - Starting');
  console.log('✅ MINIMAL - selectedPacks:', selectedPacks?.length);
  console.log('✅ MINIMAL - selectedClient:', selectedClient?.FullName);

  const getTotalPrice = () => {
    return selectedPacks?.reduce((total, pack) => {
      const price = pack.TotalPackPrice || pack.total_price || 0;
      return total + price;
    }, 0) || 0;
  };

  const handleCompleteSale = async () => {
    setIsProcessing(true);
    console.log('💰 Starting sale completion...');

    try {
      // Prepare sale data
      const newSale = {
        client_id: selectedClient.ClientID || selectedClient.id,
        pack_id: selectedPacks[0].Id || selectedPacks[0].id,
        total_amount: getTotalPrice()
      };

      console.log('💰 Sending sale data:', newSale);

      // Send to database API using apiRequest helper
      const responseData = await apiRequest('/sales', {
        method: 'POST',
        body: JSON.stringify(newSale),
      });
      
      console.log('✅ Sale saved successfully:', responseData);

      // Refresh data to show new sale in dashboard/reports
      if (typeof initializeData === 'function') {
        console.log('🔄 Refreshing data...');
        await initializeData();
      }

      setSaleCompleted(true);
    } catch (error) {
      console.error('❌ Error saving sale:', error);
      alert(`فشل في حفظ البيع: ${error.message}`);
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
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        direction: 'rtl'
      }}>
        <div style={{
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          maxWidth: '400px',
          width: '100%',
          margin: '16px'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#059669',
            marginBottom: '16px' 
          }}>
            ✅ تم البيع بنجاح!
          </h2>
          <p style={{ marginBottom: '16px', color: '#6b7280' }}>
            تم حفظ عملية البيع في النظام وسيظهر في التقارير
          </p>
          
          <button
            onClick={handleNewSale}
            style={{
              width: '100%',
              backgroundColor: '#4f46e5',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            عملية بيع جديدة
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      direction: 'rtl'
    }}>
      <div style={{
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '32px',
        maxWidth: '400px',
        width: '100%',
        margin: '16px'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#059669',
          marginBottom: '16px' 
        }}>
          ✅ تأكيد البيع
        </h2>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ marginBottom: '8px' }}>
            <strong>العميل:</strong> {selectedClient?.FullName || 'غير محدد'}
          </p>
          <p style={{ marginBottom: '8px' }}>
            <strong>عدد الباقات:</strong> {selectedPacks?.length || 0}
          </p>
          <p style={{ marginBottom: '16px' }}>
            <strong>رقم العميل:</strong> {selectedClient?.ClientID || 'غير محدد'}
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => setCurrentScreen('clients')}
            style={{
              width: '100%',
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            العودة لاختيار العميل
          </button>
          <button
            onClick={() => setCurrentScreen('dashboard')}
            style={{
              width: '100%',
              backgroundColor: '#4f46e5',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            العودة للوحة التحكم
          </button>
          <button
            onClick={handleCompleteSale}
            disabled={isProcessing}
            style={{
              width: '100%',
              backgroundColor: isProcessing ? '#9ca3af' : '#059669',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: '500',
              cursor: isProcessing ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? 'جاري الحفظ...' : 'تأكيد البيع'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleConfirmationMinimal;
