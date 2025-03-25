import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Award, 
  Edit, 
  Save, 
  X, 
  Camera,
  Upload
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
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { db, storage, auth } from '../../firebase';
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const UserProfilePage = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  
  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // User data
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    occupation: '',
    education: '',
    birthdate: '',
    profilePicture: '',
  });
  
  // File upload state
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Fetch user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;
      
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          setUserProfile({
            displayName: currentUser.displayName || userData.displayName || '',
            email: currentUser.email || userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            bio: userData.bio || '',
            occupation: userData.occupation || '',
            education: userData.education || '',
            birthdate: userData.birthdate || '',
            profilePicture: currentUser.photoURL || userData.profilePicture || '',
          });
        } else {
          // Initialize user document if it doesn't exist
          await setDoc(userDocRef, {
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            role: userRole || 'user',
            createdAt: new Date().toISOString(),
          });
          
          setUserProfile({
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            phone: '',
            address: '',
            bio: '',
            occupation: '',
            education: '',
            birthdate: '',
            profilePicture: currentUser.photoURL || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user profile. Please try again later.');
      }
    };
    
    fetchUserProfile();
  }, [currentUser, userRole]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle profile picture change
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  
  // Upload profile picture to Firebase Storage
  const uploadProfilePicture = async () => {
    if (!imageFile) return null;
    
    const storageRef = ref(storage, `profile-pictures/${currentUser.uid}/${imageFile.name}`);
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
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Upload profile picture if selected
      let profilePictureURL = userProfile.profilePicture;
      
      if (imageFile) {
        profilePictureURL = await uploadProfilePicture();
      }
      
      // Update user profile in Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: userProfile.displayName,
        phone: userProfile.phone,
        address: userProfile.address,
        bio: userProfile.bio,
        occupation: userProfile.occupation,
        education: userProfile.education,
        birthdate: userProfile.birthdate,
        profilePicture: profilePictureURL,
        updatedAt: new Date().toISOString(),
      });
      
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: userProfile.displayName,
        photoURL: profilePictureURL
      });
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        profilePicture: profilePictureURL
      }));
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setImageFile(null);
      setUploadProgress(0);
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
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
    
    // Reset form to original values
    if (currentUser) {
      const fetchUserProfile = async () => {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            setUserProfile({
              displayName: currentUser.displayName || userData.displayName || '',
              email: currentUser.email || userData.email || '',
              phone: userData.phone || '',
              address: userData.address || '',
              bio: userData.bio || '',
              occupation: userData.occupation || '',
              education: userData.education || '',
              birthdate: userData.birthdate || '',
              profilePicture: currentUser.photoURL || userData.profilePicture || '',
            });
          }
        } catch (error) {
          console.error('Error resetting form:', error);
        }
      };
      
      fetchUserProfile();
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 py-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Your Profile</h1>
          <p className="text-orange-100 max-w-2xl mx-auto">
            Manage your personal information and account settings
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          
          {/* Profile Header */}
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-48 bg-orange-100"></div>
            
            {/* Profile Picture */}
            <div className="absolute left-6 bottom-0 transform translate-y-1/2">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200 flex items-center justify-center">
                  {userProfile.profilePicture ? (
                    <img 
                      src={userProfile.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                
                {/* Edit profile picture button (when editing) */}
                {isEditing && (
                  <label 
                    htmlFor="profile-picture" 
                    className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full cursor-pointer"
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
                    onClick={handleSubmit}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
                >
                  <Edit className="h-5 w-5 mr-1" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="p-6 pt-20">
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
            
            {/* Upload Progress */}
            {isEditing && imageFile && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-6">
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
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="displayName"
                      value={userProfile.displayName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Your name"
                      disabled={isLoading}
                    />
                  ) : (
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-gray-800">
                        {userProfile.displayName || 'Not specified'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-800">{userProfile.email}</p>
                  </div>
                </div>
                
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={userProfile.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Your phone number"
                      disabled={isLoading}
                    />
                  ) : (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-gray-800">
                        {userProfile.phone || 'Not specified'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Birth Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="birthdate"
                      value={userProfile.birthdate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      disabled={isLoading}
                    />
                  ) : (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-gray-800">
                        {userProfile.birthdate 
                          ? new Date(userProfile.birthdate).toLocaleDateString() 
                          : 'Not specified'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={userProfile.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Your address"
                      disabled={isLoading}
                    />
                  ) : (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-gray-800">
                        {userProfile.address || 'Not specified'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Occupation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="occupation"
                      value={userProfile.occupation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Your occupation"
                      disabled={isLoading}
                    />
                  ) : (
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-gray-800">
                        {userProfile.occupation || 'Not specified'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Education */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Education
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="education"
                      value={userProfile.education}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Your education background"
                      disabled={isLoading}
                    />
                  ) : (
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-gray-800">
                        {userProfile.education || 'Not specified'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={userProfile.bio}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Tell us about yourself"
                      disabled={isLoading}
                    ></textarea>
                  ) : (
                    <p className="text-gray-800">
                      {userProfile.bio || 'No bio information available.'}
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserProfilePage;