import React, { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, TrendingUp, Plus, BarChart3, Calendar, Award } from 'lucide-react';
import Header from '../Common/Header';
import { t } from '../../translations/arabic';

const Dashboard = ({ 
  currentUser, 
  data, 
  setCurrentScreen, 
  resetAppState,
  setData, // Add setData to props 
  initializeData, // Add manual data loading function
  trackUserAction, // Add tracking function
  apiRequest
}) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Load dashboard data (packs, articles, etc.)
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [packsData, articlesData, clientsData] = await Promise.all([
          apiRequest('/api/packs'),
          apiRequest('/api/articles'),
          apiRequest('/api/clients')
        ]);
        
        setDashboardData({
          packs: packsData || [],
          articles: articlesData || [],
          clients: clientsData || []
        });
        
        console.log('✅ Dashboard - Data loaded:', {
          packs: packsData?.length,
          articles: articlesData?.length,
          clients: clientsData?.length
        });
      } catch (error) {
        console.error('❌ Dashboard - Error loading data:', error);
        setDashboardData({
          packs: [],
          articles: [],
          clients: []
        });
      }
    };

    if (apiRequest) {
      loadDashboardData();
    }
  }, [apiRequest]);

  // Load personal statistics for delegate
  const loadStatistics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const apiBase = baseURL.replace('/api', '');

      const response = await fetch(`${apiBase}/api/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const stats = await response.json();
        setStatistics(stats);
        console.log(`🎯 PERSONAL STATISTICS LOADED FOR: ${stats.delegate.username}`);
        console.log(`📍 Territory: ${stats.delegate.wilaya}`);
        console.log(`📊 Personal Sales: ${stats.delegate.personalStats.totalSales}`);
        console.log(`� Personal Revenue: ${stats.delegate.personalStats.totalRevenue} DA`);
        console.log(`👥 Territory Clients: ${stats.delegate.personalStats.wilayaClients}`);
        console.log('📈 Full Statistics Object:', stats);
      } else {
        console.error('Failed to load statistics:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Track dashboard access
  useEffect(() => {
    trackUserAction('DASHBOARD_LOADED', {
      user: currentUser ? currentUser.username : null,
      dataExists: !!dashboardData,
      clientCount: dashboardData?.clients?.length || 0,
      packCount: dashboardData?.packs?.length || 0,
      salesCount: data?.sales?.length || 0
    });
    
    // Load personal statistics
    loadStatistics();
  }, [dashboardData]);
  
  // Debug logging
  console.log('🏠 Dashboard - Received data:', data);
  console.log('🏠 Dashboard - Dashboard data:', dashboardData);
  console.log('🏠 Dashboard - Clients data:', dashboardData?.clients);
  console.log('🏠 Dashboard - Packs data:', dashboardData?.packs);
  console.log('🏠 Dashboard - Sales data:', data?.sales);

  // Safety check for data loading
  if (!dashboardData && !statistics) {
    console.log('⚠️ Dashboard - No data available, showing loading screen');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Use statistics data if available, fallback to general data
  const stats = statistics ? {
    totalSales: statistics.delegate.personalStats.totalSales,
    totalClients: statistics.delegate.personalStats.wilayaClients,
    totalPacks: dashboardData?.packs?.length || 0,
    totalPackStock: dashboardData?.packs?.reduce((sum, pack) => sum + (pack.quantity || 0), 0) || 0,
    totalRevenue: statistics.delegate.personalStats.totalRevenue
  } : {
    totalSales: data?.sales?.length || 0,
    totalClients: dashboardData?.clients?.length || 0,
    totalPacks: dashboardData?.packs?.length || 0,
    totalPackStock: dashboardData?.packs?.reduce((sum, pack) => sum + (pack.quantity || 0), 0) || 0,
    totalRevenue: data?.sales?.reduce((sum, sale) => sum + (sale.pack?.TotalPackPrice || sale.totalPrice || 0), 0) || 0
  };

  const statCards = [
    { title: t('personalSales'), value: stats.totalSales, icon: ShoppingCart, color: 'bg-blue-500' },
    { title: `${t('clientsInTerritory')} ${statistics?.delegate.wilaya || 'المنطقة'}`, value: stats.totalClients, icon: Users, color: 'bg-green-500' },
    { title: t('availablePacks'), value: stats.totalPacks, icon: Package, color: 'bg-purple-500' },
    { title: 'إجمالي المخزون', value: stats.totalPackStock, icon: Package, color: 'bg-orange-500' },
    { title: t('personalRevenue'), value: `${stats.totalRevenue.toLocaleString('ar-DZ')} ${t('currency')}`, icon: TrendingUp, color: 'bg-indigo-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header 
        currentUser={currentUser} 
        onLogout={resetAppState}
        title={`${t('welcome')}, ${currentUser.rep_name || currentUser.RepresentName || currentUser.username}`}
        setCurrentScreen={setCurrentScreen}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Personal Delegate Info Banner */}
        {statistics && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {t('welcome')}, {currentUser?.rep_name || currentUser?.username}!
                </h2>
                <p className="text-indigo-100 mt-1">
                  📍 {t('territory')}: <span className="font-semibold">{statistics.delegate.wilaya}</span>
                </p>
                <p className="text-indigo-100 text-sm mt-1">
                  {t('showsPersonalData')}
                </p>
              </div>
              <div className="text-left">
                <div className="text-3xl font-bold">{statistics.delegate.personalStats.totalSales}</div>
                <div className="text-sm text-indigo-100">{t('personalSales')}</div>
                <div className="text-lg font-semibold mt-1">{statistics.delegate.personalStats.totalRevenue.toLocaleString()} {t('DA')}</div>
                <div className="text-xs text-indigo-100">{t('personalRevenue')}</div>
              </div>
            </div>
          </div>
        )}
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-full text-white ml-4`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('quickActions')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => {
                console.log('🔵 Dashboard - New Sale button clicked');
                console.log('🔵 Dashboard - Current data state:', data);
                console.log('🔵 Dashboard - Dashboard data state:', dashboardData);
                console.log('🔵 Dashboard - Data exists:', !!data);
                console.log('🔵 Dashboard - Packs exists:', !!dashboardData?.packs);
                console.log('🔵 Dashboard - Packs length:', dashboardData?.packs?.length);
                console.log('🔵 Dashboard - Packs content:', dashboardData?.packs);
                console.log('🔵 Dashboard - Clients length:', dashboardData?.clients?.length);
                console.log('🔵 Dashboard - About to navigate to packs screen');
                
                trackUserAction('CLICK_NEW_SALE', { 
                  user: currentUser?.username,
                  clientCount: dashboardData?.clients?.length || 0,
                  packCount: dashboardData?.packs?.length || 0
                });
                setCurrentScreen('packs');
              }}
              className="flex items-center justify-center space-x-reverse space-x-2 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5" />
              <span>{t('newSale')}</span>
            </button>
            <button
              onClick={() => {
                trackUserAction('CLICK_MANAGE_CLIENTS', { 
                  user: currentUser?.username,
                  clientCount: data?.clients?.length || 0
                });
                setCurrentScreen('client-management');
              }}
              className="flex items-center justify-center space-x-reverse space-x-2 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700">
              <Users className="w-5 h-5" />
              <span>{t('manageClients')}</span>
            </button>
            <button
              onClick={() => {
                trackUserAction('CLICK_MANAGE_PACKS', { 
                  user: currentUser?.username,
                  packCount: dashboardData?.packs?.length || 0
                });
                setCurrentScreen('pack-management');
              }}
              className="flex items-center justify-center space-x-reverse space-x-2 bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700">
              <Package className="w-5 h-5" />
              <span>{t('managePacks')}</span>
            </button>
            <button 
              onClick={() => {
                trackUserAction('CLICK_SALES_REPORT', { 
                  user: currentUser?.username,
                  salesCount: data?.sales?.length || 0
                });
                setCurrentScreen('enhanced-reports');
              }}
              className="flex items-center justify-center space-x-reverse space-x-2 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700">
              <TrendingUp className="w-5 h-5" />
              <span>{t('salesReport')}</span>
            </button>
          </div>
        </div>

        {/* Personal Statistics Section */}
        {statistics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Sales Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 ml-2 text-indigo-600" />
                {t('monthlySalesPerformance')}
              </h3>
              {statistics.monthlySales && statistics.monthlySales.length > 0 ? (
                <div className="space-y-3">
                  {statistics.monthlySales.slice(0, 6).map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{month.month}</span>
                      <div className="flex items-center space-x-reverse space-x-2">
                        <span className="text-sm font-medium">{month.salesCount} {t('sales')}</span>
                        <span className="text-sm text-green-600">{month.revenue.toLocaleString('ar-DZ')} {t('currency')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">{t('noSalesData')}</p>
              )}
            </div>

            {/* Top Packs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 ml-2 text-yellow-600" />
                {t('topSellingPacks')}
              </h3>
              {statistics.topPacks && statistics.topPacks.length > 0 ? (
                <div className="space-y-3">
                  {statistics.topPacks.map((pack, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-indigo-600 ml-2">#{index + 1}</span>
                        <span className="text-sm font-medium">{pack.packName}</span>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium">{pack.salesCount} {t('sold')}</div>
                        <div className="text-xs text-green-600">{pack.revenue.toLocaleString('ar-DZ')} {t('currency')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">{t('noSalesData')}</p>
              )}
            </div>
          </div>
        )}

        {/* Recent Sales */}
        {statistics?.recentActivity && statistics.recentActivity.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 ml-2 text-blue-600" />
              {t('recentSalesActivity')}
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('client')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('pack')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('amount')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('date')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statistics.recentActivity.map((sale, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {sale.clientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {sale.packName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {sale.amount.toLocaleString('ar-DZ')} {t('currency')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {new Date(sale.date).toLocaleDateString('ar-DZ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : data?.sales && data.sales.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('recentSales')}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('client')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('pack')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('amount')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('date')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.sales.slice(-5).map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {sale.client?.FullName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {sale.pack?.PackName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {sale.pack?.TotalPackPrice || sale.totalPrice || 0} {t('currency')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {new Date(sale.createDate).toLocaleDateString('ar-DZ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('gettingStarted')}</h2>
            <p className="text-gray-600 mb-4">{t('welcomeMessage')}</p>
            <button
              onClick={() => setCurrentScreen('packs')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              {t('makeFirstSale')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;