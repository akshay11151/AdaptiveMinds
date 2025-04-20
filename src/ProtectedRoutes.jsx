import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Component to protect routes that require authentication
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isDisabled } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If user is disabled, redirect to login with an error state
  if (isDisabled) {
    return <Navigate to="/" state={{ error: 'Your account has been disabled. Please contact an administrator.' }} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children ? children : <Outlet />;
};

// Component to protect instructor-only routes
export const InstructorRoute = ({ children }) => {
  const { isAuthenticated, isInstructor, loading, isDisabled } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If user is disabled, redirect to login with an error state
  if (isDisabled) {
    return <Navigate to="/" state={{ error: 'Your account has been disabled. Please contact an administrator.' }} />;
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
  const { isAuthenticated, isAdmin, loading, isDisabled } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Admin should never be disabled, but include check for consistency
  if (isDisabled) {
    return <Navigate to="/" state={{ error: 'Your account has been disabled. Please contact an administrator.' }} />;
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
  const { isAuthenticated, userRole, loading, isDisabled } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Don't redirect if user is disabled - they'll see the login page with error message
  if (isDisabled) {
    return children ? children : <Outlet />;
  }

  if (isAuthenticated) {
    if (userRole === 'instructor') {
      return <Navigate to="/instructor/home" />;
    } else if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/home" />;
    }
  }

  return children ? children : <Outlet />;
};