// Storage utility for QR code history
export class QRStorage {
  static STORAGE_KEY = 'deskqr-history';

  static getHistory() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading QR history:', error);
      return [];
    }
  }

  static saveQR(qrData) {
    try {
      const history = this.getHistory();
      const newEntry = {
        id: Date.now().toString(),
        ...qrData,
        timestamp: new Date().toISOString(),
      };
      
      const updatedHistory = [newEntry, ...history.slice(0, 99)]; // Keep last 100 entries
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory));
      return newEntry;
    } catch (error) {
      console.error('Error saving QR to history:', error);
      return null;
    }
  }

  static deleteQR(id) {
    try {
      const history = this.getHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory));
      return true;
    } catch (error) {
      console.error('Error deleting QR from history:', error);
      return false;
    }
  }

  static clearHistory() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing QR history:', error);
      return false;
    }
  }
}

// Export utility functions
export const exportQRAsImage = async (canvas, filename, format = 'png') => {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.download = `${filename}.${format}`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        resolve(true);
      }, `image/${format}`);
    } catch (error) {
      reject(error);
    }
  });
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};