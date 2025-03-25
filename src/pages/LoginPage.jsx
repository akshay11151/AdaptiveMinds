import React, { useState } from 'react';
import { Eye, EyeOff, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from "../../firebase"

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setIsLoading(true);
    
    try {
      // Check if this is the admin email
      if (email.toLowerCase() === 'admin@lms.com') {
        // Authenticate the admin user with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Store admin user info in localStorage if remember me is checked
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            role: 'admin'
          }));
        }
        
        // Explicitly set admin role in Firestore if it doesn't exist
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          // If user document doesn't exist, create it with admin role
          await setDoc(userDocRef, {
            email: user.email,
            role: 'admin',
            createdAt: new Date().toISOString(),
          });
        }
        
        // Navigate to admin dashboard
        navigate('/admin/dashboard');
        return;
      }
      
      // Regular user authentication flow
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user data from Firestore to determine role
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Store user info in localStorage if remember me is checked
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            role: userData.role
          }));
        }
        
        // Redirect based on user role
        if (userData.role === 'instructor') {
          navigate('/instructor/home');
        } else {
          navigate('/home');
        }
      } else {
        // If user document doesn't exist in Firestore
        setError('User account data not found. Please contact support.');
        setIsLoading(false);
      }
      
    } catch (error) {
      setIsLoading(false);
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Invalid email or password. Please try again.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed login attempts. Please try again later or reset your password.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled. Please contact support.');
          break;
        default:
          setError('Failed to login. Please try again later.');
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
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Sign in to access your learning dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
            
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
              </div>

              {/* Additional Options */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember_me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-orange-500 hover:text-orange-600 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-medium py-3 px-4 rounded-lg hover:from-orange-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-md transition-all"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Log In'}
              </button>
            </div>
          </form>

          {/* Sign up link */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-orange-500 hover:text-orange-600 transition-colors">
                Sign up
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

export default LoginPage;