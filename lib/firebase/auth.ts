import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from './config';

// Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Email/Password Sign Up
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Update profile with display name
  if (userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
    // Send email verification
    await sendEmailVerification(userCredential.user);
  }

  return userCredential;
};

// Email/Password Sign In
export const signInWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Google Sign In
export const signInWithGoogle = async () => {
  return signInWithPopup(auth, googleProvider);
};

// Phone Number Authentication
let recaptchaVerifier: RecaptchaVerifier | null = null;

export const setupRecaptcha = (containerId: string) => {
  if (typeof window !== 'undefined') {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved - will proceed with phone sign-in
      },
    });
  }
  return recaptchaVerifier;
};

export const sendPhoneOtp = async (phoneNumber: string): Promise<ConfirmationResult | null> => {
  if (!recaptchaVerifier) {
    throw new Error('reCAPTCHA not initialized');
  }

  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  return confirmationResult;
};

export const verifyPhoneOtp = async (confirmationResult: ConfirmationResult, otp: string) => {
  return confirmationResult.confirm(otp);
};

// Sign Out
export const firebaseSignOut = async () => {
  return signOut(auth);
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Get ID token for API calls
export const getIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken();
  }
  return null;
};

// Auth state observer
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export type { FirebaseUser, ConfirmationResult };
