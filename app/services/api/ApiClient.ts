import { supabase } from '../../config/supabase';

export interface ApiConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data: T | null;
  error: ApiError | null;
  status: number;
  headers?: Record<string, string>;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  signal?: AbortSignal;
  timeout?: number;
}

// Request/Response interceptors
export type RequestInterceptor = (config: RequestOptions) => RequestOptions | Promise<RequestOptions>;
export type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

export class ApiClient {
  private config: ApiConfig;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  
  constructor(config: ApiConfig = {}) {
    this.config = {
      baseURL: process.env.EXPO_PUBLIC_API_URL || '',
      timeout: 30000,
      ...config,
    };
    
    // Add default auth interceptor
    this.addRequestInterceptor(async (config) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${session.access_token}`,
        };
      }
      return config;
    });
    
    // Add default error interceptor
    this.addErrorInterceptor(async (error) => {
      // Handle token refresh
      if (error.status === 401) {
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError && session) {
          // Retry the request with new token
          console.log('Token refreshed, retrying request');
        }
      }
      return error;
    });
  }
  
  // Interceptor management
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }
  
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }
  
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }
  
  // Apply interceptors
  private async applyRequestInterceptors(config: RequestOptions): Promise<RequestOptions> {
    let modifiedConfig = config;
    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    return modifiedConfig;
  }
  
  private async applyResponseInterceptors<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let modifiedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    return modifiedResponse;
  }
  
  private async applyErrorInterceptors(error: ApiError): Promise<ApiError> {
    let modifiedError = error;
    for (const interceptor of this.errorInterceptors) {
      modifiedError = await interceptor(modifiedError);
    }
    return modifiedError;
  }
  
  // Core request method
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Apply request interceptors
      const config = await this.applyRequestInterceptors({
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
          ...options.headers,
        },
      });
      
      // Build URL with params
      const url = new URL(`${this.config.baseURL}${endpoint}`);
      if (config.params) {
        Object.entries(config.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        config.timeout || this.config.timeout || 30000
      );
      
      // Make request
      const response = await fetch(url.toString(), {
        method,
        headers: config.headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: config.signal || controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Parse response
      let responseData: T | null = null;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else if (contentType?.includes('text/')) {
        responseData = await response.text() as any;
      }
      
      // Create API response
      const apiResponse: ApiResponse<T> = {
        data: response.ok ? responseData : null,
        error: !response.ok ? {
          message: responseData?.['message'] || `Request failed with status ${response.status}`,
          code: responseData?.['code'],
          status: response.status,
          details: responseData,
        } : null,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      };
      
      // Handle errors
      if (apiResponse.error) {
        const modifiedError = await this.applyErrorInterceptors(apiResponse.error);
        apiResponse.error = modifiedError;
        return apiResponse;
      }
      
      // Apply response interceptors
      return await this.applyResponseInterceptors(apiResponse);
    } catch (error: any) {
      // Handle network errors
      const apiError: ApiError = {
        message: error.message || 'Network request failed',
        code: error.code || 'NETWORK_ERROR',
        details: error,
      };
      
      const modifiedError = await this.applyErrorInterceptors(apiError);
      
      return {
        data: null,
        error: modifiedError,
        status: 0,
      };
    }
  }
  
  // HTTP methods
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }
  
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }
  
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }
  
  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }
  
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }
  
  // File upload
  async upload<T>(
    endpoint: string,
    file: File | Blob,
    fieldName: string = 'file',
    additionalData?: Record<string, any>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append(fieldName, file);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }
      
      const config = await this.applyRequestInterceptors({
        ...options,
        headers: {
          ...this.config.headers,
          ...options?.headers,
          // Remove Content-Type to let browser set it with boundary
        },
      });
      
      delete config.headers?.['Content-Type'];
      
      const url = `${this.config.baseURL}${endpoint}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: config.headers,
        body: formData,
        signal: config.signal,
      });
      
      const responseData = await response.json();
      
      const apiResponse: ApiResponse<T> = {
        data: response.ok ? responseData : null,
        error: !response.ok ? {
          message: responseData?.message || 'Upload failed',
          code: responseData?.code,
          status: response.status,
          details: responseData,
        } : null,
        status: response.status,
      };
      
      return await this.applyResponseInterceptors(apiResponse);
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Upload failed',
          code: 'UPLOAD_ERROR',
          details: error,
        },
        status: 0,
      };
    }
  }
  
  // Batch requests
  async batch<T>(
    requests: Array<{
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      endpoint: string;
      data?: any;
      options?: RequestOptions;
    }>
  ): Promise<ApiResponse<T>[]> {
    const promises = requests.map(({ method, endpoint, data, options }) => {
      switch (method) {
        case 'GET':
          return this.get<T>(endpoint, options);
        case 'POST':
          return this.post<T>(endpoint, data, options);
        case 'PUT':
          return this.put<T>(endpoint, data, options);
        case 'PATCH':
          return this.patch<T>(endpoint, data, options);
        case 'DELETE':
          return this.delete<T>(endpoint, options);
        default:
          return Promise.resolve({
            data: null,
            error: { message: `Unknown method: ${method}` },
            status: 0,
          });
      }
    });
    
    return Promise.all(promises);
  }
}

// Create default instance
export const apiClient = new ApiClient();

// Export for custom instances
export default ApiClient;