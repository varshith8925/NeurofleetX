import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import AlertBanner from '../../components/common/AlertBanner';
import HealthMetricsDashboard from '../fleetmanager/HealthMetricsDashboard';
import VehicleHealthDetail from '../../pages/fleetmanager/VehicleHealthDetail';
import { Plus, Wrench, CheckCircle, AlertTriangle, Calendar, Activity, TrendingUp } from 'lucide-react';
import maintenanceService from '../../services/maintenanceService';
import vehicleService from '../../services/vehicleService';
import healthService from '../../services/healthService';
import toast from 'react-hot-toast';

const MaintenanceManagement = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('health'); // 'health' or 'maintenance'
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [selectedVehicleHealth, setSelectedVehicleHealth] = useState(null);
  const [formData, setFormData] = useState({
    vehicleId: '',
    maintenanceType: '',
    description: '',
    scheduledDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [maintenanceRes, vehiclesRes, overdueRes] = await Promise.all([
        maintenanceService.getAllMaintenance(),
        vehicleService.getAllVehicles(),
        maintenanceService.getOverdueMaintenance()
      ]);
      setMaintenanceRecords(maintenanceRes.data || []);
      setVehicles(vehiclesRes.data || []);
      setOverdue(overdueRes.data || []);
    } catch (error) {
      toast.error('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await maintenanceService.createMaintenance(formData);
      toast.success('Maintenance scheduled successfully');
      setModalOpen(false);
      setFormData({ vehicleId: '', maintenanceType: '', description: '', scheduledDate: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to schedule maintenance');
    }
  };

  const handleComplete = async (id) => {
    try {
      await maintenanceService.completeMaintenance(id);
      toast.success('Maintenance marked as complete');
      fetchData();
    } catch (error) {
      toast.error('Failed to complete maintenance');
    }
  };

  const handleViewHealth = async (vehicleId) => {
    try {
      const response = await healthService.getVehicleHealth(vehicleId);
      if (response.success) {
        setSelectedVehicleHealth(response.data);
        setHealthModalOpen(true);
      }
    } catch (error) {
      toast.error('Failed to load vehicle health');
    }
  };

  const columns = [
    {
      header: 'Vehicle',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-white font-medium">{row.vehicleName}</p>
            <p className="text-gray-400 text-sm">{row.vehicleLicensePlate}</p>
          </div>
        </div>
      )
    },
    { header: 'Type', accessor: 'maintenanceType' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Scheduled Date',
      render: (row) => (
        <span className="text-gray-300">
          {new Date(row.scheduledDate).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
          row.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
          row.status === 'OVERDUE' ? 'bg-red-500/20 text-red-400' :
          'bg-yellow-500/20 text-yellow-400'
        }`}>
          {row.status}
        </span>
      )
    }
  ];

  const actions = (row) => (
    <div className="flex items-center space-x-2">
      {row.status !== 'COMPLETED' && (
        <button
          onClick={() => handleComplete(row.id)}
          className="flex items-center space-x-1 px-3 py-1.5 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Complete</span>
        </button>
      )}
      <button
        onClick={() => handleViewHealth(row.vehicleId)}
        className="flex items-center space-x-1 px-3 py-1.5 text-primary-400 hover:bg-primary-500/20 rounded-lg transition-colors"
      >
        <Activity className="w-4 h-4" />
        <span className="text-sm">Health</span>
      </button>
    </div>
  );

  if (loading) {
    return <Loading message="Loading maintenance data..." />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Maintenance & Health Management</h1>
            <p className="text-gray-400 mt-1">AI-powered predictive maintenance & fleet health monitoring</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Schedule Maintenance</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('health')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'health'
                ? 'text-primary-400 border-b-2 border-primary-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Health Metrics</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'maintenance'
                ? 'text-primary-400 border-b-2 border-primary-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Wrench className="w-5 h-5" />
              <span>Maintenance Records</span>
            </div>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'health' && <HealthMetricsDashboard />}

        {activeTab === 'maintenance' && (
          <>
            {/* Overdue Alerts */}
            {overdue.length > 0 && (
              <AlertBanner
                type="warning"
                message={`${overdue.length} vehicle(s) have overdue maintenance`}
              />
            )}

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-neuro-light rounded-xl border border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Scheduled</p>
                    <p className="text-xl font-bold text-white">
                      {maintenanceRecords.filter(m => m.status === 'SCHEDULED').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-neuro-light rounded-xl border border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">In Progress</p>
                    <p className="text-xl font-bold text-white">
                      {maintenanceRecords.filter(m => m.status === 'IN_PROGRESS').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-neuro-light rounded-xl border border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Completed</p>
                    <p className="text-xl font-bold text-white">
                      {maintenanceRecords.filter(m => m.status === 'COMPLETED').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-neuro-light rounded-xl border border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Overdue</p>
                    <p className="text-xl font-bold text-white">{overdue.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={maintenanceRecords}
              actions={actions}
              emptyMessage="No maintenance records found"
            />
          </>
        )}

        {/* Schedule Maintenance Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Schedule Maintenance"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle</label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                required
              >
                <option value="">Select vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} - {vehicle.licensePlate}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Maintenance Type</label>
              <select
                value={formData.maintenanceType}
                onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                required
              >
                <option value="">Select type</option>
                <option value="OIL_CHANGE">Oil Change</option>
                <option value="TIRE_ROTATION">Tire Rotation</option>
                <option value="BRAKE_SERVICE">Brake Service</option>
                <option value="ENGINE_SERVICE">Engine Service</option>
                <option value="BATTERY_CHECK">Battery Check</option>
                <option value="FULL_SERVICE">Full Service</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Scheduled Date</label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                required
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                Schedule
              </button>
            </div>
          </form>
        </Modal>

        {/* Vehicle Health Detail Modal */}
        <Modal
          isOpen={healthModalOpen}
          onClose={() => {
            setHealthModalOpen(false);
            setSelectedVehicleHealth(null);
          }}
          title="Vehicle Health Analysis"
          size="xl"
        >
          <VehicleHealthDetail health={selectedVehicleHealth} />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default MaintenanceManagement;