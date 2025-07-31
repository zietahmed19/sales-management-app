/**
 * Pack Selection Component
 * Allows representatives to select product packs for sale
 * Supports multiple pack selection and displays running totals
 */

import React, { useState } from 'react';
import { ArrowLeft, Plus, X, ShoppingCart, Package, Gift } from 'lucide-react';

const PackSelection = ({ 
  navigateTo, 
  selectedPacks, 
  setSelectedPacks, 
  data,
  setCurrentScreen
}) => {
  // Local state for UI management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByPrice, setFilterByPrice] = useState('all');

  // Filter packs based on search and price filter
  const filteredPacks = data.packs.filter(pack => {
    const matchesSearch = pack.PackName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pack.articles.some(article => 
                           article.Name.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesPrice = filterByPrice === 'all' || 
                        (filterByPrice === 'low' && pack.TotalPackPrice < 30) ||
                        (filterByPrice === 'medium' && pack.TotalPackPrice >= 30 && pack.TotalPackPrice <= 50) ||
                        (filterByPrice === 'high' && pack.TotalPackPrice > 50);
    
    return matchesSearch && matchesPrice;
  });

  // Handle pack selection
  const handlePackSelect = (pack) => {
    // Check if pack is already selected
    const isAlreadySelected = selectedPacks.find(p => p.Id === pack.Id);
    
    if (!isAlreadySelected) {
      setSelectedPacks(prev => [...prev, pack]);
    }
  };

  // Handle pack removal from selection
  const handleRemovePack = (packId) => {
    setSelectedPacks(prev => prev.filter(p => p.Id !== packId));
  };

  // Calculate total price of selected packs
  const getTotalPrice = () => {
    return selectedPacks.reduce((total, pack) => total + pack.TotalPackPrice, 0);
  };

  // Check if pack is selected
  const isPackSelected = (packId) => {
    return selectedPacks.some(p => p.Id === packId);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setCurrentScreen('dashboard')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Select Packs</h1>
            </div>
            {selectedPacks.length > 0 && (
              <button
                onClick={() => setCurrentScreen('clients')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Continue to Client Selection
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedPacks.length > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Selected Packs</h2>
            <div className="space-y-3">
              {selectedPacks.map(pack => (
                <div key={pack.Id} className="flex justify-between items-center bg-green-50 p-3 rounded-md">
                  <span className="font-medium">{pack.PackName}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 font-semibold">${pack.TotalPackPrice}</span>
                    <button 
                      onClick={() => handleRemovePack(pack.Id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.packs.map(pack => (
            <div key={pack.Id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{pack.PackName}</h3>
                <span className="text-xl font-bold text-green-600">${pack.TotalPackPrice}</span>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Articles:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {pack.articles.map(article => (
                    <li key={article.Id} className="flex justify-between">
                      <span>{article.Name}</span>
                      <span>${article.Price}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {pack.Gift && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-1">Gift:</h4>
                  <p className="text-sm text-gray-600">{pack.Gift.GiftName} - {pack.Gift.Description}</p>
                </div>
              )}

              <button
                onClick={() => handlePackSelect(pack)}
                disabled={selectedPacks.find(p => p.Id === pack.Id)}
                className={`w-full py-2 px-4 rounded-md font-medium ${
                  selectedPacks.find(p => p.Id === pack.Id)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {selectedPacks.find(p => p.Id === pack.Id) ? 'Selected' : 'Select Pack'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PackSelection;