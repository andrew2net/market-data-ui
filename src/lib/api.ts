interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export class ApiClient {
  private baseUrl: string;
  private onUnauthorized?: () => void;

  constructor(baseUrl: string, onUnauthorized?: () => void) {
    this.baseUrl = baseUrl;
    this.onUnauthorized = onUnauthorized;
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    const { requiresAuth = true, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((fetchOptions.headers as Record<string, string>) || {}),
    };

    // Add authorization header if required
    if (requiresAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      // Handle 401 unauthorized
      if (response.status === 401) {
        localStorage.removeItem('token');
        if (this.onUnauthorized) {
          this.onUnauthorized();
        }
        return {
          status: 401,
          error: 'Unauthorized - redirecting to login',
        };
      }

      const responseData = await response.json();

      if (!response.ok) {
        return {
          status: response.status,
          error: responseData.error || `Request failed with status ${response.status}`,
        };
      }

      return {
        status: response.status,
        data: responseData,
      };
    } catch (error) {
      return {
        status: 0,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Convenience methods
  async get<T>(endpoint: string, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}
