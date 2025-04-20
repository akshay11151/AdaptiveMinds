import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  User, 
  Clock, 
  MessageSquare, 
  Check, 
  XCircle,
  AlertCircle,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc,
  where,
  limit,
  startAfter,
  getDoc
} from 'firebase/firestore';
import { db } from '../../firebase';

const ContactUsManagement = () => {
  const [contactMessages, setContactMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const [reachedEnd, setReachedEnd] = useState(false);
  const messagesPerPage = 10;
  
  // Used for viewing message details
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Status options for filter
  const statusOptions = [
    { value: 'all', label: 'All Messages' },
    { value: 'new', label: 'New' },
    { value: 'read', label: 'Read' },
    { value: 'responded', label: 'Responded' },
    { value: 'closed', label: 'Closed' }
  ];

  // Fetch contact messages from Firestore
  useEffect(() => {
    fetchMessages();
  }, [selectedStatus]);

  const fetchMessages = async (fromStart = true) => {
    try {
      setLoading(true);
      
      let messagesRef = collection(db, 'contact_messages');
      let messagesQuery;

      // Status filtering
      if (selectedStatus !== 'all') {
        messagesQuery = query(
          messagesRef, 
          where('status', '==', selectedStatus),
          orderBy('createdAt', 'desc'),
          limit(messagesPerPage)
        );
      } else {
        messagesQuery = query(
          messagesRef, 
          orderBy('createdAt', 'desc'),
          limit(messagesPerPage)
        );
      }
      
      // Pagination - if not from start and we have a last document
      if (!fromStart && lastVisible) {
        if (selectedStatus !== 'all') {
          messagesQuery = query(
            messagesRef,
            where('status', '==', selectedStatus),
            orderBy('createdAt', 'desc'),
            startAfter(lastVisible),
            limit(messagesPerPage)
          );
        } else {
          messagesQuery = query(
            messagesRef,
            orderBy('createdAt', 'desc'),
            startAfter(lastVisible),
            limit(messagesPerPage)
          );
        }
      }
      
      const snapshot = await getDocs(messagesQuery);
      
      // Check if we've reached the end
      if (snapshot.docs.length < messagesPerPage) {
        setReachedEnd(true);
      } else {
        setReachedEnd(false);
      }
      
      // Set the last visible document for pagination
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc);
      
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAtFormatted: doc.data().createdAt ? formatDate(doc.data().createdAt) : 'Unknown'
      }));
      
      // If loading more, append to existing messages, otherwise replace
      if (!fromStart) {
        setContactMessages(prevMessages => [...prevMessages, ...fetchedMessages]);
      } else {
        setContactMessages(fetchedMessages);
        setCurrentPage(1);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching contact messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load more messages
  const loadMoreMessages = async () => {
    if (!reachedEnd) {
      await fetchMessages(false);
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (err) {
      return 'Invalid date';
    }
  };

  // Update message status
  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      const messageRef = doc(db, 'contact_messages', messageId);
      await updateDoc(messageRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Update local state
      setContactMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? { ...msg, status: newStatus } : msg
        )
      );
      
      // If viewing message details, update the selected message
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage(prev => ({ ...prev, status: newStatus }));
      }
      
    } catch (err) {
      console.error('Error updating message status:', err);
      alert('Failed to update message status. Please try again.');
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'contact_messages', messageId));
      
      // Update local state
      setContactMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== messageId)
      );
      
      // If viewing the message that was deleted, close the modal
      if (selectedMessage && selectedMessage.id === messageId) {
        setShowDetailModal(false);
        setSelectedMessage(null);
      }
      
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message. Please try again.');
    }
  };

  // View message details
  const viewMessageDetails = async (messageId) => {
    try {
      const messageRef = doc(db, 'contact_messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (messageDoc.exists()) {
        const messageData = messageDoc.data();
        
        // If message is new, mark it as read
        if (messageData.status === 'new') {
          await updateDoc(messageRef, {
            status: 'read',
            updatedAt: new Date()
          });
          
          // Update local state
          setContactMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === messageId ? { ...msg, status: 'read' } : msg
            )
          );
        }
        
        setSelectedMessage({
          id: messageDoc.id,
          ...messageData,
          createdAtFormatted: messageData.createdAt ? formatDate(messageData.createdAt) : 'Unknown'
        });
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Error fetching message details:', err);
      alert('Failed to load message details. Please try again.');
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-yellow-100 text-yellow-800';
      case 'responded':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Search and filter messages
  const filteredMessages = contactMessages.filter(message => {
    return (
      (message.name && message.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (message.email && message.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (message.subject && message.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (message.message && message.message.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Export to CSV
  const exportToCSV = () => {
    // Generate CSV content
    const csvRows = [];
    const headers = ['Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Date'];
    csvRows.push(headers.join(','));
    
    filteredMessages.forEach(msg => {
      const values = [
        `"${msg.name || ''}"`,
        `"${msg.email || ''}"`,
        `"${msg.phone || ''}"`,
        `"${msg.subject || ''}".replace(/"/g, '""')`,
        `"${msg.message || ''}".replace(/"/g, '""')`,
        `"${msg.status || ''}"`,
        `"${msg.createdAtFormatted || ''}"`
      ];
      csvRows.push(values.join(','));
    });
    
    // Create and download CSV file
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `contact_messages_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Top Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={exportToCSV}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center self-end"
        >
          <Download className="h-5 w-5 mr-2" />
          Export to CSV
        </button>
      </div>

      {/* Loading State */}
      {loading && contactMessages.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
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
            onClick={() => fetchMessages()}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Messages List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredMessages.map(message => (
            <div 
              key={message.id} 
              className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 ${
                message.status === 'new' 
                  ? 'border-blue-500' 
                  : message.status === 'read'
                    ? 'border-yellow-500'
                    : message.status === 'responded'
                      ? 'border-green-500'
                      : 'border-gray-300'
              }`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{message.name}</h3>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-1" />
                        <span>{message.email}</span>
                      </div>
                      {message.phone && (
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Phone className="h-4 w-4 mr-1" />
                          <span>{message.phone}</span>
                        </div>
                      )}
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-700">Subject: {message.subject}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message.message}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(message.status)}`}>
                      {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{message.createdAtFormatted}</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => viewMessageDetails(message.id)} 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Empty state */}
          {filteredMessages.length === 0 && !loading && (
            <div className="bg-white rounded-xl p-12 text-center">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <MessageSquare className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No messages found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedStatus !== 'all' 
                  ? `There are no ${selectedStatus} messages at the moment.` 
                  : 'There are no contact messages in the system yet.'}
              </p>
              {selectedStatus !== 'all' && (
                <button
                  onClick={() => setSelectedStatus('all')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none"
                >
                  View All Messages
                </button>
              )}
            </div>
          )}
          
          {/* Load More Button */}
          {!reachedEnd && filteredMessages.length > 0 && (
            <div className="text-center mt-6">
              <button
                onClick={loadMoreMessages}
                disabled={loading}
                className={`px-4 py-2 text-orange-500 hover:text-orange-700 font-medium ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Loading...' : 'Load More Messages'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Message Detail Modal */}
      {showDetailModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Message Details</h2>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedMessage.status)}`}>
                    {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">From</h3>
                  <p className="font-medium text-gray-800">{selectedMessage.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                  <p className="text-gray-800">{selectedMessage.email}</p>
                </div>
                
                {selectedMessage.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                    <p className="text-gray-800">{selectedMessage.phone}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Subject</h3>
                  <p className="font-medium text-gray-800">{selectedMessage.subject}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Message</h3>
                  <p className="text-gray-800 whitespace-pre-line">{selectedMessage.message}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Received On</h3>
                  <p className="text-gray-800">{selectedMessage.createdAtFormatted}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={() => updateMessageStatus(selectedMessage.id, 'responded')}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Responded
                </button>
                <button
                  onClick={() => updateMessageStatus(selectedMessage.id, 'closed')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Close
                </button>
              </div>
              <button
                onClick={() => deleteMessage(selectedMessage.id)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium flex items-center"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactUsManagement;