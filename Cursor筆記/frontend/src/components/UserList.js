import React from 'react';

function UserList({ users }) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-6xl mb-4">👥</div>
        <p className="text-gray-600 text-lg">還沒有任何用戶</p>
        <p className="text-gray-500">新增一個用戶開始使用吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map(user => (
        <div
          key={user.id}
          className="bg-white border border-gray-300 rounded-lg p-4 hover:border-primary-300 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {user.name}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {user.email}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                註冊時間: {new Date(user.createdAt).toLocaleString('zh-TW')}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                活躍用戶
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserList;

