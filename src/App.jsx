import React from 'react';
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from './AuthContext';
import { ProtectedRoute, InstructorRoute, AdminRoute, PublicRoute } from './ProtectedRoutes';

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LandingPage from './pages/LandingPage';
import CoursesPage from "./pages/CoursesPage";
import FeedbackPage from "./pages/FeedbackPage";
import NotificationPage from './pages/NotificationPage';
import InstructorsDashboardPage from './pages/InstructorsDashboardPage';
import InstructorsProfile from './pages/InstructorsProfile';
import AdminDashboard from './pages/AdminDashboard';
import UserProfilePage from './pages/UserProfilePage';



const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes - Accessible to unauthenticated users */}
        <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        
        {/* Protected Routes - Require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<LandingPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path='/userprofile' element={<UserProfilePage />} />
          <Route path="/notifications" element={<NotificationPage />} />
        </Route>
        
        {/* Instructor Routes - Only accessible to instructors */}
        <Route element={<InstructorRoute />}>
          <Route path="/instructor/home" element={<InstructorsDashboardPage />} />
       
          <Route path="/instructor/profile" element={<InstructorsProfile />} />
        </Route>
        
        {/* Admin Routes - Only accessible to admins */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
        
        {/* Fallback route - Redirect to home or login based on auth status */}
        <Route path="*" element={<ProtectedRoute><LandingPage /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
};

export default App;