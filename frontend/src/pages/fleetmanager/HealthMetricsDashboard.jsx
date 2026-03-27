import React, { useState, useEffect } from 'react';
import { 
  Activity, AlertTriangle, CheckCircle, Clock, 
  TrendingUp, Wrench, Battery, Gauge, Wind, Zap 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import healthService from '../../services/healthService';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const HealthMetricsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchHealthMetrics();
  }, []);

  const fetchHealthMetrics = async () => {
    try {
      setLoading(true);
      const response = await healthService.getFleetHealthMetrics();
      if (response.success) {
        setMetrics(response.data);
      }
    } catch (error) {
      toast.error('Failed to load health metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeAll = async () => {
    setAnalyzing(true);
    try {
      const response = await healthService.analyzeAllVehicles();
      if (response.success) {
        toast.success('Fleet analysis completed!');
        await fetchHealthMetrics();
      }
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <Loading message="Loading health metrics..." />;
  }

  if (!metrics) {
    return <div className="text-white">No data available</div>;
  }

  const riskData = [
    { name: 'Low Risk', value: metrics.riskDistribution?.LOW || 0, color: '#10b981' },
    { name: 'Medium Risk', value: metrics.riskDistribution?.MEDIUM || 0, color: '#f59e0b' },
    { name: 'High Risk', value: metrics.riskDistribution?.HIGH || 0, color: '#ef4444' },
    { name: 'Critical', value: metrics.riskDistribution?.CRITICAL || 0, color: '#dc2626' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Activity className="w-7 h-7 text-primary-400" />
            <span>Fleet Health Metrics</span>
          </h2>
          <p className="text-gray-400 mt-1">AI-powered predictive maintenance dashboard</p>
        </div>
        <button
          onClick={handleAnalyzeAll}
          disabled={analyzing}
          className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
        >
          {analyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>Analyze All Vehicles</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Healthy Vehicles</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{metrics.healthyVehicles}</p>
              <p className="text-xs text-gray-500 mt-1">Health Score ≥ 80%</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Needs Attention</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{metrics.vehiclesNeedingAttention}</p>
              <p className="text-xs text-gray-500 mt-1">Health Score 50-80%</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Critical Vehicles</p>
              <p className="text-3xl font-bold text-red-400 mt-2">{metrics.criticalVehicles}</p>
              <p className="text-xs text-gray-500 mt-1">Health Score &lt; 50%</p>
            </div>
            <Activity className="w-12 h-12 text-red-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Fleet Health</p>
              <p className="text-3xl font-bold text-primary-400 mt-2">{metrics.averageFleetHealth}%</p>
              <p className="text-xs text-gray-500 mt-1">Overall performance</p>
            </div>
            <TrendingUp className="w-12 h-12 text-primary-400" />
          </div>
        </div>
      </div>

      {/* Maintenance Predictions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Next 7 Days</h3>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-orange-400">{metrics.vehiclesNeedingMaintenanceIn7Days}</p>
            <p className="text-gray-400 text-sm mt-2">Vehicles need maintenance</p>
          </div>
        </div>

        <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Wrench className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Next 30 Days</h3>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-yellow-400">{metrics.vehiclesNeedingMaintenanceIn30Days}</p>
            <p className="text-gray-400 text-sm mt-2">Scheduled maintenance</p>
          </div>
        </div>

        <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Anomalies Detected</h3>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-red-400">{metrics.vehiclesWithAnomalies}</p>
            <p className="text-gray-400 text-sm mt-2">Require immediate attention</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Legend
                formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Health Trend Line Chart */}
        <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Health Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.healthTrendData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" tick={{ fill: '#9ca3af' }} />
              <YAxis tick={{ fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Line type="monotone" dataKey="averageHealth" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Critical Vehicles Alert */}
      {metrics.criticalVehiclesList && metrics.criticalVehiclesList.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>Critical Vehicles - Immediate Action Required</span>
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.criticalVehiclesList.map((vehicle) => (
              <div key={vehicle.id} className="bg-neuro-dark rounded-lg p-4 border border-red-500/30">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-semibold">{vehicle.vehicleName}</h4>
                    <p className="text-gray-400 text-sm">{vehicle.licensePlate}</p>
                  </div>
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded font-semibold">
                    {vehicle.riskLevel}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Health Score</span>
                    <span className="text-red-400 font-bold">{vehicle.overallHealthScore}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${vehicle.overallHealthScore}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{vehicle.maintenanceRecommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Maintenance */}
      {metrics.upcomingMaintenanceList && metrics.upcomingMaintenanceList.length > 0 && (
        <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-yellow-400" />
            <span>Upcoming Maintenance (Next 7 Days)</span>
          </h3>
          <div className="space-y-3">
            {metrics.upcomingMaintenanceList.map((vehicle) => (
              <div key={vehicle.id} className="bg-neuro-dark rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{vehicle.vehicleName}</h4>
                    <p className="text-gray-400 text-sm">{vehicle.licensePlate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400 font-bold">{vehicle.predictedMaintenanceDays}</span>
                    <span className="text-gray-400 text-sm">days</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Health: {vehicle.overallHealthScore}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthMetricsDashboard;