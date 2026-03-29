'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { User, LoginCredentials } from '@/types';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  firebaseSignOut,
  onAuthStateChange,
  getIdToken,
  sendPhoneOtp,
  verifyPhoneOtp,
  setupRecaptcha,
  type FirebaseUser,
  type ConfirmationResult,
} from '@/lib/firebase';
import { authApi } from '@/lib/api';
import { storage } from '@/lib/utils';

interface RegisterWithEmailData {
  name: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPhoneVerification: (phoneNumber: string) => Promise<ConfirmationResult | null>;
  verifyPhone: (confirmationResult: ConfirmationResult, code: string) => Promise<void>;
  registerWithEmail: (data: RegisterWithEmailData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initRecaptcha: (containerId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!firebaseUser;

  // Sync Firebase user to backend and get SmartLoan user profile
  const syncUserToBackend = useCallback(async (fbUser: FirebaseUser) => {
    try {
      const idToken = await fbUser.getIdToken();
      storage.set('token', idToken);

      // Try to get existing user profile from backend
      try {
        const backendUser = await authApi.me();
        setUser(backendUser);
        storage.set('user', backendUser);
      } catch {
        // User doesn't exist in backend yet, create them
        const newUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || 'SmartLoan User',
          email: fbUser.email || '',
          role: 'user',
          trustScore: 100,
          createdAt: new Date().toISOString(),
        };
        setUser(newUser);
        storage.set('user', newUser);
      }
    } catch (error) {
      console.error('Error syncing user to backend:', error);
    }
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        await syncUserToBackend(fbUser);
      } else {
        setUser(null);
        storage.remove('token');
        storage.remove('user');
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [syncUserToBackend]);

  // Initialize reCAPTCHA for phone auth
  const initRecaptcha = useCallback((containerId: string) => {
    setupRecaptcha(containerId);
  }, []);

  // Email/Password Login
  const login = useCallback(async (credentials: LoginCredentials) => {
    await signInWithEmail(credentials.email, credentials.password);
    // The onAuthStateChange listener will handle the rest
  }, []);

  // Google Sign In
  const loginWithGoogle = useCallback(async () => {
    await signInWithGoogle();
    // The onAuthStateChange listener will handle the rest
  }, []);

  // Phone verification - send OTP
  const sendPhoneVerification = useCallback(async (phoneNumber: string) => {
    return sendPhoneOtp(phoneNumber);
  }, []);

  // Phone verification - verify OTP
  const verifyPhone = useCallback(async (confirmationResult: ConfirmationResult, code: string) => {
    await verifyPhoneOtp(confirmationResult, code);
    // The onAuthStateChange listener will handle the rest
  }, []);

  // Email/Password Registration
  const registerWithEmail = useCallback(async (data: RegisterWithEmailData) => {
    await signUpWithEmail(data.email, data.password, data.name);
    // Note: Backend user creation is handled automatically by FirebaseAuthenticationFilter
    // when the user makes their first authenticated request. The filter calls findOrCreateUser()
    // which creates the user in the database if they don't exist.
    // The onAuthStateChange listener will sync the user via syncUserToBackend -> authApi.me()
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await firebaseSignOut();
    storage.remove('token');
    storage.remove('user');
    setUser(null);
    router.push('/login');
  }, [router]);

  // Refresh user data from backend
  const refreshUser = useCallback(async () => {
    if (firebaseUser) {
      await syncUserToBackend(firebaseUser);
    }
  }, [firebaseUser, syncUserToBackend]);

  // Refresh Firebase token periodically
  useEffect(() => {
    if (!firebaseUser) return;

    const refreshToken = async () => {
      const newToken = await getIdToken();
      if (newToken) {
        storage.set('token', newToken);
      }
    };

    // Refresh token every 55 minutes (tokens expire in 1 hour)
    const interval = setInterval(refreshToken, 55 * 60 * 1000);

    return () => clearInterval(interval);
  }, [firebaseUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        isAuthenticated,
        login,
        loginWithGoogle,
        sendPhoneVerification,
        verifyPhone,
        registerWithEmail,
        logout,
        refreshUser,
        initRecaptcha,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
