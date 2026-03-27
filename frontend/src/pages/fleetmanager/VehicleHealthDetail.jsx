import React from 'react';
import { Gauge, Zap, Wind, Battery, Settings, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const VehicleHealthDetail = ({ health }) => {
  if (!health) {
    return (
      <div className="bg-neuro-light rounded-xl border border-gray-700 p-8 text-center">
        <p className="text-gray-400">No health data available</p>
      </div>
    );
  }

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHealthBg = (score) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 40) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getRiskBadge = (risk) => {
    const styles = {
      LOW: 'bg-green-500/20 text-green-400',
      MEDIUM: 'bg-yellow-500/20 text-yellow-400',
      HIGH: 'bg-orange-500/20 text-orange-400',
      CRITICAL: 'bg-red-500/20 text-red-400'
    };
    return styles[risk] || styles.LOW;
  };

  const components = [
    { name: 'Engine', score: health.engineHealthScore, icon: Gauge, color: '#6366f1' },
    { name: 'Brakes', score: health.brakeHealthScore, icon: AlertTriangle, color: '#ef4444' },
    { name: 'Tires', score: health.tireHealthScore, icon: Wind, color: '#3b82f6' },
    { name: 'Battery', score: health.batteryHealthScore, icon: Battery, color: '#10b981' },
    { name: 'Transmission', score: health.transmissionHealthScore, icon: Settings, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <div className={`rounded-xl border p-6 ${getHealthBg(health.overallHealthScore)}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Overall Health Score</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRiskBadge(health.riskLevel)}`}>
            {health.riskLevel} RISK
          </span>
        </div>
        <div className="flex items-end space-x-4">
          <div className={`text-6xl font-bold ${getHealthColor(health.overallHealthScore)}`}>
            {health.overallHealthScore}%
          </div>
          <div className="flex-1">
            <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
              <div 
                className={`h-4 rounded-full transition-all ${
                  health.overallHealthScore >= 80 ? 'bg-green-500' :
                  health.overallHealthScore >= 60 ? 'bg-yellow-500' :
                  health.overallHealthScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${health.overallHealthScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Health */}
      <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Component Health Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {components.map((component) => {
            const Icon = component.icon;
            return (
              <div key={component.name} className="bg-neuro-dark rounded-lg p-4 text-center">
                <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: component.color }} />
                <p className="text-gray-400 text-sm mb-2">{component.name}</p>
                <p className={`text-2xl font-bold ${getHealthColor(component.score)}`}>
                  {component.score}%
                </p>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="h-2 rounded-full"
                    style={{ 
                      width: `${component.score}%`,
                      backgroundColor: component.color
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Maintenance Prediction */}
      <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-primary-400" />
          <span>Maintenance Prediction</span>
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-400 text-sm mb-2">Predicted Maintenance In</p>
            <div className="flex items-end space-x-2">
              <p className={`text-4xl font-bold ${
                health.predictedMaintenanceDays <= 7 ? 'text-red-400' :
                health.predictedMaintenanceDays <= 30 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {health.predictedMaintenanceDays}
              </p>
              <p className="text-gray-400 text-lg mb-1">days</p>
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2">Recommendation</p>
            <div className={`p-3 rounded-lg border ${
              health.predictedMaintenanceDays <= 7 ? 'bg-red-500/10 border-red-500/30' :
              health.predictedMaintenanceDays <= 30 ? 'bg-yellow-500/10 border-yellow-500/30' :
              'bg-green-500/10 border-green-500/30'
            }`}>
              <p className="text-white text-sm">{health.maintenanceRecommendation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Usage Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-neuro-dark rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Distance</p>
            <p className="text-2xl font-bold text-white mt-1">{health.totalDistanceCovered?.toFixed(0) || 0} km</p>
          </div>
          <div className="bg-neuro-dark rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Trips</p>
            <p className="text-2xl font-bold text-white mt-1">{health.totalTripsCompleted || 0}</p>
          </div>
          <div className="bg-neuro-dark rounded-lg p-4">
            <p className="text-gray-400 text-sm">Avg Speed</p>
            <p className="text-2xl font-bold text-white mt-1">{health.averageSpeed?.toFixed(0) || 0} km/h</p>
          </div>
          <div className="bg-neuro-dark rounded-lg p-4">
            <p className="text-gray-400 text-sm">Last Maintenance</p>
            <p className="text-2xl font-bold text-white mt-1">{health.daysSinceLastMaintenance || 0} days</p>
          </div>
        </div>
      </div>

      {/* Anomalies */}
      {health.hasAnomalies && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
            <h3 className="text-lg font-semibold text-white">Anomalies Detected</h3>
          </div>
          <p className="text-red-400">{health.anomalyDetails}</p>
        </div>
      )}

      {/* Last Analysis */}
      <div className="text-right text-xs text-gray-500">
        Last analyzed: {health.lastAnalysis ? new Date(health.lastAnalysis).toLocaleString() : 'Never'}
      </div>
    </div>
  );
};

export default VehicleHealthDetail;