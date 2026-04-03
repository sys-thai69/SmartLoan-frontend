'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { Eye, EyeOff, CheckCircle, Sparkles, Mail, ArrowRight } from 'lucide-react';
import { z } from 'zod';
import axios from 'axios';

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

const otpSchema = z.object({
  code: z.string().min(6, 'Code must be 6 digits').max(6, 'Code must be 6 digits'),
});

type EmailRegisterData = z.infer<typeof emailRegisterSchema>;
type OTPData = z.infer<typeof otpSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingName, setPendingName] = useState('');
  const [pendingPassword, setPendingPassword] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const { registerWithEmail } = useAuth();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  const emailForm = useForm<EmailRegisterData>({
    resolver: zodResolver(emailRegisterSchema),
  });

  const otpForm = useForm<OTPData>({
    resolver: zodResolver(otpSchema),
  });

  // Step 1: Request OTP
  const onSendOTP = async (data: EmailRegisterData) => {
    try {
      setError(null);
      setPendingEmail(data.email);
      setPendingName(data.name);
      setPendingPassword(data.password);

      await axios.post(`${API_URL}/auth/send-otp?email=${data.email}`);
      setStep('otp');
      setSuccess('✓ Verification code sent to your email!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to send OTP. Please try again.');
    }
  };

  // Step 2: Verify OTP
  const onVerifyOTP = async (data: OTPData) => {
    try {
      setError(null);
      await axios.post(`${API_URL}/auth/verify-otp`, {
        email: pendingEmail,
        code: data.code,
      });
      setIsVerified(true);
      setSuccess('✓ Email verified successfully!');
      setTimeout(() => setStep('password'), 1000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Invalid or expired code. Please try again.');
    }
  };

  // Step 3: Register account
  const onRegister = async () => {
    try {
      setError(null);
      await registerWithEmail({
        name: pendingName,
        email: pendingEmail,
        password: pendingPassword,
      });
      setSuccess('✓ Account created successfully! Redirecting...');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Registration failed. Please try again.');
    }
  };

  const benefits = [
    'Track informal loans with friends & family',
    'Automatic payment collection',
    'AI-powered loan assistance',
    'Build your trust score',
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-white/5 rounded-full blur-2xl" />

        <div className="max-w-md relative animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm text-indigo-100 mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Peer-to-Peer Lending
          </div>
          <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">
            Start Managing Your Loans Today
          </h1>
          <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
            Join SmartLoan and never have another loan dispute with friends or family again.
          </p>
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-indigo-200" />
                </div>
                <span className="text-indigo-50">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 mesh-bg">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5 justify-center">
              <Image
                src="/smartloan-logo.png"
                alt="SmartLoan"
                width={269}
                height={245}
                className="h-10 w-auto rounded-xl"
              />
              <span className="font-bold text-3xl text-slate-900">SmartLoan</span>
            </Link>
            <p className="text-slate-500 mt-3 text-lg">
              {step === 'email' ? 'Create your free account' : step === 'otp' ? 'Verify your email' : 'Set your password'}
            </p>
          </div>

          <Card className="shadow-xl shadow-slate-200/50">
            <CardContent className="p-8">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm mb-6 animate-fade-in">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm mb-6 animate-fade-in">
                  {success}
                </div>
              )}

              {step === 'email' && (
                <>
                  <form onSubmit={emailForm.handleSubmit(onSendOTP)} className="space-y-5">
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
                        className="absolute right-3.5 top-9 text-slate-400 hover:text-slate-600"
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
                      size="lg"
                      isLoading={emailForm.formState.isSubmitting}
                    >
                      Send Verification Code
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>

                  <div className="mt-7 text-center">
                    <p className="text-sm text-slate-500">
                      Already have an account?{' '}
                      <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </>
              )}

              {step === 'otp' && (
                <>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                      <Mail className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="text-slate-600 text-sm mb-4">
                      We sent a 6-digit code to<br />
                      <span className="font-semibold">{pendingEmail}</span>
                    </p>
                  </div>

                  <form onSubmit={otpForm.handleSubmit(onVerifyOTP)} className="space-y-5">
                    <Input
                      label="Verification Code"
                      placeholder="000000"
                      maxLength={6}
                      inputMode="numeric"
                      error={otpForm.formState.errors.code?.message}
                      {...otpForm.register('code')}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      isLoading={otpForm.formState.isSubmitting}
                    >
                      Verify Code
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setError(null);
                        setSuccess(null);
                        otpForm.reset();
                      }}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      ← Change email
                    </button>
                  </div>

                  <p className="mt-4 text-xs text-slate-500 text-center">
                    Didn&apos;t receive code? Check spam or request a new one.
                  </p>
                </>
              )}

              {step === 'password' && (
                <>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <p className="text-slate-600 text-sm">
                      Email verified! Ready to create your account?
                    </p>
                  </div>

                  <Button
                    onClick={onRegister}
                    className="w-full"
                    size="lg"
                  >
                    Create Account
                  </Button>

                  <p className="mt-4 text-xs text-slate-500 text-center">
                    Email: {pendingEmail}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-xs text-slate-400 mt-8">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
