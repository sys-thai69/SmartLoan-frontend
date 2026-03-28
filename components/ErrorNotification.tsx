'use client';

import React from 'react';
import { useError } from '@/context/ErrorContext';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export function ErrorNotification() {
  const { errors, removeError } = useError();

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getIconStyles = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-red-400';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
      {errors.map((error) => (
        <div
          key={error.id}
          className={`flex items-start gap-3 p-4 border rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${getStyles(error.type)}`}
          role="alert"
        >
          <div className={`flex-shrink-0 ${getIconStyles(error.type)}`}>
            {getIcon(error.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{error.message}</p>
          </div>
          <button
            onClick={() => removeError(error.id)}
            className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
            aria-label="Close notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
