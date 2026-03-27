// frontend/src/components/common/AlertBanner.jsx
import React from 'react';
import { AlertTriangle, X, Info, CheckCircle, AlertCircle } from 'lucide-react';

const AlertBanner = ({ type = 'info', message, onClose }) => {
  const configs = {
    info: {
      bg: 'bg-blue-500/10 border-blue-500/50',
      icon: Info,
      iconColor: 'text-blue-400'
    },
    success: {
      bg: 'bg-green-500/10 border-green-500/50',
      icon: CheckCircle,
      iconColor: 'text-green-400'
    },
    warning: {
      bg: 'bg-yellow-500/10 border-yellow-500/50',
      icon: AlertTriangle,
      iconColor: 'text-yellow-400'
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/50',
      icon: AlertCircle,
      iconColor: 'text-red-400'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} border rounded-lg p-4 flex items-center justify-between animate-fadeIn`}>
      <div className="flex items-center space-x-3">
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
        <span className="text-gray-300">{message}</span>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;