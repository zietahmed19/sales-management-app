import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [representatives, setRepresentatives] = useState([]);
  const [allSales, setAllSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch admin data from your API
  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch admin statistics
      const statsResponse = await fetch('http://localhost:3001/api/admin/statistics', { headers });
      if (!statsResponse.ok) throw new Error('Failed to fetch admin statistics');
      const statsData = await statsResponse.json();

      // Fetch representatives with performance data
      const repsResponse = await fetch('http://localhost:3001/api/admin/representatives', { headers });
      if (!repsResponse.ok) throw new Error('Failed to fetch representatives');
      const repsData = await repsResponse.json();

      // Fetch all sales
      const salesResponse = await fetch('http://localhost:3001/api/admin/sales', { headers });
      if (!salesResponse.ok) throw new Error('Failed to fetch sales');
      const salesData = await salesResponse.json();

      setStatistics(statsData);
      setRepresentatives(repsData);
      setAllSales(salesData);
      
      console.log('📊 Admin Dashboard Data:', {
        statistics: statsData,
        representatives: repsData.length,
        sales: salesData.length
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <h2>🔄 Loading Admin Dashboard...</h2>
          <p>Fetching company-wide statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">
          <h2>❌ Error Loading Admin Dashboard</h2>
          <p>{error}</p>
          <button onClick={fetchAdminData}>🔄 Retry</button>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="admin-dashboard">
        <div className="no-data">
          <h2>📊 No Admin Data Available</h2>
          <p>Unable to load statistics</p>
        </div>
      </div>
    );
  }

  const { overview, revenuePerDelegate, monthlySales, wilayaPerformance, topPacks } = statistics;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>🏢 Admin Dashboard</h1>
        <p>Company-wide Sales Management Overview</p>
        <button onClick={fetchAdminData} className="refresh-btn">
          🔄 Refresh Data
        </button>
      </div>

      {/* Overview Statistics */}
      <div className="overview-cards">
        <div className="overview-card">
          <h3>💰 Total Revenue</h3>
          <p className="big-number">{overview.totalRevenue?.toLocaleString()} DA</p>
        </div>
        <div className="overview-card">
          <h3>📊 Total Sales</h3>
          <p className="big-number">{overview.totalSales}</p>
        </div>
        <div className="overview-card">
          <h3>👥 Representatives</h3>
          <p className="big-number">{overview.totalRepresentatives}</p>
        </div>
        <div className="overview-card">
          <h3>🏪 Total Clients</h3>
          <p className="big-number">{overview.totalClients}</p>
        </div>
        <div className="overview-card">
          <h3>📦 Available Packs</h3>
          <p className="big-number">{overview.totalPacks}</p>
        </div>
        <div className="overview-card">
          <h3>📈 Avg Revenue/Delegate</h3>
          <p className="big-number">{parseFloat(overview.averageRevenuePerDelegate).toLocaleString()} DA</p>
        </div>
      </div>

      {/* Revenue per Delegate */}
      <div className="section">
        <h2>👨‍💼 Delegate Performance Ranking</h2>
        <div className="delegate-performance">
          {revenuePerDelegate.slice(0, 10).map((delegate, index) => (
            <div key={delegate.id} className={`delegate-card ${index < 3 ? 'top-performer' : ''}`}>
              <div className="delegate-rank">#{index + 1}</div>
              <div className="delegate-info">
                <h4>{delegate.name}</h4>
                <p>Code: {delegate.code} | Territory: {delegate.wilaya}</p>
                <div className="delegate-stats">
                  <span>💰 {delegate.revenue.toLocaleString()} DA</span>
                  <span>📊 {delegate.salesCount} sales</span>
                </div>
              </div>
              {index < 3 && <div className="performance-badge">🏆</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Wilaya Performance */}
      <div className="section">
        <h2>🗺️ Territory Performance</h2>
        <div className="wilaya-grid">
          {wilayaPerformance.map((wilaya, index) => (
            <div key={wilaya.wilaya} className="wilaya-card">
              <h4>{wilaya.wilaya}</h4>
              <div className="wilaya-stats">
                <p>💰 Revenue: {wilaya.revenue.toLocaleString()} DA</p>
                <p>📊 Sales: {wilaya.salesCount}</p>
                <p>👥 Delegates: {wilaya.delegateCount}</p>
                <p>📈 Avg/Delegate: {wilaya.delegateCount > 0 ? (wilaya.revenue / wilaya.delegateCount).toFixed(0) : 0} DA</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Selling Packs */}
      <div className="section">
        <h2>📦 Top Selling Packs</h2>
        <div className="packs-grid">
          {topPacks.map((pack, index) => (
            <div key={index} className="pack-card">
              <h4>{pack.packName}</h4>
              <div className="pack-stats">
                <p>📊 Sales: {pack.salesCount}</p>
                <p>💰 Revenue: {pack.revenue.toLocaleString()} DA</p>
                <p>📈 Avg Value: {pack.salesCount > 0 ? (pack.revenue / pack.salesCount).toFixed(0) : 0} DA</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Sales Trend */}
      <div className="section">
        <h2>📈 Monthly Sales Trend</h2>
        <div className="monthly-trend">
          {monthlySales.map((month, index) => (
            <div key={month.month} className="month-card">
              <h4>{month.month}</h4>
              <p>📊 {month.salesCount} sales</p>
              <p>💰 {month.revenue.toLocaleString()} DA</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sales Activity */}
      <div className="section">
        <h2>📋 Recent Sales (Latest 20)</h2>
        <div className="sales-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Delegate</th>
                <th>Pack</th>
                <th>Amount</th>
                <th>Territory</th>
              </tr>
            </thead>
            <tbody>
              {allSales.slice(0, 20).map((sale) => (
                <tr key={sale.id}>
                  <td>{new Date(sale.createDate).toLocaleDateString()}</td>
                  <td>{sale.client.FullName}</td>
                  <td>{sale.represent.RepresentName} ({sale.represent.RepCode})</td>
                  <td>{sale.pack.PackName}</td>
                  <td>{sale.totalPrice.toLocaleString()} DA</td>
                  <td>{sale.client.Wilaya}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="dashboard-footer">
        <p>📊 Dashboard last updated: {new Date().toLocaleString()}</p>
        <p>🏢 Total Company Revenue: {overview.totalRevenue?.toLocaleString()} DA across {overview.totalRepresentatives} delegates</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
