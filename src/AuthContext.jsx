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
  const [isDisabled, setIsDisabled] = useState(false);

  // Function to logout
  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('user');
    setCurrentUser(null);
    setUserRole(null);
    setIsDisabled(false);
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if it's the admin email
          if (user.email.toLowerCase() === 'admin@lms.com') {
            setCurrentUser(user);
            setUserRole('admin');
            setIsDisabled(false);
          } else {
            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              
              // Check if user is disabled
              if (userData.disabled === true) {
                // If user is disabled, sign them out
                await signOut(auth);
                setCurrentUser(null);
                setUserRole(null);
                setIsDisabled(true);
                localStorage.removeItem('user');
              } else {
                // User is not disabled, set their data
                setCurrentUser(user);
                setUserRole(userData.role);
                setIsDisabled(false);
              }
            } else {
              setCurrentUser(user);
              setIsDisabled(false);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentUser(user);
        }
      } else {
        // No user is signed in
        setCurrentUser(null);
        setUserRole(null);
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
    isAuthenticated: !!currentUser,
    isDisabled
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};