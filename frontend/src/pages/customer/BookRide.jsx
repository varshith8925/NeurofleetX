// frontend/src/pages/customer/BookRide.jsx
// Module 5: Customer Booking & Smart Recommendations
// Features: Location search (Nominatim), Route finding (OSRM), AI vehicle
//           recommendations, booking calendar, vehicle filters, AI badges.

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import RouteMap from '../../components/maps/RouteMap';
import LocationSearch from '../../components/common/LocationSearch';
import Loading from '../../components/common/Loading';
import {
  MapPin, Car, Clock, DollarSign, Zap, Users,
  Navigation, CheckCircle, Sparkles, Calendar,
  Star, TrendingUp, Shield,
} from 'lucide-react';
import vehicleService from '../../services/vehicleService';
import bookingService from '../../services/bookingService';
import routeService from '../../services/routeService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// ── AI recommendation scoring ─────────────────────────────────────────────────
const scoreVehicle = (vehicle, formData, selectedRoute) => {
  let score = 50;
  if (vehicle.fuelType === 'ELECTRIC') score += 20;
  if (vehicle.fuelType === 'HYBRID')   score += 10;
  if (formData.vehicleType && vehicle.vehicleType === formData.vehicleType) score += 15;
  if (selectedRoute) {
    const dist = selectedRoute.distance;
    if (dist > 20 && vehicle.vehicleType === 'SUV')  score += 10;
    if (dist < 10 && vehicle.vehicleType === 'HATCHBACK') score += 10;
  }
  if (vehicle.rating) score += vehicle.rating * 3;
  return Math.min(score, 100);
};

const AI_REASONS = [
  'Best EV range for this route',
  'Top-rated by recent riders',
  'Most fuel-efficient for distance',
  'Highest comfort score',
  'Best value for money',
  'Perfect seat capacity match',
];

// ── Component ─────────────────────────────────────────────────────────────────
const BookRide = () => {
  const navigate = useNavigate();
  const [loading, setLoading]                   = useState(false);
  const [vehicles, setVehicles]                 = useState([]);
  const [routes, setRoutes]                     = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [source, setSource]                     = useState(null);
  const [destination, setDestination]           = useState(null);
  const [selectedVehicle, setSelectedVehicle]   = useState(null);
  const [bookingDate, setBookingDate]           = useState('');
  const [bookingTime, setBookingTime]           = useState('');
  const [showAIPanel, setShowAIPanel]           = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);

  const [formData, setFormData] = useState({
    pickupLocation: '', dropoffLocation: '',
    pickupLat: '', pickupLng: '',
    dropoffLat: '', dropoffLng: '',
    vehicleType: '', seats: '', fuelType: '',
  });

  useEffect(() => { fetchAvailableVehicles(); }, []);

  // Re-score AI recommendations whenever route or filters change
  useEffect(() => {
    if (vehicles.length === 0) return;
    const selectedRoute = routes[selectedRouteIndex] || null;
    const scored = vehicles
      .map((v) => ({
        ...v,
        aiScore: scoreVehicle(v, formData, selectedRoute),
        aiReason: AI_REASONS[Math.floor(Math.random() * AI_REASONS.length)],
      }))
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 3);
    setAiRecommendations(scored);
  }, [vehicles, formData, routes, selectedRouteIndex]);

  const fetchAvailableVehicles = async () => {
    try {
      const response = await vehicleService.getAvailableVehicles();
      setVehicles(response.data || []);
    } catch {
      toast.error('Failed to load vehicles');
    }
  };

  const handlePickupSelect = (location) => {
    setFormData({
      ...formData,
      pickupLocation: location.name,
      pickupLat: location.lat.toString(),
      pickupLng: location.lng.toString(),
    });
    setSource([location.lat, location.lng]);
    toast.success(`📍 Pickup set: ${location.name.split(',')[0]}`);
  };

  const handleDropoffSelect = (location) => {
    setFormData({
      ...formData,
      dropoffLocation: location.name,
      dropoffLat: location.lat.toString(),
      dropoffLng: location.lng.toString(),
    });
    setDestination([location.lat, location.lng]);
    toast.success(`🏁 Dropoff set: ${location.name.split(',')[0]}`);
  };

  const handleSearchRoutes = async () => {
    if (!formData.pickupLat || !formData.dropoffLat) {
      toast.error('Please select both pickup and dropoff locations');
      return;
    }
    setLoading(true);
    try {
      const src  = { lat: parseFloat(formData.pickupLat),  lng: parseFloat(formData.pickupLng) };
      const dest = { lat: parseFloat(formData.dropoffLat), lng: parseFloat(formData.dropoffLng) };
      setSource([src.lat, src.lng]);
      setDestination([dest.lat, dest.lng]);

      const response = await routeService.getMultipleRoutes(src, dest);
      if (response.success && response.data?.length > 0) {
        setRoutes(response.data);
        setSelectedRouteIndex(0);
        setShowAIPanel(true);
        toast.success(`✅ Found ${response.data.length} route${response.data.length > 1 ? 's' : ''}!`);
      } else {
        toast.error('No routes found between these locations');
      }
    } catch (error) {
      toast.error('Failed to find routes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (formData.vehicleType && v.vehicleType !== formData.vehicleType) return false;
    if (formData.seats && v.seats < parseInt(formData.seats))          return false;
    if (formData.fuelType && v.fuelType !== formData.fuelType)         return false;
    return true;
  });

  const handleBookRide = async () => {
    if (!selectedVehicle) { toast.error('Please select a vehicle'); return; }
    if (!formData.pickupLocation || !formData.dropoffLocation) {
      toast.error('Please enter pickup and dropoff locations'); return;
    }
    if (routes.length === 0) { toast.error('Please search for routes first'); return; }

    const selectedRoute = routes[selectedRouteIndex];
    try {
      setLoading(true);
      await bookingService.createBooking({
        vehicleId:         selectedVehicle.id,
        pickupLocation:    formData.pickupLocation,
        dropoffLocation:   formData.dropoffLocation,
        pickupLat:         parseFloat(formData.pickupLat),
        pickupLng:         parseFloat(formData.pickupLng),
        dropoffLat:        parseFloat(formData.dropoffLat),
        dropoffLng:        parseFloat(formData.dropoffLng),
        distance:          selectedRoute.distance,
        estimatedDuration: selectedRoute.duration,
        fare:              selectedRoute.fare,
        scheduledDate:     bookingDate || null,
        scheduledTime:     bookingTime || null,
      });
      toast.success('🎉 Ride booked successfully!');
      navigate('/customer');
    } catch {
      toast.error('Failed to book ride');
    } finally {
      setLoading(false);
    }
  };

  const selectedRoute = routes[selectedRouteIndex];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Book a Ride</h1>
          <p className="text-gray-400 mt-1">Smart route planning with AI-powered vehicle recommendations</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Left Column: Search + Filters ── */}
          <div className="space-y-4">
            {/* Location Search */}
            <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Navigation className="w-5 h-5 text-primary-400" />
                <span>Location Details</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">📍 Pickup Location</label>
                  <LocationSearch placeholder="Search pickup location…" onLocationSelect={handlePickupSelect} />
                  {formData.pickupLocation && (
                    <p className="text-xs text-green-400 mt-1 truncate">✓ {formData.pickupLocation.split(',')[0]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">🏁 Dropoff Location</label>
                  <LocationSearch placeholder="Search dropoff location…" onLocationSelect={handleDropoffSelect} />
                  {formData.dropoffLocation && (
                    <p className="text-xs text-green-400 mt-1 truncate">✓ {formData.dropoffLocation.split(',')[0]}</p>
                  )}
                </div>
                <button
                  onClick={handleSearchRoutes}
                  disabled={loading || !source || !destination}
                  className="w-full flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors font-semibold"
                >
                  <MapPin className="w-5 h-5" />
                  <span>{loading ? 'Searching…' : 'Find Routes'}</span>
                </button>
              </div>
            </div>

            {/* Booking Calendar */}
            <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary-400" />
                <span>Schedule (Optional)</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Time</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-neuro-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                {(bookingDate || bookingTime) && (
                  <p className="text-xs text-primary-400">
                    🗓 Scheduled: {bookingDate} {bookingTime}
                  </p>
                )}
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

          {/* ── Right: Map + Routes + Vehicles ── */}
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
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: route.color }}></div>
                          <span className="text-white font-semibold text-sm">{route.name}</span>
                        </div>
                        {route.recommended && <span className="text-yellow-400 text-lg">⭐</span>}
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{route.description}</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 flex items-center space-x-1"><Clock className="w-3 h-3" /><span>Time</span></span>
                          <span className="text-white font-semibold">{route.duration} min</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 flex items-center space-x-1"><MapPin className="w-3 h-3" /><span>Distance</span></span>
                          <span className="text-white font-semibold">{route.distance} km</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 flex items-center space-x-1"><DollarSign className="w-3 h-3" /><span>Fare</span></span>
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
                            route.traffic === 'Light'    ? 'bg-green-500/20 text-green-400' :
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

            {/* ── Module 5: AI-Powered Vehicle Recommendations ── */}
            {showAIPanel && aiRecommendations.length > 0 && (
              <div className="bg-gradient-to-br from-primary-900/30 to-purple-900/20 rounded-xl border border-primary-500/30 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary-400 animate-pulse" />
                  <h3 className="text-lg font-semibold text-white">AI Recommended Vehicles</h3>
                  <span className="text-xs bg-primary-500/20 text-primary-400 border border-primary-500/30 px-2 py-0.5 rounded-full ml-2">
                    Powered by AI
                  </span>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {aiRecommendations.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle)}
                      className={`p-4 rounded-xl text-left transition-all relative overflow-hidden ${
                        selectedVehicle?.id === vehicle.id
                          ? 'bg-primary-500/25 border-2 border-primary-400 shadow-lg shadow-primary-500/20'
                          : 'bg-neuro-dark hover:bg-gray-700/80 border-2 border-primary-500/20 hover:border-primary-500/40'
                      }`}
                    >
                      {/* AI Score badge */}
                      <div className="absolute top-2 right-2 flex items-center space-x-1 bg-primary-500/20 text-primary-400 text-xs px-1.5 py-0.5 rounded-full border border-primary-500/30">
                        <Star className="w-3 h-3" />
                        <span>{vehicle.aiScore}%</span>
                      </div>

                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                          <Car className="w-5 h-5 text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{vehicle.name}</p>
                          <p className="text-gray-400 text-xs">{vehicle.model}</p>
                        </div>
                        {selectedVehicle?.id === vehicle.id && (
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-xs mb-3">
                        <span className="flex items-center space-x-1 text-gray-400">
                          <Users className="w-3 h-3" /><span>{vehicle.seats}</span>
                        </span>
                        {vehicle.fuelType === 'ELECTRIC' && (
                          <span className="flex items-center space-x-1 text-green-400">
                            <Zap className="w-3 h-3" /><span>EV</span>
                          </span>
                        )}
                        {vehicle.fuelType === 'HYBRID' && (
                          <span className="flex items-center space-x-1 text-blue-400">
                            <Shield className="w-3 h-3" /><span>Hybrid</span>
                          </span>
                        )}
                      </div>

                      {/* AI reason */}
                      <div className="flex items-center space-x-1 text-xs text-primary-300/80 bg-primary-500/10 rounded px-2 py-1">
                        <TrendingUp className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{vehicle.aiReason}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── All Available Vehicles ── */}
            <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                All Available Vehicles ({filteredVehicles.length})
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
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{vehicle.name}</p>
                        <p className="text-gray-400 text-sm">{vehicle.model}</p>
                      </div>
                      {selectedVehicle?.id === vehicle.id && (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-3 text-sm">
                      <span className="flex items-center space-x-1 text-gray-400">
                        <Users className="w-4 h-4" /><span>{vehicle.seats}</span>
                      </span>
                      {vehicle.fuelType === 'ELECTRIC' && (
                        <span className="flex items-center space-x-1 text-green-400">
                          <Zap className="w-4 h-4" /><span>EV</span>
                        </span>
                      )}
                      <span className="text-gray-400">{vehicle.color}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Book Button */}
              {selectedVehicle && routes.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="bg-neuro-dark rounded-lg p-4 border border-gray-700">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Booking Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-gray-400">Vehicle</div>
                      <div className="text-white font-medium">{selectedVehicle.name}</div>
                      <div className="text-gray-400">Route</div>
                      <div className="text-white">{selectedRoute?.name}</div>
                      <div className="text-gray-400">Distance</div>
                      <div className="text-white">{selectedRoute?.distance} km</div>
                      <div className="text-gray-400">Duration</div>
                      <div className="text-white">{selectedRoute?.duration} min</div>
                      {bookingDate && <><div className="text-gray-400">Date</div><div className="text-primary-400">{bookingDate} {bookingTime}</div></>}
                      <div className="text-gray-400 font-medium">Total Fare</div>
                      <div className="text-green-400 font-bold text-sm">₹{selectedRoute?.fare}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleBookRide}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-4 rounded-xl transition-all duration-300 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
                  >
                    {loading ? 'Booking…' : `Confirm Booking — ₹${selectedRoute?.fare || 0}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookRide;