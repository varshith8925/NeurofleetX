// frontend/src/pages/customer/RideHistory.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import DataTable from '../../components/common/DataTable';
import Loading from '../../components/common/Loading';
import { Car, MapPin, DollarSign } from 'lucide-react';
import bookingService from '../../services/bookingService';
import toast from 'react-hot-toast';

const RideHistory = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings();
      setBookings(response.data || []);
    } catch (error) {
      toast.error('Failed to load ride history');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Date',
      render: (row) => (
        <span className="text-gray-300">
          {new Date(row.bookingDate || row.completedAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Route',
      render: (row) => (
        <div>
          <p className="text-white">{row.pickupLocation}</p>
          <p className="text-gray-400 text-sm">→ {row.dropoffLocation}</p>
        </div>
      )
    },
    {
      header: 'Vehicle',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Car className="w-4 h-4 text-primary-400" />
          <span className="text-gray-300">{row.vehicleName}</span>
        </div>
      )
    },
    {
      header: 'Distance',
      render: (row) => (
        <span className="text-gray-300">{row.distance} km</span>
      )
    },
    {
      header: 'Fare',
      render: (row) => (
        <span className="text-green-400 font-semibold">₹{row.fare}</span>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
          row.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
          row.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
          'bg-yellow-500/20 text-yellow-400'
        }`}>
          {row.status}
        </span>
      )
    }
  ];

  if (loading) {
    return <Loading message="Loading ride history..." />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Ride History</h1>
          <p className="text-gray-400 mt-1">View all your past rides</p>
        </div>

        <DataTable
          columns={columns}
          data={bookings}
          emptyMessage="No rides found"
        />
      </div>
    </DashboardLayout>
  );
};

export default RideHistory;