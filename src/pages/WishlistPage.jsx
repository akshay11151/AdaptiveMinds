import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bookmark, 
  Search, 
  Star, 
  Clock, 
  Users, 
  Trash2, 
  AlertCircle, 
  Loader,
  BookOpen
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  // State
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch user's wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated || !currentUser) {
        navigate('/');
        return;
      }
      
      try {
        setLoading(true);
        
        // Query wishlist collection
        const wishlistQuery = query(
          collection(db, 'user_wishlist'),
          where('userId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(wishlistQuery);
        
        // Get all wishlist items
        const wishlistIds = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Fetch course details for each wishlist item
        const wishlistWithDetails = await Promise.all(
          wishlistIds.map(async (item) => {
            try {
              const courseRef = doc(db, 'courses', item.courseId);
              const courseSnap = await getDoc(courseRef);
              
              if (courseSnap.exists()) {
                return {
                  wishlistId: item.id,
                  courseId: item.courseId,
                  addedAt: item.addedAt,
                  ...courseSnap.data()
                };
              } else {
                // Course doesn't exist anymore
                return {
                  wishlistId: item.id,
                  courseId: item.courseId,
                  addedAt: item.addedAt,
                  title: 'Course no longer available',
                  deleted: true
                };
              }
            } catch (err) {
              console.error(`Error fetching course ${item.courseId}:`, err);
              return {
                wishlistId: item.id,
                courseId: item.courseId,
                addedAt: item.addedAt,
                title: 'Failed to load course',
                error: true
              };
            }
          })
        );
        
        setWishlistItems(wishlistWithDetails);
        setError(null);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError('Failed to load wishlist. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWishlist();
  }, [currentUser, isAuthenticated, navigate]);
  
  // Filter wishlist items based on search term
  const filteredItems = wishlistItems.filter(item => 
    !item.deleted && !item.error && (
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  // Handle remove from wishlist
  const handleRemoveFromWishlist = async (wishlistId) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'user_wishlist', wishlistId));
      
      // Update local state
      setWishlistItems(prev => prev.filter(item => item.wishlistId !== wishlistId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert('Failed to remove from wishlist. Please try again.');
    }
  };
  
  // Course Card Component
  const CourseCard = ({ course }) => {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
        {/* Course Image */}
        <div className="relative">
          <img 
            src={course.imageUrl || "https://img.freepik.com/free-photo/ai-nuclear-energy-background-future-innovation-disruptive-technology_53876-129783.jpg"} 
            alt={course.title} 
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
            {course.category || 'General'}
          </div>
          <button 
            onClick={() => handleRemoveFromWishlist(course.wishlistId)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white text-red-500 hover:bg-red-50"
            title="Remove from wishlist"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
        
        {/* Course Content */}
        <div className="p-5">
          <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{course.title}</h3>
          
          {/* Rating and Info */}
          <div className="flex flex-wrap items-center text-sm text-gray-600 mb-4">
            <div className="flex items-center mr-4 mb-2">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span>{course.rating || 0}</span>
            </div>
            <div className="flex items-center mr-4 mb-2">
              <Users className="h-4 w-4 text-gray-400 mr-1" />
              <span>{course.enrolledStudents || 0} students</span>
            </div>
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 text-gray-400 mr-1" />
              <span>{course.sections ? `${course.sections.reduce((total, section) => total + section.videos.length, 0)} videos` : '0 videos'}</span>
            </div>
          </div>
          
          {/* Instructor */}
          <div className="text-sm text-gray-600 mb-4">
            Instructor: <span className="font-medium">{course.instructorName || 'Unknown'}</span>
          </div>
          
          {/* Price and Button */}
          <div className="flex justify-between items-center">
            <div className="font-bold text-lg text-orange-500">
              ${course.price?.toFixed(2) || '0.00'}
            </div>
            <button 
              onClick={() => navigate(`/courses`)}
              className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-orange-500 hover:to-orange-600 transition-colors text-sm font-medium"
            >
              View Course
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 py-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Your Wishlist</h1>
          <p className="text-orange-100 max-w-2xl mx-auto">
            Courses you've saved for later. Come back to them when you're ready to enroll.
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search wishlist..."
            className="w-full py-3 pl-12 pr-4 text-gray-700 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader className="h-8 w-8 text-orange-500 animate-spin" />
            <span className="ml-2 text-gray-600">Loading wishlist...</span>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg flex items-start max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {/* Empty Wishlist */}
        {!loading && !error && wishlistItems.length === 0 && (
          <div className="text-center py-16">
            <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Save courses to your wishlist by clicking the bookmark icon on any course.
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600"
            >
              Browse Courses
            </button>
          </div>
        )}
        
        {/* Wishlist Grid */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <CourseCard key={item.wishlistId} course={item} />
            ))}
          </div>
        )}
        
        {/* Search Results Empty */}
        {!loading && !error && wishlistItems.length > 0 && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No matching courses</h3>
            <p className="text-gray-500 mb-6">
              No courses matching "{searchTerm}" were found in your wishlist.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default WishlistPage;