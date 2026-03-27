// frontend/src/pages/fleetmanager/ManagerDashboard.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import Loading from '../../components/common/Loading';
import AlertBanner from '../../components/common/AlertBanner';
import FleetStatsChart from '../../components/charts/FleetStatsChart';
import VehicleMap from '../../components/maps/VehicleMap';
import { Car, Activity, Wrench, AlertTriangle, MapPin } from 'lucide-react';
import vehicleService from '../../services/vehicleService';
import telemetryService from '../../services/telemetryService';
import toast from 'react-hot-toast';

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    inUse: 0,
    maintenance: 0,
    outOfService: 0
  });
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchTelemetryData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [vehicleStats, vehiclesData, alertsData] = await Promise.all([
        vehicleService.getVehicleStats(),
        vehicleService.getAllVehicles(),
        telemetryService.getAlerts()
      ]);

      setStats(vehicleStats.data || {});
      setVehicles(vehiclesData.data || []);
      setAlerts(alertsData.data || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTelemetryData = async () => {
    try {
      const [telemetryData, alertsData] = await Promise.all([
        telemetryService.getAllLatestTelemetry(),
        telemetryService.getAlerts()
      ]);

      // Update vehicle locations from telemetry
      if (telemetryData.data) {
        setVehicles(prev => prev.map(vehicle => {
          const telemetry = telemetryData.data.find(t => t.vehicleId === vehicle.id);
          if (telemetry) {
            return {
              ...vehicle,
              latitude: telemetry.latitude,
              longitude: telemetry.longitude,
              speed: telemetry.speed
            };
          }
          return vehicle;
        }));
      }

      setAlerts(alertsData.data || []);
    } catch (error) {
      console.error('Failed to fetch telemetry:', error);
    }
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Fleet Manager Dashboard</h1>
          <p className="text-gray-400 mt-1">Monitor and manage your fleet in real-time</p>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert, index) => (
              <AlertBanner
                key={index}
                type={alert.type === 'OVERSPEEDING' ? 'warning' : 'error'}
                message={`${alert.vehicleName}: ${alert.message}`}
                onClose={() => setAlerts(prev => prev.filter((_, i) => i !== index))}
              />
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Vehicles"
            value={stats.total || 0}
            icon={Car}
            color="primary"
          />
          <StatCard
            title="Available"
            value={stats.available || 0}
            icon={Activity}
            color="success"
          />
          <StatCard
            title="In Use"
            value={stats.inUse || 0}
            icon={MapPin}
            color="info"
          />
          <StatCard
            title="Maintenance"
            value={stats.maintenance || 0}
            icon={Wrench}
            color="warning"
          />
          <StatCard
            title="Out of Service"
            value={stats.outOfService || 0}
            icon={AlertTriangle}
            color="danger"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Vehicle Map */}
          <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Live Vehicle Tracking</h2>
            <div className="h-80">
              <VehicleMap vehicles={vehicles} />
            </div>
          </div>

          {/* Fleet Status Chart */}
          <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Fleet Status</h2>
            <FleetStatsChart data={stats} />
          </div>
        </div>

        {/* Recent Vehicles */}
        <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Vehicle Overview</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.slice(0, 6).map((vehicle) => (
              <div 
                key={vehicle.id}
                className="bg-neuro-dark rounded-lg p-4 border border-gray-700 hover:border-primary-500/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                      <Car className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{vehicle.name}</p>
                      <p className="text-gray-400 text-sm">{vehicle.model}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    vehicle.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-400' :
                    vehicle.status === 'IN_USE' ? 'bg-blue-500/20 text-blue-400' :
                    vehicle.status === 'MAINTENANCE' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{vehicle.licensePlate}</span>
                  {vehicle.speed !== undefined && (
                    <span className="text-gray-300">{vehicle.speed} km/h</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;