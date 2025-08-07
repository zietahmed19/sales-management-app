﻿/**
 * Pack Selection Component
 * Allows representatives to select product packs for sale
 * Supports multiple pack selection and displays running totals
 */

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Package, Gift, Star, TrendingUp, Filter, SortAsc, SortDesc, ShoppingCart } from 'lucide-react';
import { t } from '../../translations/arabic';

const PackSelection = ({ 
  navigateTo, 
  selectedPacks, 
  setSelectedPacks, 
  data,
  setCurrentScreen,
  apiRequest
}) => {
  // Local state for UI management (must be before any early returns)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByPrice, setFilterByPrice] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // name, price, articles
  const [sortOrder, setSortOrder] = useState('asc');
  const [showDetails, setShowDetails] = useState({}); // Track which pack details are shown
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load packs when component mounts
  React.useEffect(() => {
    const loadPacks = async () => {
      try {
        setLoading(true);
        const packsData = await apiRequest('/api/packs');
        setPacks(packsData || []);
        console.log('âœ… PackSelection - Loaded packs:', packsData);
      } catch (error) {
        console.error('âŒ PackSelection - Error loading packs:', error);
        setPacks([]);
      } finally {
        setLoading(false);
      }
    };

    if (apiRequest) {
      loadPacks();
    }
  }, [apiRequest]);

  // Filter and sort packs with enhanced logic (must be before early returns)
  const filteredAndSortedPacks = useMemo(() => {
    if (!packs || packs.length === 0) return [];
    
    let filtered = packs.filter(pack => {
      const packName = pack.PackName || pack.pack_name || '';
      const totalPrice = pack.TotalPackPrice || pack.total_price || 0;
      const articles = pack.articles || [];
      
      const matchesSearch = packName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           articles.some(article => {
                             const articleName = article.Name || article.name || '';
                             return articleName.toLowerCase().includes(searchTerm.toLowerCase());
                           });
      
      const matchesPrice = filterByPrice === 'all' || 
                          (filterByPrice === 'low' && totalPrice < 300000) ||
                          (filterByPrice === 'medium' && totalPrice >= 300000 && totalPrice <= 600000) ||
                          (filterByPrice === 'high' && totalPrice > 600000);
      
      return matchesSearch && matchesPrice;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.PackName || a.pack_name || '';
          bValue = b.PackName || b.pack_name || '';
          break;
        case 'price':
          aValue = a.TotalPackPrice || a.total_price || 0;
          bValue = b.TotalPackPrice || b.total_price || 0;
          break;
        case 'articles':
          aValue = (a.articles || []).length;
          bValue = (b.articles || []).length;
          break;
        default:
          aValue = a.PackName || a.pack_name || '';
          bValue = b.PackName || b.pack_name || '';
      }
      
      if (sortBy === 'price' || sortBy === 'articles') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const comparison = aValue.localeCompare(bValue, 'ar');
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [packs, searchTerm, filterByPrice, sortBy, sortOrder]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')} {t('packs')}...</p>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('ðŸ” PackSelection - Loaded packs:', packs);
  console.log('ðŸ” PackSelection - Packs length:', packs?.length);

  // Safety check for data - removed since we load our own data now

  // Handle pack selection
  const handlePackSelect = (pack) => {
    // Check if pack is already selected
    const packId = pack.Id || pack.id;
    const isAlreadySelected = selectedPacks.find(p => (p.Id || p.id) === packId);
    
    if (!isAlreadySelected) {
      setSelectedPacks(prev => [...prev, pack]);
    }
  };

  const handlePackSelection = (pack) => {
    const quantity = selectedQuantities[pack.id] || 1;
    if (pack.quantity >= quantity) {
      setSelectedPacks(prev => [
        ...prev,
        { ...pack, selectedQuantity: quantity }
      ]);
    } else {
      alert('Not enough quantity available');
    }
  };

  // Handle pack removal from selection
  const handleRemovePack = (packId) => {
    setSelectedPacks(prev => prev.filter(p => (p.Id || p.id) !== packId));
  };

  // Calculate total price of selected packs
  const getTotalPrice = () => {
    return selectedPacks.reduce((total, pack) => {
      const price = pack.TotalPackPrice || pack.total_price || 0;
      return total + price;
    }, 0);
  };

  // Toggle pack details view
  const toggleDetails = (packId) => {
    setShowDetails(prev => ({
      ...prev,
      [packId]: !prev[packId]
    }));
  };

  // Get pack recommendation badge
  const getPackBadge = (pack) => {
    const price = pack.TotalPackPrice || pack.total_price || 0;
    const articlesCount = (pack.articles || []).length;
    
    if (price > 600000) return { text: 'Ø­Ø²Ù…Ø© Ù…Ù…ÙŠØ²Ø©', color: 'bg-purple-100 text-purple-800' };
    if (articlesCount >= 5) return { text: 'Ø¹Ø±Ø¶ Ù…ØªÙ†ÙˆØ¹', color: 'bg-purple-100 text-purple-800' };
    if (pack.Gift || pack.gift) return { text: 'Ù…Ø¹ Ù‡Ø¯ÙŠØ©', color: 'bg-green-100 text-green-800' };
    return { text: 'Ø¹Ø±Ø¶ Ø¹Ø§Ø¯ÙŠ', color: 'bg-gray-100 text-gray-800' };
  };
  
  // Check if pack is selected
  const isPackSelected = (packId) => {
    return selectedPacks.some(p => (p.Id || p.id) === packId);
  };
  
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="bg-purple-600 shadow-xl border-b border-purple-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-4">
              <button 
                onClick={() => setCurrentScreen('dashboard')}
                className="ml-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-300 backdrop-blur-sm"
              >
                <ArrowLeft className="w-5 h-5 transform rotate-180 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">{t('selectPacks')}</h1>
                <p className="text-sm text-purple-100">
                  {selectedPacks.length > 0 && `Ù…Ø­Ø¯Ø¯ ${selectedPacks.length} Ø­Ø²Ù…Ø© â€¢ `}
                  Ø¹Ø±Ø¶ {filteredAndSortedPacks.length} Ù…Ù† Ø£ØµÙ„ {packs?.length || 0} Ø­Ø²Ù…Ø©
                </p>
              </div>
            </div>
            {selectedPacks.length > 0 && (
              <button
                onClick={() => {
                  console.log('ðŸ”µ PackSelection - Navigate to clients clicked');
                  console.log('ðŸ”µ Current selectedPacks:', selectedPacks);
                  console.log('ðŸ”µ selectedPacks length:', selectedPacks.length);
                  setCurrentScreen('clients');
                }}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ù„Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø¹Ù…ÙŠÙ„
                <span className="bg-purple-800 text-white px-2 py-1 rounded-full text-xs">
                  {selectedPacks.length}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Search and Filter Section */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-xl p-6 mb-6 border border-purple-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ø§Ù„Ø¨Ø­Ø« Ø¨Ø§Ù„Ø­Ø²Ù…Ø©ØŒ Ø§Ù„Ù…Ù‚Ø§Ù„Ø§Øª..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-right"
                  dir="rtl"
                />
              </div>
            </div>
          </div>
          
          {/* Filters and Sort */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Price Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterByPrice}
                onChange={(e) => setFilterByPrice(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-right"
                dir="rtl"
              >
                <option value="all">ÙƒÙ„ Ø§Ù„Ø£Ø³Ø¹Ø§Ø±</option>
                <option value="low">Ø£Ù‚Ù„ Ù…Ù† 300,000 Ø¯.Ø¬</option>
                <option value="medium">300,000 - 600,000 Ø¯.Ø¬</option>
                <option value="high">Ø£ÙƒØ«Ø± Ù…Ù† 600,000 Ø¯.Ø¬</option>
              </select>
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">ØªØ±ØªÙŠØ¨ Ø­Ø³Ø¨:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-right"
                dir="rtl"
              >
                <option value="name">Ø§Ø³Ù… Ø§Ù„Ø­Ø²Ù…Ø©</option>
                <option value="price">Ø§Ù„Ø³Ø¹Ø±</option>
                <option value="articles">Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ù‚Ø§Ù„Ø§Øª</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                title={sortOrder === 'asc' ? 'ØªØµØ§Ø¹Ø¯ÙŠ' : 'ØªÙ†Ø§Ø²Ù„ÙŠ'}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Clear Filters */}
            {(searchTerm || filterByPrice !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterByPrice('all');
                }}
                className="px-3 py-2 text-sm text-purple-600 hover:text-purple-800"
              >
                Ù…Ø³Ø­ Ø§Ù„ÙÙ„Ø§ØªØ±
              </button>
            )}
          </div>
        </div>

        {/* Selected Packs Summary */}
        {selectedPacks.length > 0 && (
          <div className="mb-8 bg-purple-600 text-white rounded-xl shadow-xl p-6 border border-purple-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Ø§Ù„Ø­Ø²Ù… Ø§Ù„Ù…Ø®ØªØ§Ø±Ø© ({selectedPacks.length})
              </h2>
              <div className="text-2xl font-bold">
                {getTotalPrice().toLocaleString('ar-DZ')} {t('currency')}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedPacks.map(pack => {
                const packId = pack.Id || pack.id;
                const packName = pack.PackName || pack.pack_name;
                const totalPrice = pack.TotalPackPrice || pack.total_price;
                
                return (
                  <div key={packId} className="bg-white bg-opacity-20 backdrop-blur-sm rounded-md p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{packName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{totalPrice?.toLocaleString('ar-DZ')} Ø¯.Ø¬</span>
                        <button 
                          onClick={() => handleRemovePack(packId)}
                          className="text-white hover:text-red-200 text-lg font-bold"
                        >
                          âœ•
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pack Stats */}
        {filteredAndSortedPacks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Package className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">{filteredAndSortedPacks.length}</div>
              <div className="text-sm text-purple-600">Ø­Ø²Ù… Ù…ØªØ§Ø­Ø©</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">
                {Math.round(filteredAndSortedPacks.reduce((sum, pack) => sum + (pack.TotalPackPrice || pack.total_price || 0), 0) / filteredAndSortedPacks.length).toLocaleString('ar-DZ')}
              </div>
              <div className="text-sm text-green-600">Ù…ØªÙˆØ³Ø· Ø§Ù„Ø³Ø¹Ø±</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Star className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">
                {filteredAndSortedPacks.filter(pack => pack.Gift || pack.gift).length}
              </div>
              <div className="text-sm text-purple-600">Ø­Ø²Ù… Ø¨Ù‡Ø¯Ø§ÙŠØ§</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <Gift className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-900">{selectedPacks.length}</div>
              <div className="text-sm text-orange-600">Ù…Ø­Ø¯Ø¯Ø© Ø­Ø§Ù„ÙŠØ§Ù‹</div>
            </div>
          </div>
        )}

        {/* Pack Cards */}
        {filteredAndSortedPacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedPacks.map(pack => {
              const packId = pack.Id || pack.id;
              const packName = pack.PackName || pack.pack_name;
              const totalPrice = pack.TotalPackPrice || pack.total_price;
              const gift = pack.Gift || pack.gift;
              const articles = pack.articles || [];
              const badge = getPackBadge(pack);
              const isSelected = isPackSelected(packId);
              const detailsShown = showDetails[packId];
              
              return (
                <div key={packId} className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 ${isSelected ? 'ring-2 ring-green-500 bg-green-50' : ''}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{packName}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${badge.color}`}>
                        {badge.text}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">{totalPrice?.toLocaleString('ar-DZ')} Ø¯.Ø¬</div>
                      <div className="text-xs text-gray-500">{articles.length} Ù…Ù‚Ø§Ù„Ø©</div>
                      <div className={`text-xs font-medium ${pack.quantity > 10 ? 'text-green-600' : pack.quantity > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                        Ø§Ù„Ù…ØªØ§Ø­: {pack.quantity || 0} ÙˆØ­Ø¯Ø©
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Preview */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Ø§Ù„Ù…Ø­ØªÙˆÙŠØ§Øª:</span>
                      <button
                        onClick={() => toggleDetails(packId)}
                        className="text-xs text-purple-600 hover:text-purple-800"
                      >
                        {detailsShown ? 'Ø¥Ø®ÙØ§Ø¡ Ø§Ù„ØªÙØ§ØµÙŠÙ„' : 'Ø¹Ø±Ø¶ Ø§Ù„ØªÙØ§ØµÙŠÙ„'}
                      </button>
                    </div>
                    
                    {detailsShown ? (
                      <div className="text-sm text-gray-600 space-y-2">
                        <div className="bg-gray-50 rounded-md p-3">
                          <h4 className="font-medium text-gray-800 mb-2">Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ù…Ø¶Ù…Ù†Ø©:</h4>
                          {articles.map(article => {
                            const articleId = article.Id || article.id;
                            const articleName = article.Name || article.name;
                            const articlePrice = article.Price || article.price;
                            return (
                              <div key={articleId} className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                                <div className="flex-1">
                                  <span className="font-medium">{articleName}</span>
                                  <span className="text-xs text-gray-500 mr-2">(Ø§Ù„ÙƒÙ…ÙŠØ©: {article.quantity || 1})</span>
                                </div>
                                <span className="font-medium text-green-600">{articlePrice?.toLocaleString('ar-DZ')} Ø¯.Ø¬</span>
                              </div>
                            );
                          })}
                          <div className="mt-2 pt-2 border-t border-gray-300">
                            <div className="flex justify-between items-center font-bold">
                              <span>Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø­Ø²Ù…Ø©:</span>
                              <span className="text-green-600">{totalPrice?.toLocaleString('ar-DZ')} Ø¯.Ø¬</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        <div className="mb-2">
                          <span className="font-medium text-gray-700">Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª ({articles.length}):</span>
                        </div>
                        {articles.slice(0, 3).map(article => (
                          <div key={article.Id || article.id} className="flex justify-between items-center mb-1">
                            <span>â€¢ {article.Name || article.name}</span>
                            <span className="text-xs text-gray-500">{(article.Price || article.price)?.toLocaleString('ar-DZ')} Ø¯.Ø¬</span>
                          </div>
                        ))}
                        {articles.length > 3 && (
                          <div className="text-xs text-purple-600 mt-1">
                            Ùˆ {articles.length - 3} Ù…Ù†ØªØ¬ Ø£Ø®Ø±Ù‰...
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {gift && (
                    <div className="mb-4 p-3 bg-yellow-50 rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <Gift className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Ù‡Ø¯ÙŠØ© Ù…Ø¬Ø§Ù†ÙŠØ©</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        {gift.GiftName || gift.gift_name}
                        {gift.Description || gift.description ? ` - ${gift.Description || gift.description}` : ''}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => handlePackSelect(pack)}
                    disabled={isSelected}
                    className={`w-full py-3 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-green-600 text-white cursor-default'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Star className="w-4 h-4" />
                        Ù…Ø­Ø¯Ø¯
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4" />
                        Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø­Ø²Ù…Ø©
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ù„Ø§ ØªÙˆØ¬Ø¯ Ø­Ø²Ù… Ù…ØªØ§Ø­Ø©</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterByPrice !== 'all' 
                ? 'Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø­Ø²Ù… ØªØ·Ø§Ø¨Ù‚ Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„Ø¨Ø­Ø«' 
                : 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø­Ø²Ù… Ù…ØªÙˆÙØ±Ø© Ø­Ø§Ù„ÙŠØ§Ù‹'}
            </p>
            {(searchTerm || filterByPrice !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterByPrice('all');
                }}
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                Ù…Ø³Ø­ Ø§Ù„ÙÙ„Ø§ØªØ± ÙˆØ¥Ø¸Ù‡Ø§Ø± ÙƒÙ„ Ø§Ù„Ø­Ø²Ù…
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PackSelection;
