'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { Eye, EyeOff, CheckCircle, Phone } from 'lucide-react';
import { z } from 'zod';
import type { ConfirmationResult } from 'firebase/auth';

// Schema for email registration
const emailRegisterSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Schema for phone registration
const phoneRegisterSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{7,14}$/, 'Please enter a valid phone number (e.g., +855123456789)'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type EmailRegisterData = z.infer<typeof emailRegisterSchema>;
type PhoneRegisterData = z.infer<typeof phoneRegisterSchema>;
type OtpData = z.infer<typeof otpSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [registerMethod] = useState<'email' | 'phone'>('email');
  const [phoneStep, setPhoneStep] = useState<'phone' | 'otp'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { registerWithEmail, loginWithGoogle, sendPhoneVerification, verifyPhone, initRecaptcha } = useAuth();
  const router = useRouter();

  // Initialize reCAPTCHA
  useEffect(() => {
    if (registerMethod === 'phone') {
      initRecaptcha('recaptcha-container');
    }
  }, [registerMethod, initRecaptcha]);

  // Email form
  const emailForm = useForm<EmailRegisterData>({
    resolver: zodResolver(emailRegisterSchema),
  });

  // Phone form
  const phoneForm = useForm<PhoneRegisterData>({
    resolver: zodResolver(phoneRegisterSchema),
  });

  // OTP form
  const otpForm = useForm<OtpData>({
    resolver: zodResolver(otpSchema),
  });

  const onEmailSubmit = async (data: EmailRegisterData) => {
    try {
      setError(null);
      setSuccess(null);
      await registerWithEmail({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setSuccess('Account created! A verification email has been sent to your email address.');
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err) {
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else {
        setError(firebaseError.message || 'Registration failed. Please try again.');
      }
    }
  };

  const onGoogleSignUp = async () => {
    try {
      setError(null);
      setIsGoogleLoading(true);
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        return;
      }
      setError(firebaseError.message || 'Google sign-up failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onPhoneSubmit = async (data: PhoneRegisterData) => {
    try {
      setError(null);
      const result = await sendPhoneVerification(data.phoneNumber);
      if (result) {
        setConfirmationResult(result);
        setPhoneStep('otp');
      }
    } catch (err) {
      const firebaseError = err as { code?: string; message?: string };
      setError(firebaseError.message || 'Failed to send verification code');
    }
  };

  const onOtpSubmit = async (data: OtpData) => {
    if (!confirmationResult) {
      setError('Session expired. Please try again.');
      setPhoneStep('phone');
      return;
    }

    try {
      setError(null);
      await verifyPhone(confirmationResult, data.otp);
      router.push('/dashboard');
    } catch (err) {
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === 'auth/invalid-verification-code') {
        setError('Invalid verification code');
      } else {
        setError(firebaseError.message || 'Verification failed. Please try again.');
      }
    }
  };

  const benefits = [
    'Track informal loans with friends & family',
    'Auto-debit from Wing wallet',
    'AI-powered loan assistance',
    'Build your trust score',
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-white">
      {/* Left side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 p-12 flex-col justify-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-white mb-6">
            Start Managing Your Loans Today
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            Join SmartLoan and never have another loan dispute with friends or
            family again.
          </p>
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-3 text-white">
                <CheckCircle className="w-5 h-5 text-blue-200" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="font-bold text-3xl text-gray-900">SmartLoan</span>
            </Link>
            <p className="text-gray-600 mt-2">Create your free account</p>
          </div>

          <Card>
            <CardContent className="p-6">
              {/* Registration Method Tabs - Hidden: Phone OTP coming soon */}
              {/* TODO: Uncomment Phone tabs when OTP is ready */}
              {/*
              <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <button type="button" onClick={() => setRegisterMethod('email')} className="...">
                  <Mail className="w-4 h-4" /> Email
                </button>
                <button type="button" onClick={() => setRegisterMethod('phone')} className="...">
                  <Phone className="w-4 h-4" /> Phone
                </button>
              </div>
              */}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm mb-4">
                  {success}
                </div>
              )}

              {/* Email Registration Form */}
              {registerMethod === 'email' && (
                <>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                    <Input
                      label="Full Name"
                      placeholder="Enter your full name"
                      error={emailForm.formState.errors.name?.message}
                      {...emailForm.register('name')}
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="you@example.com"
                      error={emailForm.formState.errors.email?.message}
                      {...emailForm.register('email')}
                    />

                    <div className="relative">
                      <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        error={emailForm.formState.errors.password?.message}
                        {...emailForm.register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <Input
                      label="Confirm Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      error={emailForm.formState.errors.confirmPassword?.message}
                      {...emailForm.register('confirmPassword')}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      isLoading={emailForm.formState.isSubmitting}
                    >
                      Create Account
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  {/* Google Sign Up */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={onGoogleSignUp}
                    isLoading={isGoogleLoading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </>
              )}

              {/* Phone Registration Form - DISABLED: Paused for now */}
              {false && registerMethod === 'phone' && (
                <>
                  {phoneStep === 'phone' && (
                    <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                      <div className="text-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                          <Phone className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-600">
                          Enter your phone number to create an account
                        </p>
                      </div>

                      <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="+855 12 345 6789"
                        error={phoneForm.formState.errors.phoneNumber?.message}
                        {...phoneForm.register('phoneNumber')}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        isLoading={phoneForm.formState.isSubmitting}
                      >
                        Send Verification Code
                      </Button>
                    </form>
                  )}

                  {phoneStep === 'otp' && (
                    <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Enter Verification Code</h3>
                        <p className="text-sm text-gray-600">
                          We sent a 6-digit code to your phone
                        </p>
                      </div>

                      <Input
                        label="Verification Code"
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        error={otpForm.formState.errors.otp?.message}
                        {...otpForm.register('otp')}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        isLoading={otpForm.formState.isSubmitting}
                      >
                        Verify & Create Account
                      </Button>

                      <button
                        type="button"
                        onClick={() => {
                          setPhoneStep('phone');
                          setError(null);
                        }}
                        className="w-full text-sm text-gray-500 hover:text-gray-700"
                      >
                        Use a different phone number
                      </button>
                    </form>
                  )}

                  {/* reCAPTCHA container */}
                  <div id="recaptcha-container" />
                </>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-gray-500 mt-8">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
