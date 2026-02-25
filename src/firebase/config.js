// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Use hardcoded config or environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAYNbjudJvVReEoJiVspXE8M2OAUvr2pFw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nordicrisercom.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nordicrisercom",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nordicrisercom.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "648135525212",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:648135525212:web:336ad5c5389e72f61c7799"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Check if we should use emulators
const shouldUseEmulators = () => {
  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const useEmulatorParam = urlParams.get('useEmulator');
  
  // Check localStorage
  const localStorageSetting = localStorage.getItem('useFirebaseEmulator');
  
  // Check environment variable
  const envSetting = import.meta.env.VITE_USE_EMULATOR === 'true';
  
  // Default: use emulator in development, production in production
  return import.meta.env.DEV || useEmulatorParam === 'true' || localStorageSetting === 'true' || envSetting;
};

// Connect to emulators if needed
if (shouldUseEmulators()) {
  console.log('🔥 Connecting to Firebase Emulators');
  
  try {
    // Auth Emulator
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099', {
        disableWarnings: true
      });
    }
    
    // Firestore Emulator
    if (!db._settingsFrozen) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    
    // Storage Emulator
    if (!storage._settings) {
      connectStorageEmulator(storage, 'localhost', 9199);
    }
    
    console.log('✅ Successfully connected to Firebase Emulators');
  } catch (error) {
    console.warn('⚠️ Emulator connection warning:', error.message);
  }
} else {
  console.log('🌐 Using Firebase Production Services');
}

export { auth, db, storage };