import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [saleCompleted, setSaleCompleted] = useState(false);

  const getTotalPrice = () => {
    return selectedPacks.reduce((total, pack) => total + pack.TotalPackPrice, 0);
  };

  // Function to save sales data to JSON file
  const saveSalesToFile = async (salesData) => {
    try {
      console.log('Attempting to save sales data:', salesData); // Debug log
      
      // Save to localStorage for persistence
      localStorage.setItem('salesData', JSON.stringify(salesData));
      console.log('Saved to localStorage successfully'); // Debug log
      
      // Also download as file for backup
      const dataStr = JSON.stringify(salesData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Sales.json';
      document.body.appendChild(link); // Add to DOM
      link.click();
      document.body.removeChild(link); // Remove from DOM
      URL.revokeObjectURL(url);
      console.log('File download triggered successfully'); // Debug log
      
      return true;
    } catch (error) {
      console.error('Error saving sales data:', error);
      return false;
    }
  };

  // Function to load existing sales data
  const loadExistingSales = () => {
    try {
      const savedSales = localStorage.getItem('salesData');
      return savedSales ? JSON.parse(savedSales) : [];
    } catch (error) {
      console.error('Error loading sales data:', error);
      return [];
    }
  };


  const handleCompleteSale = async () => {
    setIsProcessing(true);
    
    try {
      // Load existing sales from localStorage or use current data.sales
      const existingSales = loadExistingSales();
      const currentSales = existingSales.length > 0 ? existingSales : (data.sales || []);
      
      // Create new sale object with proper ID
      const newSale = {
        Id: currentSales.length + 1,
        CreateDate: new Date().toISOString(),
        ClientID: selectedClient.ClientID,
        Client: {
          ClientID: selectedClient.ClientID,
          FullName: selectedClient.FullName,
          City: selectedClient.City,
          Wilaya: selectedClient.Wilaya,
          AllPhones: selectedClient.AllPhones
        },
        RepresentID: currentUser.iD,
        Represent: {
          iD: currentUser.iD,
          RepresentName: currentUser.RepresentName,
          RepCode: currentUser.RepCode
        },
        Packs: selectedPacks.map(pack => ({
          PackID: pack.Id,
          PackName: pack.PackName,
          TotalPackPrice: pack.TotalPackPrice,
          Articles: pack.articles.map(article => ({
            Name: article.Name,
            Price: article.Price || 0
          })),
          Gift: pack.Gift ? {
            GiftName: pack.Gift.GiftName,
            GiftPrice: pack.Gift.GiftPrice || 0
          } : null
        })),
        TotalAmount: getTotalPrice(),
        Status: 'Completed'
      };

      // Add new sale to existing sales
      const updatedSales = [...currentSales, newSale];
      
      console.log('Saving sales data:', updatedSales); // Debug log
      
      // Save to file
      const saveSuccess = await saveSalesToFile(updatedSales);
      
      if (saveSuccess) {
        // Update local state
        setData(prevData => ({
          ...prevData,
          sales: updatedSales
        }));
        
        setSaleCompleted(true);
      } else {
        throw new Error('Failed to save sales data');
      }
    } catch (error) {
      console.error('Error completing sale:', error);
      alert('Error saving sale. Please try again.');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sale Completed!</h2>
            <p className="text-gray-600">The sale has been successfully recorded and saved.</p>
          </div>
          <button
            onClick={handleNewSale}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 font-medium"
          >
            Make Another Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => setCurrentScreen('clients')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Confirm Sale</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Sale Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Client Information</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p><span className="font-medium">Name:</span> {selectedClient.FullName}</p>
                <p><span className="font-medium">ID:</span> {selectedClient.ClientID}</p>
                <p><span className="font-medium">Location:</span> {selectedClient.City}, {selectedClient.Wilaya}</p>
                <p><span className="font-medium">Phone:</span> {selectedClient.AllPhones}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Representative</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p><span className="font-medium">Name:</span> {currentUser.RepresentName}</p>
                <p><span className="font-medium">Code:</span> {currentUser.RepCode}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Selected Packs</h3>
            <div className="space-y-3">
              {selectedPacks.map(pack => (
                <div key={pack.Id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{pack.PackName}</h4>
                    <span className="font-semibold text-green-600">${pack.TotalPackPrice}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="mb-1">Articles: {pack.articles.map(a => a.Name).join(', ')}</p>
                    {pack.Gift && <p>Gift: {pack.Gift.GiftName}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">${getTotalPrice().toFixed(2)}</span>
            </div>

            <button
              onClick={handleCompleteSale}
              disabled={isProcessing}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 font-medium disabled:bg-gray-400"
            >
              {isProcessing ? 'Processing Sale...' : 'Complete Sale'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleConfirmation;