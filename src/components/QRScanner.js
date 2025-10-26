import React, { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import jsQR from 'jsqr';
import { 
  FiCamera, 
  FiUpload, 
  FiCopy, 
  FiExternalLink,
  FiCheck,
  FiAlertCircle,
  FiStopCircle,
  FiPlay,
  FiRefreshCw
} from 'react-icons/fi';
import { QRStorage, copyToClipboard } from '../utils/storage';

const QRScanner = () => {
  const [scanMode, setScanMode] = useState('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const html5QrCodeScannerRef = useRef(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleScanSuccess = (decodedText, decodedResult) => {
    setScanResult({
      text: decodedText,
      result: decodedResult,
      timestamp: new Date().toISOString(),
    });

    // Save to history
    QRStorage.saveQR({
      type: 'scanned',
      content: decodedText,
      scanMode,
    });

    showNotification('QR code scanned successfully!');
    stopScanning();
  };

  const handleScanError = (error) => {
    // Don't show errors for each failed scan attempt
    console.log('Scan error:', error);
  };

  const startCameraScanning = async () => {
    try {
      setError('');
      setIsScanning(true);

      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      html5QrCodeScannerRef.current = scanner;
      scanner.render(handleScanSuccess, handleScanError);
    } catch (err) {
      setError('Failed to start camera. Please ensure camera permissions are granted.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (html5QrCodeScannerRef.current) {
      html5QrCodeScannerRef.current.clear();
      html5QrCodeScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        handleScanSuccess(code.data, code);
      } else {
        setError('No QR code found in the uploaded image.');
        showNotification('No QR code found in the image', 'error');
      }
    };

    img.src = URL.createObjectURL(file);
  };

  const handleCopyResult = async () => {
    if (!scanResult) return;
    
    try {
      await copyToClipboard(scanResult.text);
      showNotification('Result copied to clipboard!');
    } catch (error) {
      showNotification('Failed to copy result', 'error');
    }
  };

  const handleOpenLink = () => {
    if (!scanResult) return;
    
    const text = scanResult.text;
    if (text.startsWith('http://') || text.startsWith('https://')) {
      window.open(text, '_blank');
    } else if (text.startsWith('mailto:')) {
      window.open(text);
    } else if (text.startsWith('tel:')) {
      window.open(text);
    } else {
      showNotification('Content is not a valid link', 'error');
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

  const resetScanner = () => {
    setScanResult(null);
    setError('');
    if (scanMode === 'camera' && !isScanning) {
      startCameraScanning();
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scan QR Code</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Use your camera or upload an image to scan QR codes.
        </p>
      </div>

      {/* Scan Mode Selection */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scan Mode</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setScanMode('camera');
              stopScanning();
              setScanResult(null);
              setError('');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              scanMode === 'camera'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <FiCamera className="w-4 h-4" />
            <span>Camera</span>
          </button>
          <button
            onClick={() => {
              setScanMode('upload');
              stopScanning();
              setScanResult(null);
              setError('');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              scanMode === 'upload'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <FiUpload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {scanMode === 'camera' ? 'Camera Scanner' : 'Upload Image'}
              </h3>
              {scanMode === 'camera' && (
                <div className="flex space-x-2">
                  {!isScanning ? (
                    <button
                      onClick={startCameraScanning}
                      className="btn-primary flex items-center"
                    >
                      <FiPlay className="w-4 h-4 mr-2" />
                      Start
                    </button>
                  ) : (
                    <button
                      onClick={stopScanning}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
                    >
                      <FiStopCircle className="w-4 h-4 mr-2" />
                      Stop
                    </button>
                  )}
                </div>
              )}
            </div>

            {scanMode === 'camera' ? (
              <div className="space-y-4">
                <div 
                  id="qr-reader" 
                  className="w-full"
                  style={{ 
                    display: isScanning ? 'block' : 'none',
                  }}
                />
                {!isScanning && !scanResult && (
                  <div className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FiCamera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Click "Start" to begin camera scanning
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-primary-500 transition-colors duration-200"
                >
                  <div className="text-center">
                    <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Click to upload an image with QR code
                    </p>
                  </div>
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg flex items-center space-x-2">
                <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scan Result</h3>
              {scanResult && (
                <button
                  onClick={resetScanner}
                  className="btn-secondary flex items-center"
                >
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  New Scan
                </button>
              )}
            </div>

            {scanResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Scanned Content:</p>
                  <p className="text-gray-900 dark:text-white font-mono text-sm break-all">
                    {scanResult.text}
                  </p>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Scanned at: {new Date(scanResult.timestamp).toLocaleString()}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleCopyResult}
                    className="btn-secondary flex items-center"
                  >
                    <FiCopy className="w-4 h-4 mr-2" />
                    Copy
                  </button>
                  {isValidLink(scanResult.text) && (
                    <button
                      onClick={handleOpenLink}
                      className="btn-primary flex items-center"
                    >
                      <FiExternalLink className="w-4 h-4 mr-2" />
                      Open Link
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FiCamera className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No QR code scanned yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Scan result will appear here
                </p>
              </div>
            )}
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

export default QRScanner;