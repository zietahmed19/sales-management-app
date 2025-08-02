import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

// Single instance flag to prevent React StrictMode double execution
let isDataLoaded = false;

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAdminData = async (isRefresh = false) => {
    // Prevent duplicate calls unless it's a manual refresh
    if (isDataLoaded && !isRefresh) {
      console.log('🚫 Data already loaded, skipping duplicate call');
      return;
    }

    console.log(`🔄 ${isRefresh ? 'Refreshing' : 'Loading'} Admin Dashboard...`);
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Admin authentication required');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch all admin data in parallel
      const [statsRes, repsRes, salesRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/statistics', { headers }),
        fetch('http://localhost:3001/api/admin/representatives', { headers }),
        fetch('http://localhost:3001/api/admin/sales', { headers })
      ]);

      if (!statsRes.ok) throw new Error(`Statistics API failed: ${statsRes.status}`);
      if (!repsRes.ok) throw new Error(`Representatives API failed: ${repsRes.status}`);
      if (!salesRes.ok) throw new Error(`Sales API failed: ${salesRes.status}`);

      const [statistics, representatives, sales] = await Promise.all([
        statsRes.json(),
        repsRes.json(),
        salesRes.json()
      ]);

      // Combine all data into single state
      setDashboardData({
        statistics,
        representatives,
        sales
      });

      setLastUpdated(new Date());
      isDataLoaded = true;
      
      console.log('✅ Admin dashboard loaded successfully!');

    } catch (error) {
      console.error('❌ Admin dashboard error:', error);
      setError(error.message);
      isDataLoaded = false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRefresh = () => {
    isDataLoaded = false;
    fetchAdminData(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">
          <h2>🔄 Loading Admin Dashboard...</h2>
          <p>Fetching company-wide analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="admin-error">
          <h2>❌ Admin Access Error</h2>
          <p>{error}</p>
          <div className="admin-error-actions">
            <button onClick={handleRefresh}>🔄 Retry</button>
            <button onClick={handleLogout}>🚪 Logout</button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData?.statistics?.overview) {
    return (
      <div className="admin-dashboard">
        <div className="admin-no-data">
          <h2>📊 No Dashboard Data</h2>
          <button onClick={handleRefresh}>🔄 Reload</button>
        </div>
      </div>
    );
  }

  const { statistics, representatives, sales } = dashboardData;
  const { overview, revenuePerDelegate, monthlySales, wilayaPerformance, topPacks } = statistics;

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <div className="admin-header">
        <div className="admin-title">
          <h1>🏢 Admin Control Center</h1>
          <p>Company-wide Sales Analytics & Management</p>
        </div>
        <div className="admin-actions">
          <button onClick={handleRefresh} className="admin-refresh-btn">
            🔄 Refresh Data
          </button>
          <button onClick={handleLogout} className="admin-logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Company Overview */}
      <div className="admin-overview">
        <h2>📈 Company Performance Overview</h2>
        <div className="overview-metrics">
          <div className="metric-card primary">
            <h3>💰 Total Revenue</h3>
            <div className="metric-value">{overview.totalRevenue?.toLocaleString()} DA</div>
          </div>
          <div className="metric-card">
            <h3>📊 Total Sales</h3>
            <div className="metric-value">{overview.totalSales}</div>
          </div>
          <div className="metric-card">
            <h3>👥 Active Delegates</h3>
            <div className="metric-value">{overview.totalRepresentatives}</div>
          </div>
          <div className="metric-card">
            <h3>🏪 Total Clients</h3>
            <div className="metric-value">{overview.totalClients}</div>
          </div>
          <div className="metric-card">
            <h3>📦 Product Packs</h3>
            <div className="metric-value">{overview.totalPacks}</div>
          </div>
          <div className="metric-card success">
            <h3>📈 Avg per Delegate</h3>
            <div className="metric-value">{parseFloat(overview.averageRevenuePerDelegate).toLocaleString()} DA</div>
          </div>
        </div>
      </div>

      {/* Delegate Performance Analysis */}
      <div className="admin-section">
        <h2>🏆 Top Performing Delegates</h2>
        <div className="delegates-ranking">
          {revenuePerDelegate?.slice(0, 8).map((delegate, index) => (
            <div key={delegate.id} className={`delegate-performance-card rank-${index + 1}`}>
              <div className="rank-badge">#{index + 1}</div>
              <div className="delegate-details">
                <h4>{delegate.name}</h4>
                <p className="delegate-code">Code: {delegate.code}</p>
                <p className="delegate-territory">📍 {delegate.wilaya}</p>
              </div>
              <div className="performance-metrics">
                <div className="metric">
                  <span className="metric-label">Revenue</span>
                  <span className="metric-amount">{delegate.revenue.toLocaleString()} DA</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Sales Count</span>
                  <span className="metric-count">{delegate.salesCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Territory Analysis */}
      <div className="admin-section">
        <h2>🗺️ Regional Performance Analysis</h2>
        <div className="territory-analysis">
          {wilayaPerformance?.map((territory) => (
            <div key={territory.wilaya} className="territory-card">
              <h4>{territory.wilaya}</h4>
              <div className="territory-stats">
                <div className="stat">
                  <span>💰</span>
                  <div>
                    <p>{territory.revenue.toLocaleString()} DA</p>
                    <small>Total Revenue</small>
                  </div>
                </div>
                <div className="stat">
                  <span>📊</span>
                  <div>
                    <p>{territory.salesCount}</p>
                    <small>Sales Made</small>
                  </div>
                </div>
                <div className="stat">
                  <span>👥</span>
                  <div>
                    <p>{territory.delegateCount}</p>
                    <small>Delegates</small>
                  </div>
                </div>
                <div className="stat">
                  <span>📈</span>
                  <div>
                    <p>{territory.delegateCount > 0 ? (territory.revenue / territory.delegateCount).toFixed(0) : 0} DA</p>
                    <small>Avg per Delegate</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Performance */}
      <div className="admin-section">
        <h2>📦 Best Selling Products</h2>
        <div className="products-performance">
          {topPacks?.map((pack, index) => (
            <div key={index} className="product-card">
              <div className="product-rank">#{index + 1}</div>
              <div className="product-info">
                <h4>{pack.packName}</h4>
                <div className="product-metrics">
                  <span>📊 {pack.salesCount} sales</span>
                  <span>💰 {pack.revenue.toLocaleString()} DA</span>
                  <span>📈 Avg: {pack.salesCount > 0 ? (pack.revenue / pack.salesCount).toFixed(0) : 0} DA</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Monitor */}
      <div className="admin-section">
        <h2>📋 Recent Sales Activity</h2>
        <div className="activity-monitor">
          <div className="activity-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Delegate</th>
                  <th>Client</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Territory</th>
                </tr>
              </thead>
              <tbody>
                {sales?.slice(0, 15).map((sale) => (
                  <tr key={sale.id}>
                    <td>{new Date(sale.createDate).toLocaleDateString()}</td>
                    <td>
                      <strong>{sale.represent?.RepresentName}</strong>
                      <br />
                      <small>{sale.represent?.RepCode}</small>
                    </td>
                    <td>{sale.client?.FullName}</td>
                    <td>{sale.pack?.PackName}</td>
                    <td className="amount">{sale.totalPrice?.toLocaleString()} DA</td>
                    <td>{sale.client?.Wilaya}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admin Footer */}
      <div className="admin-footer">
        <div className="admin-info">
          <p>🔐 Admin Dashboard - Last Updated: {lastUpdated?.toLocaleString()}</p>
          <p>📊 Monitoring {overview.totalRepresentatives} delegates across {wilayaPerformance?.length} territories</p>
          <p>💼 Total Business: {overview.totalRevenue?.toLocaleString()} DA from {overview.totalSales} sales</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
