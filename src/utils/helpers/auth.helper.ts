/**
 * Authentication Helpers
 * Helper functions for authentication operations
 */

import { STORAGE_KEYS } from "@/config/app.config";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "seller" | "viewer";
  permissions: string[];
  assigned_shops: number[];
}

export const authHelper = {
  // Token management
  setToken: (token: string) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  clearToken: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  // User management
  setUser: (user: StoredUser) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getUser: (): StoredUser | null => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  clearUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Session management
  clearSession: () => {
    authHelper.clearToken();
    authHelper.clearUser();
  },

  isAuthenticated: () => {
    return !!authHelper.getToken();
  },
};
