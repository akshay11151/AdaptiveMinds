import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../AuthContext';

const Navbar = () => {
  // Get auth context and navigation
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Get username from currentUser or fallback to "User"
  const username = currentUser?.displayName || currentUser?.email?.split('@')[0] || "User";
  
  // State for dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Navigate to login page after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  return (
    <nav className="bg-white shadow-md py-4 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo & Brand Name */}
        <Link to="/home" className="flex items-center">
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-2 rounded-full shadow-sm">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h1 className="ml-2 text-xl font-bold text-gray-800">LearningHub</h1>
        </Link>
        
        {/* Navigation Items */}
        <div className="hidden md:flex space-x-8 items-center">
          <Link to="/home" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
            Home
          </Link>
          <Link to="/courses" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
            Courses
          </Link>
          <Link to="/feedback" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
            Feedback
          </Link>
          <Link to="/contact-us" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
            Contact Us
          </Link>
          <Link to="/discussion" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
            Discussion
          </Link>
          <Link to="/notifications" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
            Notifications
          </Link>
          
          {/* New dropdown for Others */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center text-gray-700 hover:text-orange-500 transition-colors font-medium"
            >
              Others
              <ChevronDown className="ml-1 h-4 w-4" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Link 
                  to="/certificates" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  Certificates
                </Link>
                <Link 
                  to="/wishlist" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  Wishlist
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* User Actions */}
        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="hidden md:block text-gray-700 font-medium mr-3">
                {username}
              </div>
              <Link to="/userprofile" className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors">
                <User className="h-5 w-5 text-orange-600" />
              </Link>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center text-gray-700 hover:text-orange-500 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden md:inline ml-1">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
              Login
            </Link>
            <Link to="/register" className="bg-gradient-to-r from-orange-400 to-orange-500 text-white py-2 px-4 rounded-lg hover:from-orange-500 hover:to-orange-600 transition-colors shadow-sm">
              Register
            </Link>
          </div>
        )}
        
        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;