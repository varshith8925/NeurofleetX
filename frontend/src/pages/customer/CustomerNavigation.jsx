// frontend/src/pages/customer/CustomerNavigation.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import RouteMap from '../../components/maps/RouteMap';
import Loading from '../../components/common/Loading';
import { MapPin, Clock, User, Car } from 'lucide-react';
import bookingService from '../../services/bookingService';
import toast from 'react-hot-toast';

const CustomerNavigation = () => {
  const { bookingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    fetchBooking();
    const interval = setInterval(fetchBooking, 10000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await bookingService.getBookingById(bookingId);
      const bookingData = response.data;
      setBooking(bookingData);
      
      if (bookingData.pickupLat && bookingData.pickupLng) {
        setSource([bookingData.pickupLat, bookingData.pickupLng]);
      }
      if (bookingData.dropoffLat && bookingData.dropoffLng) {
        setDestination([bookingData.dropoffLat, bookingData.dropoffLng]);
      }
    } catch (error) {
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading navigation..." />;
  }

  if (!booking) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-400">Booking not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Track Your Ride</h1>
          <p className="text-gray-400 mt-1">Real-time ride tracking</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 bg-neuro-light rounded-xl border border-gray-700 p-4">
            <div className="h-[500px]">
              <RouteMap
                source={source}
                destination={destination}
                routes={booking.route ? [booking.route] : []}
              />
            </div>
          </div>

          {/* Ride Details */}
          <div className="space-y-4">
            <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Ride Status</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  booking.status === 'IN_PROGRESS' ? 'bg-green-500/20 text-green-400' :
                  booking.status === 'ACCEPTED' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {booking.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="text-gray-400 text-sm">Pickup</p>
                    <p className="text-white">{booking.pickupLocation}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="text-gray-400 text-sm">Dropoff</p>
                    <p className="text-white">{booking.dropoffLocation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Info */}
            {booking.driverName && (
              <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Driver Details</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-primary-500/20 rounded-full flex items-center justify-center">
                    <User className="w-7 h-7 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{booking.driverName}</p>
                    <p className="text-gray-400 text-sm">{booking.driverPhone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Vehicle Info */}
            {booking.vehicleName && (
              <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Vehicle Details</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Car className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{booking.vehicleName}</p>
                    <p className="text-gray-400 text-sm">{booking.vehicleLicensePlate}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Trip Summary */}
            <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Trip Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Distance</span>
                  <span className="text-white">{booking.distance} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Est. Duration</span>
                  <span className="text-white">{booking.estimatedDuration} min</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                  <span className="text-gray-400">Fare</span>
                  <span className="text-green-400 text-xl font-bold">₹{booking.fare}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerNavigation;