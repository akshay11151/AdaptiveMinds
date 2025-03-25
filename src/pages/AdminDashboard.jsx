import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  User, 
  Bell, 
  Settings, 
  LogOut, 
  Search,
  Menu,
  X,
  BarChart2,
  TrendingUp,
  DollarSign,
  Award,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import UsersManagement from './UsersManagement';
import InstructorsManagement from './InstructorsManagement';
import NotificationsManagement from './NotificationsManagement';

// Chart component
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  // Sample data for charts and statistics
  const userGrowthData = [
    { month: 'Jan', users: 1200 },
    { month: 'Feb', users: 1900 },
    { month: 'Mar', users: 2400 },
    { month: 'Apr', users: 3200 },
    { month: 'May', users: 4000 },
    { month: 'Jun', users: 4800 },
    { month: 'Jul', users: 5600 },
    { month: 'Aug', users: 6300 },
    { month: 'Sep', users: 7200 },
    { month: 'Oct', users: 8000 },
    { month: 'Nov', users: 8800 },
    { month: 'Dec', users: 9500 },
  ];

  const courseEnrollmentData = [
    { name: 'Web Dev', value: 35 },
    { name: 'Data Science', value: 25 },
    { name: 'Design', value: 20 },
    { name: 'Business', value: 15 },
    { name: 'Others', value: 5 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const revenueData = [
    { month: 'Jan', revenue: 15000 },
    { month: 'Feb', revenue: 18000 },
    { month: 'Mar', revenue: 17000 },
    { month: 'Apr', revenue: 22000 },
    { month: 'May', revenue: 24000 },
    { month: 'Jun', revenue: 28000 },
    { month: 'Jul', revenue: 32000 },
    { month: 'Aug', revenue: 35000 },
    { month: 'Sep', revenue: 40000 },
    { month: 'Oct', revenue: 44000 },
    { month: 'Nov', revenue: 48000 },
    { month: 'Dec', revenue: 52000 },
  ];

  // Dashboard component with KPI cards and charts
  const renderDashboard = () => {
    return (
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Users</p>
                <h3 className="text-2xl font-bold text-gray-800">9,523</h3>
                <div className="flex items-center mt-1 text-green-600 text-sm">
                  <ChevronUp className="h-4 w-4" />
                  <span className="ml-1">12.5% increase</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-800">$324,521</h3>
                <div className="flex items-center mt-1 text-green-600 text-sm">
                  <ChevronUp className="h-4 w-4" />
                  <span className="ml-1">8.2% increase</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Courses</p>
                <h3 className="text-2xl font-bold text-gray-800">243</h3>
                <div className="flex items-center mt-1 text-green-600 text-sm">
                  <ChevronUp className="h-4 w-4" />
                  <span className="ml-1">5.3% increase</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Instructors</p>
                <h3 className="text-2xl font-bold text-gray-800">124</h3>
                <div className="flex items-center mt-1 text-green-600 text-sm">
                  <ChevronUp className="h-4 w-4" />
                  <span className="ml-1">3.7% increase</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Line Chart - User Growth */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">User Growth</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart - Revenue */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Revenue</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Revenue']}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* More Charts and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pie Chart - Course Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm lg:col-span-1">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Course Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseEnrollmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {courseEnrollmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-800 font-medium">15 new users registered</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-800 font-medium">$2,542 revenue generated</p>
                  <p className="text-sm text-gray-500">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-orange-100 p-2 rounded-full mr-3">
                  <BookOpen className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-gray-800 font-medium">3 new courses published</p>
                  <p className="text-sm text-gray-500">12 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-purple-100 p-2 rounded-full mr-3">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-800 font-medium">2 new instructors joined</p>
                  <p className="text-sm text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Conditional rendering based on active view
  let mainContent;
  switch (activeView) {
    case 'users':
      mainContent = <UsersManagement />;
      break;
    case 'instructors':
      mainContent = <InstructorsManagement />;
      break;
    case 'notifications':
      mainContent = <NotificationsManagement />;
      break;
    default:
      mainContent = renderDashboard();
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-500 mr-4 md:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="relative md:w-64">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative text-gray-500 hover:text-gray-700">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center transform translate-x-1 -translate-y-1">
                  3
                </span>
              </button>
              <div className="relative">
                <button className="flex items-center focus:outline-none">
                  <img
                    src="/api/placeholder/40/40"
                    alt="Admin"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="ml-2 hidden sm:block text-sm font-medium text-gray-700">Admin User</span>
                  <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-800">
                {activeView === 'dashboard' && 'Admin Dashboard'}
                {activeView === 'users' && 'Users Management'}
                {activeView === 'instructors' && 'Instructors Management'}
                {activeView === 'notifications' && 'Notifications Management'}
              </h1>
              <p className="text-gray-600 mt-1">
                {activeView === 'dashboard' && 'Overview of your learning platform'}
                {activeView === 'users' && 'Manage and monitor user accounts'}
                {activeView === 'instructors' && 'Manage your platform instructors'}
                {activeView === 'notifications' && 'Manage system notifications and announcements'}
              </p>
            </div>

            {/* Render the appropriate content based on active view */}
            {mainContent}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;