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
import { authApi } from '@/lib/api';
import { storage } from '@/lib/utils';

interface RegisterWithEmailData {
  name: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  registerWithEmail: (data: RegisterWithEmailData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  // Placeholder stubs for Google & Phone (not implemented yet)
  loginWithGoogle: () => Promise<void>;
  sendPhoneVerification: () => Promise<null>;
  verifyPhone: () => Promise<void>;
  initRecaptcha: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = storage.get<string>('token', '');
        if (storedToken) {
          // Token exists, fetch user profile
          const userProfile = await authApi.me();
          setUser(userProfile);
          storage.set('user', userProfile);
        }
      } catch {
        // Token invalid or expired, clear storage
        storage.remove('token');
        storage.remove('user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Email/Password Login
  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    storage.set('token', response.token);
    setUser(response.user);
    storage.set('user', response.user);
  }, []);

  // Email/Password Registration
  const registerWithEmail = useCallback(async (data: RegisterWithEmailData) => {
    const response = await authApi.register({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    storage.set('token', response.token);
    setUser(response.user);
    storage.set('user', response.user);
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await authApi.logout();
    storage.remove('token');
    storage.remove('user');
    setUser(null);
    router.push('/login');
  }, [router]);

  // Refresh user data from backend
  const refreshUser = useCallback(async () => {
    try {
      const userProfile = await authApi.me();
      setUser(userProfile);
      storage.set('user', userProfile);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  // TODO: Implement these when ready to re-enable OTP
  const loginWithGoogle = useCallback(async () => {
    throw new Error('Google sign-in not yet implemented');
  }, []);

  const sendPhoneVerification = useCallback(async () => {
    throw new Error('Phone verification not yet implemented');
  }, []);

  const verifyPhone = useCallback(async () => {
    throw new Error('Phone verification not yet implemented');
  }, []);

  const initRecaptcha = useCallback(() => {
    // No-op for now
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        registerWithEmail,
        logout,
        refreshUser,
        loginWithGoogle,
        sendPhoneVerification,
        verifyPhone,
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
