'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { registerSchema, type RegisterFormData } from '@/lib/validations';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      router.push('/dashboard');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Registration failed. Please try again.'
      );
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
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <span className="font-bold text-3xl text-gray-900">SmartLoan</span>
            </Link>
            <p className="text-gray-600 mt-2">Create your free account</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  error={errors.name?.message}
                  {...register('name')}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <Input
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  Create Account
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-gray-500 mt-8">
            By creating an account, you agree to our Terms of Service and Privacy
            Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
