import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Star, 
  User, 
  Clock, 
  MessageCircle, 
  Check, 
  XCircle,
  AlertCircle,
  Trash2,
  Mail,
  Eye,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  getDoc, 
  deleteDoc, 
  updateDoc, 
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../../firebase';

const FeedbackManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Used for viewing feedback details
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Category options for filter
  const categoryOptions = [
    { value: 'all', label: 'All Feedback' },
    { value: 'course-content', label: 'Course Content' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'platform', label: 'Platform' },
    { value: 'support', label: 'Customer Support' },
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'other', label: 'Other' }
  ];

  // Fetch feedback from Firestore
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        
        // Create query
        const feedbackQuery = query(
          collection(db, 'feedbacks'),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(feedbackQuery);
        
        const feedbackData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAtFormatted: doc.data().createdAt ? formatDate(doc.data().createdAt) : 'Unknown'
        }));
        
        setFeedbackItems(feedbackData);
        setFilteredItems(feedbackData);
        setError(null);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('Failed to load feedback. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedback();
  }, []);
  
  // Filter feedback based on search term and category
  useEffect(() => {
    let results = [...feedbackItems];
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(item => 
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.message && item.message.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      results = results.filter(item => item.category === selectedCategory);
    }
    
    setFilteredItems(results);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, feedbackItems]);
  
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
  
  // Delete feedback
  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'feedbacks', feedbackId));
      
      // Update local state
      setFeedbackItems(prevItems => 
        prevItems.filter(item => item.id !== feedbackId)
      );
      
      // Close modal if viewing the deleted feedback
      if (selectedFeedback && selectedFeedback.id === feedbackId) {
        setShowDetailModal(false);
        setSelectedFeedback(null);
      }
      
    } catch (err) {
      console.error('Error deleting feedback:', err);
      alert('Failed to delete feedback. Please try again.');
    }
  };
  
  // Update feedback status
  const handleUpdateStatus = async (feedbackId, newStatus) => {
    try {
      const feedbackRef = doc(db, 'feedbacks', feedbackId);
      await updateDoc(feedbackRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Update local state
      setFeedbackItems(prevItems => 
        prevItems.map(item => 
          item.id === feedbackId ? { ...item, status: newStatus } : item
        )
      );
      
      // Update selected feedback if it's the one being viewed
      if (selectedFeedback && selectedFeedback.id === feedbackId) {
        setSelectedFeedback(prev => ({ ...prev, status: newStatus }));
      }
      
    } catch (err) {
      console.error('Error updating feedback status:', err);
      alert('Failed to update feedback status. Please try again.');
    }
  };
  
  // View feedback details
  const handleViewFeedback = async (feedbackId) => {
    try {
      const feedbackRef = doc(db, 'feedbacks', feedbackId);
      const feedbackDoc = await getDoc(feedbackRef);
      
      if (feedbackDoc.exists()) {
        const feedbackData = feedbackDoc.data();
        
        // If status is pending, mark it as reviewed
        if (feedbackData.status === 'pending') {
          await updateDoc(feedbackRef, {
            status: 'reviewed',
            updatedAt: new Date()
          });
          
          // Update local state
          setFeedbackItems(prevItems => 
            prevItems.map(item => 
              item.id === feedbackId ? { ...item, status: 'reviewed' } : item
            )
          );
          
          feedbackData.status = 'reviewed';
        }
        
        setSelectedFeedback({
          id: feedbackDoc.id,
          ...feedbackData,
          createdAtFormatted: feedbackData.createdAt ? formatDate(feedbackData.createdAt) : 'Unknown'
        });
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Error fetching feedback details:', err);
      alert('Failed to load feedback details. Please try again.');
    }
  };
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get rating stars
  const renderRatingStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index} 
        className={`h-4 w-4 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };
  
  // Export to CSV
  const exportToCSV = () => {
    // Generate CSV content
    const csvRows = [];
    const headers = ['Name', 'Email', 'Rating', 'Category', 'Message', 'Status', 'Date'];
    csvRows.push(headers.join(','));
    
    filteredItems.forEach(item => {
      const values = [
        `"${item.name || ''}"`,
        `"${item.email || ''}"`,
        `"${item.rating || 0}"`,
        `"${item.category || ''}"`,
        `"${item.message ? item.message.replace(/"/g, '""') : ''}"`,
        `"${item.status || ''}"`,
        `"${item.createdAtFormatted || ''}"`
      ];
      csvRows.push(values.join(','));
    });
    
    // Create and download CSV file
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
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
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={exportToCSV}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
        >
          <Download className="h-5 w-5 mr-2" />
          Export to CSV
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback...</p>
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

      {/* Feedback List */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map(feedback => (
                  <tr key={feedback.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{feedback.name || 'Anonymous'}</div>
                          <div className="text-sm text-gray-500">{feedback.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex">
                        {renderRatingStars(feedback.rating || 0)}
                        <span className="ml-2 text-sm text-gray-600">({feedback.rating || 0}/5)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {feedback.category ? feedback.category.replace(/-/g, ' ') : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(feedback.status)}`}>
                        {feedback.status ? feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1) : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {feedback.createdAtFormatted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleViewFeedback(feedback.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteFeedback(feedback.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Feedback"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Empty state */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No feedback found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filter to find what youre looking for.'
                  : 'There is no feedback in the system yet.'}
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
          
          {/* Pagination */}
          {filteredItems.length > 0 && totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">
                      {indexOfLastItem > filteredItems.length ? filteredItems.length : indexOfLastItem}
                    </span>{' '}
                    of <span className="font-medium">{filteredItems.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                          currentPage === index + 1
                            ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Feedback Detail Modal */}
      {showDetailModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Feedback Details</h2>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedFeedback.status)}`}>
                    {selectedFeedback.status 
                      ? selectedFeedback.status.charAt(0).toUpperCase() + selectedFeedback.status.slice(1)
                      : 'Pending'
                    }
                  </span>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">From</h3>
                  <p className="font-medium text-gray-800">{selectedFeedback.name || 'Anonymous'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                  <p className="text-gray-800">{selectedFeedback.email || 'No email provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Rating</h3>
                  <div className="flex items-center">
                    {renderRatingStars(selectedFeedback.rating || 0)}
                    <span className="ml-2 text-gray-700">({selectedFeedback.rating || 0}/5)</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {selectedFeedback.category 
                      ? selectedFeedback.category.replace(/-/g, ' ').charAt(0).toUpperCase() + selectedFeedback.category.replace(/-/g, ' ').slice(1)
                      : 'Unknown'
                    }
                  </span>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Feedback</h3>
                  <p className="text-gray-800 whitespace-pre-line">{selectedFeedback.message || 'No message provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Received On</h3>
                  <p className="text-gray-800">{selectedFeedback.createdAtFormatted}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={() => handleUpdateStatus(selectedFeedback.id, 'resolved')}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedFeedback.id, 'closed')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Close
                </button>
              </div>
              <button
                onClick={() => handleDeleteFeedback(selectedFeedback.id)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;