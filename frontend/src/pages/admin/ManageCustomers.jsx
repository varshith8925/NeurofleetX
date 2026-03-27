// frontend/src/pages/admin/ManageCustomers.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import { Edit, Trash2, User } from 'lucide-react';
import userService from '../../services/userService';
import toast from 'react-hot-toast';

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    identityNumber: '',
    gender: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await userService.getCustomers();
      setCustomers(response.data || []);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      identityNumber: customer.identityNumber,
      gender: customer.gender
    });
    setModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await userService.updateUser(editingCustomer.id, formData);
      toast.success('Customer updated successfully');
      setModalOpen(false);
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to update customer');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await userService.deleteUser(id);
        toast.success('Customer deleted successfully');
        fetchCustomers();
      } catch (error) {
        toast.error('Failed to delete customer');
      }
    }
  };

  const columns = [
    {
      header: 'Customer',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-white font-medium">{row.name}</p>
            <p className="text-gray-400 text-sm">{row.email}</p>
          </div>
        </div>
      )
    },
    { header: 'Identity Number', accessor: 'identityNumber' },
    { header: 'Gender', accessor: 'gender' },
    {
      header: 'Total Trips',
      render: (row) => (
        <span className="text-white">{row.totalTrips || 0}</span>
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
    return <Loading message="Loading customers..." />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Customers</h1>
          <p className="text-gray-400 mt-1">View and manage all registered customers</p>
        </div>

        <DataTable
          columns={columns}
          data={customers}
          actions={actions}
          emptyMessage="No customers found"
        />

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Edit Customer"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Identity Number</label>
              <input
                type="text"
                value={formData.identityNumber}
                onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
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

export default ManageCustomers;