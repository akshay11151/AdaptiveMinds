import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Book, 
  Calendar, 
  Clock, 
  MessageCircle, 
  Settings, 
  Info,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Loader
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../AuthContext';

// Individual notification component
const NotificationItem = ({ notification }) => {
  const icons = {
    course: <Book className="h-5 w-5" />,
    deadline: <Clock className="h-5 w-5" />,
    announcement: <Bell className="h-5 w-5" />,
    discussion: <MessageCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    alert: <AlertCircle className="h-5 w-5" />,
    update: <RefreshCw className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />
  };

  // Get formatted time
  const getFormattedTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    try {
      // Handle Firestore Timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffInMS = now - date;
      const diffInMin = Math.floor(diffInMS / (1000 * 60));
      const diffInHrs = Math.floor(diffInMS / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMS / (1000 * 60 * 60 * 24));
      
      if (diffInMin < 60) {
        return diffInMin <= 1 ? 'Just now' : `${diffInMin} minutes ago`;
      } else if (diffInHrs < 24) {
        return `${diffInHrs} ${diffInHrs === 1 ? 'hour' : 'hours'} ago`;
      } else if (diffInDays < 7) {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (err) {
      console.error("Error formatting date:", err);
      return 'Unknown time';
    }
  };

  return (
    <div className="border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start">
        {/* Icon */}
        <div className={`mr-4 p-2.5 rounded-full flex-shrink-0 ${getNotificationColor(notification.type)} text-white`}>
          {icons[notification.type] || <Bell className="h-5 w-5" />}
        </div>

        {/* Content */}
        <div className="flex-grow">
          <h4 className="text-sm font-medium text-gray-900">
            {notification.title || 'Notification'}
          </h4>
          <p className="text-sm mt-1 text-gray-700">
            {notification.message}
          </p>
          
          {notification.actionLink && (
            <Link 
              to={notification.actionLink} 
              className="text-orange-500 hover:text-orange-600 text-sm mt-1 inline-block"
            >
              {notification.actionText || 'View Details'}
            </Link>
          )}
          
          <div className="mt-2">
            <p className="text-xs text-gray-500">{getFormattedTime(notification.createdAt || notification.date)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to get notification color based on type
const getNotificationColor = (type) => {
  switch (type) {
    case 'course':
      return 'bg-blue-500';
    case 'deadline':
      return 'bg-red-500';
    case 'announcement':
      return 'bg-orange-500';
    case 'discussion':
      return 'bg-green-500';
    case 'warning':
      return 'bg-amber-500';
    case 'alert':
      return 'bg-red-500';
    case 'update':
      return 'bg-indigo-500';
    case 'info':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

// Filter tabs component
const FilterTabs = ({ activeFilter, setActiveFilter, filters }) => {
  return (
    <div className="flex overflow-x-auto pb-2 mb-4">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => setActiveFilter(filter.value)}
          className={`flex items-center px-4 py-2 mr-2 rounded-full whitespace-nowrap ${
            activeFilter === filter.value
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          } transition-colors`}
        >
          {filter.icon}
          <span className="ml-2">{filter.label}</span>
        </button>
      ))}
    </div>
  );
};

// Empty state component
const EmptyState = ({ filter, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-600">Loading notifications...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-orange-100 p-4 rounded-full mb-4">
        <Bell className="h-8 w-8 text-orange-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">No notifications</h3>
      <p className="text-gray-600 text-center max-w-sm">
        {filter === 'all' 
          ? "You don't have any notifications right now. Check back later!" 
          : `You don't have any ${filter} notifications at the moment.`}
      </p>
    </div>
  );
};

const NotificationPage = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const notificationsPerPage = 10;

  // Filter definitions
  const filters = [
    { label: 'All Notifications', value: 'all', icon: <Bell className="h-4 w-4" /> },
    { label: 'Announcements', value: 'announcement', icon: <Bell className="h-4 w-4" /> },
    { label: 'Information', value: 'info', icon: <Info className="h-4 w-4" /> },
    { label: 'Warnings', value: 'warning', icon: <AlertTriangle className="h-4 w-4" /> },
    { label: 'Alerts', value: 'alert', icon: <AlertCircle className="h-4 w-4" /> }
  ];

  // Fetch notifications from Firestore
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Create query based on user role and general notifications
        const userRole = currentUser.role || 'user';
        const notificationsRef = collection(db, 'user_notifications');
        
        // Simple query without compound conditions to avoid index issues
        let notificationsQuery = query(
          notificationsRef,
          where('userId', '==', currentUser.uid),
          // We'll sort client-side to avoid index requirements
          limit(notificationsPerPage)
        );
        
        const snapshot = await getDocs(notificationsQuery);
        
        if (snapshot.docs.length === notificationsPerPage) {
          setHasMore(true);
        } else {
          setHasMore(false);
        }
        
        const userNotifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Also fetch general notifications from the admin
        const adminNotificationsRef = collection(db, 'notifications');
        
        // Split queries to avoid complex index requirements
        // First get all notifications for this user's role
        let roleSpecificQuery = query(
          adminNotificationsRef,
          where('audience', '==', userRole === 'instructor' ? 'instructors' : 'students'),
          where('sent', '==', true),
          limit(10)
        );
        
        // Then get notifications for all users
        let allUsersQuery = query(
          adminNotificationsRef,
          where('audience', '==', 'all'),
          where('sent', '==', true),
          limit(10)
        );
        
        // Execute both queries
        const roleSpecificSnapshot = await getDocs(roleSpecificQuery);
        const allUsersSnapshot = await getDocs(allUsersQuery);
        
        // Combine results from both queries
        const roleSpecificNotifications = roleSpecificSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: `admin-${doc.id}`,
            sourceId: doc.id,
            title: data.title,
            message: data.message,
            type: data.type || 'announcement',
            createdAt: data.createdAt,
            isSystemNotification: true
          };
        });
        
        const allUsersNotifications = allUsersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: `admin-${doc.id}`,
            sourceId: doc.id,
            title: data.title,
            message: data.message,
            type: data.type || 'announcement',
            createdAt: data.createdAt,
            isSystemNotification: true
          };
        });
        
        // Combine both sets of admin notifications
        const adminNotifications = [...roleSpecificNotifications, ...allUsersNotifications];
        
        // Combine notifications
        const combinedNotifications = [...userNotifications, ...adminNotifications];
        
        // Sort manually since we couldn't use orderBy in the query
        combinedNotifications.sort((a, b) => {
          const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
          const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
          return dateB - dateA; // Descending order (newest first)
        });
        
        setNotifications(combinedNotifications);
        setError(null);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  // Filter notifications based on active filter and search query
  const getFilteredNotifications = () => {
    return notifications.filter(notification => {
      // Filter by type
      const typeMatch = activeFilter === 'all' || notification.type === activeFilter;
      
      // Filter by search query
      const searchMatch = !searchQuery || 
        (notification.title && notification.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (notification.message && notification.message.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return typeMatch && searchMatch;
    });
  };

  const filteredNotifications = getFilteredNotifications();

  // Load more notifications
  const handleLoadMore = async () => {
    if (!hasMore || !currentUser) return;
    
    try {
      setLoading(true);
      
      // Query for more notifications - simplified to avoid index requirements
      const notificationsRef = collection(db, 'user_notifications');
      let nextQuery = query(
        notificationsRef,
        where('userId', '==', currentUser.uid),
        limit(notificationsPerPage * 2)
      );
      
      const snapshot = await getDocs(nextQuery);
      
      const allUserNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter out notifications we already have
      const existingIds = notifications
        .filter(n => !n.id.startsWith('admin-'))
        .map(n => n.id);
      
      const newNotifications = allUserNotifications.filter(
        notification => !existingIds.includes(notification.id)
      );
      
      if (newNotifications.length < notificationsPerPage) {
        setHasMore(false);
      }
      
      // Sort and append to existing notifications
      const updatedNotifications = [...notifications, ...newNotifications].sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return dateB - dateA;
      });
      
      // Append to existing notifications
      setNotifications(updatedNotifications);
      
    } catch (err) {
      console.error('Error loading more notifications:', err);
      alert('Failed to load more notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 py-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Notifications</h1>
          <p className="text-orange-100 max-w-2xl mx-auto">
            Stay updated with your course progress, announcements, and activities.
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Notification Header with Search */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative w-full md:w-1/3">
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Filter Tabs */}
            <div className="mt-6">
              <FilterTabs 
                activeFilter={activeFilter} 
                setActiveFilter={setActiveFilter}
                filters={filters}
              />
            </div>
          </div>
          
          {/* Error Message */}
          {error && !loading && (
            <div className="p-6 text-center text-red-500">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* Notification List */}
          <div className="divide-y divide-gray-100">
            {loading && filteredNotifications.length === 0 ? (
              <EmptyState filter={activeFilter} loading={true} />
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification}
                />
              ))
            ) : (
              <EmptyState filter={activeFilter} loading={false} />
            )}
          </div>
          
          {/* Load More Button */}
          {filteredNotifications.length > 0 && hasMore && (
            <div className="p-6 text-center">
              <button 
                onClick={handleLoadMore}
                disabled={loading}
                className={`text-orange-500 hover:text-orange-600 font-medium ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  'Load More Notifications'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotificationPage;