import React, { useState, useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';

// Safe destructure: if an icon is missing from the library, fall back to a
// no-op component so rendering doesn't crash with "Element type is invalid".
const {
  FiCode = () => null,
  FiCamera = () => null,
  FiCopy = () => null,
  FiDownload = () => null,
  FiTrash2 = () => null,
  FiExternalLink = () => null,
  FiSearch = () => null,
  FiFilter = () => null,
  FiCalendar = () => null,
  FiCheck = () => null,
  FiAlertCircle = () => null,
  FiMoreVertical = () => null,
} = FiIcons;
import { QRStorage, copyToClipboard, exportQRAsImage } from '../utils/storage';

const History = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const loadHistory = () => {
    const historyData = QRStorage.getHistory();
    setHistory(historyData);
  };

  const filterAndSortHistory = () => {
    let filtered = history;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.text?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.type === filter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'content':
          return (a.content || a.text || '').localeCompare(b.content || b.text || '');
        default:
          return 0;
      }
    });

    setFilteredHistory(filtered);
  };

  const handleCopyContent = async (content) => {
    try {
      await copyToClipboard(content);
      showNotification('Content copied to clipboard!');
    } catch (error) {
      showNotification('Failed to copy content', 'error');
    }
  };

  const handleDownloadQR = async (item) => {
    if (!item.dataURL) {
      showNotification('QR code image not available for download', 'error');
      return;
    }

    try {
      // Create a temporary canvas from the data URL
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const filename = `qr-${item.id}`;
        await exportQRAsImage(canvas, filename, 'png');
        showNotification('QR code downloaded successfully!');
      };

      img.src = item.dataURL;
    } catch (error) {
      showNotification('Failed to download QR code', 'error');
    }
  };

  const handleDeleteItem = (id) => {
    try {
      QRStorage.deleteQR(id);
      loadHistory();
      showNotification('Item deleted successfully!');
    } catch (error) {
      showNotification('Failed to delete item', 'error');
    }
  };

  const handleDeleteSelected = () => {
    try {
      selectedItems.forEach(id => {
        QRStorage.deleteQR(id);
      });
      setSelectedItems(new Set());
      setShowDeleteConfirm(false);
      loadHistory();
      showNotification(`${selectedItems.size} items deleted successfully!`);
    } catch (error) {
      showNotification('Failed to delete selected items', 'error');
    }
  };

  const handleClearHistory = () => {
    try {
      QRStorage.clearHistory();
      setHistory([]);
      setFilteredHistory([]);
      setSelectedItems(new Set());
      showNotification('History cleared successfully!');
    } catch (error) {
      showNotification('Failed to clear history', 'error');
    }
  };

  const handleSelectItem = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredHistory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredHistory.map(item => item.id)));
    }
  };

  const isValidLink = (text) => {
    return text && (
      text.startsWith('http://') || 
      text.startsWith('https://') || 
      text.startsWith('mailto:') || 
      text.startsWith('tel:')
    );
  };

  const handleOpenLink = (url) => {
    window.open(url, '_blank');
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterAndSortHistory();
  }, [history, searchTerm, filter, sortBy]);

  const HistoryItem = ({ item, isSelected, onSelect }) => {
    const [showMenu, setShowMenu] = useState(false);
    const content = item.content || item.text || '';

    return (
      <div className={`card p-4 transition-all duration-200 ${
        isSelected ? 'ring-2 ring-primary-500' : ''
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(item.id)}
              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            
            <div className={`p-2 rounded-lg ${
              item.type === 'generated' 
                ? 'bg-primary-100 dark:bg-primary-900' 
                : 'bg-green-100 dark:bg-green-900'
            }`}>
              {item.type === 'generated' ? (
                <FiCode className={`w-5 h-5 ${
                  item.type === 'generated' ? 'text-primary-600' : 'text-green-600'
                }`} />
              ) : (
                <FiCamera className="w-5 h-5 text-green-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.type === 'generated'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                }`}>
                  {item.type === 'generated' ? 'Generated' : 'Scanned'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-sm text-gray-900 dark:text-white font-medium mb-1 truncate">
                {content.length > 50 ? `${content.substring(0, 50)}...` : content}
              </p>
              
              {item.qrType && (
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {item.qrType}
                </span>
              )}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiMoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      handleCopyContent(content);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <FiCopy className="w-4 h-4 mr-2" />
                    Copy Content
                  </button>
                  
                  {item.dataURL && (
                    <button
                      onClick={() => {
                        handleDownloadQR(item);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <FiDownload className="w-4 h-4 mr-2" />
                      Download QR
                    </button>
                  )}
                  
                  {isValidLink(content) && (
                    <button
                      onClick={() => {
                        handleOpenLink(content);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <FiExternalLink className="w-4 h-4 mr-2" />
                      Open Link
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      handleDeleteItem(item.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                  >
                    <FiTrash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">History</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage your QR code history.
          </p>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Types</option>
            <option value="generated">Generated</option>
            <option value="scanned">Scanned</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="content">By Content</option>
          </select>

          <div className="flex space-x-2">
            <button
              onClick={handleSelectAll}
              className="btn-secondary flex-1"
            >
              {selectedItems.size === filteredHistory.length ? 'Deselect All' : 'Select All'}
            </button>
            {selectedItems.size > 0 && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Delete ({selectedItems.size})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* History List */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              isSelected={selectedItems.has(item.id)}
              onSelect={handleSelectItem}
            />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <FiCalendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm || filter !== 'all' ? 'No matching items found' : 'No history yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Start by generating or scanning QR codes to build your history.'
            }
          </p>
          {!searchTerm && filter === 'all' && (
            <div className="flex justify-center space-x-4">
              <button 
                className="btn-primary"
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'generate' }))}
              >
                <FiCode className="w-4 h-4 mr-2" />
                Generate QR Code
              </button>
              <button 
                className="btn-secondary"
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'scan' }))}
              >
                <FiCamera className="w-4 h-4 mr-2" />
                Scan QR Code
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Selected Items
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete {selectedItems.size} selected item(s)? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? (
            <FiCheck className="w-5 h-5" />
          ) : (
            <FiAlertCircle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default History;