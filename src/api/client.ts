/**
 * API Client
 * Base HTTP client for all API requests
 */

import { API_CONFIG } from "@/config/api.config";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = API_CONFIG.BASE_URL, timeout: number = API_CONFIG.TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    method: string = "GET",
    body?: any,
    extraHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method,
        headers: { ...this.getHeaders(), ...extraHeaders },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const text = await response.text();
      let data: ApiResponse<T>;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }
        data = {} as ApiResponse<T>;
      }

      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }

      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, "GET");
  }

  post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, "POST", body);
  }

  put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    // Send as POST with method override to prevent LiteSpeed/cPanel from stripping PUT JSON bodies
    return this.request<T>(endpoint, "POST", body, { "X-HTTP-Method-Override": "PUT" });
  }

  delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, "POST", undefined, { "X-HTTP-Method-Override": "DELETE" });
  }
}

export const apiClient = new ApiClient();
