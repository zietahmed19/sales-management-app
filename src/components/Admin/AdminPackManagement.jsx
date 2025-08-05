import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, DollarSign, TrendingUp, Users, Save, X, ArrowLeft } from 'lucide-react';

const AdminPackManagement = ({ resetAppState, setCurrentScreen }) => {
  const [packs, setPacks] = useState([]);
  const [articles, setArticles] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [formData, setFormData] = useState({
    pack_name: '',
    total_price: '',
    articles: [],
    gift_id: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const apiBase = baseURL.replace('/api', '');

      // Fetch packs, articles, and gifts
      const [packsResponse, articlesResponse, giftsResponse] = await Promise.all([
        fetch(`${apiBase}/api/admin/packs`, { headers }),
        fetch(`${apiBase}/api/articles`, { headers }),
        fetch(`${apiBase}/api/gifts`, { headers })
      ]);

      if (!packsResponse.ok || !articlesResponse.ok || !giftsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [packsData, articlesData, giftsData] = await Promise.all([
        packsResponse.json(),
        articlesResponse.json(),
        giftsResponse.json()
      ]);

      setPacks(packsData);
      setArticles(articlesData);
      setGifts(giftsData);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    if (resetAppState) {
      resetAppState();
    }
  };

  const resetForm = () => {
    setFormData({
      pack_name: '',
      total_price: '',
      articles: [],
      gift_id: null
    });
    setEditingPack(null);
    setShowAddForm(false);
  };

  const handleEdit = (pack) => {
    setFormData({
      pack_name: pack.pack_name,
      total_price: pack.total_price,
      articles: pack.articles || [],
      gift_id: pack.gift?.id || null
    });
    setEditingPack(pack);
    setShowAddForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.pack_name.trim() || !formData.total_price) {
      alert('Please fill in pack name and total price');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const apiBase = baseURL.replace('/api', '');

      const url = editingPack 
        ? `${apiBase}/api/admin/packs/${editingPack.id}`
        : `${apiBase}/api/admin/packs`;
      
      const method = editingPack ? 'PUT' : 'POST';

      // Log the data being sent for debugging
      console.log('Sending pack data:', formData);
      console.log('URL:', url);
      console.log('Method:', method);

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          throw new Error(`Server error (${response.status}): ${errorText}`);
        }
        throw new Error(errorData.message || `Server error (${response.status})`);
      }

      const result = await response.json();
      alert(result.message);
      
      resetForm();
      fetchData(); // Refresh the pack list
    } catch (error) {
      console.error('Error saving pack:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (pack) => {
    if (!window.confirm(`Are you sure you want to delete "${pack.pack_name}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const apiBase = baseURL.replace('/api', '');

      const response = await fetch(`${apiBase}/api/admin/packs/${pack.id}`, {
        method: 'DELETE',
        headers
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete pack');
      }

      alert(result.message);
      fetchData(); // Refresh the pack list
    } catch (error) {
      console.error('Error deleting pack:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleArticleToggle = (article) => {
    const isSelected = formData.articles.some(a => a.id === article.id);
    
    if (isSelected) {
      setFormData({
        ...formData,
        articles: formData.articles.filter(a => a.id !== article.id)
      });
    } else {
      setFormData({
        ...formData,
        articles: [...formData.articles, { ...article, quantity: 1 }]
      });
    }
  };

  const handleArticleQuantityChange = (articleId, quantity) => {
    setFormData({
      ...formData,
      articles: formData.articles.map(a => 
        a.id === articleId ? { ...a, quantity: parseInt(quantity) || 1 } : a
      )
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Loading pack data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-xl text-gray-800 mb-2">Error loading data</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalPacks = packs.length;
  const totalRevenue = packs.reduce((sum, pack) => sum + (pack.sales_stats?.total_revenue || 0), 0);
  const totalSales = packs.reduce((sum, pack) => sum + (pack.sales_stats?.total_sales || 0), 0);
  const averagePackPrice = totalPacks > 0 ? (packs.reduce((sum, pack) => sum + pack.total_price, 0) / totalPacks) : 0;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              إدارة الحزم
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentScreen && setCurrentScreen('admin')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                لوحة التحكم
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة حزمة جديدة
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الحزم</p>
                <p className="text-2xl font-bold text-gray-900">{totalPacks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString('ar-DZ')} دج</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">متوسط سعر الحزمة</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(averagePackPrice).toLocaleString('ar-DZ')} دج</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingPack ? 'تعديل الحزمة' : 'إضافة حزمة جديدة'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الحزمة *
                  </label>
                  <input
                    type="text"
                    value={formData.pack_name}
                    onChange={(e) => setFormData({...formData, pack_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر الإجمالي (دج) *
                  </label>
                  <input
                    type="number"
                    value={formData.total_price}
                    onChange={(e) => setFormData({...formData, total_price: parseFloat(e.target.value) || ''})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الهدية (اختيارية)
                </label>
                <select
                  value={formData.gift_id || ''}
                  onChange={(e) => setFormData({...formData, gift_id: e.target.value || null})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">بدون هدية</option>
                  {gifts.map(gift => (
                    <option key={gift.id} value={gift.id}>
                      {gift.gift_name} - {gift.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المقالات
                </label>
                <div className="border border-gray-300 rounded-md p-4 max-h-64 overflow-y-auto">
                  {articles.map(article => {
                    const isSelected = formData.articles.some(a => a.id === article.id);
                    const selectedArticle = formData.articles.find(a => a.id === article.id);
                    
                    return (
                      <div key={article.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleArticleToggle(article)}
                            className="mr-3"
                          />
                          <div>
                            <span className="font-medium">{article.name}</span>
                            <span className="text-gray-500 text-sm mr-2">({article.price} دج)</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex items-center">
                            <label className="text-sm mr-2">الكمية:</label>
                            <input
                              type="number"
                              value={selectedArticle?.quantity || 1}
                              onChange={(e) => handleArticleQuantityChange(article.id, e.target.value)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                              min="1"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {editingPack ? 'حفظ التغييرات' : 'إضافة الحزمة'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Packs Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">قائمة الحزم ({totalPacks} حزمة)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم الحزمة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعر</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المقالات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الهدية</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبيعات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإيرادات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">هامش الربح</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {packs.map((pack) => (
                  <tr key={pack.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pack.pack_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pack.total_price.toLocaleString('ar-DZ')} دج
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pack.articles_count} مقال
                      <div className="text-xs text-gray-400">
                        كلفة: {pack.articles_cost?.toLocaleString('ar-DZ')} دج
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pack.gift ? pack.gift.gift_name : 'بدون هدية'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pack.sales_stats?.total_sales || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(pack.sales_stats?.total_revenue || 0).toLocaleString('ar-DZ')} دج
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        (pack.sales_stats?.profit_margin || 0) > 30 
                          ? 'bg-green-100 text-green-800' 
                          : (pack.sales_stats?.profit_margin || 0) > 15
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {pack.sales_stats?.profit_margin || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(pack)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pack)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {packs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                لا توجد حزم متاحة. انقر على "إضافة حزمة جديدة" لإضافة الحزمة الأولى.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPackManagement;
