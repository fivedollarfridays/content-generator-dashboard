'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useLocalStorage } from '@/app/hooks';
import { ContentGeneratorAPI } from '@/lib/api/api-client';

/**
 * Authentication state interface
 */
export interface AuthState {
  /**
   * Whether the user is authenticated (has valid API key)
   */
  isAuthenticated: boolean;

  /**
   * Current API key (null if not authenticated)
   */
  apiKey: string | null;

  /**
   * API client instance configured with current API key
   */
  apiClient: ContentGeneratorAPI;

  /**
   * Whether authentication is being validated
   */
  isLoading: boolean;

  /**
   * Authentication error message if validation failed
   */
  error: string | null;
}

/**
 * Authentication context actions
 */
export interface AuthActions {
  /**
   * Set and validate a new API key
   * @param key - API key to set
   */
  setApiKey: (key: string) => Promise<void>;

  /**
   * Clear API key and log out
   */
  clearApiKey: () => void;

  /**
   * Validate current API key
   */
  validateApiKey: () => Promise<boolean>;
}

/**
 * Combined authentication context value
 */
export type AuthContextValue = AuthState & AuthActions;

/**
 * Authentication context
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Authentication provider props
 */
export interface AuthProviderProps {
  /**
   * Child components
   */
  children: React.ReactNode;

  /**
   * Base API URL
   * @default process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
   */
  apiUrl?: string;
}

/**
 * Authentication Provider Component
 *
 * Provides authentication state and methods to the application.
 * Manages API key storage, validation, and API client configuration.
 *
 * @param props - Provider props
 * @returns Provider component
 *
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
}) => {
  const [storedApiKey, setStoredApiKey, removeStoredApiKey] = useLocalStorage<
    string | null
  >('api_key', null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiClient, setApiClient] = useState<ContentGeneratorAPI>(
    () => new ContentGeneratorAPI(apiUrl, storedApiKey || undefined)
  );

  /**
   * Validate API key by making a health check request
   */
  const validateApiKey = useCallback(async (): Promise<boolean> => {
    if (!storedApiKey) {
      setIsAuthenticated(false);
      setError(null);
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = new ContentGeneratorAPI(apiUrl, storedApiKey);
      const response = await client.healthCheck();

      if (response.success) {
        setIsAuthenticated(true);
        setApiClient(client);
        setError(null);
        return true;
      } else {
        setIsAuthenticated(false);
        setError(response.error?.message || 'API key validation failed');
        return false;
      }
    } catch (err) {
      setIsAuthenticated(false);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [storedApiKey, apiUrl]);

  /**
   * Set and validate a new API key
   */
  const setApiKey = useCallback(
    async (key: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const client = new ContentGeneratorAPI(apiUrl, key);
        const response = await client.healthCheck();

        if (response.success) {
          setStoredApiKey(key);
          setApiClient(client);
          setIsAuthenticated(true);
          setError(null);
        } else {
          setError(response.error?.message || 'Invalid API key');
          throw new Error(response.error?.message || 'Invalid API key');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to validate API key';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, setStoredApiKey]
  );

  /**
   * Clear API key and log out
   */
  const clearApiKey = useCallback((): void => {
    removeStoredApiKey();
    setIsAuthenticated(false);
    setApiClient(new ContentGeneratorAPI(apiUrl));
    setError(null);
  }, [apiUrl, removeStoredApiKey]);

  /**
   * Validate stored API key on mount
   */
  useEffect(() => {
    validateApiKey();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value: AuthContextValue = {
    isAuthenticated,
    apiKey: storedApiKey,
    apiClient,
    isLoading,
    error,
    setApiKey,
    clearApiKey,
    validateApiKey,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use authentication context
 *
 * @returns Authentication context value
 * @throws Error if used outside AuthProvider
 *
 * @example
 * ```tsx
 * const { isAuthenticated, apiKey, setApiKey, clearApiKey } = useAuth();
 *
 * if (isAuthenticated) {
 *   console.log('User authenticated with key:', apiKey);
 * }
 * ```
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * HOC to require authentication for a component
 *
 * @param Component - Component to wrap
 * @returns Wrapped component that requires authentication
 *
 * @example
 * ```tsx
 * const ProtectedPage = withAuth(() => {
 *   return <div>Protected Content</div>;
 * });
 * ```
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = props => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Authenticating...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-4">
              Please configure your API key in the settings page to access this
              content.
            </p>
            <a
              href="/settings"
              className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Settings
            </a>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
};
