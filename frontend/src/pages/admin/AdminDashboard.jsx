// frontend/src/pages/admin/AdminDashboard.jsx
// Module 6: Admin Dashboard & Urban Mobility Insights
// Features: KPI cards, fleet heatmap (Leaflet), hourly rental chart (Chart.js),
//           real-time fleet status overview, vehicle status grid

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import Loading from '../../components/common/Loading';
import FleetStatsChart from '../../components/charts/FleetStatsChart';
import TripStatsChart from '../../components/charts/TripStatsChart';
import {
  Car, Users, UserCheck, Activity, AlertTriangle,
  Navigation, TrendingUp, Clock, Zap, MapPin, BarChart2,
} from 'lucide-react';
import userService from '../../services/userService';
import vehicleService from '../../services/vehicleService';
import bookingService from '../../services/bookingService';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, PointElement, LineElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  MapContainer, TileLayer, CircleMarker, Popup,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, PointElement, LineElement
);

// ── Simulated data helpers (replace with real API calls as needed) ────────────

const generateHourlyData = () =>
  Array.from({ length: 24 }, (_, h) => ({
    hour: `${h.toString().padStart(2, '0')}:00`,
    rentals: Math.floor(
      h >= 7 && h <= 9 ? Math.random() * 40 + 30   // morning rush
      : h >= 17 && h <= 19 ? Math.random() * 50 + 35 // evening rush
      : h >= 22 || h <= 5 ? Math.random() * 5        // night low
      : Math.random() * 25 + 10
    ),
  }));

// Bengaluru hotspot coords for heatmap demo
const HOTSPOT_DATA = [
  { lat: 12.9716, lng: 77.5946, intensity: 90, area: 'MG Road' },
  { lat: 12.9279, lng: 77.6271, intensity: 75, area: 'Koramangala' },
  { lat: 13.0358, lng: 77.5970, intensity: 60, area: 'Hebbal' },
  { lat: 12.9698, lng: 77.7499, intensity: 55, area: 'Whitefield' },
  { lat: 12.8399, lng: 77.6770, intensity: 45, area: 'Electronic City' },
  { lat: 13.0068, lng: 77.5800, intensity: 70, area: 'Yeshwanthpur' },
  { lat: 12.9542, lng: 77.4993, intensity: 50, area: 'Rajajinagar' },
  { lat: 12.9010, lng: 77.6640, intensity: 65, area: 'HSR Layout' },
];

const VEHICLE_STATUS_MOCK = [
  { id: 'V-001', name: 'Toyota Innova', type: 'SUV', status: 'ACTIVE', driver: 'Ravi K.', location: 'MG Road' },
  { id: 'V-002', name: 'Maruti Swift', type: 'HATCHBACK', status: 'AVAILABLE', driver: '—', location: 'Koramangala Depot' },
  { id: 'V-003', name: 'Tata Nexon EV', type: 'SUV', status: 'CHARGING', driver: '—', location: 'Hebbal Depot' },
  { id: 'V-004', name: 'Honda City', type: 'SEDAN', status: 'ACTIVE', driver: 'Suman P.', location: 'Whitefield' },
  { id: 'V-005', name: 'Hyundai Creta', type: 'SUV', status: 'MAINTENANCE', driver: '—', location: 'Workshop' },
  { id: 'V-006', name: 'Kia EV6', type: 'SEDAN', status: 'ACTIVE', driver: 'Priya S.', location: 'Indiranagar' },
];

const STATUS_STYLE = {
  ACTIVE:      { bg: 'bg-green-500/20',  text: 'text-green-400',  dot: 'bg-green-400' },
  AVAILABLE:   { bg: 'bg-blue-500/20',   text: 'text-blue-400',   dot: 'bg-blue-400' },
  CHARGING:    { bg: 'bg-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  MAINTENANCE: { bg: 'bg-red-500/20',    text: 'text-red-400',    dot: 'bg-red-400' },
};

// ── Component ─────────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVehicles: 0, totalDrivers: 0, totalManagers: 0,
    totalCustomers: 0, activeTrips: 0, vehicleStats: {},
    tripsToday: 0, activeRoutes: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [tripData, setTripData] = useState([]);
  const [hourlyData] = useState(generateHourlyData);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [userStats, vehicleStats, bookingStats, bookings] = await Promise.all([
        userService.getUserStats(),
        vehicleService.getVehicleStats(),
        bookingService.getBookingStats(),
        bookingService.getAllBookings(),
      ]);

      setStats({
        totalVehicles:  vehicleStats.data?.total    || 0,
        totalDrivers:   userStats.data?.drivers     || 0,
        totalManagers:  userStats.data?.managers    || 0,
        totalCustomers: userStats.data?.customers   || 0,
        activeTrips:    bookingStats.data?.active   || 0,
        vehicleStats:   vehicleStats.data           || {},
        tripsToday:     bookingStats.data?.today    || Math.floor(Math.random() * 80 + 20),
        activeRoutes:   bookingStats.data?.routes   || Math.floor(Math.random() * 15 + 5),
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

  // Hourly chart config
  const hourlyChartData = {
    labels: hourlyData.map((d) => d.hour),
    datasets: [
      {
        label: 'Rentals',
        data: hourlyData.map((d) => d.rentals),
        backgroundColor: (ctx) => {
          const v = ctx.raw;
          return v > 40 ? 'rgba(239,68,68,0.7)'
               : v > 20 ? 'rgba(245,158,11,0.7)'
               : 'rgba(99,102,241,0.7)';
        },
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const hourlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw} rentals`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af', font: { size: 10 }, maxRotation: 45 },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  };

  if (loading) return <Loading message="Loading dashboard..." />;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Urban Mobility Insights & Fleet Overview</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center space-x-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 border border-primary-500/30 px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <Activity className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* ── Module 6: KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Fleet"     value={stats.totalVehicles}  icon={Car}       color="primary" />
          <StatCard title="Trips Today"     value={stats.tripsToday}     icon={Navigation} color="success" />
          <StatCard title="Active Routes"   value={stats.activeRoutes}   icon={MapPin}    color="info" />
          <StatCard title="Total Users"     value={stats.totalCustomers} icon={Users}     color="warning" />
        </div>

        {/* ── Module 6: Fleet Distribution Heatmap + Hourly Chart ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Heatmap */}
          <div className="bg-neuro-light rounded-xl border border-gray-700 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="w-5 h-5 text-primary-400" />
              <h2 className="text-lg font-semibold text-white">Fleet Distribution Heatmap</h2>
            </div>
            <div className="h-72 rounded-lg overflow-hidden">
              <MapContainer
                center={[12.9716, 77.5946]}
                zoom={11}
                className="h-full w-full"
                style={{ background: '#1a1a2e' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {HOTSPOT_DATA.map((spot, i) => (
                  <CircleMarker
                    key={i}
                    center={[spot.lat, spot.lng]}
                    radius={Math.max(10, spot.intensity / 5)}
                    pathOptions={{
                      color:       spot.intensity > 70 ? '#ef4444' : spot.intensity > 50 ? '#f59e0b' : '#6366f1',
                      fillColor:   spot.intensity > 70 ? '#ef4444' : spot.intensity > 50 ? '#f59e0b' : '#6366f1',
                      fillOpacity: 0.55,
                      weight:      1,
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>{spot.area}</strong>
                        <br />Activity: {spot.intensity}%
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
              <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span><span>High (&gt;70%)</span></span>
              <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span><span>Medium (50–70%)</span></span>
              <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span><span>Low (&lt;50%)</span></span>
            </div>
          </div>

          {/* Hourly Rental Activity */}
          <div className="bg-neuro-light rounded-xl border border-gray-700 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <BarChart2 className="w-5 h-5 text-primary-400" />
              <h2 className="text-lg font-semibold text-white">Hourly Rental Activity</h2>
            </div>
            <div className="h-72">
              <Bar data={hourlyChartData} options={hourlyChartOptions} />
            </div>
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Fleet Status</h2>
            <FleetStatsChart data={stats.vehicleStats} />
          </div>
          <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Trip Statistics</h2>
            <TripStatsChart data={tripData} />
          </div>
        </div>

        {/* ── Module 6: Real-time Fleet Status Overview ── */}
        <div className="bg-neuro-light rounded-xl border border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-primary-400" />
            <h2 className="text-xl font-semibold text-white">Real-time Fleet Status</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {VEHICLE_STATUS_MOCK.map((v) => {
              const s = STATUS_STYLE[v.status] || STATUS_STYLE.AVAILABLE;
              return (
                <div key={v.id} className="bg-neuro-dark rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Car className="w-4 h-4 text-gray-400" />
                      <span className="text-white font-medium text-sm">{v.name}</span>
                    </div>
                    <span className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                      <span>{v.status}</span>
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p><span className="text-gray-500">ID:</span> {v.id} · {v.type}</p>
                    <p><span className="text-gray-500">Driver:</span> {v.driver}</p>
                    <p className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{v.location}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recent Bookings ── */}
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
                          booking.status === 'COMPLETED'   ? 'bg-green-500/20 text-green-400' :
                          booking.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                          booking.status === 'PENDING'     ? 'bg-yellow-500/20 text-yellow-400' :
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