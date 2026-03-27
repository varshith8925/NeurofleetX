// frontend/src/pages/driver/DriverDashboard.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import Loading from '../../components/common/Loading';
import EarningsChart from '../../components/charts/EarningsChart';
import { Car, DollarSign, MapPin, Clock, CheckCircle } from 'lucide-react';
import bookingService from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedTrips: 0,
    totalEarnings: 0,
    totalDistance: 0,
    activeRide: null
  });
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [earningsData, setEarningsData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [earningsRes, bookingsRes] = await Promise.all([
        bookingService.getDriverEarnings(),
        bookingService.getDriverBookings()
      ]);

      const earnings = earningsRes.data || {};
      setStats({
        completedTrips: earnings.completedTrips || 0,
        totalEarnings: earnings.totalEarnings || 0,
        totalDistance: earnings.totalDistance || 0,
        activeRide: earnings.activeRide
      });

      setAssignedVehicle(earnings.assignedVehicle);
      setRecentTrips(bookingsRes.data?.slice(0, 5) || []);
      setEarningsData(earnings.chartData || []);
    } catch {
      toast.error('Failed to load dashboard data');
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
        <div>
          <h1 className="text-3xl font-bold text-white">Driver Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Completed Trips"
            value={stats.completedTrips}
            icon={CheckCircle}
            color="success"
          />
          <StatCard
            title="Total Earnings"
            value={`₹${stats.totalEarnings}`}
            icon={DollarSign}
            color="primary"
          />
          <StatCard
            title="Total Distance"
            value={`${stats.totalDistance} km`}
            icon={MapPin}
            color="info"
          />
          <StatCard
            title="Status"
            value={stats.activeRide ? 'On Trip' : 'Available'}
            icon={Car}
            color={stats.activeRide ? 'warning' : 'success'}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Assigned Vehicle */}
          <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Assigned Vehicle</h2>
            {assignedVehicle ? (
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-500/20 rounded-xl flex items-center justify-center">
                  <Car className="w-8 h-8 text-primary-400" />
                </div>
                <div>
                  <p className="text-white text-lg font-semibold">{assignedVehicle.name}</p>
                  <p className="text-gray-400">{assignedVehicle.model}</p>
                  <p className="text-gray-500 text-sm">{assignedVehicle.licensePlate}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No vehicle assigned</p>
            )}
          </div>

          {/* Active Ride */}
          <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Active Ride</h2>
            {stats.activeRide ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Pickup</span>
                  <span className="text-white">{stats.activeRide.pickupLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dropoff</span>
                  <span className="text-white">{stats.activeRide.dropoffLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Customer</span>
                  <span className="text-white">{stats.activeRide.customerName}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No active ride</p>
            )}
          </div>
        </div>

        {/* Earnings Chart */}
        <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Earnings Overview</h2>
          <EarningsChart data={earningsData} />
        </div>

        {/* Recent Trips */}
        <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Trips</h2>
          {recentTrips.length > 0 ? (
            <div className="space-y-3">
              {recentTrips.map((trip) => (
                <div 
                  key={trip.id}
                  className="flex items-center justify-between p-4 bg-neuro-dark rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white">{trip.pickupLocation} → {trip.dropoffLocation}</p>
                      <p className="text-gray-400 text-sm">{trip.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">₹{trip.fare}</p>
                    <p className="text-gray-400 text-sm">{trip.distance} km</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No recent trips</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DriverDashboard;