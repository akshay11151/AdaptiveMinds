import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Create auth context
const AuthContext = createContext();

// Hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to logout
  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('user');
    setCurrentUser(null);
    setUserRole(null);
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Check if it's the admin email
          if (user.email.toLowerCase() === 'admin@lms.com') {
            setUserRole('admin');
          } else {
            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserRole(userData.role);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      
      setLoading(false);
    });

    // Try to get user from localStorage if remember me was checked
    const storedUser = localStorage.getItem('user');
    if (storedUser && !currentUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserRole(parsedUser.role);
    }

    // Cleanup subscription
    return unsubscribe;
  }, []);

  // Context value
  const value = {
    currentUser,
    userRole,
    logout,
    isStudent: userRole === 'user',
    isInstructor: userRole === 'instructor',
    isAdmin: userRole === 'admin',
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};