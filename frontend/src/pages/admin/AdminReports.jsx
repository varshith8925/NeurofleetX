// frontend/src/pages/admin/AdminReports.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import Loading from '../../components/common/Loading';
import TripStatsChart from '../../components/charts/TripStatsChart';
import EarningsChart from '../../components/charts/EarningsChart';
import { FileText, Download, Calendar, TrendingUp, Car, Users, DollarSign } from 'lucide-react';
import bookingService from '../../services/bookingService';
import vehicleService from '../../services/vehicleService';
import userService from '../../services/userService';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    totalTrips: 0,
    totalRevenue: 0,
    totalDistance: 0,
    avgTripDuration: 0,
    tripData: [],
    revenueData: []
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [bookingStats, vehicleStats, userStats] = await Promise.all([
        bookingService.getBookingStats(),
        vehicleService.getVehicleStats(),
        userService.getUserStats()
      ]);

      setReportData({
        totalTrips: bookingStats.data?.totalTrips || 0,
        totalRevenue: bookingStats.data?.totalRevenue || 0,
        totalDistance: bookingStats.data?.totalDistance || 0,
        avgTripDuration: bookingStats.data?.avgDuration || 0,
        tripData: bookingStats.data?.chartData || [],
        revenueData: bookingStats.data?.revenueData || []
      });
    } catch (error) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading reports..." />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
            <p className="text-gray-400 mt-1">Comprehensive fleet performance insights</p>
          </div>
          <button
            className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={async () => {
              try {
                await bookingService.downloadPDF();
                toast.success('PDF report downloaded');
              } catch (err) {
                toast.error('Failed to download PDF report');
              }
            }}
          >
            <Download className="w-5 h-5" />
            <span>Export Report (PDF)</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-neuro-light rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Trips</p>
                <p className="text-3xl font-bold text-white mt-2">{reportData.totalTrips}</p>
              </div>
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-primary-400" />
              </div>
            </div>
          </div>
          <div className="bg-neuro-light rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-white mt-2">₹{reportData.totalRevenue}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-neuro-light rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Distance</p>
                <p className="text-3xl font-bold text-white mt-2">{reportData.totalDistance} km</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-neuro-light rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Trip Duration</p>
                <p className="text-3xl font-bold text-white mt-2">{reportData.avgTripDuration} min</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Trip Statistics</h2>
            <TripStatsChart data={reportData.tripData} />
          </div>
          <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Revenue Overview</h2>
            <EarningsChart data={reportData.revenueData} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;