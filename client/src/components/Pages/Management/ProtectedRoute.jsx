import React from 'react';
import { Navigate } from 'react-router-dom';
import Auth from "/src/utils/auth"; // Adjust the path based on your project structure

const ProtectedRoute = ({ element }) => {
  const isAuthenticated = Auth.loggedIn();

  return isAuthenticated ? element : <Navigate to="/login-page" replace />;
};

export default ProtectedRoute;
