import React from 'react';

function Header({ activeTab, setActiveTab }) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-primary-600">
            任務管理系統
          </h1>
          
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
              }`}
            >
              任務管理
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
              }`}
            >
              用戶管理
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;

