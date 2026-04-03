'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Shield, ShieldCheck, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';

export default function BootstrapAdminPage() {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'conflict' | 'error'>(
    'idle'
  );
  const [message, setMessage] = useState('');
  const [secretKey, setSecretKey] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleBootstrap = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!secretKey.trim()) {
      setMessage('Please enter the bootstrap secret key.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const res = await adminApi.bootstrap(secretKey.trim());
      await refreshUser();
      setMessage(res.message);
      setStatus('success');
    } catch (err: unknown) {
      // The global axios interceptor in client.ts reshapes errors to { message, status, ... }
      // so we read err.status directly, NOT err.response.status
      const error = err as { status?: number; message?: string };
      if (error?.status === 409) {
        setMessage(error.message ?? 'Admin already exists.');
        setStatus('conflict');
      } else if (error?.status === 403) {
        setMessage(error.message ?? 'Invalid bootstrap key.');
        setStatus('error');
      } else {
        setMessage(error?.message || 'Something went wrong. Are you logged in?');
        setStatus('error');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 mesh-bg">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="glass-strong rounded-2xl p-8 shadow-xl border border-slate-200/60 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Admin Bootstrap</h1>
            <p className="text-sm text-slate-500">
              This page makes <strong>you</strong> the first platform admin.
              It works <em>only once</em> — once an admin exists, this is permanently disabled.
            </p>
          </div>

          {/* Security notice */}
          <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              You must be <strong>logged in</strong> and know the <strong>bootstrap secret key</strong> to claim admin rights.
              The key is configured in the server&apos;s <code className="font-mono bg-amber-100 px-1 rounded">ADMIN_BOOTSTRAP_KEY</code> environment variable.
            </p>
          </div>

          {/* Secret Key Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bootstrap Secret Key</label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter the admin bootstrap key..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              disabled={status === 'success' || status === 'conflict'}
            />
          </div>

          {/* Status: success */}
          {status === 'success' && (
            <div className="flex gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
              <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-green-800">{message}</p>
                <p className="text-xs text-green-600">
                  You can now access the Admin Panel from the navigation bar.
                </p>
              </div>
            </div>
          )}

          {/* Status: conflict */}
          {status === 'conflict' && (
            <div className="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <Shield className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">{message}</p>
            </div>
          )}

          {/* Status: error */}
          {status === 'error' && (
            <div className="flex gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{message}</p>
            </div>
          )}

          {/* Logged-in user info */}
          {user && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-slate-800">{user.name}</p>
                <p className="text-slate-500 text-xs">{user.email}</p>
              </div>
              <span className="ml-auto text-xs font-medium px-2 py-1 rounded-full bg-white border border-indigo-200 text-indigo-600">
                {user.role}
              </span>
            </div>
          )}

          {/* CTA */}
          {status === 'success' ? (
            <button
              onClick={() => router.push('/admin')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 shadow"
            >
              Go to Admin Panel
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="bootstrap-admin-btn"
              onClick={handleBootstrap}
              disabled={status === 'loading' || status === 'conflict' || !isAuthenticated}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Claiming admin…
                </>
              ) : status === 'conflict' ? (
                <>
                  <Shield className="w-4 h-4" />
                  Admin already set
                </>
              ) : !isAuthenticated ? (
                <>
                  <Shield className="w-4 h-4" />
                  Log in first
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Make me Admin
                </>
              )}
            </button>
          )}

          {!isAuthenticated && (
            <p className="text-center text-xs text-slate-400">
              <button
                onClick={() => router.push('/login')}
                className="text-indigo-600 hover:underline font-medium"
              >
                Log in
              </button>{' '}
              to claim the admin role.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
