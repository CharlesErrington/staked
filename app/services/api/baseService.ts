import { useAuthStore } from '../../store/authStore';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export class BaseService {
  protected baseUrl: string;

  constructor() {
    // This will be replaced with actual Supabase URL
    this.baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  }

  protected getAuthHeaders(): HeadersInit {
    const session = useAuthStore.getState().session;
    if (!session) {
      return {
        'Content-Type': 'application/json',
      };
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };
  }

  protected async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        return {
          error: data.message || 'An error occurred',
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: 'Failed to parse response',
        status: response.status,
      };
    }
  }

  protected async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: 'Network error',
        status: 0,
      };
    }
  }

  protected async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: 'Network error',
        status: 0,
      };
    }
  }

  protected async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: 'Network error',
        status: 0,
      };
    }
  }

  protected async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: 'Network error',
        status: 0,
      };
    }
  }
}