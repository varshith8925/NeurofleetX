import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Edit, Gauge, Fuel, MapPin, Thermometer, Wind, Battery, AlertTriangle } from 'lucide-react';
import telemetryService from '../../services/telemetryService';
import toast from 'react-hot-toast';

// Modal Portal Component
const ModalPortal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        className="relative bg-neuro-light rounded-2xl shadow-2xl border border-gray-700 w-full max-w-2xl"
        style={{ zIndex: 100000 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

const TelemetryManagement = ({ vehicle, telemetry, onUpdate }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTelemetry, setCurrentTelemetry] = useState(telemetry);
  const [formData, setFormData] = useState({
    latitude: 0,
    longitude: 0,
    speed: 0,
    fuelLevel: 100,
    engineTemp: 70,
    tirePressure: 32,
    batteryLevel: 100
  });

  // Update current telemetry when prop changes
  useEffect(() => {
    setCurrentTelemetry(telemetry);
  }, [telemetry]);

  const handleEdit = () => {
    setFormData({
      latitude: currentTelemetry?.latitude || vehicle?.latitude || 12.9716,
      longitude: currentTelemetry?.longitude || vehicle?.longitude || 77.5946,
      speed: currentTelemetry?.speed || 0,
      fuelLevel: currentTelemetry?.fuelLevel || 100,
      engineTemp: currentTelemetry?.engineTemp || 70,
      tirePressure: currentTelemetry?.tirePressure || 32,
      batteryLevel: currentTelemetry?.batteryLevel || 100
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await telemetryService.updateTelemetry(vehicle.id, formData);
      
      if (response.success) {
        toast.success('Telemetry updated successfully!');
        
        // Update local state immediately
        setCurrentTelemetry(response.data);
        
        setModalOpen(false);
        
        // Call parent update function
        if (onUpdate) {
          onUpdate();
        }

        // Show alert warnings
        if (formData.speed > 80) {
          toast.error(`⚠️ Alert: Overspeeding detected! ${formData.speed} km/h`, { duration: 5000 });
        }
        if (formData.fuelLevel < 30) {
          toast.error(`⛽ Alert: Low fuel! ${formData.fuelLevel}%`, { duration: 5000 });
        }
        if (formData.engineTemp > 70) {
          toast.error(`🌡️ Alert: High temperature! ${formData.engineTemp}°C`, { duration: 5000 });
        }
      } else {
        toast.error(response.message || 'Failed to update telemetry');
      }
    } catch (error) {
      console.error('Error updating telemetry:', error);
      toast.error('Failed to update telemetry');
    } finally {
      setLoading(false);
    }
  };

  // Color functions based on thresholds
  const getFuelColor = (level) => {
    if (level === null || level === undefined) return 'text-gray-400';
    if (level > 50) return 'text-green-400';
    if (level > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getFuelBgColor = (level) => {
    if (level === null || level === undefined) return 'bg-gray-500/20';
    if (level > 50) return 'bg-green-500/20 border-green-500/30';
    if (level > 30) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getSpeedColor = (speed) => {
    if (speed === null || speed === undefined) return 'text-gray-400';
    if (speed > 80) return 'text-red-400';
    if (speed > 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getSpeedBgColor = (speed) => {
    if (speed === null || speed === undefined) return 'bg-gray-500/20';
    if (speed > 80) return 'bg-red-500/20 border-red-500/30';
    if (speed > 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-green-500/20 border-green-500/30';
  };

  const getTempColor = (temp) => {
    if (temp === null || temp === undefined) return 'text-gray-400';
    if (temp > 70) return 'text-red-400';
    if (temp > 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getTempBgColor = (temp) => {
    if (temp === null || temp === undefined) return 'bg-gray-500/20';
    if (temp > 70) return 'bg-red-500/20 border-red-500/30';
    if (temp > 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-green-500/20 border-green-500/30';
  };

  const displayTelemetry = currentTelemetry || telemetry;

  return (
    <>
      <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <span>📊 Telemetry Data</span>
          </h3>
          <button
            onClick={handleEdit}
            className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>

        {/* Alert Thresholds Info */}
        <div className="mb-4 p-3 bg-neuro-dark rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400 flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Alerts: Speed &gt; 80 km/h | Fuel &lt; 30% | Temp &gt; 70°C</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Speed */}
          <div className={`rounded-lg p-4 border ${getSpeedBgColor(displayTelemetry?.speed)}`}>
            <div className="flex items-center space-x-3">
              <Gauge className={`w-6 h-6 ${getSpeedColor(displayTelemetry?.speed)}`} />
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Speed</p>
                <p className={`text-2xl font-bold ${getSpeedColor(displayTelemetry?.speed)}`}>
                  {displayTelemetry?.speed?.toFixed(1) || 0} <span className="text-sm">km/h</span>
                </p>
              </div>
            </div>
            {displayTelemetry?.speed > 80 && (
              <div className="mt-2 flex items-center space-x-1 text-red-400 text-xs animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                <span>Overspeeding Alert!</span>
              </div>
            )}
          </div>

          {/* Fuel */}
          <div className={`rounded-lg p-4 border ${getFuelBgColor(displayTelemetry?.fuelLevel)}`}>
            <div className="flex items-center space-x-3">
              <Fuel className={`w-6 h-6 ${getFuelColor(displayTelemetry?.fuelLevel)}`} />
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Fuel Level</p>
                <p className={`text-2xl font-bold ${getFuelColor(displayTelemetry?.fuelLevel)}`}>
                  {displayTelemetry?.fuelLevel?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
            {displayTelemetry?.fuelLevel < 30 && (
              <div className="mt-2 flex items-center space-x-1 text-red-400 text-xs animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                <span>Low Fuel Alert!</span>
              </div>
            )}
          </div>

          {/* Engine Temp */}
          <div className={`rounded-lg p-4 border ${getTempBgColor(displayTelemetry?.engineTemp)}`}>
            <div className="flex items-center space-x-3">
              <Thermometer className={`w-6 h-6 ${getTempColor(displayTelemetry?.engineTemp)}`} />
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Engine Temp</p>
                <p className={`text-2xl font-bold ${getTempColor(displayTelemetry?.engineTemp)}`}>
                  {displayTelemetry?.engineTemp?.toFixed(1) || 0}°C
                </p>
              </div>
            </div>
            {displayTelemetry?.engineTemp > 70 && (
              <div className="mt-2 flex items-center space-x-1 text-red-400 text-xs animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                <span>High Temp Alert!</span>
              </div>
            )}
          </div>

          {/* Tire Pressure */}
          <div className="bg-neuro-dark rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-3">
              <Wind className="w-6 h-6 text-blue-400" />
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Tire Pressure</p>
                <p className="text-2xl font-bold text-white">
                  {displayTelemetry?.tirePressure?.toFixed(1) || 0} <span className="text-sm">PSI</span>
                </p>
              </div>
            </div>
          </div>

          {/* Battery (for EVs) */}
          {vehicle?.fuelType === 'ELECTRIC' && (
            <div className="bg-neuro-dark rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-3">
                <Battery className="w-6 h-6 text-green-400" />
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Battery</p>
                  <p className="text-2xl font-bold text-white">
                    {displayTelemetry?.batteryLevel?.toFixed(1) || 0}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          <div className={`${vehicle?.fuelType === 'ELECTRIC' ? '' : 'col-span-2'} bg-neuro-dark rounded-lg p-4 border border-gray-700`}>
            <div className="flex items-center space-x-3">
              <MapPin className="w-6 h-6 text-primary-400" />
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Current Location</p>
                <p className="text-white text-sm">
                  {displayTelemetry?.latitude?.toFixed(6) || vehicle?.latitude?.toFixed(6) || 'N/A'}, 
                  {' '}
                  {displayTelemetry?.longitude?.toFixed(6) || vehicle?.longitude?.toFixed(6) || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        {displayTelemetry?.timestamp && (
          <p className="text-xs text-gray-500 mt-4 text-right">
            Last updated: {new Date(displayTelemetry.timestamp).toLocaleString()}
          </p>
        )}
      </div>

      {/* Modal using Portal */}
      <ModalPortal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="✏️ Edit Telemetry Data"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Alert Thresholds Warning */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Alerts will be generated for: Speed &gt; 80 km/h | Fuel &lt; 30% | Temp &gt; 70°C</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Speed (km/h)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.speed}
                onChange={(e) => setFormData({ ...formData, speed: parseFloat(e.target.value) || 0 })}
                className={`w-full bg-neuro-dark border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  formData.speed > 80 ? 'border-red-500' : 'border-gray-600'
                }`}
                min="0"
                max="200"
              />
              {formData.speed > 80 && (
                <p className="text-red-400 text-xs mt-1">⚠️ Will trigger overspeeding alert!</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fuel Level (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.fuelLevel}
                onChange={(e) => setFormData({ ...formData, fuelLevel: parseFloat(e.target.value) || 0 })}
                className={`w-full bg-neuro-dark border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  formData.fuelLevel < 30 ? 'border-red-500' : 'border-gray-600'
                }`}
                min="0"
                max="100"
              />
              {formData.fuelLevel < 30 && (
                <p className="text-red-400 text-xs mt-1">⚠️ Will trigger low fuel alert!</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Engine Temp (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.engineTemp}
                onChange={(e) => setFormData({ ...formData, engineTemp: parseFloat(e.target.value) || 0 })}
                className={`w-full bg-neuro-dark border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  formData.engineTemp > 70 ? 'border-red-500' : 'border-gray-600'
                }`}
                min="0"
                max="150"
              />
              {formData.engineTemp > 70 && (
                <p className="text-red-400 text-xs mt-1">⚠️ Will trigger high temp alert!</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tire Pressure (PSI)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.tirePressure}
                onChange={(e) => setFormData({ ...formData, tirePressure: parseFloat(e.target.value) || 0 })}
                className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="0"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Battery Level (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.batteryLevel}
                onChange={(e) => setFormData({ ...formData, batteryLevel: parseFloat(e.target.value) || 0 })}
                className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="0"
                max="100"
              />
            </div>

            <div className="col-span-2">
              <hr className="border-gray-700 my-2" />
              <p className="text-sm font-medium text-gray-300 mb-3">📍 Location Coordinates</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Telemetry</span>
              )}
            </button>
          </div>
        </form>
      </ModalPortal>
    </>
  );
};

export default TelemetryManagement;