import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Component to protect routes that require authentication
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children ? children : <Outlet />;
};

// Component to protect instructor-only routes
export const InstructorRoute = ({ children }) => {
  const { isAuthenticated, isInstructor, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (!isInstructor) {
    return <Navigate to="/home" />;
  }

  return children ? children : <Outlet />;
};

// Component to protect admin-only routes
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (!isAdmin) {
    return <Navigate to="/home" />;
  }

  return children ? children : <Outlet />;
};

// Component to redirect authenticated users from login/register pages
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isAuthenticated) {
    if (userRole === 'instructor') {
      return <Navigate to="/instructor/home" />;
    } else {
      return <Navigate to="/home" />;
    }
  }

  return children ? children : <Outlet />;
};