import React, { useState } from 'react';
import { ArrowLeft, Search, Plus, Edit, MapPin, Phone, Users, Filter } from 'lucide-react';
import Header from '../Common/Header';

const ClientManagement = ({ 
  currentUser, 
  data, 
  setData,
  setCurrentScreen, 
  resetAppState 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [newClient, setNewClient] = useState({
    FullName: '',
    City: '',
    Wilaya: '',
    AllPhones: '',
    Location: ''
  });

  // Get unique cities for filter
  const cities = [...new Set(data.clients.map(client => client.City))].sort();

  // Filter clients
  const filteredClients = data.clients.filter(client => {
    const matchesSearch = client.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.City.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.AllPhones.includes(searchTerm);
    const matchesCity = cityFilter === 'all' || client.City === cityFilter;
    return matchesSearch && matchesCity;
  });

  // Get client statistics
  const getClientStats = (clientId) => {
    const clientSales = data.sales.filter(sale => sale.clientID === clientId);
    const totalSales = clientSales.length;
    const totalSpent = clientSales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
    const lastSale = clientSales.length > 0 ? 
      Math.max(...clientSales.map(sale => new Date(sale.createDate).getTime())) : null;
    
    return {
      totalSales,
      totalSpent,
      lastSale: lastSale ? new Date(lastSale) : null
    };
  };

  // Handle add/edit client
  const handleSaveClient = () => {
    if (!newClient.FullName || !newClient.City || !newClient.AllPhones) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingClient) {
      // Update existing client
      const updatedClients = data.clients.map(client => 
        client.ClientID === editingClient.ClientID ? 
        { ...editingClient, ...newClient } : client
      );
      setData({ ...data, clients: updatedClients });
      setEditingClient(null);
    } else {
      // Add new client
      const clientId = `C${(data.clients.length + 1).toString().padStart(3, '0')}`;
      const client = {
        ClientID: clientId,
        ...newClient
      };
      setData({ ...data, clients: [...data.clients, client] });
    }

    setNewClient({
      FullName: '',
      City: '',
      Wilaya: '',
      AllPhones: '',
      Location: ''
    });
    setShowAddForm(false);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setNewClient({
      FullName: client.FullName,
      City: client.City,
      Wilaya: client.Wilaya,
      AllPhones: client.AllPhones,
      Location: client.Location
    });
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
    setNewClient({
      FullName: '',
      City: '',
      Wilaya: '',
      AllPhones: '',
      Location: ''
    });
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentUser={currentUser} 
        onLogout={resetAppState}
        title="Client Management"
        setCurrentScreen={setCurrentScreen}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Clients ({filteredClients.length})
            </h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Client</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, city, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Add/Edit Client Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newClient.FullName}
                  onChange={(e) => setNewClient({ ...newClient, FullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={newClient.AllPhones}
                  onChange={(e) => setNewClient({ ...newClient, AllPhones: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={newClient.City}
                  onChange={(e) => setNewClient({ ...newClient, City: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter city"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wilaya
                </label>
                <input
                  type="text"
                  value={newClient.Wilaya}
                  onChange={(e) => setNewClient({ ...newClient, Wilaya: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter wilaya"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location/Address
                </label>
                <input
                  type="text"
                  value={newClient.Location}
                  onChange={(e) => setNewClient({ ...newClient, Location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter full address"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClient}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {editingClient ? 'Update Client' : 'Add Client'}
              </button>
            </div>
          </div>
        )}

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const stats = getClientStats(client.ClientID);
            return (
              <div key={client.ClientID} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {client.FullName}
                    </h3>
                    <p className="text-sm text-gray-500">ID: {client.ClientID}</p>
                  </div>
                  <button
                    onClick={() => handleEditClient(client)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{client.City}, {client.Wilaya}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{client.AllPhones}</span>
                  </div>
                  {client.Location && (
                    <div className="text-sm text-gray-500">
                      {client.Location}
                    </div>
                  )}
                </div>
                
                {/* Client Statistics */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-indigo-600">{stats.totalSales}</p>
                      <p className="text-xs text-gray-500">Total Sales</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-green-600">
                        ${stats.totalSpent.toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500">Total Spent</p>
                    </div>
                  </div>
                  {stats.lastSale && (
                    <div className="mt-2 text-center">
                      <p className="text-xs text-gray-500">
                        Last sale: {stats.lastSale.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || cityFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Get started by adding your first client'
              }
            </p>
            {!searchTerm && cityFilter === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Client
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientManagement;
