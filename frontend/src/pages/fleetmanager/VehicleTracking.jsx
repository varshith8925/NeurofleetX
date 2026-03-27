import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import VehicleMap from '../../components/maps/VehicleMap';
import TelemetryManagement from '../fleetmanager/TelemetryManagement';
import Loading from '../../components/common/Loading';
import AlertBanner from '../../components/common/AlertBanner';
import LocationSearch from '../../components/common/LocationSearch';
import { MapPin, Car, Navigation, AlertTriangle, X } from 'lucide-react';
import vehicleService from '../../services/vehicleService';
import telemetryService from '../../services/telemetryService';
import toast from 'react-hot-toast';

const VehicleTracking = () => {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchTelemetry, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchVehicles(), fetchAlerts()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const [vehiclesRes, telemetryRes] = await Promise.all([
        vehicleService.getAllVehicles(),
        telemetryService.getAllLatestTelemetry()
      ]);

      const vehiclesWithTelemetry = (vehiclesRes.data || []).map(vehicle => {
        const vehicleTelemetry = (telemetryRes.data || []).find(t => t.vehicleId === vehicle.id);
        return {
          ...vehicle,
          latitude: vehicleTelemetry?.latitude || vehicle.latitude,
          longitude: vehicleTelemetry?.longitude || vehicle.longitude,
          speed: vehicleTelemetry?.speed || 0
        };
      });

      setVehicles(vehiclesWithTelemetry);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const alertsRes = await telemetryService.getAlerts();
      setAlerts(alertsRes.data || []);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const fetchTelemetry = async () => {
    try {
      const [telemetryRes, alertsRes] = await Promise.all([
        telemetryService.getAllLatestTelemetry(),
        telemetryService.getAlerts()
      ]);

      setVehicles(prev => prev.map(vehicle => {
        const vehicleTelemetry = (telemetryRes.data || []).find(t => t.vehicleId === vehicle.id);
        if (vehicleTelemetry) {
          return {
            ...vehicle,
            latitude: vehicleTelemetry.latitude,
            longitude: vehicleTelemetry.longitude,
            speed: vehicleTelemetry.speed
          };
        }
        return vehicle;
      }));

      setAlerts(alertsRes.data || []);

      // Update selected vehicle telemetry
      if (selectedVehicle) {
        const updatedTelemetry = (telemetryRes.data || []).find(t => t.vehicleId === selectedVehicle.id);
        if (updatedTelemetry) {
          setTelemetry(updatedTelemetry);
        }
      }
    } catch (error) {
      console.error('Failed to fetch telemetry:', error);
    }
  };

  const handleVehicleClick = async (vehicle) => {
    setSelectedVehicle(vehicle);
    setMapCenter([vehicle.latitude, vehicle.longitude]);
    
    try {
      const response = await telemetryService.getVehicleTelemetry(vehicle.id);
      if (response.success) {
        setTelemetry(response.data);
      }
    } catch (error) {
      console.error('Failed to get telemetry:', error);
      setTelemetry(null);
    }
  };

  const handleLocationSearch = (location) => {
    setMapCenter([location.lat, location.lng]);
    toast.success(`📍 Navigating to ${location.name.split(',')[0]}`);
  };

  const handleTelemetryUpdate = async () => {
    // Refresh all data
    await fetchVehicles();
    await fetchAlerts();
    
    // Refresh selected vehicle telemetry
    if (selectedVehicle) {
      try {
        const response = await telemetryService.getVehicleTelemetry(selectedVehicle.id);
        if (response.success) {
          setTelemetry(response.data);
        }
      } catch (error) {
        console.error('Failed to refresh telemetry:', error);
      }
    }
  };

  const handleDismissAlert = async (alertId, index) => {
    try {
      await telemetryService.acknowledgeAlert(alertId);
      setAlerts(prev => prev.filter((_, i) => i !== index));
      toast.success('Alert dismissed');
    } catch (error) {
      toast.error('Failed to dismiss alert');
    }
  };

  if (loading) {
    return <Loading message="Loading tracking data..." />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Vehicle Tracking</h1>
          <p className="text-gray-400 mt-1">Real-time GPS tracking and telemetry management</p>
        </div>

        {/* Location Search */}
        <div className="bg-neuro-light rounded-xl border border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-primary-400" />
            <span>Search Location on Map</span>
          </h3>
          <LocationSearch 
            onLocationSelect={handleLocationSearch}
            placeholder="Search for a city, address, landmark (e.g., MG Road, Bangalore)"
          />
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Active Alerts ({alerts.length})</span>
            </h3>
            {alerts.slice(0, 5).map((alert, index) => (
              <div
                key={alert.id || index}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  alert.type === 'OVERSPEEDING' ? 'bg-red-500/10 border-red-500/30' :
                  alert.type === 'LOW_FUEL' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  alert.type === 'HIGH_ENGINE_TEMP' ? 'bg-orange-500/10 border-orange-500/30' :
                  'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className={`w-5 h-5 ${
                    alert.type === 'OVERSPEEDING' ? 'text-red-400' :
                    alert.type === 'LOW_FUEL' ? 'text-yellow-400' :
                    alert.type === 'HIGH_ENGINE_TEMP' ? 'text-orange-400' :
                    'text-blue-400'
                  }`} />
                  <div>
                    <p className="text-white font-medium">{alert.vehicleName}</p>
                    <p className="text-gray-400 text-sm">{alert.message}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDismissAlert(alert.id, index)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 bg-neuro-light rounded-xl border border-gray-700 p-4">
            <div className="h-[500px]">
              <VehicleMap
                vehicles={vehicles}
                onVehicleClick={handleVehicleClick}
                selectedVehicle={selectedVehicle}
                center={mapCenter}
              />
            </div>
          </div>

          {/* Vehicle Details & Telemetry */}
          <div className="space-y-4">
            {selectedVehicle ? (
              <>
                {/* Vehicle Info */}
                <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                      <Car className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedVehicle.name}</h3>
                      <p className="text-gray-400 text-sm">{selectedVehicle.model} • {selectedVehicle.licensePlate}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-neuro-dark rounded-lg">
                      <span className="text-gray-400">Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedVehicle.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-400' :
                        selectedVehicle.status === 'IN_USE' ? 'bg-blue-500/20 text-blue-400' :
                        selectedVehicle.status === 'MAINTENANCE' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {selectedVehicle.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neuro-dark rounded-lg">
                      <span className="text-gray-400">Fuel Type</span>
                      <span className="text-white">{selectedVehicle.fuelType}</span>
                    </div>
                  </div>
                </div>

                {/* Telemetry Management */}
                <TelemetryManagement 
                  vehicle={selectedVehicle}
                  telemetry={telemetry}
                  onUpdate={handleTelemetryUpdate}
                />
              </>
            ) : (
              <div className="bg-neuro-light rounded-xl border border-gray-700 p-8 text-center">
                <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">Click on a vehicle marker to view details and edit telemetry</p>
              </div>
            )}

            {/* Vehicle List */}
            <div className="bg-neuro-light rounded-xl border border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">All Vehicles ({vehicles.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {vehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    onClick={() => handleVehicleClick(vehicle)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedVehicle?.id === vehicle.id
                        ? 'bg-primary-500/20 border border-primary-500/50'
                        : 'bg-neuro-dark hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        vehicle.status === 'AVAILABLE' ? 'bg-green-400' :
                        vehicle.status === 'IN_USE' ? 'bg-blue-400' :
                        vehicle.status === 'MAINTENANCE' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}></div>
                      <span className="text-white text-sm">{vehicle.name}</span>
                    </div>
                    <span className={`text-sm ${
                      vehicle.speed > 80 ? 'text-red-400 font-bold' : 'text-gray-400'
                    }`}>
                      {vehicle.speed?.toFixed(0) || 0} km/h
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VehicleTracking;