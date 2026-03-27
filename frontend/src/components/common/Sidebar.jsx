// frontend/src/components/common/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Car, Users, MapPin, Wrench, 
  DollarSign, Navigation, History, Calendar, FileText
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/admin/vehicles', label: 'Manage Vehicles', icon: Car },
          { to: '/admin/drivers', label: 'Manage Drivers', icon: Users },
          { to: '/admin/managers', label: 'Manage Managers', icon: Users },
          { to: '/admin/customers', label: 'Manage Customers', icon: Users },
          { to: '/admin/reports', label: 'Reports', icon: FileText },
        ];
      case 'FLEET_MANAGER':
        return [
          { to: '/manager', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/manager/vehicles', label: 'Vehicle Management', icon: Car },
          { to: '/manager/tracking', label: 'Vehicle Tracking', icon: MapPin },
          { to: '/manager/drivers', label: 'Driver Assignment', icon: Users },
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

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-neuro-light min-h-screen border-r border-gray-700 hidden lg:block">
      <div className="p-4">
        <Link to="/" className="flex items-center space-x-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-neuro-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <span className="text-xl font-bold text-white">NeuroFleetX</span>
        </Link>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;