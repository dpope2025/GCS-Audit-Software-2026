import { useState } from 'react';

// This function recursively finds keys known to hold large base64 data
// and nullifies their values to prevent localStorage from filling up.
// This is a "lossy" approach, as the file data will not persist across page reloads.
// The in-memory React state will remain intact for the current session.
const stripLargeDataForStorage = (obj: any): any => {
    if (!obj) return obj;

    // Use JSON stringify/parse for a deep copy that's safe for localStorage-bound data.
    // It handles the data structures in this app correctly (e.g., dates are already strings).
    const clonedObj = JSON.parse(JSON.stringify(obj));

    const recurse = (current: any) => {
        if (!current || typeof current !== 'object') {
            return;
        }

        if (Array.isArray(current)) {
            current.forEach(recurse);
            return;
        }

        Object.keys(current).forEach(key => {
            const value = current[key];
            
            // Heuristics to identify keys that store large base64 data strings.
            const isLargeDataKey = key.includes('dataUrl') || key === 'signature' || key === 'photo' || key === 'clientLogo' || key.includes('Report');
            
            if (isLargeDataKey && typeof value === 'string' && value.startsWith('data:')) {
                // By setting this to null, we keep the property but discard the heavy data.
                // The UI will know a file was there but won't be able to display it after a reload.
                current[key] = null;
            } else if (value && typeof value === 'object') {
                recurse(value);
            }
        });
    };

    recurse(clonedObj);
    return clonedObj;
};

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      // Data loaded from localStorage will not have the large data fields.
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      // If parsing fails, it's safer to start fresh with the initial value.
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Keep the full data (with file contents) in the React state for the current session.
      setStoredValue(valueToStore);
      
      if (typeof window !== "undefined") {
        // Create a version of the state with large data stripped out before saving to localStorage.
        const storableValue = stripLargeDataForStorage(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(storableValue));
      }
    } catch (error) {
       if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          console.error(`localStorage quota exceeded for key: “${key}”. Even after stripping large data, the state is too big. The user needs to clear storage.`);
          alert("Error: Your browser's local storage is full.\nThe application can no longer save your changes. To fix this, please clear the site data for this application in your browser settings and then refresh the page. Note that this will reset all progress.");
       } else {
         console.error(`Error setting localStorage key “${key}”:`, error);
       }
    }
  };
  return [storedValue, setValue];
}

export default useLocalStorage;
