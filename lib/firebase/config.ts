import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration from environment variables
// These must be set in .env.local for the app to work
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate required config in development
if (typeof window !== 'undefined' && (!firebaseConfig.apiKey || !firebaseConfig.projectId)) {
  console.error(
    'Firebase configuration is missing. Please ensure these environment variables are set in .env.local:\n' +
    '- NEXT_PUBLIC_FIREBASE_API_KEY\n' +
    '- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN\n' +
    '- NEXT_PUBLIC_FIREBASE_PROJECT_ID\n' +
    '- NEXT_PUBLIC_FIREBASE_APP_ID'
  );
}

// Initialize Firebase (prevent re-initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
