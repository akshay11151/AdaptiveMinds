import React from 'react';
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from './AuthContext';
import { ProtectedRoute, InstructorRoute, AdminRoute, PublicRoute } from './ProtectedRoutes';

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LandingPage from './pages/LandingPage';
import CoursesPage from "./pages/CoursesPage";
import CourseViewPage from "./pages/CourseViewPage"; // New course view page
import CertificatesPage from "./pages/CertificatesPage"; // New certificates page
import CertificateView from "./pages/CertificateView"; // New certificate view page
import WishlistPage from "./pages/WishlistPage"; // New wishlist page
import FeedbackPage from "./pages/FeedbackPage";
import NotificationPage from './pages/NotificationPage';
import ContactUsPage from './pages/ContactUsPage';
import DiscussionPage from './pages/DiscussionPage';
import InstructorsDashboardPage from './pages/InstructorsDashboardPage';
import InstructorsProfile from './pages/InstructorsProfile';
import InstructorStudents from './pages/InstructorStudents';
import InstructorCourses from './pages/InstructorCourses';
import InstructorDiscussions from './pages/InstructorDiscussions';
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
          <Route path="/course-view/:courseId" element={<CourseViewPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/certificate/:certificateId" element={<CertificateView />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/discussion" element={<DiscussionPage />} />
          <Route path="/userprofile" element={<UserProfilePage />} />
          <Route path="/notifications" element={<NotificationPage />} />
        </Route>
         
        {/* Instructor Routes - Only accessible to instructors */}
        <Route element={<InstructorRoute />}>
          <Route path="/instructor/home" element={<InstructorsDashboardPage />} />
          <Route path="/instructor/profile" element={<InstructorsProfile />} />
          <Route path="/instructor/students" element={<InstructorStudents />} />
          <Route path="/instructor/courses" element={<InstructorCourses />} />
          <Route path="/instructor/discussions" element={<InstructorDiscussions />} />
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