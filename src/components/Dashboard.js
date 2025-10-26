import React, { useState, useEffect } from 'react';
import { 
  FiCode, 
  FiCamera, 
  FiClock, 
  FiTrendingUp,
  FiZap,
  FiStar
} from 'react-icons/fi';
import { QRStorage } from '../utils/storage';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalGenerated: 0,
    totalScanned: 0,
    recentActivity: [],
  });

  useEffect(() => {
    const history = QRStorage.getHistory();
    const generated = history.filter(item => item.type === 'generated').length;
    const scanned = history.filter(item => item.type === 'scanned').length;
    const recent = history.slice(0, 5);

    setStats({
      totalGenerated: generated,
      totalScanned: scanned,
      recentActivity: recent,
    });
  }, []);

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ icon: Icon, title, description, onClick, color }) => (
    <div 
      className="card p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer animate-slide-up"
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here's your QR code activity overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={FiCode}
          title="QR Codes Generated"
          value={stats.totalGenerated}
          color="bg-primary-600"
        />
        <StatCard
          icon={FiCamera}
          title="QR Codes Scanned"
          value={stats.totalScanned}
          color="bg-green-600"
        />
        <StatCard
          icon={FiTrendingUp}
          title="Total Activity"
          value={stats.totalGenerated + stats.totalScanned}
          color="bg-purple-600"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            icon={FiCode}
            title="Generate QR Code"
            description="Create a new QR code from text, URL, or other data"
            color="bg-primary-600"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'generate' }))}
          />
          <QuickActionCard
            icon={FiCamera}
            title="Scan QR Code"
            description="Use your camera or upload an image to scan QR codes"
            color="bg-green-600"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'scan' }))}
          />
          <QuickActionCard
            icon={FiClock}
            title="View History"
            description="Browse your previously generated and scanned QR codes"
            color="bg-purple-600"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'history' }))}
          />
        </div>
      </div>

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="card">
            {stats.recentActivity.map((item, index) => (
              <div 
                key={item.id} 
                className={`p-4 flex items-center justify-between ${
                  index !== stats.recentActivity.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    item.type === 'generated' ? 'bg-primary-100 dark:bg-primary-900' : 'bg-green-100 dark:bg-green-900'
                  }`}>
                    {item.type === 'generated' ? (
                      <FiCode className={`w-4 h-4 ${
                        item.type === 'generated' ? 'text-primary-600' : 'text-green-600'
                      }`} />
                    ) : (
                      <FiCamera className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.type === 'generated' ? 'Generated' : 'Scanned'} QR Code
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                      {item.content || item.text || 'QR Code'}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started */}
      {stats.totalGenerated === 0 && stats.totalScanned === 0 && (
        <div className="card p-8 text-center animate-fade-in">
          <FiStar className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Welcome to DeskQR!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get started by generating your first QR code or scanning one with your camera.
          </p>
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
        </div>
      )}
    </div>
  );
};

export default Dashboard;