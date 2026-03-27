// frontend/src/pages/customer/CustomerDashboard.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import Loading from '../../components/common/Loading';
import { Car, Clock, DollarSign, MapPin } from 'lucide-react';
import bookingService from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalSpent: 0,
    totalDistance: 0,
    totalTime: 0
  });
  const [activeBooking, setActiveBooking] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes] = await Promise.all([
        bookingService.getCustomerStats(),
        bookingService.getMyBookings()
      ]);

      setStats(statsRes.data || {});
      
      const bookings = bookingsRes.data || [];
      const active = bookings.find(
        b => b.status === 'PENDING' || b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS'
      );
      setActiveBooking(active);
      setRecentTrips(bookings.filter(b => b.status === 'COMPLETED').slice(0, 5));
    } catch (error) {
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome, {user?.name}</h1>
            <p className="text-gray-400 mt-1">Your ride dashboard</p>
          </div>
          <Link
            to="/customer/book"
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
          >
            Book a Ride
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Trips"
            value={stats.totalTrips || 0}
            icon={Car}
            color="primary"
          />
          <StatCard
            title="Total Spent"
            value={`₹${stats.totalSpent || 0}`}
            icon={DollarSign}
            color="success"
          />
          <StatCard
            title="Total Distance"
            value={`${stats.totalDistance || 0} km`}
            icon={MapPin}
            color="info"
          />
          <StatCard
            title="Total Time"
            value={`${stats.totalTime || 0} min`}
            icon={Clock}
            color="warning"
          />
        </div>

        {/* Active Booking */}
        {activeBooking && (
          <div className="bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-xl border border-primary-500/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Active Booking</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                activeBooking.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                activeBooking.status === 'ACCEPTED' ? 'bg-blue-500/20 text-blue-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {activeBooking.status}
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-gray-400 text-sm">Pickup</p>
                  <p className="text-white">{activeBooking.pickupLocation}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-gray-400 text-sm">Dropoff</p>
                  <p className="text-white">{activeBooking.dropoffLocation}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Fare: <span className="text-white font-semibold">₹{activeBooking.fare}</span></span>
              {activeBooking.driverName && (
                <span className="text-gray-400">Driver: <span className="text-white">{activeBooking.driverName}</span></span>
              )}
            </div>

            {activeBooking.status === 'IN_PROGRESS' && (
              <Link
                to={`/customer/navigation/${activeBooking.id}`}
                className="mt-4 inline-flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <MapPin className="w-5 h-5" />
                <span>Track Ride</span>
              </Link>
            )}
          </div>
        )}

        {/* Recent Trips */}
        <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Trips</h2>
            <Link to="/customer/history" className="text-primary-400 hover:text-primary-300 text-sm">
              View All
            </Link>
          </div>
          
          {recentTrips.length > 0 ? (
            <div className="space-y-3">
              {recentTrips.map((trip) => (
                <div 
                  key={trip.id}
                  className="flex items-center justify-between p-4 bg-neuro-dark rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Car className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white">{trip.pickupLocation} → {trip.dropoffLocation}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(trip.completedAt).toLocaleDateString()}
                      </p>
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
            <div className="text-center py-8">
              <Car className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No trips yet</p>
              <Link
                to="/customer/book"
                className="text-primary-400 hover:text-primary-300 text-sm mt-2 inline-block"
              >
                Book your first ride
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;