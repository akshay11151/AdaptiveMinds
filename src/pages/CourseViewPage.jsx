import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Play, 
  CheckCircle, 
  Clock, 
  Award, 
  BookOpen, 
  Video, 
  ExternalLink, 
  Download,
  AlertCircle,
  Loader
} from 'lucide-react';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  arrayUnion, 
  serverTimestamp, 
  setDoc 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CourseViewPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const videoRef = useRef(null);
  
  // State
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [activeVideo, setActiveVideo] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [certificateGenerated, setCertificateGenerated] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState('');
  
  // Fetch course data and user progress
  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      if (!isAuthenticated || !currentUser) {
        navigate('/');
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch course data
        const courseRef = doc(db, 'courses', courseId);
        const courseDoc = await getDoc(courseRef);
        
        if (!courseDoc.exists()) {
          setError('Course not found');
          setLoading(false);
          return;
        }
        
        const courseData = { id: courseDoc.id, ...courseDoc.data() };
        setCourse(courseData);
        
        // Fetch user's progress for this course
        const userCourseRef = doc(db, 'user_courses', `${currentUser.uid}_${courseId}`);
        const userCourseDoc = await getDoc(userCourseRef);
        
        if (!userCourseDoc.exists()) {
          // User hasn't enrolled in this course
          navigate('/courses');
          return;
        }
        
        const userCourseData = userCourseDoc.data();
        setProgress(userCourseData.progress || 0);
        setCompletedVideos(userCourseData.completedVideos || []);
        
        // If there's a certificate already
        if (userCourseData.certificateId) {
          setCertificateGenerated(true);
          
          // Fetch certificate details
          const certificateRef = doc(db, 'user_certificates', userCourseData.certificateId);
          const certificateDoc = await getDoc(certificateRef);
          
          if (certificateDoc.exists()) {
            setCertificateUrl(`/certificate/${userCourseData.certificateId}`);
          }
        }
        
        // Update last accessed
        await updateDoc(userCourseRef, {
          lastAccessedAt: serverTimestamp()
        });
        
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseAndProgress();
  }, [courseId, currentUser, isAuthenticated, navigate]);
  
  // Mark video as completed
  const handleVideoCompleted = async (sectionIndex, videoIndex) => {
    if (!course || !currentUser) return;
    
    try {
      const section = course.sections[sectionIndex];
      const video = section.videos[videoIndex];
      const videoId = `${sectionIndex}_${videoIndex}`;
      
      // If already completed, do nothing
      if (completedVideos.includes(videoId)) return;
      
      // Add to completedVideos array
      const updatedCompletedVideos = [...completedVideos, videoId];
      setCompletedVideos(updatedCompletedVideos);
      
      // Calculate new progress
      const totalVideos = course.sections.reduce((total, section) => total + section.videos.length, 0);
      const newProgress = Math.round((updatedCompletedVideos.length / totalVideos) * 100);
      setProgress(newProgress);
      
      // Update in Firestore
      const userCourseRef = doc(db, 'user_courses', `${currentUser.uid}_${courseId}`);
      await updateDoc(userCourseRef, {
        completedVideos: arrayUnion(videoId),
        progress: newProgress,
        lastAccessedAt: serverTimestamp()
      });
      
      // Check if course is complete
      if (newProgress === 100 && !certificateGenerated) {
        await generateCertificate();
      }
      
    } catch (err) {
      console.error('Error marking video as completed:', err);
      alert('Failed to update progress. Please try again.');
    }
  };
  
  // Generate certificate
  const generateCertificate = async () => {
    if (!course || !currentUser || certificateGenerated) return;
    
    try {
      setGenerating(true);
      
      // Create certificate ID
      const certificateId = `CERT-${currentUser.uid.substring(0, 4)}-${courseId.substring(0, 4)}-${Date.now()}`;
      
      // Create certificate document
      await setDoc(doc(db, 'user_certificates', certificateId), {
        userId: currentUser.uid,
        courseId: courseId,
        courseName: course.title,
        instructorName: course.instructorName,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        issueDate: serverTimestamp(),
        certificateId
      });
      
      // Update user course record
      const userCourseRef = doc(db, 'user_courses', `${currentUser.uid}_${courseId}`);
      await updateDoc(userCourseRef, {
        completed: true,
        certificateId,
        completedAt: serverTimestamp()
      });
      
      setCertificateGenerated(true);
      setCertificateUrl(`/certificate/${certificateId}`);
      
    } catch (err) {
      console.error('Error generating certificate:', err);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setGenerating(false);
    }
  };
  
  // Select video to play
  const handleSelectVideo = (sectionIndex, videoIndex) => {
    setActiveSection(sectionIndex);
    setActiveVideo(videoIndex);
    
    // Scroll video into view
    if (videoRef.current) {
      videoRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Check if a video is completed
  const isVideoCompleted = (sectionIndex, videoIndex) => {
    return completedVideos.includes(`${sectionIndex}_${videoIndex}`);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-12 flex justify-center items-center">
          <Loader className="h-8 w-8 text-orange-500 animate-spin" />
          <span className="ml-2 text-gray-600">Loading course...</span>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-12">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{error}</p>
              <button 
                onClick={() => navigate('/courses')}
                className="mt-2 text-sm underline"
              >
                Return to Courses
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // If no course data
  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-12">
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">Course not found</h3>
            <p className="text-gray-500 mb-6">The course you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => navigate('/courses')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Browse Courses
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Get current video
  const currentSection = course.sections[activeSection];
  const currentVideo = currentSection?.videos[activeVideo];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Course header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/courses')}
            className="flex items-center text-gray-600 hover:text-orange-500 mb-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Courses
          </button>
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{course.title}</h1>
          
          <div className="flex flex-wrap items-center text-sm text-gray-600 mb-4">
            <div className="flex items-center mr-6 mb-2">
              <BookOpen className="h-4 w-4 text-orange-500 mr-1" />
              <span>Instructor: {course.instructorName}</span>
            </div>
            <div className="flex items-center mr-6 mb-2">
              <Video className="h-4 w-4 text-orange-500 mr-1" />
              <span>{course.sections.reduce((total, section) => total + section.videos.length, 0)} videos</span>
            </div>
            <div className="flex items-center mb-2">
              <Award className="h-4 w-4 text-orange-500 mr-1" />
              <span>Certificate on completion</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-orange-500 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">{progress}% complete</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Video Display */}
              <div ref={videoRef} className="aspect-video bg-black flex items-center justify-center">
                {currentVideo ? (
                  <iframe
                    src={currentVideo.url}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="text-center text-white">
                    <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Select a video to start learning</p>
                  </div>
                )}
              </div>
              
              {/* Video Info */}
              {currentVideo && (
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-2">{currentVideo.title}</h2>
                      <p className="text-gray-600 text-sm">
                        From: {currentSection.title}
                      </p>
                    </div>
                    
                    {/* Mark as Complete Button */}
                    {!isVideoCompleted(activeSection, activeVideo) ? (
                      <button 
                        onClick={() => handleVideoCompleted(activeSection, activeVideo)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark as Complete
                      </button>
                    ) : (
                      <div className="flex items-center text-green-500 px-4 py-2 bg-green-50 rounded-lg text-sm font-medium">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed
                      </div>
                    )}
                  </div>
                  
                  {currentVideo.description && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-2">Description</h3>
                      <p className="text-gray-600">{currentVideo.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Course Description */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">About This Course</h2>
              <p className="text-gray-600">{course.description}</p>
              
              {certificateGenerated && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start">
                    <Award className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">Course Completed!</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Congratulations! You've completed this course and earned a certificate.
                      </p>
                      <a 
                        href={certificateUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:text-orange-600 font-medium flex items-center w-fit"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Certificate
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              {progress === 100 && !certificateGenerated && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <Award className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1">Course Completed!</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Congratulations! You've completed all videos in this course.
                      </p>
                      <button 
                        onClick={generateCertificate}
                        disabled={generating}
                        className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center ${
                          generating ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {generating ? (
                          <>
                            <Loader className="animate-spin h-4 w-4 mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Award className="h-4 w-4 mr-1" />
                            Generate Certificate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Course Curriculum */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="font-bold text-gray-800">Course Curriculum</h2>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{completedVideos.length} / {course.sections.reduce((total, section) => total + section.videos.length, 0)} completed</span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {course.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="p-4">
                    <h3 className="font-medium text-gray-800 mb-2">{section.title}</h3>
                    
                    <div className="space-y-2">
                      {section.videos.map((video, videoIndex) => {
                        const isCompleted = isVideoCompleted(sectionIndex, videoIndex);
                        const isActive = activeSection === sectionIndex && activeVideo === videoIndex;
                        
                        return (
                          <button
                            key={videoIndex}
                            onClick={() => handleSelectVideo(sectionIndex, videoIndex)}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-sm ${
                              isActive 
                                ? 'bg-orange-100 text-orange-700' 
                                : isCompleted 
                                  ? 'bg-green-50 text-gray-700'
                                  : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center">
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              ) : (
                                <Play className={`h-4 w-4 ${isActive ? 'text-orange-500' : 'text-gray-400'} mr-2 flex-shrink-0`} />
                              )}
                              <span className="line-clamp-1">{video.title}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CourseViewPage;