// frontend/src/pages/admin/ManageDrivers.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import { Edit, Trash2, User } from 'lucide-react';
import userService from '../../services/userService';
import toast from 'react-hot-toast';

const ManageDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    licenseNumber: '',
    gender: ''
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await userService.getDrivers();
      setDrivers(response.data || []);
    } catch (error) {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email,
      licenseNumber: driver.licenseNumber,
      gender: driver.gender
    });
    setModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await userService.updateUser(editingDriver.id, formData);
      toast.success('Driver updated successfully');
      setModalOpen(false);
      fetchDrivers();
    } catch (error) {
      toast.error('Failed to update driver');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await userService.deleteUser(id);
        toast.success('Driver deleted successfully');
        fetchDrivers();
      } catch (error) {
        toast.error('Failed to delete driver');
      }
    }
  };

  const columns = [
    {
      header: 'Driver',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-white font-medium">{row.name}</p>
            <p className="text-gray-400 text-sm">{row.email}</p>
          </div>
        </div>
      )
    },
    { header: 'License Number', accessor: 'licenseNumber' },
    { header: 'Gender', accessor: 'gender' },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.available ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {row.available ? 'Available' : 'On Trip'}
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
    return <Loading message="Loading drivers..." />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Drivers</h1>
          <p className="text-gray-400 mt-1">View and manage all registered drivers</p>
        </div>

        <DataTable
          columns={columns}
          data={drivers}
          actions={actions}
          emptyMessage="No drivers found"
        />

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Edit Driver"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">License Number</label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg"
              >
                Update
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ManageDrivers;