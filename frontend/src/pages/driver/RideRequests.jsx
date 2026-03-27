// frontend/src/pages/driver/RideRequests.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import Loading from '../../components/common/Loading';
import { MapPin, User, Clock, DollarSign, Check, X, Navigation } from 'lucide-react';
import bookingService from '../../services/bookingService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const RideRequests = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeRide, setActiveRide] = useState(null);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const [pendingRes, driverBookingsRes] = await Promise.all([
        bookingService.getPendingBookings(),
        bookingService.getDriverBookings()
      ]);
      setPendingRequests(pendingRes.data || []);
      
      // Check for active ride
      const active = (driverBookingsRes.data || []).find(
        b => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS'
      );
      setActiveRide(active);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId) => {
    try {
      await bookingService.acceptBooking(bookingId);
      toast.success('Ride accepted!');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to accept ride');
    }
  };

  const handleStartRide = async (bookingId) => {
    try {
      await bookingService.startRide(bookingId);
      toast.success('Ride started!');
      navigate('/driver/navigation');
    } catch (error) {
      toast.error('Failed to start ride');
    }
  };

  const handleCompleteRide = async (bookingId) => {
    try {
      await bookingService.completeRide(bookingId);
      toast.success('Ride completed!');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to complete ride');
    }
  };

  if (loading) {
    return <Loading message="Loading ride requests..." />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Ride Requests</h1>
          <p className="text-gray-400 mt-1">Accept and manage ride requests</p>
        </div>

        {/* Active Ride */}
        {activeRide && (
          <div className="bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-xl border border-primary-500/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Active Ride</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                activeRide.status === 'IN_PROGRESS' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {activeRide.status === 'IN_PROGRESS' ? 'In Progress' : 'Accepted'}
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-gray-400 text-sm">Pickup</p>
                  <p className="text-white">{activeRide.pickupLocation}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-gray-400 text-sm">Dropoff</p>
                  <p className="text-white">{activeRide.dropoffLocation}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-white">{activeRide.customerName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-white">₹{activeRide.fare}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-white">{activeRide.distance} km</span>
              </div>
            </div>

            <div className="flex space-x-3">
              {activeRide.status === 'ACCEPTED' && (
                <>
                  <button
                    onClick={() => handleStartRide(activeRide.id)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg transition-colors"
                  >
                    <Navigation className="w-5 h-5" />
                    <span>Start Ride</span>
                  </button>
                </>
              )}
              {activeRide.status === 'IN_PROGRESS' && (
                <>
                  <button
                    onClick={() => navigate('/driver/navigation')}
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors"
                  >
                    <Navigation className="w-5 h-5" />
                    <span>Navigate</span>
                  </button>
                  <button
                    onClick={() => handleCompleteRide(activeRide.id)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg transition-colors"
                  >
                    <Check className="w-5 h-5" />
                    <span>Complete Ride</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Pending Requests */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Pending Requests ({pendingRequests.length})
          </h2>
          
          {pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-neuro-light rounded-xl border border-gray-700 p-6 hover:border-primary-500/50 transition-colors"
                >
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                      <div>
                        <p className="text-gray-400 text-sm">Pickup</p>
                        <p className="text-white">{request.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                      <div>
                        <p className="text-gray-400 text-sm">Dropoff</p>
                        <p className="text-white">{request.dropoffLocation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{request.customerName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-white font-semibold">₹{request.fare}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{request.distance} km</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAccept(request.id)}
                      disabled={activeRide}
                      className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      <Check className="w-5 h-5" />
                      <span>Accept</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-neuro-light rounded-xl border border-gray-700 p-12 text-center">
              <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No pending ride requests</p>
              <p className="text-gray-500 text-sm mt-1">New requests will appear here</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RideRequests;