// frontend/src/pages/admin/ManageManagers.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import { Edit, Trash2, Building } from 'lucide-react';
import userService from '../../services/userService';
import toast from 'react-hot-toast';

const ManageManagers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    gender: ''
  });

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const response = await userService.getManagers();
      setManagers(response.data || []);
    } catch (error) {
      toast.error('Failed to load managers');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (manager) => {
    setEditingManager(manager);
    setFormData({
      name: manager.name,
      email: manager.email,
      companyName: manager.companyName,
      gender: manager.gender
    });
    setModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await userService.updateUser(editingManager.id, formData);
      toast.success('Manager updated successfully');
      setModalOpen(false);
      fetchManagers();
    } catch (error) {
      toast.error('Failed to update manager');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this manager?')) {
      try {
        await userService.deleteUser(id);
        toast.success('Manager deleted successfully');
        fetchManagers();
      } catch (error) {
        toast.error('Failed to delete manager');
      }
    }
  };

  const columns = [
    {
      header: 'Manager',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Building className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-white font-medium">{row.name}</p>
            <p className="text-gray-400 text-sm">{row.email}</p>
          </div>
        </div>
      )
    },
    { header: 'Company', accessor: 'companyName' },
    { header: 'Gender', accessor: 'gender' }
  ];

  const actions = (row) => (
    <div className="flex items-center space-x-2">
      <button // frontend/src/pages/admin/ManageManagers.jsx (continued)
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
    return <Loading message="Loading managers..." />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Fleet Managers</h1>
          <p className="text-gray-400 mt-1">View and manage all fleet managers</p>
        </div>

        <DataTable
          columns={columns}
          data={managers}
          actions={actions}
          emptyMessage="No managers found"
        />

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Edit Manager"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
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

export default ManageManagers;