import React, { useState } from 'react';

function AttachmentUpload({ taskId, onAttachmentUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file) => {
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      setSelectedFile(file);
    } else if (file) {
      alert('檔案大小不能超過 10MB');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !taskId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const attachment = await response.json();
        onAttachmentUploaded(attachment);
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
      } else {
        const error = await response.json();
        alert('上傳失敗: ' + error.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('上傳時發生錯誤');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">上傳附件</h3>
      
      {/* Drag and Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          <div className="text-sm text-gray-600">
            <label
              htmlFor="file-input"
              className="cursor-pointer font-medium text-primary-600 hover:text-primary-500"
            >
              點擊選擇檔案
            </label>
            {' '}或拖拽檔案到這裡
          </div>
          
          <p className="text-xs text-gray-500">
            支援 JPG, PNG, GIF, PDF, DOC, DOCX, TXT, ZIP, RAR 格式，最大 10MB
          </p>
        </div>
        
        <input
          id="file-input"
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
        />
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? '上傳中...' : '上傳'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttachmentUpload;
