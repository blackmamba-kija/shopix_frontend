/**
 * API Configuration
 * Centralized configuration for all API endpoints and settings
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/profile",
    REFRESH: "/auth/refresh",
  },

  // Users
  USERS: {
    LIST: "/users",
    GET: (id: string) => `/users/${id}`,
    CREATE: "/users",
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },

  // Shops
  SHOPS: {
    LIST: "/shops",
    GET: (id: string) => `/shops/${id}`,
    CREATE: "/shops",
    UPDATE: (id: string) => `/shops/${id}`,
    DELETE: (id: string) => `/shops/${id}`,
  },

  // Products
  PRODUCTS: {
    LIST: "/products",
    GET: (id: string) => `/products/${id}`,
    CREATE: "/products",
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
  },

  // Sales
  SALES: {
    LIST: "/sales",
    GET: (id: string) => `/sales/${id}`,
    CREATE: "/sales",
    UPDATE: (id: string) => `/sales/${id}`,
    DELETE: (id: string) => `/sales/${id}`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: "/notifications",
    GET: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    DELETE: (id: string) => `/notifications/${id}`,
  },
} as const;
