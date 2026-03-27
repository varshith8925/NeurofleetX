// frontend/src/pages/driver/DriverEarnings.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import Loading from '../../components/common/Loading';
import EarningsChart from '../../components/charts/EarningsChart';
import { DollarSign, TrendingUp, Calendar, Car } from 'lucide-react';
import bookingService from '../../services/bookingService';
import toast from 'react-hot-toast';

const DriverEarnings = () => {
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    todayEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    completedTrips: 0,
    chartData: []
  });
  const [completedTrips, setCompletedTrips] = useState([]);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const [earningsRes, bookingsRes] = await Promise.all([
        bookingService.getDriverEarnings(),
        bookingService.getDriverBookings()
      ]);

      setEarnings(earningsRes.data || {});
      setCompletedTrips(
        (bookingsRes.data || []).filter(b => b.status === 'COMPLETED').slice(0, 10)
      );
    } catch (error) {
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading earnings..." />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Earnings</h1>
          <p className="text-gray-400 mt-1">Track your income and trip history</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Earnings"
            value={`₹${earnings.totalEarnings || 0}`}
            icon={DollarSign}
            color="primary"
          />
          <StatCard
            title="Today's Earnings"
            value={`₹${earnings.todayEarnings || 0}`}
            icon={TrendingUp}
            color="success"
          />
          <StatCard
            title="This Week"
            value={`₹${earnings.weeklyEarnings || 0}`}
            icon={Calendar}
            color="info"
          />
          <StatCard
            title="Completed Trips"
            value={earnings.completedTrips || 0}
            icon={Car}
            color="warning"
          />
        </div>

        {/* Earnings Chart */}
        <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Earnings Overview</h2>
          <EarningsChart data={earnings.chartData || []} />
        </div>

        {/* Completed Trips */}
        <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Completed Trips</h2>
          {completedTrips.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                    <th className="pb-3 px-4">Date</th>
                    <th className="pb-3 px-4">Pickup</th>
                    <th className="pb-3 px-4">Dropoff</th>
                    <th className="pb-3 px-4">Distance</th>
                    <th className="pb-3 px-4">Fare</th>
                  </tr>
                </thead>
                <tbody>
                  {completedTrips.map((trip) => (
                    <tr key={trip.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(trip.completedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-white">{trip.pickupLocation}</td>
                      <td className="py-3 px-4 text-white">{trip.dropoffLocation}</td>
                      <td className="py-3 px-4 text-gray-300">{trip.distance} km</td>
                      <td className="py-3 px-4 text-green-400 font-semibold">₹{trip.fare}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No completed trips yet</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DriverEarnings;