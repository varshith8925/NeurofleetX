// frontend/src/pages/fleetmanager/DriverAssignment.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import { User, Car, Link as LinkIcon, Unlink } from 'lucide-react';
import vehicleService from '../../services/vehicleService';
import userService from '../../services/userService';
import toast from 'react-hot-toast';

const DriverAssignment = () => {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, driversRes] = await Promise.all([
        vehicleService.getAllVehicles(),
        userService.getAvailableDrivers()
      ]);
      setVehicles(vehiclesRes.data || []);
      setDrivers(driversRes.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = (vehicle) => {
    setSelectedVehicle(vehicle);
    setSelectedDriver('');
    setModalOpen(true);
  };

  const handleUnassign = async (vehicle) => {
    if (window.confirm('Are you sure you want to unassign the driver from this vehicle?')) {
      try {
        await vehicleService.unassignDriver(vehicle.id);
        toast.success('Driver unassigned successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to unassign driver');
      }
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedDriver) {
      toast.error('Please select a driver');
      return;
    }
    try {
      await vehicleService.assignDriver(selectedVehicle.id, selectedDriver);
      toast.success('Driver assigned successfully');
      setModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to assign driver');
    }
  };

  const columns = [
    {
      header: 'Vehicle',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p className="text-white font-medium">{row.name}</p>
            <p className="text-gray-400 text-sm">{row.licensePlate}</p>
          </div>
        </div>
      )
    },
    { header: 'Model', accessor: 'model' },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-400' :
          row.status === 'IN_USE' ? 'bg-blue-500/20 text-blue-400' :
          row.status === 'MAINTENANCE' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Assigned Driver',
      render: (row) => (
        row.driverName ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-white">{row.driverName}</span>
          </div>
        ) : (
          <span className="text-gray-500">Not assigned</span>
        )
      )
    }
  ];

  const actions = (row) => (
    <div className="flex items-center space-x-2">
      {row.driverId ? (
        <button
          onClick={() => handleUnassign(row)}
          className="flex items-center space-x-1 px-3 py-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
        >
          <Unlink className="w-4 h-4" />
          <span className="text-sm">Unassign</span>
        </button>
      ) : (
        <button
          onClick={() => handleAssign(row)}
          className="flex items-center space-x-1 px-3 py-1.5 text-primary-400 hover:bg-primary-500/20 rounded-lg transition-colors"
          disabled={row.status !== 'AVAILABLE'}
        >
          <LinkIcon className="w-4 h-4" />
          <span className="text-sm">Assign</span>
        </button>
      )}
    </div>
  );

  if (loading) {
    return <Loading message="Loading data..." />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Driver Assignment</h1>
          <p className="text-gray-400 mt-1">Assign drivers to vehicles</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Available Vehicles</p>
                <p className="text-2xl font-bold text-white">
                  {vehicles.filter(v => v.status === 'AVAILABLE' && !v.driverId).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Available Drivers</p>
                <p className="text-2xl font-bold text-white">{drivers.length}</p>
              </div>
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={vehicles}
          actions={actions}
          emptyMessage="No vehicles found"
        />

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Assign Driver"
        >
          <form onSubmit={handleSubmitAssignment} className="space-y-4">
            <div>
              <p className="text-gray-400 mb-4">
                Assign a driver to <span className="text-white font-semibold">{selectedVehicle?.name}</span>
              </p>
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Driver</label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                required
              >
                <option value="">Choose a driver</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} - {driver.licenseNumber}
                  </option>
                ))}
              </select>
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
                Assign
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default DriverAssignment;