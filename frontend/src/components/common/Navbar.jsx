// frontend/src/components/common/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, X, User, LogOut, Settings, Bell, 
  LayoutDashboard, Car, Users, MapPin, Wrench, 
  DollarSign, Navigation, History, Calendar
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavLinks = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/admin/vehicles', label: 'Vehicles', icon: Car },
          { to: '/admin/drivers', label: 'Drivers', icon: Users },
          { to: '/admin/managers', label: 'Managers', icon: Users },
          { to: '/admin/customers', label: 'Customers', icon: Users },
          { to: '/admin/reports', label: 'Reports', icon: Calendar },
        ];
      case 'FLEET_MANAGER':
        return [
          { to: '/manager', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/manager/vehicles', label: 'Vehicles', icon: Car },
          { to: '/manager/tracking', label: 'Tracking', icon: MapPin },
          { to: '/manager/drivers', label: 'Drivers', icon: Users },
          { to: '/manager/maintenance', label: 'Maintenance', icon: Wrench },
        ];
      case 'DRIVER':
        return [
          { to: '/driver', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/driver/requests', label: 'Ride Requests', icon: Car },
          { to: '/driver/navigation', label: 'Navigation', icon: Navigation },
          { to: '/driver/earnings', label: 'Earnings', icon: DollarSign },
        ];
      case 'CUSTOMER':
        return [
          { to: '/customer', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/customer/book', label: 'Book Ride', icon: Car },
          { to: '/customer/history', label: 'Ride History', icon: History },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-neuro-light border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={`/${user?.role?.toLowerCase().replace('_', '')}`} className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-neuro-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-xl font-bold text-white">NeuroFleetX</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="hidden sm:block text-gray-300">{user?.name}</span>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-neuro-light rounded-lg shadow-lg border border-gray-700 py-1 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded">
                      {user?.role?.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neuro-light border-t border-gray-700 animate-slideIn">
          <div className="px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;