/**
 * Application Configuration
 * Global app settings and constants
 */

export const APP_CONFIG = {
  APP_NAME: "YUSCO",
  VERSION: "1.0.0",
  ENVIRONMENT: import.meta.env.MODE,
  DEBUG: import.meta.env.DEV,
} as const;

export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  PREFERENCES: "preferences",
} as const;

export const ROUTER_FUTURE_FLAGS = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;
