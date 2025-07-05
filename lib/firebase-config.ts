import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import Constants from 'expo-constants';

// Get Firebase configuration from app.json extra section
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || "AIzaSyAuhko0O1WKxY8tRXduIgDrRjQ5sF96DnU",
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || "farmers-ai-4c1b7.firebaseapp.com",
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || "farmers-ai-4c1b7",
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || "farmers-ai-4c1b7.firebasestorage.app",
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || "538206936930",
  appId: Constants.expoConfig?.extra?.firebaseAppId || "1:538206936930:web:45116149bbba55e3ed963b",
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId || "G-SSP86XN0RD",
};

// Debug log to see what config is being used
if (__DEV__) {
  console.log('🔥 Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing',
    authDomain: firebaseConfig.authDomain ? '✅ Set' : '❌ Missing',
    projectId: firebaseConfig.projectId ? '✅ Set' : '❌ Missing',
    appId: firebaseConfig.appId ? '✅ Set' : '❌ Missing',
  });
}

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.error('❌ Firebase Config Values:', firebaseConfig);
    console.error('❌ Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
    throw new Error(`Missing required Firebase configuration fields: ${missingFields.join(', ')}. Please check your app.json extra section.`);
  }
  
  // Check for placeholder values
  const placeholderValues = ['your-actual-', 'demo-', 'placeholder-'];
  const hasPlaceholders = Object.entries(firebaseConfig).some(([key, value]) => 
    placeholderValues.some(placeholder => value?.toString().includes(placeholder))
  );
  
  if (hasPlaceholders) {
    throw new Error('Firebase configuration contains placeholder values. Please update your app.json with real Firebase project credentials.');
  }
};

// Initialize Firebase with validation
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  // Validate configuration before initializing
  validateFirebaseConfig();
  
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Initialize Auth with additional settings for development
  auth = getAuth(app);
  
  // For development, configure auth persistence
  if (__DEV__) {
    // Enable network logging for debugging
    console.log('🔥 Firebase initialized with config:', {
      ...firebaseConfig,
      apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
    });
  }
  
  // Initialize Firestore with settings
  db = getFirestore(app);
  
  console.log('✅ Firebase initialized successfully with project:', firebaseConfig.projectId);
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  
  // More detailed error logging
  if (error instanceof Error) {
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
  
  throw error;
}

export { auth, db };
export default app;
