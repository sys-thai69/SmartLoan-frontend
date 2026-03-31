'use client';

import React, { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { useAuth } from '@/context/AuthContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);

    // You can also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorBoundaryContent fallback={this.props.fallback} resetError={this.resetError} error={this.state.error} />;
    }

    return this.props.children;
  }
}

function ErrorBoundaryContent({ fallback, resetError, error }: { fallback?: ReactNode; resetError: () => void; error: Error | null }) {
  const { isAuthenticated } = useAuth();
  const homeUrl = isAuthenticated ? '/dashboard' : '/';

  return (
    fallback || (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-red-200">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-center text-gray-600 mb-4">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && error && (
              <div className="mb-4 p-3 bg-gray-100 rounded border border-gray-300">
                <p className="text-xs font-mono text-gray-700 break-words">
                  {error.message}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                onClick={resetError}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = homeUrl)}
                variant="outline"
                className="flex-1"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
