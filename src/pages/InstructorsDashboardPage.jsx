import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { BookOpen, BarChart2, User, Clock, LogOut } from 'lucide-react';

const InstructorsDashboardPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Get the first name from displayName or fallback to "Instructor"
  const firstName = currentUser?.displayName?.split(' ')[0] 
    || currentUser?.email?.split('@')[0] 
    || 'Instructor';

  // Handle logout with proper navigation
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Navigate to login page after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Sample data for instructor home page
  const upcomingClasses = [
    { id: 1, title: 'Advanced Data Analysis', time: 'Today, 2:00 PM', students: 24 },
    { id: 2, title: 'Python Programming Basics', time: 'Tomorrow, 10:00 AM', students: 32 },
    { id: 3, title: 'Machine Learning Fundamentals', time: 'Friday, 3:30 PM', students: 18 }
  ];

  const recentAssignments = [
    { id: 1, title: 'Data Visualization Project', course: 'Data Science', submissions: 18, total: 24 },
    { id: 2, title: 'Python Algorithms Exercise', course: 'Python Programming', submissions: 28, total: 32 },
    { id: 3, title: 'Model Training Report', course: 'Machine Learning', submissions: 10, total: 18 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-2 rounded-full">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-800">LearningHub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/instructor/profile" className="text-gray-700 hover:text-orange-500">
                <User className="h-6 w-6" />
              </Link>
              <button onClick={handleLogout} className="text-gray-700 hover:text-orange-500">
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {firstName}!</h1>
          <p className="text-gray-600 mt-2">Here's an overview of your teaching activities.</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link 
            to="/instructor/home" 
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center"
          >
            <div className="p-3 bg-orange-100 rounded-lg mr-4">
              <BarChart2 className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Dashboard</h2>
              <p className="text-sm text-gray-600">View your teaching analytics</p>
            </div>
          </Link>
          
          <Link 
            to="/instructor/courses" 
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center"
          >
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">My Courses</h2>
              <p className="text-sm text-gray-600">Manage your courses</p>
            </div>
          </Link>
          
          <Link 
            to="/instructor/profile" 
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center"
          >
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Profile</h2>
              <p className="text-sm text-gray-600">Update your information</p>
            </div>
          </Link>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Upcoming Classes */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Upcoming Classes</h2>
              <Link to="/instructor/schedule" className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                View all
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {upcomingClasses.map(classItem => (
                <div key={classItem.id} className="p-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">{classItem.title}</h3>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{classItem.time}</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      {classItem.students} students
                    </div>
                  </div>
                </div>
              ))}
              
              {upcomingClasses.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No upcoming classes scheduled.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Assignments */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Assignments</h2>
              <Link to="/instructor/assignments" className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                View all
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {recentAssignments.map(assignment => (
                <div key={assignment.id} className="p-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">{assignment.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{assignment.course}</p>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 text-right mb-1">
                        {assignment.submissions} / {assignment.total} submissions
                      </div>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full" 
                          style={{ width: `${(assignment.submissions / assignment.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {recentAssignments.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No recent assignments.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstructorsDashboardPage;