import React, { useState, useMemo } from 'react';
import { Download, DollarSign, Users, TrendingUp, BarChart3, Filter } from 'lucide-react';
import Header from '../Common/Header';

const SalesReport = ({ 
  currentUser, 
  data, 
  setCurrentScreen, 
  resetAppState 
}) => {
  // ALL hooks must be declared at the component's top level, unconditionally
  const [dateFilter, setDateFilter] = useState('all');
  const [representFilter, setRepresentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Calculate date ranges function
  const getDateRange = (filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'week':
        const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { start: weekStart, end: now };
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: monthStart, end: now };
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        return { start: quarterStart, end: now };
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return { start: yearStart, end: now };
      default:
        return null;
    }
  };

  // Get unique representatives from sales data - MUST be before any early returns
  const representatives = useMemo(() => {
    if (!data || !data.sales || !Array.isArray(data.sales)) return [];
    
    const uniqueReps = new Map();
    data.sales.forEach(sale => {
      if (sale.represent && sale.represent.iD) {
        uniqueReps.set(sale.represent.iD, sale.represent);
      }
    });
    return Array.from(uniqueReps.values());
  }, [data]);

  // Filter and sort sales data - MUST be before any early returns
  const filteredSales = useMemo(() => {
    if (!data || !data.sales || !Array.isArray(data.sales)) return [];
    
    let filtered = [...data.sales];

    // Date filter
    if (dateFilter !== 'all') {
      const range = getDateRange(dateFilter);
      if (range) {
        filtered = filtered.filter(sale => {
          const saleDate = new Date(sale.createDate);
          return saleDate >= range.start && saleDate <= range.end;
        });
      }
    }

    // Representative filter
    if (representFilter !== 'all') {
      filtered = filtered.filter(sale => sale.representID === parseInt(representFilter));
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createDate);
          bValue = new Date(b.createDate);
          break;
        case 'amount':
          aValue = a.totalPrice || 0;
          bValue = b.totalPrice || 0;
          break;
        case 'client':
          aValue = a.client?.FullName || '';
          bValue = b.client?.FullName || '';
          break;
        case 'representative':
          aValue = a.represent?.RepresentName || '';
          bValue = b.represent?.RepresentName || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, dateFilter, representFilter, sortBy, sortOrder]);

  // Calculate statistics - MUST be before any early returns
  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
    const totalSales = filteredSales.length;
    const uniqueClients = new Set(filteredSales.map(sale => sale.clientID)).size;
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Sales by representative
    const salesByRep = {};
    filteredSales.forEach(sale => {
      const repName = sale.represent?.RepresentName || 'Unknown';
      if (!salesByRep[repName]) {
        salesByRep[repName] = { count: 0, revenue: 0 };
      }
      salesByRep[repName].count++;
      salesByRep[repName].revenue += sale.totalPrice || 0;
    });

    // Sales by pack
    const salesByPack = {};
    filteredSales.forEach(sale => {
      const packName = sale.pack?.PackName || 'Unknown';
      if (!salesByPack[packName]) {
        salesByPack[packName] = { count: 0, revenue: 0 };
      }
      salesByPack[packName].count++;
      salesByPack[packName].revenue += sale.totalPrice || 0;
    });

    // Daily sales trend (last 7 days)
    const dailyTrend = {};
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push(dateStr);
      dailyTrend[dateStr] = { count: 0, revenue: 0 };
    }

    filteredSales.forEach(sale => {
      const saleDate = new Date(sale.createDate).toISOString().split('T')[0];
      if (dailyTrend[saleDate]) {
        dailyTrend[saleDate].count++;
        dailyTrend[saleDate].revenue += sale.totalPrice || 0;
      }
    });

    return {
      totalRevenue,
      totalSales,
      uniqueClients,
      averageSale,
      salesByRep: Object.entries(salesByRep).sort((a, b) => b[1].revenue - a[1].revenue),
      salesByPack: Object.entries(salesByPack).sort((a, b) => b[1].count - a[1].count),
      dailyTrend: last7Days.map(date => ({
        date,
        ...dailyTrend[date]
      }))
    };
  }, [filteredSales]);

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ['Date', 'Client', 'Representative', 'Pack', 'Amount'];
    const csvData = [
      headers.join(','),
      ...filteredSales.map(sale => [
        new Date(sale.createDate).toLocaleDateString(),
        `"${sale.client?.FullName || 'Unknown'}"`,
        `"${sale.represent?.RepresentName || 'Unknown'}"`,
        `"${sale.pack?.PackName || 'Unknown'}"`,
        sale.totalPrice || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Conditional rendering: Show loading screen if no data
  if (!data || !data.sales) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          currentUser={currentUser} 
          onLogout={resetAppState}
          title="Sales Report"
          setCurrentScreen={setCurrentScreen}
        />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sales data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentUser={currentUser} 
        onLogout={resetAppState}
        title="Sales Report"
        setCurrentScreen={setCurrentScreen}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters & Export
            </h2>
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Representative</label>
              <select
                value={representFilter}
                onChange={(e) => setRepresentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Representatives</option>
                {representatives.map(rep => (
                  <option key={rep.iD} value={rep.iD}>
                    {rep.RepresentName} ({rep.RepCode})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="client">Client</option>
                <option value="representative">Representative</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-500 p-3 rounded-full text-white mr-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-full text-white mr-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-500 p-3 rounded-full text-white mr-4">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueClients}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-indigo-500 p-3 rounded-full text-white mr-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Sale</p>
                <p className="text-2xl font-bold text-gray-900">${stats.averageSale.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales by Representative */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Representative</h3>
            <div className="space-y-4">
              {stats.salesByRep.slice(0, 5).map(([repName, data]) => (
                <div key={repName} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{repName}</span>
                      <span>{data.count} sales</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(data.revenue / stats.totalRevenue) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ${data.revenue.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Selling Packs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Packs</h3>
            <div className="space-y-4">
              {stats.salesByPack.slice(0, 5).map(([packName, data]) => (
                <div key={packName} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{packName}</span>
                      <span>{data.count} sold</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(data.count / stats.totalSales) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ${data.revenue.toFixed(2)} revenue
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Trend */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Sales Trend</h3>
          <div className="flex items-end space-x-2 h-40">
            {stats.dailyTrend.map((day, index) => (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div className="flex-1 flex items-end w-full">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ 
                      height: `${Math.max((day.revenue / Math.max(...stats.dailyTrend.map(d => d.revenue))) * 100, 5)}%` 
                    }}
                    title={`${day.count} sales, $${day.revenue.toFixed(2)}`}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </div>
                <div className="text-xs font-medium">
                  ${day.revenue.toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Sales Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detailed Sales ({filteredSales.length} records)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Representative
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pack
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.slice(0, 50).map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(sale.createDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sale.client?.FullName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.represent?.RepresentName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.pack?.PackName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ${(sale.totalPrice || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSales.length > 50 && (
              <div className="px-6 py-4 text-sm text-gray-500 text-center">
                Showing first 50 of {filteredSales.length} records
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
