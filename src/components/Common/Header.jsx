import React from 'react';
import { LogOut, User } from 'lucide-react';

const Header = ({ currentUser, onLogout, title }) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {currentUser && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {currentUser.RepresentName} ({currentUser.RepCode})
                </span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 text-red-600 hover:text-red-800"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;