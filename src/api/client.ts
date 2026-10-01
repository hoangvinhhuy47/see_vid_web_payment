import { ApiResponse } from '@/model/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string, headers: HeadersInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      const data = await response.json();
      return {
        success: response.ok,
        data,
        statusCode: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Network error',
        statusCode: 500,
      };
    }
  }

  async post<T>(endpoint: string, body: any, headers: HeadersInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return {
        success: response.ok,
        data,
        statusCode: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Network error',
        statusCode: 500,
      };
    }
  }
}

export const apiClient = new ApiClient();
