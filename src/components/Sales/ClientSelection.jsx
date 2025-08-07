﻿import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, MapPin, Phone, Users, Filter, SortAsc, SortDesc } from 'lucide-react';
import { t } from '../../translations/arabic';

const ClientSelection = ({ 
  apiRequest,
  setSelectedClient, 
  setCurrentScreen,
  selectedPacks 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, city, recent
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedWilaya, setSelectedWilaya] = useState('all');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load clients data
  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        console.log('ðŸ”„ ClientSelection - Loading clients...');
        
        const response = await apiRequest('/api/clients');
        if (response && response.length) {
          setClients(response);
          console.log('âœ… ClientSelection - Loaded clients:', response.length);
        } else {
          console.warn('âš ï¸ ClientSelection - No clients data received');
          setClients([]);
        }
      } catch (error) {
        console.error('âŒ ClientSelection - Error loading clients:', error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    if (apiRequest) {
      loadClients();
    }
  }, [apiRequest]);
  const handleClientSelect = (client) => {
    console.log('ðŸ”µ ClientSelection - handleClientSelect called');
    console.log('ðŸ”µ Selected client:', client);
    
    try {
      // Validate client object
      if (!client) {
        console.error('âŒ ClientSelection - No client provided');
        alert('Ø®Ø·Ø£: Ù„Ù… ÙŠØªÙ… Ø§Ø®ØªÙŠØ§Ø± Ø¹Ù…ÙŠÙ„ ØµØ­ÙŠØ­');
        return;
      }
      
      // Check if packs are selected first
      if (!selectedPacks || selectedPacks.length === 0) {
        console.warn('âš ï¸ ClientSelection - No packs selected, redirecting to pack selection');
        alert('ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø¨Ø§Ù‚Ø§Øª Ø£ÙˆÙ„Ø§Ù‹ Ù‚Ø¨Ù„ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø¹Ù…ÙŠÙ„');
        setCurrentScreen('packs');
        return;
      }
      
      console.log('ðŸ”µ Setting client state...');
      setSelectedClient(client);
      
      console.log('ðŸ”µ Client state updated, navigating to confirmation...');
      setCurrentScreen('confirmation');
      
      console.log('âœ… ClientSelection - Navigation to confirmation completed successfully');
    } catch (error) {
      console.error('âŒ Error in handleClientSelect:', error);
      console.error('âŒ Error stack:', error.stack);
      alert('Ø®Ø·Ø£ ØªÙ‚Ù†ÙŠ ÙÙŠ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø¹Ù…ÙŠÙ„: ' + error.message);
    }
  };

  // Get unique wilayas for filter
  const uniqueWilayas = useMemo(() => {
    if (!clients) return [];
    const wilayas = [...new Set(clients.map(client => client.Wilaya))].filter(Boolean);
    return wilayas.sort();
  }, [clients]);

  // Filter and search clients
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    
    let filtered = clients;
    
    // Filter by wilaya
    if (selectedWilaya !== 'all') {
      filtered = filtered.filter(client => client.Wilaya === selectedWilaya);
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(client => 
        client.FullName?.toLowerCase().includes(searchLower) ||
        client.City?.toLowerCase().includes(searchLower) ||
        client.Wilaya?.toLowerCase().includes(searchLower) ||
        client.AllPhones?.includes(searchTerm) ||
        client.ClientID?.toString().includes(searchTerm)
      );
    }
    
    // Sort clients
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.FullName || '';
          bValue = b.FullName || '';
          break;
        case 'city':
          aValue = a.City || '';
          bValue = b.City || '';
          break;
        case 'id':
          aValue = a.ClientID || 0;
          bValue = b.ClientID || 0;
          break;
        default:
          aValue = a.FullName || '';
          bValue = b.FullName || '';
      }
      
      if (sortBy === 'id') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const comparison = aValue.localeCompare(bValue, 'ar');
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [clients, searchTerm, sortBy, sortOrder, selectedWilaya]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-purple-800 mb-2">Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡...</h2>
          <p className="text-purple-600">ÙŠØ±Ø¬Ù‰ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±</p>
        </div>
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-purple-800 mb-2">{t('noClientsInTerritory')}</h2>
          <p className="text-purple-600 mb-4">{t('loading')} {t('clients')} Ø£Ùˆ Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø¹Ù…Ù„Ø§Ø¡ Ù…ØªØ§Ø­ÙˆÙ† ÙÙŠ Ù…Ù†Ø·Ù‚ØªÙƒ.</p>
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            {t('backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="bg-purple-600 shadow-xl border-b border-purple-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => setCurrentScreen('packs')}
              className="ml-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-300 backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5 transform rotate-180 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">{t('selectClient')}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Search and Filter Section */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-xl p-6 mb-6 border border-purple-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-purple-800 mb-2">Ø§Ø®ØªØ± Ø¹Ù…ÙŠÙ„Ø§Ù‹ Ù„Ø¥ØªÙ…Ø§Ù… Ø§Ù„Ø¨ÙŠØ¹</h2>
              <p className="text-sm text-purple-600">
                Ø¹Ø±Ø¶ {filteredClients.length} Ù…Ù† Ø£ØµÙ„ {clients.length} Ø¹Ù…ÙŠÙ„
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ø§Ù„Ø¨Ø­Ø« Ø¨Ø§Ù„Ø§Ø³Ù…ØŒ Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©ØŒ Ø§Ù„Ù‡Ø§ØªÙ..."
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
            {/* Wilaya Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedWilaya}
                onChange={(e) => setSelectedWilaya(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-right"
                dir="rtl"
              >
                <option value="all">ÙƒÙ„ Ø§Ù„ÙˆÙ„Ø§ÙŠØ§Øª</option>
                {uniqueWilayas.map(wilaya => (
                  <option key={wilaya} value={wilaya}>{wilaya}</option>
                ))}
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
                <option value="name">Ø§Ù„Ø§Ø³Ù…</option>
                <option value="city">Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©</option>
                <option value="id">Ø±Ù‚Ù… Ø§Ù„Ø¹Ù…ÙŠÙ„</option>
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
            {(searchTerm || selectedWilaya !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedWilaya('all');
                }}
                className="px-3 py-2 text-sm text-purple-600 hover:text-purple-800"
              >
                Ù…Ø³Ø­ Ø§Ù„ÙÙ„Ø§ØªØ±
              </button>
            )}
          </div>
        </div>
        
        {/* Results Count and Quick Stats */}
        {filteredClients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">{filteredClients.length}</div>
              <div className="text-sm text-purple-600">Ø¹Ù…Ù„Ø§Ø¡ Ù…ØªØ§Ø­ÙˆÙ†</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <MapPin className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">
                {new Set(filteredClients.map(c => c.City)).size}
              </div>
              <div className="text-sm text-green-600">Ù…Ø¯Ù† Ù…Ø®ØªÙ„ÙØ©</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Filter className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">
                {new Set(filteredClients.map(c => c.Wilaya)).size}
              </div>
              <div className="text-sm text-purple-600">ÙˆÙ„Ø§ÙŠØ§Øª Ù…Ø®ØªÙ„ÙØ©</div>
            </div>
          </div>
        )}
        
        {/* Client Cards */}
        {filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map(client => (
              <div key={client.ClientID || client.id} className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-purple-200 transform hover:-translate-y-1">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{client.FullName}</h3>
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                    #{client.ClientID}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{client.City}, {client.Wilaya}</span>
                    </div>
                    <button
                      onClick={() => {
                        const location = client.Location ? 
                          `${client.Location}, ${client.City}, ${client.Wilaya}` : 
                          `${client.City}, ${client.Wilaya}`;
                        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
                        window.open(googleMapsUrl, '_blank');
                      }}
                      className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      title="ÙØªØ­ ÙÙŠ Ø®Ø±Ø§Ø¦Ø· Ø¬ÙˆØ¬Ù„"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Ø®Ø±ÙŠØ·Ø©</span>
                    </button>
                  </div>
                  
                  {client.AllPhones && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{client.AllPhones}</span>
                    </div>
                  )}
                  
                  {client.Location && (
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1 ml-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-xs">{client.Location}</span>
                      </div>
                      <button
                        onClick={() => {
                          const location = `${client.Location}, ${client.City}, ${client.Wilaya}`;
                          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
                          window.open(googleMapsUrl, '_blank');
                        }}
                        className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap"
                        title="ÙØªØ­ Ø§Ù„Ø¹Ù†ÙˆØ§Ù† Ø§Ù„ÙƒØ§Ù…Ù„ ÙÙŠ Ø®Ø±Ø§Ø¦Ø· Ø¬ÙˆØ¬Ù„"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Ø¹Ù†ÙˆØ§Ù†</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleClientSelect(client)}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 font-medium transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 hover:shadow-lg"
                >
                  <Users className="w-4 h-4" />
                  {t('selectClient')}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù†ØªØ§Ø¦Ø¬</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedWilaya !== 'all' 
                ? 'Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø¹Ù…Ù„Ø§Ø¡ ÙŠØ·Ø§Ø¨Ù‚ÙˆÙ† Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„Ø¨Ø­Ø«' 
                : 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø¹Ù…Ù„Ø§Ø¡ Ù…ØªØ§Ø­ÙˆÙ† ÙÙŠ Ù…Ù†Ø·Ù‚ØªÙƒ'}
            </p>
            {(searchTerm || selectedWilaya !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedWilaya('all');
                }}
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                Ù…Ø³Ø­ Ø§Ù„ÙÙ„Ø§ØªØ± ÙˆØ¥Ø¸Ù‡Ø§Ø± ÙƒÙ„ Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSelection;
