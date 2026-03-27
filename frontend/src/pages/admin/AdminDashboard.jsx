// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import Loading from '../../components/common/Loading';
import FleetStatsChart from '../../components/charts/FleetStatsChart';
import TripStatsChart from '../../components/charts/TripStatsChart';
import { Car, Users, UserCheck, Activity, AlertTriangle } from 'lucide-react';
import userService from '../../services/userService';
import vehicleService from '../../services/vehicleService';
import bookingService from '../../services/bookingService';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalDrivers: 0,
    totalManagers: 0,
    totalCustomers: 0,
    activeTrips: 0,
    vehicleStats: {}
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [tripData, setTripData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [userStats, vehicleStats, bookingStats, bookings] = await Promise.all([
        userService.getUserStats(),
        vehicleService.getVehicleStats(),
        bookingService.getBookingStats(),
        bookingService.getAllBookings()
      ]);

      setStats({
        totalVehicles: vehicleStats.data?.total || 0,
        totalDrivers: userStats.data?.drivers || 0,
        totalManagers: userStats.data?.managers || 0,
        totalCustomers: userStats.data?.customers || 0,
        activeTrips: bookingStats.data?.active || 0,
        vehicleStats: vehicleStats.data || {}
      });

      setRecentBookings(bookings.data?.slice(0, 5) || []);
      setTripData(bookingStats.data?.chartData || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Overview of your fleet management system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Vehicles"
            value={stats.totalVehicles}
            icon={Car}
            color="primary"
          />
          <StatCard
            title="Total Drivers"
            value={stats.totalDrivers}
            icon={UserCheck}
            color="success"
          />
          <StatCard
            title="Fleet Managers"
            value={stats.totalManagers}
            icon={Users}
            color="info"
          />
          <StatCard
            title="Customers"
            value={stats.totalCustomers}
            icon={Users}
            color="warning"
          />
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Fleet Status */}
          <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Fleet Status</h2>
            <FleetStatsChart data={stats.vehicleStats} />
          </div>

          {/* Trip Statistics */}
          <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Trip Statistics</h2>
            <TripStatsChart data={tripData} />
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Bookings</h2>
          {recentBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                    <th className="pb-3 px-4">Booking ID</th>
                    <th className="pb-3 px-4">Customer</th>
                    <th className="pb-3 px-4">Vehicle</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="py-3 px-4 text-white">#{booking.id}</td>
                      <td className="py-3 px-4 text-gray-300">{booking.customerName}</td>
                      <td className="py-3 px-4 text-gray-300">{booking.vehicleName}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          booking.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                          booking.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                          booking.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white">₹{booking.fare || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No recent bookings</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;