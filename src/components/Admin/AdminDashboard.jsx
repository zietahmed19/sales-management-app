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
      
      // Use existing data from your database first
      if (data) {
        console.log('Using existing data for admin dashboard');
        
        // Get delegates from your existing representatives data
        const delegatesFromData = data.representatives || [];
        setDelegates(delegatesFromData.map(rep => ({
          id: rep.iD || rep.id,
          username: rep.username,
          territory: rep.City || rep.Wilaya || 'Unknown',
          role: 'delegate',
          name: rep.RepresentName || rep.rep_name
        })));

        // Get sales data
        const salesFromData = data.sales || [];
        setSalesData(salesFromData.map(sale => ({
          id: sale.id,
          delegateId: sale.representativeId || sale.delegate_id,
          delegateName: sale.representative_name || 'Unknown',
          totalAmount: sale.totalPrice || sale.total_amount || 0,
          date: sale.createdAt || sale.date || new Date().toISOString(),
          clientName: sale.client_name || 'Unknown Client'
        })));
      } else {
        // Fallback to sample data
        console.log('No data available, using sample data');
        generateSampleData();
      }
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin data');
      generateSampleData();
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    setDelegates([
      { id: 1, username: 'ahmed', territory: 'Algiers', role: 'delegate', name: 'Ahmed Ali' },
      { id: 2, username: 'fatima', territory: 'Oran', role: 'delegate', name: 'Fatima Ben' },
      { id: 3, username: 'karim', territory: 'Constantine', role: 'delegate', name: 'Karim Omar' },
      { id: 4, username: 'sara', territory: 'Annaba', role: 'delegate', name: 'Sara Hassan' }
    ]);

    const sampleSales = [
      { id: 1, delegateId: 1, delegateName: 'ahmed', totalAmount: 850000, date: new Date().toISOString(), clientName: 'Client A' },
      { id: 2, delegateId: 1, delegateName: 'ahmed', totalAmount: 620000, date: new Date(Date.now() - 86400000).toISOString(), clientName: 'Client B' },
      { id: 3, delegateId: 2, delegateName: 'fatima', totalAmount: 1200000, date: new Date(Date.now() - 172800000).toISOString(), clientName: 'Client C' },
      { id: 4, delegateId: 3, delegateName: 'karim', totalAmount: 750000, date: new Date(Date.now() - 259200000).toISOString(), clientName: 'Client D' },
      { id: 5, delegateId: 2, delegateName: 'fatima', totalAmount: 950000, date: new Date(Date.now() - 345600000).toISOString(), clientName: 'Client E' }
    ];
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
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <div className="bg-blue-500 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{t('totalDelegates')}</h3>
                <p className="text-3xl font-bold">{delegates.length}</p>
              </div>
              <Users className="w-12 h-12 opacity-80" />
            </div>
          </div>
          
          <div className="bg-green-500 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{t('totalSales')}</h3>
                <p className="text-3xl font-bold">{salesData.length}</p>
              </div>
              <BarChart3 className="w-12 h-12 opacity-80" />
            </div>
          </div>
          
          <div className="bg-indigo-500 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{t('totalRevenue')}</h3>
                <p className="text-2xl font-bold">
                  {calculateTotalRevenue().toLocaleString()} {t('DA')}
                </p>
              </div>
              <DollarSign className="w-12 h-12 opacity-80" />
            </div>
          </div>
          
          <div className="bg-orange-500 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{t('topPerformer')}</h3>
                <p className="text-lg font-bold">
                  {topPerformer ? topPerformer.username : t('noData')}
                </p>
                <p className="text-sm">
                  {topPerformer ? `${topPerformer.revenue.toLocaleString()} ${t('DA')}` : ''}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>

        {/* Delegates Performance Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{t('delegatesPerformance')}</h2>
          </div>
          <div className="overflow-x-auto">
            {delegates.length === 0 ? (
              <p className="text-center text-gray-500 py-8">{t('noDelegatesFound')}</p>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('delegate')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('territory')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('salesCount')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('revenue')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('averageSale')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lastSale')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {delegates.map(delegate => {
                    const delegateSales = salesData.filter(sale => sale.delegateId === delegate.id);
                    const revenue = delegateSales.reduce((total, sale) => total + sale.totalAmount, 0);
                    const averageSale = delegateSales.length > 0 ? revenue / delegateSales.length : 0;
                    const lastSale = delegateSales.length > 0 ? 
                      new Date(Math.max(...delegateSales.map(s => new Date(s.date)))).toLocaleDateString('ar-DZ') : 
                      'لا توجد مبيعات';

                    return (
                      <tr key={delegate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{delegate.username}</div>
                              <div className="text-sm text-gray-500">{delegate.name}</div>
                            </div>
                            {delegate.username === currentUser.username && (
                              <span className="mr-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {t('you')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{delegate.territory}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {delegateSales.length}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {revenue.toLocaleString()} {t('DA')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {Math.round(averageSale).toLocaleString()} {t('DA')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
