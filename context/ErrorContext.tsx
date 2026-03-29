'use client';

import React, { createContext, useContext, useCallback, useState } from 'react';

export interface ErrorAlert {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  duration?: number;
}

interface ErrorContextType {
  errors: ErrorAlert[];
  addError: (message: string, type?: ErrorAlert['type'], duration?: number) => string;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [errors, setErrors] = useState<ErrorAlert[]>([]);

  const removeError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((err) => err.id !== id));
  }, []);

  const addError = useCallback(
    (message: string, type: ErrorAlert['type'] = 'error', duration = 5000) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newError: ErrorAlert = { id, message, type, duration };

      setErrors((prev) => [...prev, newError]);

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => removeError(id), duration);
      }

      return id;
    },
    [removeError]
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <ErrorContext.Provider value={{ errors, addError, removeError, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
}
