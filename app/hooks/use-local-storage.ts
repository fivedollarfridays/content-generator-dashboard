'use client';

import {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from 'react';

/**
 * Options for useLocalStorage hook
 */
export interface UseLocalStorageOptions<T> {
  /**
   * Custom serializer function
   * @default JSON.stringify
   */
  serializer?: (value: T) => string;

  /**
   * Custom deserializer function
   * @default JSON.parse
   */
  deserializer?: (value: string) => T;

  /**
   * Whether to sync state across browser tabs/windows
   * @default true
   */
  syncData?: boolean;

  /**
   * Error handler for storage operations
   */
  onError?: (error: Error) => void;
}

/**
 * Type-safe localStorage hook with SSR support
 *
 * Provides a useState-like interface for persisting data to localStorage
 * with automatic serialization, deserialization, and cross-tab synchronization.
 *
 * @param key - localStorage key to use
 * @param initialValue - Initial value if key doesn't exist
 * @param options - Configuration options
 * @returns Tuple of [value, setValue, removeValue]
 *
 * @example
 * ```tsx
 * // Basic usage
 * const [name, setName] = useLocalStorage('user-name', 'Anonymous');
 *
 * // With custom serialization
 * const [settings, setSettings] = useLocalStorage(
 *   'app-settings',
 *   { theme: 'light', fontSize: 14 },
 *   {
 *     serializer: (value) => btoa(JSON.stringify(value)),
 *     deserializer: (value) => JSON.parse(atob(value)),
 *   }
 * );
 *
 * // Update value
 * setName('John Doe');
 *
 * // Remove value
 * const [token, setToken, removeToken] = useLocalStorage('auth-token', null);
 * removeToken();
 * ```
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, Dispatch<SetStateAction<T>>, () => void] => {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    syncData = true,
    onError,
  } = options;

  /**
   * Get value from localStorage
   */
  const readValue = useCallback((): T => {
    // Return initial value during SSR
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      return initialValue;
    }
  }, [key, initialValue, deserializer, onError]);

  /**
   * State to store the value
   */
  const [storedValue, setStoredValue] = useState<T>(readValue);

  /**
   * Set value in localStorage and state
   */
  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value: SetStateAction<T>): void => {
      // Return early during SSR
      if (typeof window === 'undefined') {
        return;
      }

      try {
        // Allow value to be a function (like useState)
        const newValue = value instanceof Function ? value(storedValue) : value;

        // Save to localStorage
        window.localStorage.setItem(key, serializer(newValue));

        // Update state
        setStoredValue(newValue);

        // Dispatch storage event for cross-tab sync
        if (syncData) {
          window.dispatchEvent(
            new StorageEvent('storage', {
              key,
              newValue: serializer(newValue),
            })
          );
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
      }
    },
    [key, storedValue, serializer, syncData, onError]
  );

  /**
   * Remove value from localStorage
   */
  const removeValue = useCallback((): void => {
    // Return early during SSR
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);

      // Dispatch storage event for cross-tab sync
      if (syncData) {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: null,
          })
        );
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
    }
  }, [key, initialValue, syncData, onError]);

  /**
   * Sync state with localStorage when key changes
   */
  useEffect(() => {
    // Update state if key changes
    const newValue = readValue();
    // Only update if value actually changed to prevent infinite loops
    if (JSON.stringify(newValue) !== JSON.stringify(storedValue)) {
      setStoredValue(newValue);
    }
  }, [key]); // Only depend on key, not readValue

  /**
   * Listen for storage events (cross-tab synchronization)
   */
  useEffect(() => {
    if (!syncData) {
      return;
    }

    const handleStorageChange = (e: StorageEvent): void => {
      if (e.key !== key) {
        return;
      }

      try {
        if (e.newValue === null) {
          setStoredValue(initialValue);
        } else {
          setStoredValue(deserializer(e.newValue));
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return (): void => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue, deserializer, syncData, onError]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook for storing and retrieving boolean values
 *
 * @param key - localStorage key
 * @param initialValue - Initial boolean value
 * @returns Tuple of [value, setValue, removeValue]
 *
 * @example
 * ```tsx
 * const [isDarkMode, setIsDarkMode] = useLocalStorageBoolean('dark-mode', false);
 *
 * // Toggle dark mode
 * setIsDarkMode(!isDarkMode);
 * ```
 */
export const useLocalStorageBoolean = (
  key: string,
  initialValue: boolean
): [boolean, Dispatch<SetStateAction<boolean>>, () => void] => {
  return useLocalStorage<boolean>(key, initialValue);
};

/**
 * Hook for storing and retrieving number values
 *
 * @param key - localStorage key
 * @param initialValue - Initial number value
 * @returns Tuple of [value, setValue, removeValue]
 *
 * @example
 * ```tsx
 * const [fontSize, setFontSize] = useLocalStorageNumber('font-size', 14);
 *
 * // Increase font size
 * setFontSize(fontSize + 2);
 * ```
 */
export const useLocalStorageNumber = (
  key: string,
  initialValue: number
): [number, Dispatch<SetStateAction<number>>, () => void] => {
  return useLocalStorage<number>(key, initialValue);
};

/**
 * Hook for storing and retrieving string values
 *
 * @param key - localStorage key
 * @param initialValue - Initial string value
 * @returns Tuple of [value, setValue, removeValue]
 *
 * @example
 * ```tsx
 * const [username, setUsername] = useLocalStorageString('username', '');
 *
 * // Update username
 * setUsername('john_doe');
 * ```
 */
export const useLocalStorageString = (
  key: string,
  initialValue: string
): [string, Dispatch<SetStateAction<string>>, () => void] => {
  return useLocalStorage<string>(key, initialValue);
};

/**
 * Hook for storing and retrieving array values
 *
 * @param key - localStorage key
 * @param initialValue - Initial array value
 * @returns Tuple of [value, setValue, removeValue]
 *
 * @example
 * ```tsx
 * const [recentSearches, setRecentSearches] = useLocalStorageArray<string>(
 *   'recent-searches',
 *   []
 * );
 *
 * // Add search
 * setRecentSearches([...recentSearches, 'new search']);
 * ```
 */
export const useLocalStorageArray = <T>(
  key: string,
  initialValue: T[]
): [T[], Dispatch<SetStateAction<T[]>>, () => void] => {
  return useLocalStorage<T[]>(key, initialValue);
};

/**
 * Hook for storing and retrieving object values
 *
 * @param key - localStorage key
 * @param initialValue - Initial object value
 * @returns Tuple of [value, setValue, removeValue]
 *
 * @example
 * ```tsx
 * interface UserPreferences {
 *   theme: 'light' | 'dark';
 *   notifications: boolean;
 *   language: string;
 * }
 *
 * const [preferences, setPreferences] = useLocalStorageObject<UserPreferences>(
 *   'user-preferences',
 *   { theme: 'light', notifications: true, language: 'en' }
 * );
 *
 * // Update preferences
 * setPreferences({ ...preferences, theme: 'dark' });
 * ```
 */
export const useLocalStorageObject = <T extends object>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, () => void] => {
  return useLocalStorage<T>(key, initialValue);
};
