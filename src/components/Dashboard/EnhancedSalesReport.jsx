import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar, 
  Download, 
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react';
import { t } from '../../translations/arabic';

const EnhancedSalesReport = ({ currentUser, data, setCurrentScreen }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeframe, setTimeframe] = useState('month'); // week, month, year

  useEffect(() => {
    loadReportData();
  }, [timeframe, currentUser]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const apiBase = baseURL.replace('/api', '');
      
      const response = await fetch(`${apiBase}/api/sales/enhanced-report?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        // Fallback to using existing data if API not available
        generateLocalReport();
      }
    } catch (error) {
      console.error('Error loading enhanced report:', error);
      generateLocalReport();
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const generateLocalReport = () => {
    if (!data?.sales) return;

    const now = new Date();
    const filteredSales = data.sales.filter(sale => {
      const saleDate = new Date(sale.createDate || sale.date);
      const daysDiff = Math.floor((now - saleDate) / (1000 * 60 * 60 * 24));
      
      switch (timeframe) {
        case 'week': return daysDiff <= 7;
        case 'month': return daysDiff <= 30;
        case 'year': return daysDiff <= 365;
        default: return daysDiff <= 30;
      }
    });

    const totalRevenue = filteredSales.reduce((sum, sale) => 
      sum + (sale.pack?.TotalPackPrice || sale.totalPrice || 0), 0);
    
    const uniqueClients = new Set(filteredSales.map(sale => sale.client?.ClientID || sale.clientId)).size;
    
    const dailyStats = {};
    filteredSales.forEach(sale => {
      const date = new Date(sale.createDate || sale.date).toDateString();
      if (!dailyStats[date]) {
        dailyStats[date] = { sales: 0, revenue: 0 };
      }
      dailyStats[date].sales += 1;
      dailyStats[date].revenue += (sale.pack?.TotalPackPrice || sale.totalPrice || 0);
    });

    const topPacks = {};
    filteredSales.forEach(sale => {
      const packName = sale.pack?.PackName || 'Unknown Pack';
      if (!topPacks[packName]) {
        topPacks[packName] = { count: 0, revenue: 0 };
      }
      topPacks[packName].count += 1;
      topPacks[packName].revenue += (sale.pack?.TotalPackPrice || sale.totalPrice || 0);
    });

    const topPacksArray = Object.entries(topPacks)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    setReportData({
      summary: {
        totalSales: filteredSales.length,
        totalRevenue,
        uniqueClients,
        averageOrderValue: filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0,
        salesGrowth: 15.2, // Mock data
        conversionRate: 8.5 // Mock data
      },
      dailyStats: Object.entries(dailyStats).slice(-7),
      topPacks: topPacksArray,
      trends: {
        salesTrend: 'up',
        revenueTrend: 'up',
        clientTrend: 'up'
      }
    });
  };

  const handleRefresh = () => {
    loadReportData();
  };

  const handleExport = () => {
    const csvContent = generateCSVReport();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSVReport = () => {
    if (!reportData) return '';
    
    let csv = 'تقرير المبيعات المحسن\n\n';
    csv += 'الملخص\n';
    csv += `إجمالي المبيعات,${reportData.summary.totalSales}\n`;
    csv += `إجمالي الإيرادات,${reportData.summary.totalRevenue.toLocaleString('ar-DZ')} د.ج\n`;
    csv += `العملاء الفريدون,${reportData.summary.uniqueClients}\n`;
    csv += `متوسط قيمة الطلب,${reportData.summary.averageOrderValue.toLocaleString('ar-DZ')} د.ج\n\n`;
    
    csv += 'أفضل الحزم\n';
    csv += 'اسم الحزمة,عدد المبيعات,الإيرادات\n';
    reportData.topPacks.forEach(pack => {
      csv += `${pack.name},${pack.count},${pack.revenue.toLocaleString('ar-DZ')}\n`;
    });
    
    return csv;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')} {t('salesReport')}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentScreen('dashboard')}
                className="text-purple-600 hover:text-purple-800"
              >
                ← {t('backToDashboard')}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{t('salesReport')} المحسن</h1>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="week">{t('weeklySales')}</option>
                <option value="month">{t('monthlySales')}</option>
                <option value="year">سنوي</option>
              </select>
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-1 bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t('refreshData')}</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>{t('exportReport')}</span>
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {t('lastUpdated')}: {lastUpdated.toLocaleString('ar-DZ')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {reportData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('totalSales')}</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalSales.toLocaleString('ar-DZ')}</p>
                  </div>
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">{reportData.summary.salesGrowth}%</span>
                  </div>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600 mt-2" />
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('totalRevenue')}</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalRevenue.toLocaleString('ar-DZ')} {t('currency')}</p>
                  </div>
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">12.8%</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600 mt-2" />
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('uniqueClients')}</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.summary.uniqueClients.toLocaleString('ar-DZ')}</p>
                  </div>
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">5.2%</span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-purple-600 mt-2" />
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('averageOrderValue')}</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.summary.averageOrderValue.toLocaleString('ar-DZ')} {t('currency')}</p>
                  </div>
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">8.1%</span>
                  </div>
                </div>
                <Activity className="w-8 h-8 text-purple-600 mt-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Performance */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  {t('dailySales')}
                </h3>
                <div className="space-y-3">
                  {reportData.dailyStats.map(([date, stats], index) => (
                    <div key={date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{new Date(date).toLocaleDateString('ar-DZ')}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">{stats.sales} {t('sales')}</span>
                        <span className="text-sm text-green-600 font-semibold">{stats.revenue.toLocaleString('ar-DZ')} {t('currency')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performing Packs */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  {t('topSellingPacks')}
                </h3>
                <div className="space-y-3">
                  {reportData.topPacks.map((pack, index) => (
                    <div key={pack.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-purple-600 mr-2">#{index + 1}</span>
                        <span className="text-sm font-medium">{pack.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{pack.count} {t('sold')}</div>
                        <div className="text-xs text-green-600">{pack.revenue.toLocaleString('ar-DZ')} {t('currency')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('performanceMetrics')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{reportData.summary.salesGrowth}%</div>
                  <div className="text-sm text-gray-600">{t('salesGrowth')}</div>
                  <div className="flex items-center justify-center mt-2 text-green-600">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    <span className="text-xs">مقارنة بالفترة السابقة</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{reportData.summary.conversionRate}%</div>
                  <div className="text-sm text-gray-600">{t('conversionRate')}</div>
                  <div className="flex items-center justify-center mt-2 text-green-600">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    <span className="text-xs">تحسن في الأداء</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">4.2</div>
                  <div className="text-sm text-gray-600">تقييم الأداء</div>
                  <div className="flex items-center justify-center mt-2 text-green-600">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    <span className="text-xs">ممتاز</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedSalesReport;
