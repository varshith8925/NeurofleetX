// frontend/src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRedirects = {
      ADMIN: '/admin',
      FLEET_MANAGER: '/manager',
      DRIVER: '/driver',
      CUSTOMER: '/customer'
    };
    return <Navigate to={roleRedirects[user.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;