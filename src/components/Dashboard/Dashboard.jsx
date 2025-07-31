import React from 'react';
import { Package, Users, ShoppingCart, TrendingUp, Plus } from 'lucide-react';
import Header from '../Common/Header';

const Dashboard = ({ 
  currentUser, 
  data, 
  setCurrentScreen, 
  resetAppState 
}) => {
  const stats = {
    totalSales: data.sales.length,
    totalClients: data.clients.length,
    totalPacks: data.packs.length,
    totalRevenue: data.sales.reduce((sum, sale) => sum + (sale.Pack?.TotalPackPrice || 0), 0)
  };

  const statCards = [
    { title: 'Total Sales', value: stats.totalSales, icon: ShoppingCart, color: 'bg-blue-500' },
    { title: 'Clients', value: stats.totalClients, icon: Users, color: 'bg-green-500' },
    { title: 'Product Packs', value: stats.totalPacks, icon: Package, color: 'bg-purple-500' },
    { title: 'Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: 'bg-indigo-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentUser={currentUser} 
        onLogout={resetAppState}
        title={`Welcome, ${currentUser.RepresentName}`}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-full text-white mr-4`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setCurrentScreen('packs')}
              className="flex items-center justify-center space-x-2 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5" />
              <span>New Sale</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700">
              <Users className="w-5 h-5" />
              <span>View Clients</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700">
              <TrendingUp className="w-5 h-5" />
              <span>Sales Report</span>
            </button>
          </div>
        </div>

        {/* Recent Sales */}
        {data.sales.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Sales</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pack</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.sales.slice(-5).map((sale) => (
                    <tr key={sale.Id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sale.Client?.FullName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.Pack?.PackName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${sale.Pack?.TotalPackPrice || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sale.CreateDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;