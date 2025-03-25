import React, { useState } from 'react';
import { Eye, EyeOff, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [role, setRole] = useState('user'); // Default role is user
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    
    // Validate terms are accepted
    if (!termsAccepted) {
      setError("You must accept the terms and conditions");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store additional user information in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        role, // 'user' or 'instructor'
        createdAt: new Date().toISOString(),
      });
      
      console.log('User registered successfully:', user.uid);
      
      // Redirect based on role
      if (role === 'instructor') {
        navigate('/instructor/home');
      } else {
        navigate('/home');
      }
      
    } catch (error) {
      setIsLoading(false);
      console.error('Registration error:', error);
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered. Please use a different email or try to login.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please use a stronger password.');
          break;
        default:
          setError('Failed to register. Please try again later.');
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-2 rounded-full shadow-md">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="ml-3 text-2xl font-bold text-gray-800">LearningHub</h1>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-600 mt-2">Join our learning platform today</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
            
              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Account Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Register as
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className={`py-3 rounded-lg border ${
                      role === 'user'
                        ? 'bg-orange-50 border-orange-500 text-orange-700'
                        : 'bg-white border-gray-300 text-gray-700'
                    } focus:outline-none transition-all`}
                    onClick={() => setRole('user')}
                    disabled={isLoading}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    className={`py-3 rounded-lg border ${
                      role === 'instructor'
                        ? 'bg-orange-50 border-orange-500 text-orange-700'
                        : 'bg-white border-gray-300 text-gray-700'
                    } focus:outline-none transition-all`}
                    onClick={() => setRole('instructor')}
                    disabled={isLoading}
                  >
                    Instructor
                  </button>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={() => setTermsAccepted(!termsAccepted)}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-600">
                    I agree to the <a href="#" className="text-orange-500 hover:text-orange-600">Terms of Service</a> and <a href="#" className="text-orange-500 hover:text-orange-600">Privacy Policy</a>
                  </label>
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-medium py-3 px-4 rounded-lg hover:from-orange-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-md transition-all"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          {/* Sign in link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/" className="font-medium text-orange-500 hover:text-orange-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-orange-50">
        <div className="h-full w-full flex items-center justify-center p-12">
          <div className="rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl">
            <img 
              src="/api/placeholder/800/600" 
              alt="Learning illustration" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;