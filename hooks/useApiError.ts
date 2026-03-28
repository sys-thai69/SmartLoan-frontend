import { useError } from '@/context/ErrorContext';
import { useCallback } from 'react';

interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
  originalError?: Error;
}

export function useApiError() {
  const { addError } = useError();

  const handleError = useCallback(
    (error: unknown, customMessage?: string) => {
      let message = customMessage || 'An unexpected error occurred';

      if (typeof error === 'object' && error !== null) {
        const errorObj = error as ErrorResponse;
        message = errorObj.message || message;

        // Log detailed error info in development
        if (process.env.NODE_ENV === 'development') {
          console.error('API Error:', {
            message: errorObj.message,
            status: errorObj.status,
            errors: errorObj.errors,
            originalError: errorObj.originalError,
          });
        }
      } else if (typeof error === 'string') {
        message = error;
      } else if (error instanceof Error) {
        message = error.message;
      }

      addError(message, 'error');
    },
    [addError]
  );

  return { handleError };
}
