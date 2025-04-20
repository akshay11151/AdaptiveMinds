import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  Users, 
  Book, 
  AlertCircle,
  Info,
  CheckCircle,
  X,
  ChevronDown,
  Filter,
  Search,
  Eye,
  Loader
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp, 
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../../firebase';

const NotificationsManagement = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingNotification, setIsCreatingNotification] = useState(false);
  const [isEditingNotification, setIsEditingNotification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  
  // New notification form state
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    audience: 'all',
    scheduledDate: '',
    scheduledTime: '',
    schedule: false
  });

  // Fetch notifications from Firestore
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const notificationsRef = collection(db, 'notifications');
        const notificationsQuery = query(notificationsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(notificationsQuery);
        
        const notificationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().scheduledDate || doc.data().createdAt?.toDate() || new Date()
        }));
        
        setNotifications(notificationsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Filter notifications based on selected tab and search term
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      selectedTab === 'all' ||
      (selectedTab === 'sent' && !notification.scheduled) ||
      (selectedTab === 'scheduled' && notification.scheduled);
    
    return matchesSearch && matchesTab;
  });

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'announcement':
        return <Bell className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // Get audience icon
  const getAudienceIcon = (audience) => {
    switch (audience) {
      case 'students':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'instructors':
        return <Book className="h-5 w-5 text-orange-500" />;
      case 'all':
      default:
        return <Users className="h-5 w-5 text-green-500" />;
    }
  };

  // Format date for display
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    let date;
    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      // Handle Firestore Timestamp
      date = dateValue.toDate();
    } else {
      // Handle string date
      date = new Date(dateValue);
    }
    
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Handle creating a new notification
  const handleCreateNotification = () => {
    setIsCreatingNotification(true);
    setIsEditingNotification(false);
    setNewNotification({
      title: '',
      message: '',
      type: 'info',
      audience: 'all',
      scheduledDate: '',
      scheduledTime: '',
      schedule: false
    });
  };

  // Handle editing a notification
  const handleEditNotification = (notification) => {
    setCurrentNotification(notification);
    
    // Format the date and time for the form
    let scheduledDate = '';
    let scheduledTime = '';
    
    if (notification.scheduledDate) {
      const date = notification.scheduledDate instanceof Date 
        ? notification.scheduledDate 
        : notification.scheduledDate.toDate();
      
      scheduledDate = date.toISOString().split('T')[0];
      scheduledTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    
    setNewNotification({
      title: notification.title || '',
      message: notification.message || '',
      type: notification.type || 'info',
      audience: notification.audience || 'all',
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime,
      schedule: !!notification.scheduled
    });
    
    setIsEditingNotification(true);
    setIsCreatingNotification(true);
  };

  // Handle deleting a notification
  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'notifications', id));
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
      alert('Failed to delete notification. Please try again.');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox inputs differently
    if (type === 'checkbox') {
      setNewNotification(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setNewNotification(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let notificationData = {
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        audience: newNotification.audience,
        createdAt: serverTimestamp(),
        scheduled: newNotification.schedule,
        sent: !newNotification.schedule,
        readCount: 0,
        totalRecipients: 0 // This would be populated based on audience count
      };
      
      // If scheduled, add the scheduled date
      if (newNotification.schedule && newNotification.scheduledDate) {
        const scheduledDate = new Date(newNotification.scheduledDate);
        
        if (newNotification.scheduledTime) {
          const [hours, minutes] = newNotification.scheduledTime.split(':');
          scheduledDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        }
        
        notificationData.scheduledDate = scheduledDate;
      }
      
      // Calculate total recipients based on audience (in a real app, query the users collection)
      switch (newNotification.audience) {
        case 'all':
          notificationData.totalRecipients = 2346; // Placeholder example value
          break;
        case 'students':
          notificationData.totalRecipients = 980; // Placeholder example value
          break;
        case 'instructors':
          notificationData.totalRecipients = 124; // Placeholder example value
          break;
      }
      
      if (isEditingNotification && currentNotification) {
        // Update existing notification
        const notificationRef = doc(db, 'notifications', currentNotification.id);
        await updateDoc(notificationRef, notificationData);
        
        // Update local state
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === currentNotification.id 
              ? { ...notification, ...notificationData, id: currentNotification.id } 
              : notification
          )
        );
      } else {
        // Add new notification
        const docRef = await addDoc(collection(db, 'notifications'), notificationData);
        
        // Update local state
        setNotifications(prevNotifications => [
          { id: docRef.id, ...notificationData, date: new Date() },
          ...prevNotifications
        ]);
      }
      
      // Reset form and close modal
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        audience: 'all',
        scheduledDate: '',
        scheduledTime: '',
        schedule: false
      });
      setIsCreatingNotification(false);
      setIsEditingNotification(false);
      setCurrentNotification(null);
      
    } catch (err) {
      console.error('Error saving notification:', err);
      alert('Failed to save notification. Please try again.');
    }
  };

  return (
    <div>
      {/* Top Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>
        
        <button 
          onClick={handleCreateNotification}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Notification
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('all')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'all'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setSelectedTab('sent')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'sent'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sent
          </button>
          <button
            onClick={() => setSelectedTab('scheduled')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'scheduled'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Scheduled
          </button>
        </nav>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-800 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Notifications List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 ${
                notification.type === 'info' 
                  ? 'border-blue-500' 
                  : notification.type === 'warning'
                    ? 'border-amber-500'
                    : notification.type === 'alert'
                      ? 'border-red-500'
                      : 'border-purple-500'
              }`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${
                      notification.type === 'info' 
                        ? 'bg-blue-100' 
                        : notification.type === 'warning'
                          ? 'bg-amber-100'
                          : notification.type === 'alert'
                            ? 'bg-red-100'
                            : 'bg-purple-100'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{notification.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      
                      <div className="flex items-center mt-3 space-x-4 flex-wrap">
                        <div className="flex items-center text-sm text-gray-500 mr-4">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(notification.date)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mr-4">
                          {getAudienceIcon(notification.audience)}
                          <span className="ml-1 capitalize">{notification.audience}</span>
                        </div>
                        {!notification.scheduled && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{notification.readCount || 0} / {notification.totalRecipients || 0} read</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button 
                      className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100"
                      onClick={() => handleEditNotification(notification)}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button 
                      className="p-1.5 text-gray-500 hover:text-red-600 transition-colors rounded-full hover:bg-gray-100"
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  !notification.scheduled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {!notification.scheduled ? 'Sent' : 'Scheduled'}
                </span>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  View Details
                </button>
              </div>
            </div>
          ))}
          
          {/* Empty state */}
          {filteredNotifications.length === 0 && !loading && (
            <div className="bg-white rounded-xl p-12 text-center">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <Bell className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedTab === 'all' 
                  ? "You haven't created any notifications yet."
                  : selectedTab === 'sent'
                    ? "You haven't sent any notifications yet."
                    : "You don't have any scheduled notifications."}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleCreateNotification}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Notification
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Notification Modal */}
      {isCreatingNotification && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {isEditingNotification ? 'Edit Notification' : 'Create New Notification'}
                    </h3>
                    
                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={newNotification.title}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                          Message
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows="4"
                          value={newNotification.message}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          required
                        ></textarea>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                          </label>
                          <select
                            id="type"
                            name="type"
                            value={newNotification.type}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="info">Information</option>
                            <option value="warning">Warning</option>
                            <option value="alert">Alert</option>
                            <option value="announcement">Announcement</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-1">
                            Audience
                          </label>
                          <select
                            id="audience"
                            name="audience"
                            value={newNotification.audience}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="all">All Users</option>
                            <option value="students">Students Only</option>
                            <option value="instructors">Instructors Only</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center">
                          <input
                            id="schedule"
                            name="schedule"
                            type="checkbox"
                            checked={newNotification.schedule}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <label htmlFor="schedule" className="ml-2 block text-sm text-gray-900">
                            Schedule for later
                          </label>
                        </div>
                      </div>
                      
                      {newNotification.schedule && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              id="scheduledDate"
                              name="scheduledDate"
                              value={newNotification.scheduledDate}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                              required={newNotification.schedule}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-1">
                              Time
                            </label>
                            <input
                              type="time"
                              id="scheduledTime"
                              name="scheduledTime"
                              value={newNotification.scheduledTime}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                              required={newNotification.schedule}
                            />
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {newNotification.schedule 
                    ? 'Schedule' 
                    : isEditingNotification 
                      ? 'Update' 
                      : 'Send Now'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNotification(false);
                    setIsEditingNotification(false);
                    setCurrentNotification(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsManagement;