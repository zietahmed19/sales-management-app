import React, { useState, useEffect } from 'react';
import { BarChart3, Users, DollarSign, TrendingUp } from 'lucide-react';
import Header from '../Common/Header';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminDashboard = ({ 
  currentUser, 
  setCurrentUser,
  data,
  setData,
  setCurrentScreen, 
  resetAppState,
  apiRequest 
}) => {
  const { t } = useLanguage();
  const [delegates, setDelegates] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [error, setError] = useState(null);

  // Admin users list
  const adminUsers = ['mohcenacid', 'djalili', 'houcemacid'];
  
  // Check if current user is admin
  const isAdmin = currentUser && (currentUser.role === 'admin' || adminUsers.includes(currentUser.username));

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    } else {
      setError('Access denied: Admin privileges required');
      setLoading(false);
    }
  }, [selectedPeriod, isAdmin]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Admin - Current data structure:', data);
      console.log('🔍 Admin - Current user:', currentUser);
      
      let foundDelegates = [];
      
      // Try to get delegates from actual database via API
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/representatives', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const representatives = await response.json();
          console.log('✅ Admin - Got representatives from API:', representatives);
          
          foundDelegates = representatives.map(rep => ({
            id: rep.iD || rep.id,
            username: rep.username,
            territory: rep.City || rep.Wilaya || rep.territory || 'Unknown',
            role: 'delegate',
            name: rep.RepresentName || rep.representName || rep.name || rep.username
          }));
          
          setDelegates(foundDelegates);
        } else {
          throw new Error('API not available');
        }
      } catch (apiError) {
        console.log('⚠️ Admin - API not available, using data prop:', apiError.message);
        
        // Fallback to data prop with multiple possible structures
        if (data) {
          console.log('🔍 Admin - Data keys:', Object.keys(data));
          
          // Try different possible data structures
          const representatives = data.representatives || 
                                data.delegates || 
                                data.users || 
                                data.reps || 
                                [];
          
          console.log('📊 Admin - Found representatives:', representatives);
          
          if (representatives && representatives.length > 0) {
            foundDelegates = representatives.map(rep => ({
              id: rep.iD || rep.id || Math.random(),
              username: rep.username || rep.Username || 'Unknown',
              territory: rep.City || rep.city || rep.Wilaya || rep.wilaya || rep.territory || 'Unknown',
              role: 'delegate',
              name: rep.RepresentName || rep.representName || rep.name || rep.fullName || rep.username || 'Unknown'
            }));
            
            setDelegates(foundDelegates);
          } else {
            console.log('⚠️ Admin - No representatives found in data, using sample data');
            generateSampleData();
            return;
          }
        } else {
          console.log('⚠️ Admin - No data available, using sample data');
          generateSampleData();
          return;
        }
      }

      // Try to get sales data and map to delegates properly
      try {
        const token = localStorage.getItem('token');
        const salesResponse = await fetch('/api/sales', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (salesResponse.ok) {
          const sales = await salesResponse.json();
          console.log('✅ Admin - Got sales from API:', sales);
          
          const mappedSales = sales.map(sale => {
            // Try to find the delegate for this sale
            const delegate = foundDelegates.find(d => 
              d.id === sale.representativeId || 
              d.id === sale.representative_id ||
              d.username === sale.representative_name ||
              d.username === sale.delegateName
            );
            
            return {
              id: sale.id,
              delegateId: delegate ? delegate.id : sale.representativeId || sale.representative_id,
              delegateName: delegate ? delegate.username : sale.representative_name || sale.delegateName || 'Unknown',
              totalAmount: Number(sale.totalPrice || sale.total_amount || sale.amount || 0),
              date: sale.createdAt || sale.date || sale.created_at || new Date().toISOString(),
              clientName: sale.client_name || sale.clientName || 'Unknown Client'
            };
          });
          
          console.log('📊 Admin - Mapped sales data:', mappedSales);
          setSalesData(mappedSales);
        } else {
          throw new Error('Sales API not available');
        }
      } catch (salesError) {
        console.log('⚠️ Admin - Sales API not available, using data prop:', salesError.message);
        
        if (data && data.sales) {
          const sales = data.sales;
          console.log('📊 Admin - Found sales in data:', sales.length);
          console.log('📊 Admin - First sale example:', sales[0]);
          
          const mappedSales = sales.map(sale => {
            // Try to find the delegate for this sale
            const delegate = foundDelegates.find(d => 
              d.id === sale.representativeId || 
              d.id === sale.representative_id ||
              d.username === sale.representative_name ||
              d.username === sale.delegateName ||
              String(d.id) === String(sale.representativeId) ||
              String(d.id) === String(sale.representative_id)
            );
            
            console.log('🔍 Admin - Mapping sale:', sale, 'to delegate:', delegate);
            
            return {
              id: sale.id,
              delegateId: delegate ? delegate.id : sale.representativeId || sale.representative_id,
              delegateName: delegate ? delegate.username : sale.representative_name || sale.delegateName || 'Unknown',
              totalAmount: Number(sale.totalPrice || sale.total_amount || sale.amount || 0),
              date: sale.createdAt || sale.date || sale.created_at || new Date().toISOString(),
              clientName: sale.client_name || sale.clientName || 'Unknown Client'
            };
          });
          
          console.log('📊 Admin - Final mapped sales:', mappedSales);
          setSalesData(mappedSales);
        } else {
          console.log('⚠️ Admin - No sales data found, generating sample data with real delegates');
          generateSampleSalesData(foundDelegates);
        }
      }
      
    } catch (error) {
      console.error('❌ Admin - Error fetching admin data:', error);
      setError('Failed to load admin data');
      generateSampleData();
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    console.log('🔄 Admin - Generating sample data');
    const sampleDelegates = [
      { id: 1, username: 'ahmed', territory: 'Algiers', role: 'delegate', name: 'Ahmed Ali' },
      { id: 2, username: 'fatima', territory: 'Oran', role: 'delegate', name: 'Fatima Ben' },
      { id: 3, username: 'karim', territory: 'Constantine', role: 'delegate', name: 'Karim Omar' },
      { id: 4, username: 'sara', territory: 'Annaba', role: 'delegate', name: 'Sara Hassan' }
    ];
    
    setDelegates(sampleDelegates);
    generateSampleSalesData(sampleDelegates);
  };

  const generateSampleSalesData = (delegatesList = delegates) => {
    console.log('🔄 Admin - Generating sample sales for delegates:', delegatesList);
    
    const sampleSales = [
      { id: 1, delegateId: delegatesList[0]?.id || 1, delegateName: delegatesList[0]?.username || 'ahmed', totalAmount: 850000, date: new Date().toISOString(), clientName: 'Client A' },
      { id: 2, delegateId: delegatesList[0]?.id || 1, delegateName: delegatesList[0]?.username || 'ahmed', totalAmount: 620000, date: new Date(Date.now() - 86400000).toISOString(), clientName: 'Client B' },
      { id: 3, delegateId: delegatesList[1]?.id || 2, delegateName: delegatesList[1]?.username || 'fatima', totalAmount: 1200000, date: new Date(Date.now() - 172800000).toISOString(), clientName: 'Client C' },
      { id: 4, delegateId: delegatesList[2]?.id || 3, delegateName: delegatesList[2]?.username || 'karim', totalAmount: 750000, date: new Date(Date.now() - 259200000).toISOString(), clientName: 'Client D' },
      { id: 5, delegateId: delegatesList[1]?.id || 2, delegateName: delegatesList[1]?.username || 'fatima', totalAmount: 950000, date: new Date(Date.now() - 345600000).toISOString(), clientName: 'Client E' }
    ];
    
    console.log('📊 Admin - Generated sample sales:', sampleSales);
    setSalesData(sampleSales);
  };

  const calculateTotalRevenue = () => {
    return salesData.reduce((total, sale) => total + sale.totalAmount, 0);
  };

  const getTopPerformer = () => {
    const delegatePerformance = delegates.map(delegate => {
      const delegateSales = salesData.filter(sale => sale.delegateId === delegate.id);
      const revenue = delegateSales.reduce((total, sale) => total + sale.totalAmount, 0);
      return { ...delegate, revenue, salesCount: delegateSales.length };
    });
    
    return delegatePerformance.sort((a, b) => b.revenue - a.revenue)[0];
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          currentUser={currentUser} 
          onLogout={resetAppState}
          title={t('accessDenied')}
          setCurrentScreen={setCurrentScreen}
        />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">{t('accessDenied')}</h2>
            <p className="text-red-600 mb-4">{t('adminPrivilegesRequired')}</p>
            <p className="text-sm text-red-500">{t('authorizedAdmins')}: mohcenacid, djalili, houcemacid</p>
            <button 
              onClick={() => setCurrentScreen('dashboard')}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              {t('backToDashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          currentUser={currentUser} 
          onLogout={resetAppState}
          title={t('error')}
          setCurrentScreen={setCurrentScreen}
        />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">{t('error')}</h2>
            <p className="text-yellow-600 mb-4">{error}</p>
            <button 
              onClick={fetchAdminData}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const topPerformer = getTopPerformer();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header 
        currentUser={currentUser} 
        onLogout={resetAppState}
        title={`${t('adminDashboard')} - ${t('welcome')} ${currentUser.username}`}
        setCurrentScreen={setCurrentScreen}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period Selection */}
        <div className="mb-6">
          <select 
            className="px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-black"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="week">{t('thisWeek')}</option>
            <option value="month">{t('thisMonth')}</option>
            <option value="quarter">{t('thisQuarter')}</option>
            <option value="year">{t('thisYear')}</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Delegates - Black */}
          <div className="bg-black text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{t('totalDelegates')}</h3>
                <p className="text-3xl font-bold text-amber-400">{delegates.length}</p>
              </div>
              <Users className="w-12 h-12 opacity-80 text-amber-400" />
            </div>
          </div>
          
          {/* Total Sales - Amber */}
          <div className="bg-amber-500 text-black rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{t('totalSales')}</h3>
                <p className="text-3xl font-bold text-white">{salesData.length}</p>
              </div>
              <BarChart3 className="w-12 h-12 opacity-80 text-white" />
            </div>
          </div>
          
          {/* Total Revenue - Yellow */}
          <div className="bg-yellow-500 text-black rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{t('totalRevenue')}</h3>
                <p className="text-2xl font-bold text-white">
                  {calculateTotalRevenue().toLocaleString()} {t('DA')}
                </p>
              </div>
              <DollarSign className="w-12 h-12 opacity-80 text-white" />
            </div>
          </div>
          
          {/* Top Performer - White with black text */}
          <div className="bg-white text-black rounded-lg p-6 shadow-lg border-2 border-amber-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{t('topPerformer')}</h3>
                <p className="text-lg font-bold text-amber-600">
                  {topPerformer ? topPerformer.username : t('noData')}
                </p>
                <p className="text-sm text-yellow-600">
                  {topPerformer ? `${topPerformer.revenue.toLocaleString()} ${t('DA')}` : ''}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 opacity-80 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Delegates Performance Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-amber-200">
          <div className="px-6 py-4 border-b border-amber-200 bg-amber-50">
            <h2 className="text-xl font-semibold text-black">{t('delegatesPerformance')}</h2>
          </div>
          <div className="overflow-x-auto">
            {delegates.length === 0 ? (
              <p className="text-center text-gray-500 py-8">{t('noDelegatesFound')}</p>
            ) : (
              <table className="min-w-full">
                <thead className="bg-amber-100">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">{t('delegate')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">{t('territory')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">{t('salesCount')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">{t('revenue')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">{t('averageSale')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">{t('lastSale')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-amber-200">
                  {delegates.map(delegate => {
                    const delegateSales = salesData.filter(sale => sale.delegateId === delegate.id);
                    const revenue = delegateSales.reduce((total, sale) => total + sale.totalAmount, 0);
                    const averageSale = delegateSales.length > 0 ? revenue / delegateSales.length : 0;
                    const lastSale = delegateSales.length > 0 ? 
                      new Date(Math.max(...delegateSales.map(s => new Date(s.date)))).toLocaleDateString('ar-DZ') : 
                      'لا توجد مبيعات';

                    return (
                      <tr key={delegate.id} className="hover:bg-yellow-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-black">{delegate.username}</div>
                              <div className="text-sm text-amber-600">{delegate.name}</div>
                            </div>
                            {delegate.username === currentUser.username && (
                              <span className="mr-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black text-amber-400">
                                {t('you')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{delegate.territory}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            delegateSales.length > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {delegateSales.length}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                          <span className={revenue > 0 ? 'text-green-600' : 'text-red-600'}>
                            {revenue.toLocaleString()} {t('DA')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                          {Math.round(averageSale).toLocaleString()} {t('DA')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600">
                          {lastSale === t('noSales') ? lastSale : lastSale}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
