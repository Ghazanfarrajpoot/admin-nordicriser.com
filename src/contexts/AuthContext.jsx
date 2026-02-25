// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { getDoc, doc } from 'firebase/firestore';

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // 'member' or 'admin'

  // Sign up new user
  async function signup(email, password, firstName, lastName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      });

      // Send email verification
      await sendEmailVerification(userCredential.user);

      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Login user
  const login = async (email, password) => {
  console.log('🔐 AuthContext login called');
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    console.log('✅ Firebase login successful');
    
    // CHECK: Skip email verification for emulator
    const isEmulator = window.location.hostname.includes('localhost') || 
                       window.location.hostname.includes('127.0.0.1');
    
    if (!isEmulator && !userCredential.user.emailVerified) {
      console.log('❌ Email not verified (in production)');
      await signOut(auth); // Sign them out
      return { 
        success: false, 
        error: 'Please verify your email before logging in.' 
      };
    }
    
    // If emulator OR email verified, continue...
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('👤 User role:', userData.role);
    }
    
    return { success: true, user: userCredential.user };
    
  } catch (error) {
    console.error('❌ AuthContext login error:', error);
    return { 
      success: false, 
      error: error.message || 'Login failed' 
    };
  }
};

  // Logout
  async function logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Reset password
  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Determine user role based on email domain or custom claim
  function determineUserRole(user) {
    // For now, check if email contains "admin" or specific admin emails
    // Later, we'll use Firebase Custom Claims
    const email = user.email.toLowerCase();
    const adminEmails = ['admin@nordicriser.com', 'yourname@nordicriser.com']; // Add your admin emails
    
    if (adminEmails.includes(email) || email.includes('admin')) {
      return 'admin';
    }
    return 'member';
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        const role = determineUserRole(user);
        setUserRole(role);
        setCurrentUser(user);
      } else {
        // User is signed out
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    logout,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}