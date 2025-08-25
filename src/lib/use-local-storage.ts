import {
  useState,
  useEffect,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from 'react';

/**
 * Options for useLocalStorage hook
 */
interface UseLocalStorageOptions<T> {
  /** Custom serializer function */
  serializer?: {
    read: (value: string) => T;
    write: (value: T) => string;
  };
  /** Enable/disable automatic syncing between tabs */
  syncData?: boolean;
  /** Function to call when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * Default JSON serializer
 */
const defaultSerializer = {
  read: <T>(value: string): T => {
    try {
      return JSON.parse(value);
    } catch {
      return value as T;
    }
  },
  write: <T>(value: T): string => JSON.stringify(value),
};

/**
 * Custom hook for managing localStorage with TypeScript support
 *
 * @param key - The localStorage key
 * @param initialValue - The initial value or a function that returns the initial value
 * @param options - Configuration options
 * @returns [value, setValue, removeValue] tuple
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseLocalStorageOptions<T> = {}
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const {
    serializer = defaultSerializer,
    syncData = true,
    onError = (error) => console.error('localStorage error:', error),
  } = options;

  // Get initial value from localStorage or use provided initial value
  const readValue = useCallback((): T => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);

      if (item === null) {
        return typeof initialValue === 'function'
          ? (initialValue as () => T)()
          : initialValue;
      }

      return serializer.read(item);
    } catch (error) {
      onError(error as Error);
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }
  }, [key, initialValue, serializer, onError]);

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Function to write value to localStorage
  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.warn('localStorage is not available in this environment');
        return;
      }

      try {
        // Allow value to be a function so we have the same API as useState
        const newValue = value instanceof Function ? value(storedValue) : value;

        // Save to localStorage
        window.localStorage.setItem(key, serializer.write(newValue));

        // Save state
        setStoredValue(newValue);

        // Dispatch storage event to sync between tabs
        if (syncData) {
          window.dispatchEvent(
            new StorageEvent('storage', {
              key,
              newValue: serializer.write(newValue),
            })
          );
        }
      } catch (error) {
        onError(error as Error);
      }
    },
    [key, storedValue, serializer, syncData, onError]
  );

  // Function to remove value from localStorage
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      console.warn('localStorage is not available in this environment');
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(
        typeof initialValue === 'function'
          ? (initialValue as () => T)()
          : initialValue
      );

      // Dispatch storage event to sync between tabs
      if (syncData) {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: null,
          })
        );
      }
    } catch (error) {
      onError(error as Error);
    }
  }, [key, initialValue, syncData, onError]);

  // Listen for changes in localStorage (from other tabs)
  useEffect(() => {
    if (!syncData || typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key || e.storageArea !== window.localStorage) return;

      try {
        if (e.newValue === null) {
          setStoredValue(
            typeof initialValue === 'function'
              ? (initialValue as () => T)()
              : initialValue
          );
        } else {
          setStoredValue(serializer.read(e.newValue));
        }
      } catch (error) {
        onError(error as Error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, serializer, syncData, onError]);

  return [storedValue, setValue, removeValue];
}
