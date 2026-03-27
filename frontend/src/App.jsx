// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageVehicles from './pages/admin/ManageVehicles';
import ManageDrivers from './pages/admin/ManageDrivers';
import ManageManagers from './pages/admin/ManageManagers';
import ManageCustomers from './pages/admin/ManageCustomers';
import AdminReports from './pages/admin/AdminReports';

// Fleet Manager Pages
import ManagerDashboard from './pages/fleetmanager/ManagerDashboard';
import VehicleManagement from './pages/fleetmanager/VehicleManagement';
import VehicleTracking from './pages/fleetmanager/VehicleTracking';
import DriverAssignment from './pages/fleetmanager/DriverAssignment';
import MaintenanceManagement from './pages/fleetmanager/MaintenanceManagement';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import RideRequests from './pages/driver/RideRequests';
import DriverNavigation from './pages/driver/DriverNavigation';
import DriverEarnings from './pages/driver/DriverEarnings';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BookRide from './pages/customer/BookRide';
import RideHistory from './pages/customer/RideHistory';
import CustomerNavigation from './pages/customer/CustomerNavigation';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155'
            }
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/vehicles" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ManageVehicles />
            </ProtectedRoute>
          } />
          <Route path="/admin/drivers" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ManageDrivers />
            </ProtectedRoute>
          } />
          <Route path="/admin/managers" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ManageManagers />
            </ProtectedRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ManageCustomers />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminReports />
            </ProtectedRoute>
          } />

          {/* Fleet Manager Routes */}
          <Route path="/manager" element={
            <ProtectedRoute allowedRoles={['FLEET_MANAGER']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/manager/vehicles" element={
            <ProtectedRoute allowedRoles={['FLEET_MANAGER']}>
              <VehicleManagement />
            </ProtectedRoute>
          } />
          <Route path="/manager/tracking" element={
            <ProtectedRoute allowedRoles={['FLEET_MANAGER']}>
              <VehicleTracking />
            </ProtectedRoute>
          } />
          <Route path="/manager/drivers" element={
            <ProtectedRoute allowedRoles={['FLEET_MANAGER']}>
              <DriverAssignment />
            </ProtectedRoute>
          } />
          <Route path="/manager/maintenance" element={
            <ProtectedRoute allowedRoles={['FLEET_MANAGER']}>
              <MaintenanceManagement />
            </ProtectedRoute>
          } />

          {/* Driver Routes */}
          <Route path="/driver" element={
            <ProtectedRoute allowedRoles={['DRIVER']}>
              <DriverDashboard />
            </ProtectedRoute>
          } />
          <Route path="/driver/requests" element={
            <ProtectedRoute allowedRoles={['DRIVER']}>
              <RideRequests />
            </ProtectedRoute>
          } />
          <Route path="/driver/navigation" element={
            <ProtectedRoute allowedRoles={['DRIVER']}>
              <DriverNavigation />
            </ProtectedRoute>
          } />
          <Route path="/driver/earnings" element={
            <ProtectedRoute allowedRoles={['DRIVER']}>
              <DriverEarnings />
            </ProtectedRoute>
          } />

          {/* Customer Routes */}
          <Route path="/customer" element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/customer/book" element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <BookRide />
            </ProtectedRoute>
          } />
          <Route path="/customer/history" element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <RideHistory />
            </ProtectedRoute>
          } />
          <Route path="/customer/navigation/:bookingId" element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerNavigation />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;