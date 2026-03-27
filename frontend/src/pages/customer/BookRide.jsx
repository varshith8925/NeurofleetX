import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import RouteMap from '../../components/maps/RouteMap';
import LocationSearch from '../../components/common/LocationSearch';
import Loading from '../../components/common/Loading';
import { MapPin, Car, Clock, DollarSign, Zap, Users, Navigation, CheckCircle } from 'lucide-react';
import vehicleService from '../../services/vehicleService';
import bookingService from '../../services/bookingService';
import routeService from '../../services/routeService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const BookRide = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupLat: '',
    pickupLng: '',
    dropoffLat: '',
    dropoffLng: '',
    vehicleType: '',
    seats: '',
    fuelType: ''
  });

  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    fetchAvailableVehicles();
  }, []);

  const fetchAvailableVehicles = async () => {
    try {
      const response = await vehicleService.getAvailableVehicles();
      setVehicles(response.data || []);
    } catch (error) {
      toast.error('Failed to load vehicles');
    }
  };

  const handlePickupSelect = (location) => {
    setFormData({
      ...formData,
      pickupLocation: location.name,
      pickupLat: location.lat.toString(),
      pickupLng: location.lng.toString()
    });
    setSource([location.lat, location.lng]);
    toast.success(`Pickup: ${location.name.split(',')[0]}`);
  };

  const handleDropoffSelect = (location) => {
    setFormData({
      ...formData,
      dropoffLocation: location.name,
      dropoffLat: location.lat.toString(),
      dropoffLng: location.lng.toString()
    });
    setDestination([location.lat, location.lng]);
    toast.success(`Dropoff: ${location.name.split(',')[0]}`);
  };

  const handleSearchRoutes = async () => {
    if (!formData.pickupLat || !formData.pickupLng || !formData.dropoffLat || !formData.dropoffLng) {
      toast.error('Please select both pickup and dropoff locations');
      return;
    }

    setLoading(true);
    try {
      const sourceCoords = [parseFloat(formData.pickupLat), parseFloat(formData.pickupLng)];
      const destCoords = [parseFloat(formData.dropoffLat), parseFloat(formData.dropoffLng)];
      
      setSource(sourceCoords);
      setDestination(destCoords);

      const response = await routeService.getMultipleRoutes(
        { lat: sourceCoords[0], lng: sourceCoords[1] },
        { lat: destCoords[0], lng: destCoords[1] }
      );
      
      if (response.success && response.data) {
        setRoutes(response.data);
        setSelectedRouteIndex(0);
        toast.success(`Found ${response.data.length} routes!`);
      }
    } catch (error) {
      toast.error('Failed to find routes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    if (formData.vehicleType && vehicle.vehicleType !== formData.vehicleType) return false;
    if (formData.seats && vehicle.seats < parseInt(formData.seats)) return false;
    if (formData.fuelType && vehicle.fuelType !== formData.fuelType) return false;
    return true;
  });

  const handleBookRide = async () => {
    if (!selectedVehicle) {
      toast.error('Please select a vehicle');
      return;
    }

    if (!formData.pickupLocation || !formData.dropoffLocation) {
      toast.error('Please enter pickup and dropoff locations');
      return;
    }

    if (routes.length === 0) {
      toast.error('Please search for routes first');
      return;
    }

    const selectedRoute = routes[selectedRouteIndex];

    try {
      setLoading(true);
      const bookingData = {
        vehicleId: selectedVehicle.id,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        pickupLat: parseFloat(formData.pickupLat),
        pickupLng: parseFloat(formData.pickupLng),
        dropoffLat: parseFloat(formData.dropoffLat),
        dropoffLng: parseFloat(formData.dropoffLng),
        distance: selectedRoute.distance,
        estimatedDuration: selectedRoute.duration,
        fare: selectedRoute.fare
      };

      await bookingService.createBooking(bookingData);
      toast.success('Ride booked successfully!');
      navigate('/customer');
    } catch (error) {
      toast.error('Failed to book ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Book a Ride</h1>
          <p className="text-gray-400 mt-1">Search locations by name and view optimal routes</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Location Search & Filters */}
          <div className="space-y-4">
            {/* Location Search */}
            <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Navigation className="w-5 h-5 text-primary-400" />
                <span>Location Details</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📍 Pickup Location
                  </label>
                  <LocationSearch
                    placeholder="Search pickup location "
                    onLocationSelect={handlePickupSelect}
                  />
                  {formData.pickupLocation && (
                    <p className="text-xs text-green-400 mt-2">✓ {formData.pickupLocation.split(',')[0]}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    🏁 Dropoff Location
                  </label>
                  <LocationSearch
                    placeholder="Search drop location"
                    onLocationSelect={handleDropoffSelect}
                  />
                  {formData.dropoffLocation && (
                    <p className="text-xs text-green-400 mt-2">✓ {formData.dropoffLocation.split(',')[0]}</p>
                  )}
                </div>
                
                <button
                  onClick={handleSearchRoutes}
                  disabled={loading || !source || !destination}
                  className="w-full flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors font-semibold"
                >
                  <MapPin className="w-5 h-5" />
                  <span>{loading ? 'Searching...' : 'Find Routes'}</span>
                </button>
              </div>
            </div>

            {/* Vehicle Filters */}
            <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Vehicle Preferences</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle Type</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="">All Types</option>
                    <option value="SEDAN">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="HATCHBACK">Hatchback</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Seats</label>
                  <select
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                    className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="">Any</option>
                    <option value="2">2+</option>
                    <option value="4">4+</option>
                    <option value="6">6+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fuel Type</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="">All</option>
                    <option value="ELECTRIC">⚡ Electric (EV)</option>
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Map & Route Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Map */}
            <div className="bg-neuro-light rounded-xl border border-gray-700 p-4">
              <div className="h-96">
                <RouteMap
                  source={source}
                  destination={destination}
                  routes={routes}
                  selectedRouteIndex={selectedRouteIndex}
                  onRouteSelect={setSelectedRouteIndex}
                />
              </div>
            </div>

            {/* Route Options */}
            {routes.length > 0 && (
              <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  🗺️ Available Routes ({routes.length})
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {routes.map((route, index) => (
                    <button
                      key={route.id || index}
                      onClick={() => setSelectedRouteIndex(index)}
                      className={`p-4 rounded-xl text-left transition-all ${
                        selectedRouteIndex === index
                          ? 'bg-gradient-to-br from-primary-500/20 to-primary-600/20 border-2 border-primary-500 shadow-lg shadow-primary-500/20'
                          : 'bg-neuro-dark hover:bg-gray-700 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: route.color }}
                          ></div>
                          <span className="text-white font-semibold text-sm">{route.name}</span>
                        </div>
                        {route.recommended && (
                          <span className="text-yellow-400 text-lg">⭐</span>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-400 mb-3">{route.description}</p>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Time</span>
                          </span>
                          <span className="text-white font-semibold">{route.duration} min</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>Distance</span>
                          </span>
                          <span className="text-white font-semibold">{route.distance} km</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 flex items-center space-x-1">
                            <DollarSign className="w-3 h-3" />
                            <span>Fare</span>
                          </span>
                          <span className="text-green-400 font-bold">₹{route.fare}</span>
                        </div>
                        {route.tolls > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-xs">Tolls</span>
                            <span className="text-yellow-400 text-xs">+₹{route.tolls}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-700">
                          <span className={`text-xs px-2 py-1 rounded ${
                            route.traffic === 'Light' ? 'bg-green-500/20 text-green-400' :
                            route.traffic === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            🚦 {route.traffic} Traffic
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Available Vehicles */}
            <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Available Vehicles ({filteredVehicles.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {filteredVehicles.slice(0, 6).map((vehicle) => (
                  <button
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={`p-4 rounded-lg text-left transition-all ${
                      selectedVehicle?.id === vehicle.id
                        ? 'bg-primary-500/20 border-2 border-primary-500'
                        : 'bg-neuro-dark hover:bg-gray-700 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                        <Car className="w-6 h-6 text-primary-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{vehicle.name}</p>
                        <p className="text-gray-400 text-sm">{vehicle.model}</p>
                      </div>
                      {selectedVehicle?.id === vehicle.id && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-3 text-sm">
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{vehicle.seats}</span>
                      </div>
                      {vehicle.fuelType === 'ELECTRIC' && (
                        <div className="flex items-center space-x-1 text-green-400">
                          <Zap className="w-4 h-4" />
                          <span>EV</span>
                        </div>
                      )}
                      <span className="text-gray-400">{vehicle.color}</span>
                    </div>
                  </button>
                ))}
              </div>

              {selectedVehicle && routes.length > 0 && (
                <button
                  onClick={handleBookRide}
                  disabled={loading}
                  className="w-full mt-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-4 rounded-xl transition-all duration-300 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
                >
                  {loading ? 'Booking...' : `Book ${selectedVehicle.name} - ₹${routes[selectedRouteIndex]?.fare || 0}`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookRide;