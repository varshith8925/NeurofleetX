// frontend/src/pages/driver/DriverNavigation.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import RouteMap from '../../components/maps/RouteMap';
import Loading from '../../components/common/Loading';
import { Navigation, Clock, MapPin, DollarSign, AlertTriangle } from 'lucide-react';
import bookingService from '../../services/bookingService';
import routeService from '../../services/routeService';
import toast from 'react-hot-toast';

const DriverNavigation = () => {
  const [loading, setLoading] = useState(true);
  const [activeRide, setActiveRide] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    fetchActiveRide();
  }, []);

  const fetchActiveRide = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getDriverBookings();
      const active = (response.data || []).find(
        b => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS'
      );

      if (active) {
        setActiveRide(active);
        
        // Get routes
        if (active.pickupLat && active.pickupLng && active.dropoffLat && active.dropoffLng) {
          const sourceCoords = [active.pickupLat, active.pickupLng];
          const destCoords = [active.dropoffLat, active.dropoffLng];
          
          setSource(sourceCoords);
          setDestination(destCoords);

          try {
            const routesRes = await routeService.getMultipleRoutes(
              { lat: active.pickupLat, lng: active.pickupLng },
              { lat: active.dropoffLat, lng: active.dropoffLng }
            );
            setRoutes(routesRes.data || []);
          } catch (error) {
            console.error('Failed to fetch routes:', error);
          }
        }
      }
    } catch (error) {
      toast.error('Failed to load navigation data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading navigation..." />;
  }

  if (!activeRide) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Navigation className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Active Ride</h2>
            <p className="text-gray-400">Accept a ride request to start navigation</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Navigation</h1>
          <p className="text-gray-400 mt-1">Follow the optimal route to your destination</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 bg-neuro-light rounded-xl border border-gray-700 p-4">
            <div className="h-[500px]">
              <RouteMap
                source={source}
                destination={destination}
                routes={routes}
                selectedRouteIndex={selectedRouteIndex}
                onRouteSelect={setSelectedRouteIndex}
              />
            </div>
          </div>

          {/* Route Details */}
          <div className="space-y-4">
            {/* Ride Info */}
            <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Ride Details</h3>
              <div className="space-y-3">
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
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Fare</span>
                    <span className="text-white font-semibold">₹{activeRide.fare}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-400">Distance</span>
                    <span className="text-white">{activeRide.distance} km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Route Options */}
            <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Route Options</h3>
              {routes.length > 0 ? (
                <div className="space-y-3">
                  {routes.map((route, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedRouteIndex(index)}
                      className={`w-full p-4 rounded-lg text-left transition-colors ${
                        selectedRouteIndex === index
                          ? 'bg-primary-500/20 border border-primary-500/50'
                          : 'bg-neuro-dark hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{route.name || `Route ${index + 1}`}</span>
                        {route.type === 'FASTEST' && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                            Fastest
                          </span>
                        )}
                        {route.type === 'SHORTEST' && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                            Shortest
                          </span>
                        )}
                        {route.type === 'ECONOMICAL' && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                            Economical
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">{route.duration} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">{route.distance} km</span>
                        </div>
                        {route.tolls > 0 && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">₹{route.tolls}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center">Loading routes...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DriverNavigation;