import React, { useState } from 'react';
import { Package, Plus, Edit, Gift, DollarSign, Search } from 'lucide-react';
import Header from '../Common/Header';

const PackManagement = ({ 
  currentUser, 
  data, 
  setData,
  setCurrentScreen, 
  resetAppState 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [newPack, setNewPack] = useState({
    PackName: '',
    TotalPackPrice: '',
    articles: [],
    Gift: null
  });
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [selectedGift, setSelectedGift] = useState('');

  // Filter packs
  const filteredPacks = data.packs.filter(pack => {
    const matchesSearch = pack.PackName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pack.articles.some(article => 
                           article.Name.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesPrice = priceFilter === 'all' || 
                        (priceFilter === 'low' && pack.TotalPackPrice < 30) ||
                        (priceFilter === 'medium' && pack.TotalPackPrice >= 30 && pack.TotalPackPrice <= 50) ||
                        (priceFilter === 'high' && pack.TotalPackPrice > 50);
    
    return matchesSearch && matchesPrice;
  });

  // Get pack statistics
  const getPackStats = (packId) => {
    const packSales = data.sales.filter(sale => sale.packID === packId);
    const totalSold = packSales.length;
    const totalRevenue = packSales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
    
    return { totalSold, totalRevenue };
  };

  // Handle article selection
  const toggleArticle = (article) => {
    setSelectedArticles(prev => {
      const exists = prev.find(a => a.Id === article.Id);
      if (exists) {
        return prev.filter(a => a.Id !== article.Id);
      } else {
        return [...prev, article];
      }
    });
  };

  // Calculate total price from selected articles
  const calculateTotalPrice = () => {
    return selectedArticles.reduce((sum, article) => sum + article.Price, 0);
  };

  // Handle save pack
  const handleSavePack = () => {
    if (!newPack.PackName || selectedArticles.length === 0) {
      alert('Please provide pack name and select at least one article');
      return;
    }

    const gift = selectedGift ? data.gifts.find(g => g.Id === parseInt(selectedGift)) : null;
    const totalPrice = newPack.TotalPackPrice || calculateTotalPrice();

    if (editingPack) {
      // Update existing pack
      const updatedPacks = data.packs.map(pack => 
        pack.Id === editingPack.Id ? {
          ...pack,
          PackName: newPack.PackName,
          TotalPackPrice: parseFloat(totalPrice),
          articles: selectedArticles,
          Gift: gift
        } : pack
      );
      setData({ ...data, packs: updatedPacks });
      setEditingPack(null);
    } else {
      // Add new pack
      const packId = Math.max(...data.packs.map(p => p.Id), 0) + 1;
      const pack = {
        Id: packId,
        PackName: newPack.PackName,
        TotalPackPrice: parseFloat(totalPrice),
        articles: selectedArticles,
        Gift: gift
      };
      setData({ ...data, packs: [...data.packs, pack] });
    }

    handleCancelEdit();
  };

  const handleEditPack = (pack) => {
    setEditingPack(pack);
    setNewPack({
      PackName: pack.PackName,
      TotalPackPrice: pack.TotalPackPrice.toString(),
      articles: pack.articles,
      Gift: pack.Gift
    });
    setSelectedArticles(pack.articles);
    setSelectedGift(pack.Gift ? pack.Gift.Id.toString() : '');
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    setEditingPack(null);
    setNewPack({
      PackName: '',
      TotalPackPrice: '',
      articles: [],
      Gift: null
    });
    setSelectedArticles([]);
    setSelectedGift('');
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentUser={currentUser} 
        onLogout={resetAppState}
        title="Pack Management"
        setCurrentScreen={setCurrentScreen}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Product Packs ({filteredPacks.length})
            </h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Pack</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search packs or articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Prices</option>
                <option value="low">Under $30</option>
                <option value="medium">$30 - $50</option>
                <option value="high">Over $50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Add/Edit Pack Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingPack ? 'Edit Pack' : 'Create New Pack'}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pack Details */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pack Name *
                  </label>
                  <input
                    type="text"
                    value={newPack.PackName}
                    onChange={(e) => setNewPack({ ...newPack, PackName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter pack name"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPack.TotalPackPrice}
                    onChange={(e) => setNewPack({ ...newPack, TotalPackPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Auto-calculated: $${calculateTotalPrice().toFixed(2)}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-calculate from articles
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Include Gift (Optional)
                  </label>
                  <select
                    value={selectedGift}
                    onChange={(e) => setSelectedGift(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">No Gift</option>
                    {data.gifts.map(gift => (
                      <option key={gift.Id} value={gift.Id}>
                        {gift.GiftName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Article Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Articles * ({selectedArticles.length} selected)
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {data.articles.map(article => {
                    const isSelected = selectedArticles.find(a => a.Id === article.Id);
                    return (
                      <label key={article.Id} className="flex items-center space-x-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => toggleArticle(article)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">{article.Name}</span>
                          <span className="text-sm text-green-600 ml-2">${article.Price}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
                
                {selectedArticles.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-700">Selected Articles:</p>
                    <div className="mt-1 space-y-1">
                      {selectedArticles.map(article => (
                        <div key={article.Id} className="flex justify-between text-xs">
                          <span>{article.Name}</span>
                          <span>${article.Price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Total Articles Price:</span>
                        <span>${calculateTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePack}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {editingPack ? 'Update Pack' : 'Create Pack'}
              </button>
            </div>
          </div>
        )}

        {/* Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPacks.map((pack) => {
            const stats = getPackStats(pack.Id);
            return (
              <div key={pack.Id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {pack.PackName}
                    </h3>
                    <div className="flex items-center text-2xl font-bold text-green-600">
                      <DollarSign className="w-5 h-5" />
                      <span>{pack.TotalPackPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditPack(pack)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Articles */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Articles:</h4>
                  <div className="space-y-1">
                    {pack.articles.map(article => (
                      <div key={article.Id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{article.Name}</span>
                        <span className="text-green-600">${article.Price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Gift */}
                {pack.Gift && (
                  <div className="mb-4 p-2 bg-yellow-50 rounded-md">
                    <div className="flex items-center text-sm">
                      <Gift className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className="text-yellow-800 font-medium">{pack.Gift.GiftName}</span>
                    </div>
                  </div>
                )}
                
                {/* Statistics */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-indigo-600">{stats.totalSold}</p>
                      <p className="text-xs text-gray-500">Times Sold</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-green-600">
                        ${stats.totalRevenue.toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500">Total Revenue</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPacks.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No packs found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || priceFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Get started by creating your first pack'
              }
            </p>
            {!searchTerm && priceFilter === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Pack
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PackManagement;
