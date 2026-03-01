/**
 * Auth API Service
 * Handles all authentication-related API calls
 */

import { apiClient, ApiResponse } from "./client";
import { API_ENDPOINTS } from "@/config/api.config";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  role: "admin" | "seller" | "viewer";
  permissions?: string[];
  assigned_shops?: any[];
}

export interface LoginResponseData {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponseData>> => {
    const response = await apiClient.post<LoginResponseData>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    );

    // Normalize response shapes:
    // - Our ApiClient expects { success, data?: T, message }
    // - Laravel backend returns { success, message, token, user } at top-level
    let normalizedData: LoginResponseData | undefined = response.data as any;

    if (!normalizedData && (response as any).token) {
      // construct LoginResponseData from top-level fields
      const r = response as any;
      normalizedData = {
        success: r.success ?? true,
        message: r.message ?? "",
        token: r.token,
        user: r.user,
      } as LoginResponseData;
    }

    return {
      success: response.success ?? !!normalizedData,
      data: normalizedData,
      message: response.message ?? (normalizedData?.message ?? ""),
    };
  },

  register: (data: RegisterRequest) =>
    apiClient.post<LoginResponseData>(API_ENDPOINTS.AUTH.REGISTER, data),

  logout: () =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {}),

  getProfile: () =>
    apiClient.get(API_ENDPOINTS.AUTH.PROFILE),

  updateProfile: (data: any) =>
    apiClient.put(API_ENDPOINTS.AUTH.PROFILE, data),
};
