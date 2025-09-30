import React, { useState } from 'react';
import TaskItem from './TaskItem';

function TaskList({ tasks, onTaskUpdated, onTaskDeleted }) {
  const [filter, setFilter] = useState('all'); // all, completed, pending

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const pendingCount = tasks.filter(task => !task.completed).length;

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <p className="text-gray-600 text-lg">還沒有任何任務</p>
        <p className="text-gray-500">新增一個任務開始使用吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
          }`}
        >
          全部 ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
          }`}
        >
          待完成 ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
          }`}
        >
          已完成 ({completedCount})
        </button>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {filteredTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onTaskUpdated={onTaskUpdated}
            onTaskDeleted={onTaskDeleted}
          />
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">
            {filter === 'completed' ? '✅' : '⏳'}
          </div>
          <p className="text-gray-600">
            {filter === 'completed' ? '還沒有已完成的任務' : '沒有待完成的任務'}
          </p>
        </div>
      )}
    </div>
  );
}

export default TaskList;

