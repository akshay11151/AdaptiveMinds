import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  User, 
  Bell, 
  Settings, 
  LogOut, 
  BarChart2,
  HelpCircle,
  FileText,
  ShoppingBag,
  MessageSquare,
  CreditCard,
  Flag,
  X,
  DollarSign,
  PieChart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const AdminSidebar = ({ activeView, setActiveView, isSidebarOpen, setIsSidebarOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Redirect to login page
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Sidebar menu items
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart2 className="h-5 w-5" />,
      onClick: () => setActiveView('dashboard')
    },
    {
      id: 'users',
      label: 'Users Management',
      icon: <Users className="h-5 w-5" />,
      onClick: () => setActiveView('users')
    },
    
    {
      id: 'courses',
      label: 'Courses',
      icon: <BookOpen className="h-5 w-5" />,
      onClick: () => {}
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
      onClick: () => setActiveView('notifications')
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: <PieChart className="h-5 w-5" />,
      onClick: () => {}
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <CreditCard className="h-5 w-5" />,
      onClick: () => {}
    },
    {
      id: 'content',
      label: 'Content Management',
      icon: <FileText className="h-5 w-5" />,
      onClick: () => {}
    },
    {
      id: 'discussions',
      label: 'Discussions',
      icon: <MessageSquare className="h-5 w-5" />,
      onClick: () => {}
    },
    {
      id: 'logout',
      label: 'LogOut',
      icon: <Settings className="h-5 w-5" />,
      onClick: handleLogout
    }
  ];

  // Function to close sidebar on mobile
  const closeSidebar = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 transition-transform duration-300 ease-in-out transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-2 rounded-md">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h2 className="ml-3 text-xl font-bold text-white">LearningHub</h2>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="px-2 py-4 h-full flex flex-col">
          <div className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick();
                  closeSidebar();
                }}
                className={`
                  w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors
                  ${activeView === item.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
                {item.id === 'notifications' && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    3
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-gray-700 pt-4 mt-6">
            <button className="w-full flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
              <HelpCircle className="h-5 w-5 mr-3" />
              <span>Help & Support</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;