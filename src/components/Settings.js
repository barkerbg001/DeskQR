import React, { useState, useEffect } from 'react';
import { 
  FiSettings, 
  FiPalette, 
  FiDownload, 
  FiCamera, 
  FiMonitor,
  FiInfo,
  FiCheck,
  FiAlertCircle,
  FiSun,
  FiMoon,
  FiHelpCircle,
  FiGithub,
  FiMail
} from 'react-icons/fi';
import { useTheme } from '../hooks/useTheme';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    autoSave: true,
    defaultQRSize: 256,
    defaultFormat: 'png',
    scanDelay: 500,
    maxHistoryItems: 100,
    soundEnabled: false,
    autoDownload: false,
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('deskqr-settings');
      if (savedSettings) {
        setSettings({ ...settings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = (newSettings) => {
    try {
      localStorage.setItem('deskqr-settings', JSON.stringify(newSettings));
      setSettings(newSettings);
      showNotification('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Failed to save settings', 'error');
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const resetSettings = () => {
    const defaultSettings = {
      autoSave: true,
      defaultQRSize: 256,
      defaultFormat: 'png',
      scanDelay: 500,
      maxHistoryItems: 100,
      soundEnabled: false,
      autoDownload: false,
    };
    saveSettings(defaultSettings);
    showNotification('Settings reset to defaults!');
  };

  const exportSettings = () => {
    try {
      const settingsData = {
        settings,
        theme,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };
      
      const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `deskqr-settings-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      showNotification('Settings exported successfully!');
    } catch (error) {
      showNotification('Failed to export settings', 'error');
    }
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (importedData.settings) {
          saveSettings(importedData.settings);
        }
        
        showNotification('Settings imported successfully!');
      } catch (error) {
        showNotification('Failed to import settings - invalid file format', 'error');
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const SettingGroup = ({ title, children }) => (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const SettingRow = ({ icon: Icon, label, description, children }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center">
        {children}
      </div>
    </div>
  );

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Customize your DeskQR experience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <SettingGroup title="Appearance">
          <SettingRow
            icon={theme === 'light' ? FiSun : FiMoon}
            label="Theme"
            description="Choose between light and dark theme"
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {theme === 'light' ? 'Light' : 'Dark'}
              </span>
              <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
            </div>
          </SettingRow>
        </SettingGroup>

        {/* QR Code Settings */}
        <SettingGroup title="QR Code Generation">
          <SettingRow
            icon={FiDownload}
            label="Default QR Size"
            description="Default size for generated QR codes"
          >
            <select
              value={settings.defaultQRSize}
              onChange={(e) => handleSettingChange('defaultQRSize', parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={128}>128px</option>
              <option value={256}>256px</option>
              <option value={512}>512px</option>
              <option value={1024}>1024px</option>
            </select>
          </SettingRow>

          <SettingRow
            icon={FiDownload}
            label="Default Export Format"
            description="Default file format for downloads"
          >
            <select
              value={settings.defaultFormat}
              onChange={(e) => handleSettingChange('defaultFormat', e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="svg">SVG</option>
            </select>
          </SettingRow>

          <SettingRow
            icon={FiDownload}
            label="Auto Download"
            description="Automatically download generated QR codes"
          >
            <Toggle 
              checked={settings.autoDownload} 
              onChange={(value) => handleSettingChange('autoDownload', value)} 
            />
          </SettingRow>
        </SettingGroup>

        {/* Scanner Settings */}
        <SettingGroup title="QR Code Scanner">
          <SettingRow
            icon={FiCamera}
            label="Scan Delay"
            description="Delay between scan attempts (milliseconds)"
          >
            <select
              value={settings.scanDelay}
              onChange={(e) => handleSettingChange('scanDelay', parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={100}>100ms</option>
              <option value={250}>250ms</option>
              <option value={500}>500ms</option>
              <option value={1000}>1000ms</option>
            </select>
          </SettingRow>

          <SettingRow
            icon={FiCamera}
            label="Sound Effects"
            description="Play sound when QR code is detected"
          >
            <Toggle 
              checked={settings.soundEnabled} 
              onChange={(value) => handleSettingChange('soundEnabled', value)} 
            />
          </SettingRow>
        </SettingGroup>

        {/* Data Management */}
        <SettingGroup title="Data Management">
          <SettingRow
            icon={FiSettings}
            label="Auto Save"
            description="Automatically save QR codes to history"
          >
            <Toggle 
              checked={settings.autoSave} 
              onChange={(value) => handleSettingChange('autoSave', value)} 
            />
          </SettingRow>

          <SettingRow
            icon={FiSettings}
            label="Max History Items"
            description="Maximum number of items to keep in history"
          >
            <select
              value={settings.maxHistoryItems}
              onChange={(e) => handleSettingChange('maxHistoryItems', parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
            </select>
          </SettingRow>
        </SettingGroup>
      </div>

      {/* Settings Management */}
      <SettingGroup title="Settings Management">
        <div className="flex flex-wrap gap-3">
          <button onClick={exportSettings} className="btn-secondary flex items-center">
            <FiDownload className="w-4 h-4 mr-2" />
            Export Settings
          </button>
          
          <label className="btn-secondary flex items-center cursor-pointer">
            <FiDownload className="w-4 h-4 mr-2" />
            Import Settings
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
            />
          </label>
          
          <button 
            onClick={resetSettings} 
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
          >
            <FiSettings className="w-4 h-4 mr-2" />
            Reset to Defaults
          </button>
        </div>
      </SettingGroup>

      {/* About */}
      <SettingGroup title="About DeskQR">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <FiInfo className="w-5 h-5 text-primary-600" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Version 1.0.0</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A modern desktop QR code generator and scanner
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <FiMonitor className="w-5 h-5 text-primary-600" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Built with</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Electron, React, and Tailwind CSS
              </p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button className="btn-secondary flex items-center">
              <FiGithub className="w-4 h-4 mr-2" />
              View on GitHub
            </button>
            <button className="btn-secondary flex items-center">
              <FiHelpCircle className="w-4 h-4 mr-2" />
              Help & Support
            </button>
          </div>
        </div>
      </SettingGroup>

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

export default Settings;