import React, { useState, useMemo, useEffect } from 'react';
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
        console.log('🔄 ClientSelection - Loading clients...');
        
        const response = await apiRequest('/api/clients');
        if (response && response.length) {
          setClients(response);
          console.log('✅ ClientSelection - Loaded clients:', response.length);
        } else {
          console.warn('⚠️ ClientSelection - No clients data received');
          setClients([]);
        }
      } catch (error) {
        console.error('❌ ClientSelection - Error loading clients:', error);
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
    console.log('🔵 ClientSelection - handleClientSelect called');
    console.log('🔵 Selected client:', client);
    
    try {
      // Validate client object
      if (!client) {
        console.error('❌ ClientSelection - No client provided');
        alert('خطأ: لم يتم اختيار عميل صحيح');
        return;
      }
      
      // Check if packs are selected first
      if (!selectedPacks || selectedPacks.length === 0) {
        console.warn('⚠️ ClientSelection - No packs selected, redirecting to pack selection');
        alert('يرجى اختيار الباقات أولاً قبل اختيار العميل');
        setCurrentScreen('packs');
        return;
      }
      
      console.log('🔵 Setting client state...');
      setSelectedClient(client);
      
      console.log('🔵 Client state updated, navigating to confirmation...');
      setCurrentScreen('confirmation');
      
      console.log('✅ ClientSelection - Navigation to confirmation completed successfully');
    } catch (error) {
      console.error('❌ Error in handleClientSelect:', error);
      console.error('❌ Error stack:', error.stack);
      alert('خطأ تقني في اختيار العميل: ' + error.message);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">جاري تحميل العملاء...</h2>
          <p className="text-gray-600">يرجى الانتظار</p>
        </div>
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('noClientsInTerritory')}</h2>
          <p className="text-gray-600 mb-4">{t('loading')} {t('clients')} أو لا يوجد عملاء متاحون في منطقتك.</p>
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            {t('backToDashboard')}
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
              onClick={() => setCurrentScreen('packs')}
              className="ml-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 transform rotate-180" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{t('selectClient')}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">اختر عميلاً لإتمام البيع</h2>
              <p className="text-sm text-gray-500">
                عرض {filteredClients.length} من أصل {clients.length} عميل
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="البحث بالاسم، المدينة، الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
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
                <option value="all">كل الولايات</option>
                {uniqueWilayas.map(wilaya => (
                  <option key={wilaya} value={wilaya}>{wilaya}</option>
                ))}
              </select>
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">ترتيب حسب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-right"
                dir="rtl"
              >
                <option value="name">الاسم</option>
                <option value="city">المدينة</option>
                <option value="id">رقم العميل</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                title={sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
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
                className="px-3 py-2 text-sm text-indigo-600 hover:text-indigo-800"
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>
        
        {/* Results Count and Quick Stats */}
        {filteredClients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{filteredClients.length}</div>
              <div className="text-sm text-blue-600">عملاء متاحون</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <MapPin className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">
                {new Set(filteredClients.map(c => c.City)).size}
              </div>
              <div className="text-sm text-green-600">مدن مختلفة</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Filter className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">
                {new Set(filteredClients.map(c => c.Wilaya)).size}
              </div>
              <div className="text-sm text-purple-600">ولايات مختلفة</div>
            </div>
          </div>
        )}
        
        {/* Client Cards */}
        {filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map(client => (
              <div key={client.ClientID || client.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{client.FullName}</h3>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    #{client.ClientID}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{client.City}, {client.Wilaya}</span>
                  </div>
                  
                  {client.AllPhones && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{client.AllPhones}</span>
                    </div>
                  )}
                  
                  {client.Location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-xs">{client.Location}</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleClientSelect(client)}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 font-medium transition-colors duration-200 flex items-center justify-center gap-2"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد نتائج</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedWilaya !== 'all' 
                ? 'لم يتم العثور على عملاء يطابقون معايير البحث' 
                : 'لا يوجد عملاء متاحون في منطقتك'}
            </p>
            {(searchTerm || selectedWilaya !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedWilaya('all');
                }}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                مسح الفلاتر وإظهار كل العملاء
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSelection;