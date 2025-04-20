import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Star, 
  Clock, 
  Users, 
  BookOpen, 
  AlertCircle, 
  Loader, 
  CheckCircle, 
  Bookmark,
  X
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  orderBy,
  limitToLast
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CoursesPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollmentFilter, setEnrollmentFilter] = useState('all');
  
  // State for registration modal
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // User's enrolled courses and wishlist
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  
  // Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // Create query to get published courses
        const coursesQuery = query(
          collection(db, 'courses'),
          where('status', '==', 'published'),
          orderBy('title')
        );
        
        const querySnapshot = await getDocs(coursesQuery);
        
        const coursesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCourses(coursesData);
        setFilteredCourses(coursesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  // Fetch user's enrolled courses and wishlist
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated || !currentUser) return;
      
      try {
        // Fetch enrolled courses
        const userCoursesQuery = query(
          collection(db, 'user_courses'),
          where('userId', '==', currentUser.uid)
        );
        
        const userCoursesSnapshot = await getDocs(userCoursesQuery);
        const userCourses = userCoursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setEnrolledCourses(userCourses.map(course => course.courseId));
        
        // Fetch wishlist
        const wishlistQuery = query(
          collection(db, 'user_wishlist'),
          where('userId', '==', currentUser.uid)
        );
        
        const wishlistSnapshot = await getDocs(wishlistQuery);
        const wishlistItems = wishlistSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setWishlist(wishlistItems.map(item => item.courseId));
        
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    
    fetchUserData();
  }, [currentUser, isAuthenticated]);
  
  // Filter courses based on search term and enrollment filter
  useEffect(() => {
    let results = [...courses];
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(course => 
        (course.title && course.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (course.category && course.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (course.instructorName && course.instructorName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply enrollment filter
    if (enrollmentFilter !== 'all' && isAuthenticated) {
      if (enrollmentFilter === 'enrolled') {
        results = results.filter(course => enrolledCourses.includes(course.id));
      } else if (enrollmentFilter === 'not-enrolled') {
        results = results.filter(course => !enrolledCourses.includes(course.id));
      }
    }
    
    setFilteredCourses(results);
  }, [searchTerm, enrollmentFilter, courses, enrolledCourses, isAuthenticated]);
  
  // Handle opening the registration modal
  const handleOpenModal = (course) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/';
      return;
    }
    
    setSelectedCourse(course);
    setShowModal(true);
    setRegistrationSuccess(false);
  };
  
  // Handle course registration
  const handleRegisterCourse = async () => {
    if (!selectedCourse || !currentUser) return;
    
    try {
      setRegistering(true);
      
      // Create user_courses document
      const userCourseId = `${currentUser.uid}_${selectedCourse.id}`;
      await setDoc(doc(db, 'user_courses', userCourseId), {
        userId: currentUser.uid,
        courseId: selectedCourse.id,
        courseName: selectedCourse.title,
        enrolledAt: serverTimestamp(),
        progress: 0,
        completed: false,
        completedSections: [],
        completedVideos: [],
        lastAccessedAt: serverTimestamp()
      });
      
      // Update course's enrolledStudents count
      const courseRef = doc(db, 'courses', selectedCourse.id);
      await updateDoc(courseRef, {
        enrolledStudents: increment(1)
      });
      
      // Add to local enrolled courses list
      setEnrolledCourses(prev => [...prev, selectedCourse.id]);
      
      // Show success message
      setRegistrationSuccess(true);
      
      // Close modal after 3 seconds
      setTimeout(() => {
        setShowModal(false);
        setSelectedCourse(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error registering for course:', err);
      alert('Failed to register for the course. Please try again.');
    } finally {
      setRegistering(false);
    }
  };
  
  // Handle adding/removing course from wishlist
  const handleWishlist = async (courseId, isCurrentlyInWishlist) => {
    if (!isAuthenticated || !currentUser) {
      // Redirect to login if not authenticated
      window.location.href = '/';
      return;
    }
    
    try {
      const wishlistId = `${currentUser.uid}_${courseId}`;
      
      if (isCurrentlyInWishlist) {
        // Remove from wishlist
        await deleteDoc(doc(db, 'user_wishlist', wishlistId));
        setWishlist(prev => prev.filter(id => id !== courseId));
      } else {
        // Add to wishlist
        await setDoc(doc(db, 'user_wishlist', wishlistId), {
          userId: currentUser.uid,
          courseId: courseId,
          addedAt: serverTimestamp()
        });
        setWishlist(prev => [...prev, courseId]);
      }
    } catch (err) {
      console.error('Error updating wishlist:', err);
      alert('Failed to update wishlist. Please try again.');
    }
  };
  
  // Course Card Component
  const CourseCard = ({ course }) => {
    const isEnrolled = enrolledCourses.includes(course.id);
    const isWishlisted = wishlist.includes(course.id);
    
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
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
            onClick={() => handleWishlist(course.id, isWishlisted)}
            className={`absolute top-4 right-4 p-1.5 rounded-full ${
              isWishlisted ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            <Bookmark className="h-5 w-5" fill={isWishlisted ? 'currentColor' : 'none'} />
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
            {isEnrolled ? (
              <Link 
                to={`/course-view/${course.id}`} 
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                View Course
              </Link>
            ) : (
              <button 
                onClick={() => handleOpenModal(course)}
                className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-orange-500 hover:to-orange-600 transition-colors text-sm font-medium"
              >
                Enroll Now
              </button>
            )}
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
          <h1 className="text-3xl font-bold text-white mb-4">Explore Our Courses</h1>
          <p className="text-orange-100 max-w-2xl mx-auto">
            Discover a wide range of high-quality courses taught by expert instructors to help you develop new skills and achieve your goals.
          </p>
          
          {/* Main Search Bar */}
          <div className="max-w-2xl mx-auto mt-8 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for courses, instructors, or topics..."
              className="w-full py-3 pl-12 pr-4 text-gray-700 bg-white rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">All Courses</h2>
          
          {/* Filter dropdown */}
          {isAuthenticated && (
            <select
              value={enrollmentFilter}
              onChange={(e) => setEnrollmentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="all">All Courses</option>
              <option value="enrolled">Enrolled Courses</option>
              <option value="not-enrolled">Not Enrolled</option>
            </select>
          )}
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader className="h-8 w-8 text-orange-500 animate-spin" />
            <span className="ml-2 text-gray-600">Loading courses...</span>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {/* No Results */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? `No courses matching "${searchTerm}" were found.` 
                : enrollmentFilter === 'enrolled'
                  ? "You haven't enrolled in any courses yet."
                  : "No courses are available at the moment."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
        
        {/* Courses Grid */}
        {!loading && !error && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
      
      {/* Registration Modal */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            {registrationSuccess ? (
              <div className="text-center py-6">
                <div className="bg-green-100 p-3 rounded-full inline-block mb-4">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Successfully Enrolled!</h3>
                <p className="text-gray-600 mb-6">
                  You've been successfully enrolled in {selectedCourse.title}. You can now access the course content.
                </p>
                <Link 
                  to={`/course-view/${selectedCourse.id}`} 
                  className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-2 rounded-lg hover:from-orange-500 hover:to-orange-600 transition-colors font-medium"
                >
                  Go to Course
                </Link>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Enroll in Course</h3>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-2">{selectedCourse.title}</h4>
                  <p className="text-gray-600 text-sm mb-4">{selectedCourse.description}</p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-bold text-gray-800">${selectedCourse.price?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Instructor:</span>
                      <span className="text-gray-800">{selectedCourse.instructorName || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Course Length:</span>
                      <span className="text-gray-800">
                        {selectedCourse.sections 
                          ? `${selectedCourse.sections.reduce((total, section) => total + section.videos.length, 0)} videos` 
                          : '0 videos'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    By enrolling in this course, you'll have lifetime access to all course materials.
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 mr-3"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRegisterCourse}
                    disabled={registering}
                    className={`bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-2 rounded-lg hover:from-orange-500 hover:to-orange-600 transition-colors font-medium flex items-center ${
                      registering ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {registering ? (
                      <>
                        <Loader className="animate-spin h-4 w-4 mr-2" />
                        Enrolling...
                      </>
                    ) : (
                      'Confirm Enrollment'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default CoursesPage;