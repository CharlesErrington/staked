import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Create a fetch-like wrapper around axios
export const axiosFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  try {
    // Parse headers if they're in Headers format
    let headers = { ...axiosInstance.defaults.headers };
    if (options.headers) {
      if (options.headers instanceof Headers) {
        // Convert Headers object to plain object
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else {
        headers = { ...headers, ...options.headers };
      }
    }
    
    const axiosConfig: any = {
      url,
      method: options.method || 'GET',
      headers,
      data: options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined,
    };

    const response = await axiosInstance(axiosConfig);
    
    // Create a Response-like object
    const mockResponse: any = {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers as any),
      url: response.config.url || url,
      json: async () => response.data,
      text: async () => JSON.stringify(response.data),
      blob: async () => new Blob([JSON.stringify(response.data)]),
      arrayBuffer: async () => {
        const str = JSON.stringify(response.data);
        const buf = new ArrayBuffer(str.length * 2);
        const bufView = new Uint16Array(buf);
        for (let i = 0; i < str.length; i++) {
          bufView[i] = str.charCodeAt(i);
        }
        return buf;
      },
      clone: () => mockResponse,
    };
    
    return mockResponse as Response;
  } catch (error: any) {
    // If it's an axios response error, return it as a Response
    if (error.response) {
      const responseData = error.response.data || {};
      const mockResponse: any = {
        ok: false,
        status: error.response.status,
        statusText: error.response.statusText,
        headers: new Headers(error.response.headers),
        url: error.config?.url || url,
        json: async () => responseData,
        text: async () => JSON.stringify(responseData),
        blob: async () => new Blob([JSON.stringify(responseData)]),
        arrayBuffer: async () => new ArrayBuffer(0),
        clone: () => mockResponse,
      };
      return mockResponse as Response;
    }
    
    // Network error or other error
    throw error;
  }
};