import React from 'react';
import { ArrowLeft } from 'lucide-react';

const ClientSelection = ({ 
  data, 
  setSelectedClient, 
  setCurrentScreen 
}) => {
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setCurrentScreen('confirmation');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => setCurrentScreen('packs')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Select Client</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.clients.map(client => (
            <div key={client.ClientID} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{client.FullName}</h3>
              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <p><span className="font-medium">ID:</span> {client.ClientID}</p>
                <p><span className="font-medium">Location:</span> {client.City}, {client.Wilaya}</p>
                <p><span className="font-medium">Phone:</span> {client.AllPhones}</p>
                <p><span className="font-medium">Address:</span> {client.Location}</p>
              </div>
              <button
                onClick={() => handleClientSelect(client)}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 font-medium"
              >
                Select Client
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientSelection;