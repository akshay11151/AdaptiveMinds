import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  FileText,
  MessageSquare,
  BarChart2,
  Calendar,
  Settings,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
  ArrowLeft,
  Edit,
  Save,
  X,
  PlusCircle,
  Trash2,
  Camera,
  User,
  Award,
  Briefcase,
  Code
} from 'lucide-react';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL
} from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { db, storage, auth } from '../../firebase';
import { useAuth } from '../AuthContext';

const InstructorsProfile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state
  const [instructor, setInstructor] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    image: "",
    expertise: [],
    education: [],
    experience: [],
    skills: [],
    yearsOfExperience: "",
    socialLinks: {
      linkedin: "",
      twitter: "",
      facebook: "",
      youtube: ""
    }
  });
  
  // Temporary states for adding new items
  const [newExpertise, setNewExpertise] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    year: ''
  });
  const [newExperience, setNewExperience] = useState({
    position: '',
    company: '',
    duration: '',
    description: ''
  });
  
  // File upload state
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Fetch instructor data
  useEffect(() => {
    const fetchInstructorProfile = async () => {
      if (!currentUser) return;
      
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          setInstructor({
            name: userData.displayName || currentUser.displayName || '',
            title: userData.title || '',
            email: userData.email || currentUser.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            bio: userData.bio || '',
            image: userData.profilePicture || currentUser.photoURL || '',
            expertise: userData.expertise || [],
            education: userData.education || [],
            experience: userData.experience || [],
            skills: userData.skills || [],
            yearsOfExperience: userData.yearsOfExperience || '',
            socialLinks: userData.socialLinks || {
              linkedin: '',
              twitter: '',
              facebook: '',
              youtube: ''
            }
          });
        } else {
          // Initialize user document if it doesn't exist
          await setDoc(userDocRef, {
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            role: 'instructor',
            createdAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error fetching instructor profile:', error);
        setError('Failed to load profile. Please try again later.');
      }
    };
    
    fetchInstructorProfile();
  }, [currentUser]);
  
  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties like socialLinks.linkedin
      const [parent, child] = name.split('.');
      setInstructor({
        ...instructor,
        [parent]: {
          ...instructor[parent],
          [child]: value
        }
      });
    } else {
      setInstructor({
        ...instructor,
        [name]: value
      });
    }
  };
  
  // Handle image change
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  
  // Upload profile picture
  const uploadProfilePicture = async () => {
    if (!imageFile) return null;
    
    const storageRef = ref(storage, `instructor-profiles/${currentUser.uid}/${imageFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          // Handle errors
          console.error('Error uploading image:', error);
          reject(error);
        },
        async () => {
          // Handle successful upload
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };
  
  // Add expertise
  const addExpertise = () => {
    if (newExpertise.trim() === '') return;
    
    setInstructor({
      ...instructor,
      expertise: [...instructor.expertise, newExpertise.trim()]
    });
    setNewExpertise('');
  };
  
  // Remove expertise
  const removeExpertise = (index) => {
    const updatedExpertise = [...instructor.expertise];
    updatedExpertise.splice(index, 1);
    setInstructor({
      ...instructor,
      expertise: updatedExpertise
    });
  };
  
  // Add skill
  const addSkill = () => {
    if (newSkill.trim() === '') return;
    
    setInstructor({
      ...instructor,
      skills: [...instructor.skills, newSkill.trim()]
    });
    setNewSkill('');
  };
  
  // Remove skill
  const removeSkill = (index) => {
    const updatedSkills = [...instructor.skills];
    updatedSkills.splice(index, 1);
    setInstructor({
      ...instructor,
      skills: updatedSkills
    });
  };
  
  // Add education
  const addEducation = () => {
    if (newEducation.degree.trim() === '' || newEducation.institution.trim() === '') return;
    
    setInstructor({
      ...instructor,
      education: [...instructor.education, { ...newEducation }]
    });
    setNewEducation({
      degree: '',
      institution: '',
      year: ''
    });
  };
  
  // Remove education
  const removeEducation = (index) => {
    const updatedEducation = [...instructor.education];
    updatedEducation.splice(index, 1);
    setInstructor({
      ...instructor,
      education: updatedEducation
    });
  };
  
  // Add experience
  const addExperience = () => {
    if (newExperience.position.trim() === '' || newExperience.company.trim() === '') return;
    
    setInstructor({
      ...instructor,
      experience: [...instructor.experience, { ...newExperience }]
    });
    setNewExperience({
      position: '',
      company: '',
      duration: '',
      description: ''
    });
  };
  
  // Remove experience
  const removeExperience = (index) => {
    const updatedExperience = [...instructor.experience];
    updatedExperience.splice(index, 1);
    setInstructor({
      ...instructor,
      experience: updatedExperience
    });
  };
  
  // Save profile changes
  const handleSave = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Upload profile picture if selected
      let profilePictureURL = instructor.image;
      
      if (imageFile) {
        profilePictureURL = await uploadProfilePicture();
      }
      
      // Update user profile in Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: instructor.name,
        title: instructor.title,
        phone: instructor.phone,
        address: instructor.address,
        bio: instructor.bio,
        profilePicture: profilePictureURL,
        expertise: instructor.expertise,
        education: instructor.education,
        experience: instructor.experience,
        skills: instructor.skills,
        yearsOfExperience: instructor.yearsOfExperience,
        socialLinks: instructor.socialLinks,
        updatedAt: new Date().toISOString(),
      });
      
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: instructor.name,
        photoURL: profilePictureURL
      });
      
      // Update local state
      setInstructor({
        ...instructor,
        image: profilePictureURL
      });
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setImageFile(null);
      setUploadProgress(0);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setImageFile(null);
    setUploadProgress(0);
    
    // Reset temporary states
    setNewExpertise('');
    setNewSkill('');
    setNewEducation({
      degree: '',
      institution: '',
      year: ''
    });
    setNewExperience({
      position: '',
      company: '',
      duration: '',
      description: ''
    });
    
    // Refetch profile to reset any changes
    const fetchInstructorProfile = async () => {
      if (!currentUser) return;
      
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          setInstructor({
            name: userData.displayName || currentUser.displayName || '',
            title: userData.title || '',
            email: userData.email || currentUser.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            bio: userData.bio || '',
            image: userData.profilePicture || currentUser.photoURL || '',
            expertise: userData.expertise || [],
            education: userData.education || [],
            experience: userData.experience || [],
            skills: userData.skills || [],
            yearsOfExperience: userData.yearsOfExperience || '',
            socialLinks: userData.socialLinks || {
              linkedin: '',
              twitter: '',
              facebook: '',
              youtube: ''
            }
          });
        }
      } catch (error) {
        console.error('Error resetting form:', error);
      }
    };
    
    fetchInstructorProfile();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/instructor/home" className="flex items-center text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-2 rounded-full">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h2 className="ml-2 text-xl font-bold text-gray-800">LearningHub</h2>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
      
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          {/* Profile Header */}
          <div className="relative bg-gradient-to-r from-orange-400 to-orange-500 px-6 py-16">
            <div className="flex flex-col items-center">
              <div className="relative">
                {instructor.image ? (
                  <img 
                    src={instructor.image} 
                    alt={instructor.name} 
                    className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg" 
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center shadow-lg">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                
                {/* Edit profile picture button (when editing) */}
                {isEditing && (
                  <label 
                    htmlFor="profile-picture" 
                    className="absolute bottom-0 right-0 bg-white text-orange-500 p-2 rounded-full cursor-pointer shadow-md"
                  >
                    <Camera className="h-5 w-5" />
                    <input 
                      id="profile-picture" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                      disabled={isLoading}
                    />
                  </label>
                )}
              </div>
              
              {isEditing ? (
                <div className="mt-4 w-full max-w-xs">
                  <input
                    type="text"
                    value={instructor.name}
                    onChange={(e) => handleInputChange({target: {name: 'name', value: e.target.value}})}
                    className="bg-white text-gray-800 border border-orange-300 rounded-lg px-4 py-2 w-full text-center font-bold text-xl mb-2"
                    placeholder="Your Name"
                  />
                  <input
                    type="text"
                    value={instructor.title}
                    onChange={(e) => handleInputChange({target: {name: 'title', value: e.target.value}})}
                    className="bg-white text-gray-600 border border-orange-300 rounded-lg px-4 py-2 w-full text-center"
                    placeholder="Your Title (e.g., Data Science Instructor)"
                  />
                </div>
              ) : (
                <>
                  <h1 className="mt-4 text-3xl font-bold text-white">{instructor.name || 'Instructor Name'}</h1>
                  <p className="text-orange-100">{instructor.title || 'Instructor Title'}</p>
                </>
              )}
            </div>
            
            {/* Edit Profile Button */}
            <div className="absolute top-4 right-4">
              {isEditing ? (
                <div className="flex space-x-2">
                  <button 
                    onClick={handleCancel}
                    className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                    disabled={isLoading}
                  >
                    <X className="h-5 w-5 mr-1" />
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="bg-white text-orange-500 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors flex items-center font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-1" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-orange-500 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors flex items-center font-medium"
                >
                  <Edit className="h-5 w-5 mr-1" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {isEditing && imageFile && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Uploading image: {Math.round(uploadProgress)}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-orange-500 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Profile Information */}
          <div className="p-6">
            <div className="md:flex md:space-x-8">
              {/* Left Column - Bio and details */}
              <div className="md:w-2/3 mb-8 md:mb-0">
                {/* Bio */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">About</h2>
                  {isEditing ? (
                    <textarea
                      value={instructor.bio}
                      onChange={(e) => handleInputChange({target: {name: 'bio', value: e.target.value}})}
                      rows="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Write your professional bio here..."
                    ></textarea>
                  ) : (
                    <p className="text-gray-600">
                      {instructor.bio || 'No bio information available.'}
                    </p>
                  )}
                </div>
                
                {/* Expertise */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Areas of Expertise</h2>
                  
                  {isEditing ? (
                    <div>
                      <div className="flex mb-2">
                        <input
                          type="text"
                          value={newExpertise}
                          onChange={(e) => setNewExpertise(e.target.value)}
                          className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg"
                          placeholder="Add a new area of expertise"
                        />
                        <button
                          type="button"
                          onClick={addExpertise}
                          className="bg-orange-500 text-white px-4 py-2 rounded-r-lg hover:bg-orange-600"
                        >
                          <PlusCircle className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {instructor.expertise.map((item, index) => (
                          <div key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full flex items-center">
                            <span>{item}</span>
                            <button
                              onClick={() => removeExpertise(index)}
                              className="ml-2 text-orange-800 hover:text-orange-900"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {instructor.expertise && instructor.expertise.length > 0 ? (
                        instructor.expertise.map((item, index) => (
                          <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                            {item}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-600">No expertise areas specified.</p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Education */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Education</h2>
                  
                  {isEditing ? (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input
                          type="text"
                          value={newEducation.degree}
                          onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                          placeholder="Degree/Qualification"
                        />
                        <input
                          type="text"
                          value={newEducation.institution}
                          onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                          placeholder="Institution"
                        />
                        <div className="flex">
                          <input
                            type="text"
                            value={newEducation.year}
                            onChange={(e) => setNewEducation({...newEducation, year: e.target.value})}
                            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg"
                            placeholder="Year (e.g., 2018)"
                          />
                          <button
                            type="button"
                            onClick={addEducation}
                            className="bg-orange-500 text-white px-4 py-2 rounded-r-lg hover:bg-orange-600"
                          >
                            <PlusCircle className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      {instructor.education && instructor.education.map((edu, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800">{edu.degree}</p>
                            <p className="text-gray-600 text-sm">{edu.institution}</p>
                            {edu.year && <p className="text-gray-500 text-sm">{edu.year}</p>}
                          </div>
                          <button
                            onClick={() => removeEducation(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {instructor.education && instructor.education.length > 0 ? (
                        instructor.education.map((edu, index) => (
                          <div key={index} className="flex items-start">
                            <Award className="h-5 w-5 text-orange-500 mr-3 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-800">{edu.degree}</p>
                              <p className="text-gray-600">{edu.institution}</p>
                              {edu.year && <p className="text-gray-500 text-sm">{edu.year}</p>}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600">No education information available.</p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Work Experience */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Work Experience</h2>
                  
                  {isEditing ? (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          value={newExperience.position}
                          onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                          placeholder="Position/Title"
                        />
                        <input
                          type="text"
                          value={newExperience.company}
                          onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                          placeholder="Company/Organization"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <input
                          type="text"
                          value={newExperience.duration}
                          onChange={(e) => setNewExperience({...newExperience, duration: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                          placeholder="Duration (e.g., 2018-2022)"
                        />
                        
                        <textarea
                          value={newExperience.description}
                          onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                          placeholder="Job description and responsibilities"
                        ></textarea>
                        
                        <button
                          type="button"
                          onClick={addExperience}
                          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center"
                        >
                          <PlusCircle className="h-5 w-5 mr-2" />
                          Add Experience
                        </button>
                      </div>
                      
                      {instructor.experience && instructor.experience.map((exp, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-800">{exp.position}</p>
                              <p className="text-gray-600">{exp.company}</p>
                              {exp.duration && <p className="text-gray-500 text-sm">{exp.duration}</p>}
                            </div>
                            <button
                              onClick={() => removeExperience(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                          {exp.description && (
                            <p className="text-gray-600 text-sm mt-2">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {instructor.experience && instructor.experience.length > 0 ? (
                        instructor.experience.map((exp, index) => (
                          <div key={index} className="flex items-start">
                            <Briefcase className="h-5 w-5 text-orange-500 mr-3 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-800">{exp.position}</p>
                              <p className="text-gray-600">{exp.company}</p>
                              {exp.duration && <p className="text-gray-500 text-sm">{exp.duration}</p>}
                              {exp.description && (
                              <p className="text-gray-600 text-sm mt-2">{exp.description}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">No work experience information available.</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Skills */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Skills</h2>
                
                {isEditing ? (
                  <div>
                    <div className="flex mb-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg"
                        placeholder="Add a skill (e.g., Python, Data Visualization)"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="bg-orange-500 text-white px-4 py-2 rounded-r-lg hover:bg-orange-600"
                      >
                        <PlusCircle className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {instructor.skills.map((skill, index) => (
                        <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                          <span>{skill}</span>
                          <button
                            onClick={() => removeSkill(index)}
                            className="ml-2 text-blue-800 hover:text-blue-900"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {instructor.skills && instructor.skills.length > 0 ? (
                      instructor.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-600">No skills specified.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Contact Info */}
            <div className="md:w-1/3">
              <div className="bg-gray-50 rounded-lg p-6">
                {/* Years of Experience */}
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-2">Years of Experience</h2>
                  {isEditing ? (
                    <input
                      type="text"
                      value={instructor.yearsOfExperience}
                      onChange={(e) => handleInputChange({target: {name: 'yearsOfExperience', value: e.target.value}})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g., 10+"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">
                      {instructor.yearsOfExperience ? `${instructor.yearsOfExperience} years` : 'Not specified'}
                    </p>
                  )}
                </div>
              
                <h2 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Mail className="h-5 w-5 text-orange-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <a href={`mailto:${instructor.email}`} className="text-gray-800 hover:text-orange-500">
                        {instructor.email}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Phone className="h-5 w-5 text-orange-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={instructor.phone}
                          onChange={(e) => handleInputChange({target: {name: 'phone', value: e.target.value}})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          placeholder="Your phone number"
                        />
                      ) : (
                        <a href={`tel:${instructor.phone}`} className="text-gray-800 hover:text-orange-500">
                          {instructor.phone || 'Not provided'}
                        </a>
                      )}
                    </div>
                  </li>
                  <li className="flex items-start">
                    <MapPin className="h-5 w-5 text-orange-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={instructor.address}
                          onChange={(e) => handleInputChange({target: {name: 'address', value: e.target.value}})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          placeholder="Your location"
                        />
                      ) : (
                        <p className="text-gray-800">{instructor.address || 'Not provided'}</p>
                      )}
                    </div>
                  </li>
                </ul>

                <h2 className="text-lg font-bold text-gray-800 mt-8 mb-4">Social Profiles</h2>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Linkedin className="h-5 w-5 text-gray-400 mr-2" />
                      <input
                        type="url"
                        value={instructor.socialLinks.linkedin}
                        onChange={(e) => handleInputChange({target: {name: 'socialLinks.linkedin', value: e.target.value}})}
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="LinkedIn URL"
                      />
                    </div>
                    <div className="flex items-center">
                      <Twitter className="h-5 w-5 text-gray-400 mr-2" />
                      <input
                        type="url"
                        value={instructor.socialLinks.twitter}
                        onChange={(e) => handleInputChange({target: {name: 'socialLinks.twitter', value: e.target.value}})}
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Twitter URL"
                      />
                    </div>
                    <div className="flex items-center">
                      <Facebook className="h-5 w-5 text-gray-400 mr-2" />
                      <input
                        type="url"
                        value={instructor.socialLinks.facebook}
                        onChange={(e) => handleInputChange({target: {name: 'socialLinks.facebook', value: e.target.value}})}
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Facebook URL"
                      />
                    </div>
                    <div className="flex items-center">
                      <Youtube className="h-5 w-5 text-gray-400 mr-2" />
                      <input
                        type="url"
                        value={instructor.socialLinks.youtube}
                        onChange={(e) => handleInputChange({target: {name: 'socialLinks.youtube', value: e.target.value}})}
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="YouTube URL"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-3">
                    {instructor.socialLinks.linkedin && (
                      <a 
                        href={instructor.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-200 rounded-full text-gray-700 hover:bg-orange-500 hover:text-white transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {instructor.socialLinks.twitter && (
                      <a 
                        href={instructor.socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-200 rounded-full text-gray-700 hover:bg-orange-500 hover:text-white transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {instructor.socialLinks.facebook && (
                      <a 
                        href={instructor.socialLinks.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-200 rounded-full text-gray-700 hover:bg-orange-500 hover:text-white transition-colors"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                    )}
                    {instructor.socialLinks.youtube && (
                      <a 
                        href={instructor.socialLinks.youtube} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-200 rounded-full text-gray-700 hover:bg-orange-500 hover:text-white transition-colors"
                      >
                        <Youtube className="h-5 w-5" />
                      </a>
                    )}
                    {!instructor.socialLinks.linkedin && 
                     !instructor.socialLinks.twitter && 
                     !instructor.socialLinks.facebook && 
                     !instructor.socialLinks.youtube && (
                      <p className="text-gray-600 text-sm">No social profiles added yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);
};

export default InstructorsProfile;