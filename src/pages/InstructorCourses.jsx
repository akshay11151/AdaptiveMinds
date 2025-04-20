import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Star, 
  Users, 
  Clock, 
  BookOpen,
  ArrowLeft,
  Save,
  X,
  Video,
  PlusCircle,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  setDoc,
  addDoc,
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../AuthContext';

const InstructorCourses = () => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Course creation/editing states
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    status: 'draft',
    sections: [
      {
        title: 'Introduction',
        videos: [
          { title: 'Welcome to the course', url: '' }
        ]
      }
    ]
  });

  // Available categories
  const categories = [
    'Web Development',
    'Data Science',
    'Mobile Development',
    'Programming Languages',
    'Game Development',
    'Database Design',
    'UI/UX Design',
    'Digital Marketing',
    'Business',
    'Soft Skills'
  ];
  
  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Courses' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' }
  ];

  // Fetch instructor's courses
  useEffect(() => {
    const fetchCourses = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const coursesCollection = collection(db, 'courses');
        const coursesQuery = query(
          coursesCollection, 
          where('instructorId', '==', currentUser.uid)
        );
        const snapshot = await getDocs(coursesQuery);
        
        const coursesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt ? formatDate(doc.data().createdAt) : 'Unknown'
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
  }, [currentUser]);

  // Filter courses based on search term and status
  useEffect(() => {
    let results = [...courses];
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(course => 
        (course.title && course.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (selectedStatus !== 'all') {
      results = results.filter(course => course.status === selectedStatus);
    }
    
    setFilteredCourses(results);
  }, [searchTerm, selectedStatus, courses]);

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (err) {
      return 'Invalid date';
    }
  };

  // Delete course
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'courses', courseId));
      
      // Update state
      const updatedCourses = courses.filter(course => course.id !== courseId);
      setCourses(updatedCourses);
      setFilteredCourses(updatedCourses);
      
    } catch (err) {
      console.error('Error deleting course:', err);
      alert('Failed to delete course. Please try again.');
    }
  };
  
  // Initialize course creation
  const handleCreateCourse = () => {
    setCourseForm({
      title: '',
      description: '',
      category: '',
      price: '',
      status: 'draft',
      sections: [
        {
          title: 'Introduction',
          videos: [
            { title: 'Welcome to the course', url: '' }
          ]
        }
      ]
    });
    setIsCreating(true);
    setIsEditing(false);
    setCurrentCourse(null);
    setFormError('');
  };
  
  // Initialize course editing
  const handleEditCourse = async (courseId) => {
    try {
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (courseDoc.exists()) {
        const courseData = courseDoc.data();
        
        setCourseForm({
          title: courseData.title || '',
          description: courseData.description || '',
          category: courseData.category || '',
          price: courseData.price ? courseData.price.toString() : '',
          status: courseData.status || 'draft',
          sections: courseData.sections || [
            {
              title: 'Introduction',
              videos: [
                { title: 'Welcome to the course', url: '' }
              ]
            }
          ]
        });
        
        setCurrentCourse(courseId);
        setIsEditing(true);
        setIsCreating(true);
        setFormError('');
      }
    } catch (err) {
      console.error('Error fetching course for editing:', err);
      alert('Failed to load course data. Please try again.');
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add a new section
  const addSection = () => {
    setCourseForm(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          title: `Section ${prev.sections.length + 1}`,
          videos: [
            { title: 'New Video', url: '' }
          ]
        }
      ]
    }));
  };
  
  // Update section title
  const updateSectionTitle = (index, title) => {
    setCourseForm(prev => {
      const updatedSections = [...prev.sections];
      updatedSections[index] = {
        ...updatedSections[index],
        title
      };
      return {
        ...prev,
        sections: updatedSections
      };
    });
  };
  
  // Delete a section
  const deleteSection = (index) => {
    if (courseForm.sections.length <= 1) {
      alert('Course must have at least one section');
      return;
    }
    
    setCourseForm(prev => {
      const updatedSections = prev.sections.filter((_, i) => i !== index);
      return {
        ...prev,
        sections: updatedSections
      };
    });
  };
  
  // Add a video to a section
  const addVideo = (sectionIndex) => {
    setCourseForm(prev => {
      const updatedSections = [...prev.sections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        videos: [
          ...updatedSections[sectionIndex].videos,
          { title: 'New Video', url: '' }
        ]
      };
      return {
        ...prev,
        sections: updatedSections
      };
    });
  };
  
  // Update video details
  const updateVideo = (sectionIndex, videoIndex, field, value) => {
    setCourseForm(prev => {
      const updatedSections = [...prev.sections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        videos: updatedSections[sectionIndex].videos.map((video, i) => 
          i === videoIndex ? { ...video, [field]: value } : video
        )
      };
      return {
        ...prev,
        sections: updatedSections
      };
    });
  };
  
  // Delete a video
  const deleteVideo = (sectionIndex, videoIndex) => {
    if (courseForm.sections[sectionIndex].videos.length <= 1) {
      alert('Section must have at least one video');
      return;
    }
    
    setCourseForm(prev => {
      const updatedSections = [...prev.sections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        videos: updatedSections[sectionIndex].videos.filter((_, i) => i !== videoIndex)
      };
      return {
        ...prev,
        sections: updatedSections
      };
    });
  };
  
  // Validate course form
  const validateCourseForm = () => {
    if (!courseForm.title.trim()) {
      setFormError('Course title is required');
      return false;
    }
    
    if (!courseForm.description.trim()) {
      setFormError('Course description is required');
      return false;
    }
    
    if (!courseForm.category) {
      setFormError('Please select a category');
      return false;
    }
    
    if (!courseForm.price.trim() || isNaN(parseFloat(courseForm.price))) {
      setFormError('Please enter a valid price');
      return false;
    }
    
    // Validate sections and videos
    for (const section of courseForm.sections) {
      if (!section.title.trim()) {
        setFormError('All sections must have a title');
        return false;
      }
      
      for (const video of section.videos) {
        if (!video.title.trim()) {
          setFormError('All videos must have a title');
          return false;
        }
        
        if (!video.url.trim()) {
          setFormError('All videos must have a URL');
          return false;
        }
        
        // Basic YouTube URL validation
        if (!video.url.includes('youtube.com/embed/') && !video.url.includes('youtu.be/')) {
          setFormError('Please enter valid YouTube embed URLs (e.g., https://www.youtube.com/embed/VIDEO_ID)');
          return false;
        }
      }
    }
    
    return true;
  };
  
  // Save course
  const saveCourse = async () => {
    if (!validateCourseForm()) {
      return;
    }
    
    try {
      setIsSaving(true);
      
      const courseData = {
        title: courseForm.title,
        description: courseForm.description,
        category: courseForm.category,
        price: parseFloat(courseForm.price),
        status: courseForm.status,
        sections: courseForm.sections,
        instructorId: currentUser.uid,
        instructorName: currentUser.displayName || '',
        updatedAt: serverTimestamp()
      };
      
      let courseId;
      
      if (isEditing && currentCourse) {
        // Update existing course
        const courseRef = doc(db, 'courses', currentCourse);
        await updateDoc(courseRef, courseData);
        courseId = currentCourse;
      } else {
        // Create new course
        courseData.createdAt = serverTimestamp();
        courseData.enrolledStudents = 0;
        courseData.rating = 0;
        courseData.reviewCount = 0;
        
        const docRef = await addDoc(collection(db, 'courses'), courseData);
        courseId = docRef.id;
      }
      
      // Fetch the updated/created course
      const updatedCourseDoc = await getDoc(doc(db, 'courses', courseId));
      
      if (updatedCourseDoc.exists()) {
        const updatedCourseData = {
          id: updatedCourseDoc.id,
          ...updatedCourseDoc.data(),
          createdAt: updatedCourseDoc.data().createdAt ? formatDate(updatedCourseDoc.data().createdAt) : 'Unknown'
        };
        
        // Update courses state
        if (isEditing) {
          setCourses(prev => prev.map(course => 
            course.id === courseId ? updatedCourseData : course
          ));
        } else {
          setCourses(prev => [...prev, updatedCourseData]);
        }
      }
      
      // Reset form and states
      setIsCreating(false);
      setIsEditing(false);
      setCurrentCourse(null);
      setCourseForm({
        title: '',
        description: '',
        category: '',
        price: '',
        status: 'draft',
        sections: [
          {
            title: 'Introduction',
            videos: [
              { title: 'Welcome to the course', url: '' }
            ]
          }
        ]
      });
      
    } catch (err) {
      console.error('Error saving course:', err);
      setFormError('Failed to save course. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Cancel course creation/editing
  const cancelCourseForm = () => {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      setIsCreating(false);
      setIsEditing(false);
      setCurrentCourse(null);
      setFormError('');
    }
  };
  
  // Toggle section collapse
  const [collapsedSections, setCollapsedSections] = useState({});
  
  const toggleSectionCollapse = (index) => {
    setCollapsedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Render the course form
  const renderCourseForm = () => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Edit Course' : 'Create New Course'}
        </h2>
        <button 
          onClick={cancelCourseForm}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {formError}
        </div>
      )}
      
      <div className="space-y-6">
        {/* Basic Course Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title*
            </label>
            <input
              type="text"
              name="title"
              value={courseForm.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g. Complete JavaScript Development"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category*
            </label>
            <select
              name="category"
              value={courseForm.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (USD)*
            </label>
            <input
              type="number"
              name="price"
              value={courseForm.price}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g. 49.99"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              name="description"
              value={courseForm.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Describe your course..."
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={courseForm.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Draft courses are only visible to you until published
            </p>
          </div>
        </div>
        
        {/* Course Content Sections */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Course Content</h3>
            <button
              type="button"
              onClick={addSection}
              className="flex items-center text-orange-500 hover:text-orange-600"
            >
              <PlusCircle className="h-5 w-5 mr-1" />
              Add Section
            </button>
          </div>
          
          <div className="space-y-4">
            {courseForm.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-t-lg">
                  <div className="flex items-center flex-1 mr-4">
                    <button
                      type="button"
                      onClick={() => toggleSectionCollapse(sectionIndex)}
                      className="mr-2 text-gray-500 hover:text-gray-700"
                    >
                      {collapsedSections[sectionIndex] 
                        ? <ChevronDown className="h-5 w-5" />
                        : <ChevronUp className="h-5 w-5" />
                      }
                    </button>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder="Section Title"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteSection(sectionIndex)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Section"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                {!collapsedSections[sectionIndex] && (
                  <div className="p-4">
                    <div className="space-y-3">
                      {section.videos.map((video, videoIndex) => (
                        <div key={videoIndex} className="flex items-start space-x-2">
                          <div className="flex-1">
                            <div className="flex space-x-2 mb-2">
                              <input
                                type="text"
                                value={video.title}
                                onChange={(e) => updateVideo(sectionIndex, videoIndex, 'title', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                                placeholder="Video Title"
                              />
                              <button
                                type="button"
                                onClick={() => deleteVideo(sectionIndex, videoIndex)}
                                className="text-red-500 hover:text-red-700 p-2"
                                title="Delete Video"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                            <div className="flex items-center">
                              <Video className="h-5 w-5 text-gray-400 mr-2" />
                              <input
                                type="text"
                                value={video.url}
                                onChange={(e) => updateVideo(sectionIndex, videoIndex, 'url', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                                placeholder="YouTube Embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID)"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => addVideo(sectionIndex)}
                        className="flex items-center text-orange-500 hover:text-orange-600 mt-2"
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Video
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={cancelCourseForm}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveCourse}
            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-1" />
                Save Course
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
  
  // Render the course list
  const renderCourseList = () => (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button 
            onClick={handleCreateCourse}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Course
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
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

      {/* Courses Grid */}
      {!loading && !error && (
        <>
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Course Thumbnail (placeholder) */}
                  <div className="relative">
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-gray-400" />
                    </div>
                    <div className={`absolute top-4 right-4 px-2 py-1 text-xs font-bold text-white rounded-full ${
                      course.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}>
                      {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                    </div>
                  </div>
                  
                  {/* Course Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                    
                    {/* Course Stats */}
                    <div className="flex flex-wrap items-center text-sm text-gray-600 mb-4 gap-y-2">
                      <div className="flex items-center mr-4">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{course.rating || 'No ratings'}</span>
                      </div>
                      <div className="flex items-center mr-4">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        <span>{course.enrolledStudents || 0} students</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span>{course.sections ? `${course.sections.reduce((total, section) => total + section.videos.length, 0)} videos` : '0 videos'}</span>
                      </div>
                    </div>
                    
                    {/* Category */}
                    <div className="mb-4">
                      <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        {course.category}
                      </span>
                    </div>
                    
                    {/* Price and Actions */}
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-lg text-orange-500">
                        ${course.price?.toFixed(2) || '0.00'}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditCourse(course.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                          title="Edit Course"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-full"
                          title="View Course"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCourse(course.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          title="Delete Course"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center">
              <div className="bg-orange-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? `No courses matching "${searchTerm}" were found.` 
                  : selectedStatus !== 'all'
                    ? `You don't have any ${selectedStatus} courses.`
                    : "You haven't created any courses yet."}
              </p>
              <button 
                onClick={handleCreateCourse}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center mx-auto"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Course
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {isCreating ? renderCourseForm() : renderCourseList()}
    </div>
  );
};

export default InstructorCourses;