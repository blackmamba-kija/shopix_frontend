/**
 * Storage Helpers
 * Helper functions for localStorage operations
 */

export const storageHelper = {
  set: (key: string, value: any) => {
    try {
      const serialized = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error setting storage key ${key}:`, error);
    }
  },

  get: (key: string) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return localStorage.getItem(key);
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing storage key ${key}:`, error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },
};
