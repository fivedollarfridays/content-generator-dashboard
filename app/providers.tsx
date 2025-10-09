'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, ToastProvider } from '@/app/contexts';
import { PreferencesProvider } from '@/app/context/preferences-context';
import { ErrorBoundary } from '@/app/components/ui/error-boundary';
import { ThemeProvider } from '@/app/hooks/use-theme';

/**
 * Query client instance
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Providers Component
 *
 * Wraps the application with all necessary providers:
 * - ErrorBoundary for error handling
 * - ThemeProvider for light/dark theme support
 * - QueryClientProvider for React Query
 * - ToastProvider for notifications
 * - AuthProvider for authentication
 * - PreferencesProvider for user preferences
 *
 * @param props - Component props
 * @returns Providers wrapper
 */
export const Providers: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider maxToasts={5}>
            <AuthProvider>
              <PreferencesProvider>{children}</PreferencesProvider>
            </AuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};
