import React, { useState, useEffect } from 'react';
import { 
  FiHome, 
  FiCode, 
  FiCamera, 
  FiClock, 
  FiSettings, 
  FiSun, 
  FiMoon 
} from 'react-icons/fi';
import { useTheme } from '../hooks/useTheme';
import Dashboard from './Dashboard';
import QRGenerator from './QRGenerator';
import QRScanner from './QRScanner';
import History from './History';
import Settings from './Settings';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { theme, toggleTheme } = useTheme();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, component: Dashboard },
    { id: 'generate', label: 'Generate QR', icon: FiCode, component: QRGenerator },
    { id: 'scan', label: 'Scan QR', icon: FiCamera, component: QRScanner },
    { id: 'history', label: 'History', icon: FiClock, component: History },
    { id: 'settings', label: 'Settings', icon: FiSettings, component: Settings },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Dashboard;

  useEffect(() => {
    // Handle navigation events from main process (menu items)
    const handleNavigate = (event) => {
      setActiveTab(event.detail);
    };

    // Handle custom navigation events
    window.addEventListener('navigate', handleNavigate);

    // Handle Electron IPC navigation events if available
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      
      const handleIPCNavigate = (event, tabId) => {
        setActiveTab(tabId);
      };

      ipcRenderer.on('navigate', handleIPCNavigate);

      return () => {
        window.removeEventListener('navigate', handleNavigate);
        ipcRenderer.removeListener('navigate', handleIPCNavigate);
      };
    }

    return () => {
      window.removeEventListener('navigate', handleNavigate);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <FiCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">DeskQR</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">QR Code Manager</p>
            </div>
          </div>
        </div>

        <nav className="px-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item w-full text-left ${
                  activeTab === tab.id ? 'active' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            {theme === 'light' ? (
              <FiMoon className="w-5 h-5 mr-2" />
            ) : (
              <FiSun className="w-5 h-5 mr-2" />
            )}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
};

export default App;