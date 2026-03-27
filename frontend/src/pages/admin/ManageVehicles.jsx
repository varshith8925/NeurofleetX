// frontend/src/pages/admin/ManageVehicles.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import { Plus, Edit, Trash2, Car } from 'lucide-react';
import vehicleService from '../../services/vehicleService';
import toast from 'react-hot-toast';

const ManageVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    color: '',
    licensePlate: '',
    vehicleType: '',
    seats: '',
    fuelType: '',
    status: 'AVAILABLE'
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getAllVehicles();
      setVehicles(response.data || []);
    } catch (error) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle.id, formData);
        toast.success('Vehicle updated successfully');
      } else {
        await vehicleService.createVehicle(formData);
        toast.success('Vehicle created successfully');
      }
      setModalOpen(false);
      resetForm();
      fetchVehicles();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      model: vehicle.model,
      color: vehicle.color,
      licensePlate: vehicle.licensePlate,
      vehicleType: vehicle.vehicleType,
      seats: vehicle.seats,
      fuelType: vehicle.fuelType,
      status: vehicle.status
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleService.deleteVehicle(id);
        toast.success('Vehicle deleted successfully');
        fetchVehicles();
      } catch (error) {
        toast.error('Failed to delete vehicle');
      }
    }
  };

  const resetForm = () => {
    setEditingVehicle(null);
    setFormData({
      name: '',
      model: '',
      color: '',
      licensePlate: '',
      vehicleType: '',
      seats: '',
      fuelType: '',
      status: 'AVAILABLE'
    });
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
            <p className="text-gray-400 text-sm">{row.model}</p>
          </div>
        </div>
      )
    },
    { header: 'License Plate', accessor: 'licensePlate' },
    { header: 'Type', accessor: 'vehicleType' },
    { header: 'Seats', accessor: 'seats' },
    { header: 'Fuel Type', accessor: 'fuelType' },
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
    }
  ];

  const actions = (row) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleEdit(row)}
        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
      >
        <Edit className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleDelete(row.id)}
        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  if (loading) {
    return <Loading message="Loading vehicles..." />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Vehicles</h1>
            <p className="text-gray-400 mt-1">Add, edit, and manage fleet vehicles</p>
          </div>
          <button
            onClick={() => { resetForm(); setModalOpen(true); }}
            className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Vehicle</span>
          </button>
        </div>

        {/* Vehicles Table */}
        <DataTable
          columns={columns}
          data={vehicles}
          actions={actions}
          emptyMessage="No vehicles found"
        />

        {/* Add/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); resetForm(); }}
          title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vehicle Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  License Plate
                </label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vehicle Type
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  required
                >
                  <option value="">Select type</option>
                  <option value="SEDAN">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="HATCHBACK">Hatchback</option>
                  <option value="VAN">Van</option>
                  <option value="TRUCK">Truck</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Seats
                </label>
                <input
                  type="number"
                  value={formData.seats}
                  onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                  className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fuel Type
                </label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                  className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  required
                >
                  <option value="">Select fuel type</option>
                  <option value="PETROL">Petrol</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="ELECTRIC">Electric</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  required
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="IN_USE">In Use</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => { setModalOpen(false); resetForm(); }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                {editingVehicle ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ManageVehicles;