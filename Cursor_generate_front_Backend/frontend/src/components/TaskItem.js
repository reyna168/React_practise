import React, { useState } from 'react';
import AttachmentUpload from './AttachmentUpload';
import AttachmentList from './AttachmentList';

function TaskItem({ task, onTaskUpdated, onTaskDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [loading, setLoading] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          completed: !task.completed,
        }),
      });

      if (response.ok) {
        onTaskUpdated({ ...task, completed: !task.completed });
      } else {
        const error = await response.json();
        alert('更新任務失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('更新任務時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          completed: task.completed,
        }),
      });

      if (response.ok) {
        onTaskUpdated({
          ...task,
          title: editTitle.trim(),
          description: editDescription.trim(),
        });
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert('更新任務失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('更新任務時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('確定要刪除這個任務嗎？')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onTaskDeleted(task.id);
      } else {
        const error = await response.json();
        alert('刪除任務失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('刪除任務時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setIsEditing(false);
  };

  const handleAttachmentUploaded = (attachment) => {
    // 可以在這裡添加通知或其他邏輯
    console.log('Attachment uploaded:', attachment);
  };

  const handleAttachmentDeleted = (attachmentId) => {
    // 可以在這裡添加通知或其他邏輯
    console.log('Attachment deleted:', attachmentId);
  };

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      task.completed 
        ? 'bg-gray-50 border-gray-200' 
        : 'bg-white border-gray-300 hover:border-primary-300'
    }`}>
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="任務標題"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="任務描述"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveEdit}
              disabled={loading || !editTitle.trim()}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              儲存
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={loading}
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start space-x-3">
          <button
            onClick={handleToggleComplete}
            disabled={loading}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-500'
            }`}
          >
            {task.completed && '✓'}
          </button>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium ${
              task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-sm mt-1 ${
                task.completed ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {task.description}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              建立時間: {new Date(task.createdAt).toLocaleString('zh-TW')}
            </p>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => setShowAttachments(!showAttachments)}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
              title="附件"
            >
              📎
            </button>
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="編輯"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="刪除"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
      
      {/* Attachments Section */}
      {showAttachments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-4">
            <AttachmentUpload 
              taskId={task.id} 
              onAttachmentUploaded={handleAttachmentUploaded}
            />
            <AttachmentList 
              taskId={task.id} 
              onAttachmentDeleted={handleAttachmentDeleted}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskItem;

