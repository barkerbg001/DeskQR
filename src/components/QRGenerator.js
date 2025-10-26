import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  FiDownload, 
  FiCopy, 
  FiSave, 
  FiType, 
  FiLink, 
  FiPhone, 
  FiMail,
  FiWifi,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';
import { QRStorage, exportQRAsImage, copyToClipboard } from '../utils/storage';

const QRGenerator = () => {
  const [input, setInput] = useState('');
  const [qrType, setQrType] = useState('text');
  const [qrOptions, setQrOptions] = useState({
    size: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  });
  const [qrDataURL, setQrDataURL] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const canvasRef = useRef(null);

  const qrTypes = [
    { id: 'text', label: 'Text', icon: FiType, placeholder: 'Enter your text here...' },
    { id: 'url', label: 'URL', icon: FiLink, placeholder: 'https://example.com' },
    { id: 'phone', label: 'Phone', icon: FiPhone, placeholder: '+1234567890' },
    { id: 'email', label: 'Email', icon: FiMail, placeholder: 'user@example.com' },
    { id: 'wifi', label: 'WiFi', icon: FiWifi, placeholder: 'WIFI:T:WPA;S:NetworkName;P:Password;;' },
  ];

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const formatInput = (value, type) => {
    switch (type) {
      case 'url':
        return value.startsWith('http') ? value : `https://${value}`;
      case 'phone':
        return `tel:${value}`;
      case 'email':
        return `mailto:${value}`;
      case 'wifi':
        return value.startsWith('WIFI:') ? value : `WIFI:T:WPA;S:${value};P:;;`;
      default:
        return value;
    }
  };

  const generateQR = async () => {
    if (!input.trim()) {
      showNotification('Please enter some content to generate QR code', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const formattedInput = formatInput(input, qrType);
      const canvas = canvasRef.current;
      
      await QRCode.toCanvas(canvas, formattedInput, {
        width: qrOptions.size,
        margin: qrOptions.margin,
        color: qrOptions.color,
        errorCorrectionLevel: qrOptions.errorCorrectionLevel,
      });

      const dataURL = canvas.toDataURL();
      setQrDataURL(dataURL);

      // Save to history
      QRStorage.saveQR({
        type: 'generated',
        content: formattedInput,
        qrType,
        dataURL,
        options: qrOptions,
      });

      showNotification('QR code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      showNotification('Failed to generate QR code', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (format = 'png') => {
    if (!canvasRef.current) return;
    
    try {
      const filename = `qr-code-${Date.now()}`;
      await exportQRAsImage(canvasRef.current, filename, format);
      showNotification(`QR code downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      showNotification('Failed to download QR code', 'error');
    }
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(input);
      showNotification('Content copied to clipboard!');
    } catch (error) {
      showNotification('Failed to copy content', 'error');
    }
  };

  useEffect(() => {
    if (input.trim()) {
      const timeoutId = setTimeout(() => {
        generateQR();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setQrDataURL('');
    }
  }, [input, qrType, qrOptions]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Generate QR Code</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create QR codes for text, URLs, contact info, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* QR Type Selection */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">QR Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {qrTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setQrType(type.id)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center space-x-2 ${
                      qrType === type.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Input */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content</h3>
            <div className="space-y-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={qrTypes.find(t => t.id === qrType)?.placeholder}
                className="input-field h-32 resize-none"
                rows={4}
              />
              <div className="flex space-x-2">
                <button onClick={handleCopy} className="btn-secondary flex items-center">
                  <FiCopy className="w-4 h-4 mr-2" />
                  Copy
                </button>
                <button 
                  onClick={generateQR} 
                  disabled={isGenerating || !input.trim()}
                  className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : 'Generate QR'}
                </button>
              </div>
            </div>
          </div>

          {/* QR Options */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Options</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Size: {qrOptions.size}px
                </label>
                <input
                  type="range"
                  min="128"
                  max="512"
                  step="32"
                  value={qrOptions.size}
                  onChange={(e) => setQrOptions(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Foreground Color
                  </label>
                  <input
                    type="color"
                    value={qrOptions.color.dark}
                    onChange={(e) => setQrOptions(prev => ({ 
                      ...prev, 
                      color: { ...prev.color, dark: e.target.value }
                    }))}
                    className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={qrOptions.color.light}
                    onChange={(e) => setQrOptions(prev => ({ 
                      ...prev, 
                      color: { ...prev.color, light: e.target.value }
                    }))}
                    className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h3>
            <div className="flex flex-col items-center space-y-4">
              {qrDataURL ? (
                <>
                  <div className="p-4 bg-white rounded-lg shadow-inner">
                    <canvas
                      ref={canvasRef}
                      className="max-w-full h-auto"
                      style={{ display: qrDataURL ? 'block' : 'none' }}
                    />
                  </div>
                  
                  {/* Export Options */}
                  <div className="w-full space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Export Options</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleDownload('png')}
                        className="btn-secondary flex items-center justify-center"
                      >
                        <FiDownload className="w-4 h-4 mr-2" />
                        PNG
                      </button>
                      <button 
                        onClick={() => handleDownload('jpg')}
                        className="btn-secondary flex items-center justify-center"
                      >
                        <FiDownload className="w-4 h-4 mr-2" />
                        JPG
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-64 h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FiType className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Enter content to generate QR code
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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

export default QRGenerator;