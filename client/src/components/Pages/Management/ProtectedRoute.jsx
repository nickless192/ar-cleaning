import React from 'react';
import { Navigate } from 'react-router-dom';
import Auth from "/src/utils/auth"; // Adjust the path based on your project structure

const ProtectedRoute = ({ element, requireAdmin = false }) => {
  const isAuthenticated = Auth.loggedIn();
  const profile = Auth.getProfile()?.data;
  const roleNames = Array.isArray(profile?.roles) ? profile.roles : [];
  const isAdmin = !!profile?.adminFlag || roleNames.includes('admin');

  if (!isAuthenticated) {
    return <Navigate to="/login-signup" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedRoute;
