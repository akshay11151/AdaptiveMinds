import React, { useState } from 'react';
import { 
  Search,
  Menu,
  X,
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import UsersManagement from './UsersManagement';
import FeedbackManagement from './FeedbackManagement';
import NotificationsManagement from './NotificationsManagement';
import ContactUsManagement from './ContactUsManagement';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('users');

  // Conditional rendering based on active view
  let mainContent;
  let pageTitle;
  let pageDescription;

  switch (activeView) {
    case 'users':
      mainContent = <UsersManagement />;
      pageTitle = 'Users Management';
      pageDescription = 'Manage and monitor user accounts';
      break;
    case 'notifications':
      mainContent = <NotificationsManagement />;
      pageTitle = 'Notifications Management';
      pageDescription = 'Manage system notifications and announcements';
      break;
    case 'feedback':
      mainContent = <FeedbackManagement />;
      pageTitle = 'Feedback Management';
      pageDescription = 'Manage and respond to user feedback';
      break;
    case 'contact-us':
      mainContent = <ContactUsManagement />;
      pageTitle = 'Contact Messages';
      pageDescription = 'Manage and respond to contact form submissions';
      break;
    default:
      mainContent = <UsersManagement />;
      pageTitle = 'Users Management';
      pageDescription = 'Manage and monitor user accounts';
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
              <div className="relative">
                <button className="flex items-center focus:outline-none">
                  <img
                    src="/api/placeholder/40/40"
                    alt="Admin"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="ml-2 hidden sm:block text-sm font-medium text-gray-700">Admin User</span>
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
              <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
              <p className="text-gray-600 mt-1">{pageDescription}</p>
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