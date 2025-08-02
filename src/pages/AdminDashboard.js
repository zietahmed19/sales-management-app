import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [delegates, setDelegates] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchAdminData();
  }, [selectedPeriod]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch all delegates
      const delegatesResponse = await fetch('/api/admin/delegates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const delegatesData = await delegatesResponse.json();
      setDelegates(delegatesData);

      // Fetch consolidated sales data
      const salesResponse = await fetch(`/api/admin/sales?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const salesData = await salesResponse.json();
      setSalesData(salesData);
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) return <div className="text-center p-4">{t('loading')}</div>;

  const topPerformer = getTopPerformer();

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-3">{t('adminDashboard')}</h1>
          
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
                          <td>{delegate.username}</td>
                          <td>{delegate.territory}</td>
                          <td>{delegateSales.length}</td>
                          <td>{revenue.toLocaleString()} {t('DA')}</td>
                          <td>{averageSale.toLocaleString()} {t('DA')}</td>
                          <td>{lastSale}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
