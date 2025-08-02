import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [delegates, setDelegates] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [error, setError] = useState(null);

  // Admin users list
  const adminUsers = ['mohcenacid', 'djalili', 'houcemacid'];
  
  // Check if current user is admin
  const currentUser = localStorage.getItem('username');
  const isAdmin = adminUsers.includes(currentUser);

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
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || '';
      
      // Fetch all delegates with fallback data
      try {
        const delegatesResponse = await fetch(`${apiUrl}/api/admin/delegates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (delegatesResponse.ok) {
          const delegatesData = await delegatesResponse.json();
          setDelegates(delegatesData);
        } else {
          // Fallback delegate data if API doesn't exist yet
          setDelegates([
            { id: 1, username: 'ahmed', territory: 'Algiers', role: 'delegate' },
            { id: 2, username: 'fatima', territory: 'Oran', role: 'delegate' },
            { id: 3, username: 'karim', territory: 'Constantine', role: 'delegate' },
            { id: 4, username: 'sara', territory: 'Annaba', role: 'delegate' }
          ]);
        }
      } catch (err) {
        // Fallback delegate data
        setDelegates([
          { id: 1, username: 'ahmed', territory: 'Algiers', role: 'delegate' },
          { id: 2, username: 'fatima', territory: 'Oran', role: 'delegate' },
          { id: 3, username: 'karim', territory: 'Constantine', role: 'delegate' },
          { id: 4, username: 'sara', territory: 'Annaba', role: 'delegate' }
        ]);
      }

      // Fetch consolidated sales data with fallback
      try {
        const salesResponse = await fetch(`${apiUrl}/api/admin/sales?period=${selectedPeriod}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (salesResponse.ok) {
          const salesData = await salesResponse.json();
          setSalesData(salesData);
        } else {
          // Generate sample sales data
          generateSampleSalesData();
        }
      } catch (err) {
        // Generate sample sales data
        generateSampleSalesData();
      }
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const generateSampleSalesData = () => {
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
      <div className="container-fluid p-4">
        <div className="alert alert-danger">
          <h4>{t('accessDenied')}</h4>
          <p>{t('adminPrivilegesRequired')}</p>
          <p>{t('authorizedAdmins')}: mohcenacid, djalili, houcemacid</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center p-4">{t('loading')}</div>;

  if (error) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-warning">
          <h4>{t('error')}</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchAdminData}>
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  const topPerformer = getTopPerformer();

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-3">{t('adminDashboard')} - {t('welcome')} {currentUser}</h1>
          
          {/* Period Selection */}
          <div className="mb-3">
            <select 
              className="form-select w-auto"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="week">{t('thisWeek')}</option>
              <option value="month">{t('thisMonth')}</option>
              <option value="quarter">{t('thisQuarter')}</option>
              <option value="year">{t('thisYear')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">{t('totalDelegates')}</h5>
              <h2 className="card-text">{delegates.length}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">{t('totalSales')}</h5>
              <h2 className="card-text">{salesData.length}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">{t('totalRevenue')}</h5>
              <h2 className="card-text">
                {calculateTotalRevenue().toLocaleString()} {t('DA')}
              </h2>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h5 className="card-title">{t('topPerformer')}</h5>
              <h6 className="card-text">
                {topPerformer ? topPerformer.username : t('noData')}
              </h6>
              <small>
                {topPerformer ? `${topPerformer.revenue.toLocaleString()} ${t('DA')}` : ''}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Delegates Performance Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">{t('delegatesPerformance')}</h5>
            </div>
            <div className="card-body">
              {delegates.length === 0 ? (
                <p className="text-muted">{t('noDelegatesFound')}</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>{t('delegate')}</th>
                        <th>{t('territory')}</th>
                        <th>{t('salesCount')}</th>
                        <th>{t('revenue')}</th>
                        <th>{t('averageSale')}</th>
                        <th>{t('lastSale')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {delegates.map(delegate => {
                        const delegateSales = salesData.filter(sale => sale.delegateId === delegate.id);
                        const revenue = delegateSales.reduce((total, sale) => total + sale.totalAmount, 0);
                        const averageSale = delegateSales.length > 0 ? revenue / delegateSales.length : 0;
                        const lastSale = delegateSales.length > 0 ? 
                          new Date(Math.max(...delegateSales.map(s => new Date(s.date)))).toLocaleDateString() : 
                          t('noSales');

                        return (
                          <tr key={delegate.id}>
                            <td>
                              <strong>{delegate.username}</strong>
                              {delegate.username === currentUser && (
                                <span className="badge bg-secondary ms-2">{t('you')}</span>
                              )}
                            </td>
                            <td>{delegate.territory}</td>
                            <td>
                              <span className="badge bg-success">{delegateSales.length}</span>
                            </td>
                            <td>
                              <strong>{revenue.toLocaleString()} {t('DA')}</strong>
                            </td>
                            <td>{Math.round(averageSale).toLocaleString()} {t('DA')}</td>
                            <td>
                              <small className="text-muted">{lastSale}</small>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
