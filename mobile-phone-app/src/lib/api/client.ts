// API client configuration and base functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  sqlQuery?: string;
  executionTime?: number;
  error?: {
    code: string;
    message: string;
    status: number;
  };
}

export interface FilterOptions {
  brands: { brand_id: number; brand_name: string }[];
  chipsets: { chipset_id: number; chipset_name: string }[];
  displayTypes: { display_type_id: number; display_type_name: string }[];
  storageOptions: number[];
  priceRange: { min: number; max: number };
}

export interface FilterCriteria {
  brand?: string;
  chipset?: string;
  displayType?: string;
  internalStorage?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  ramGb?: number;
  batteryCapacity?: number;
  screenSize?: {
    min: number;
    max: number;
  };
}

export interface PhoneSearchResponse {
  phones: Phone[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: FilterCriteria;
  sorting: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}

export interface Phone {
  phone_id: number;
  brand_name: string;
  model: string;
  image_url?: string;
  status: string;
  release_date?: string;
  ram_gb?: number;
  internal_storage_gb?: number;
  battery_capacity?: number;
  screen_size?: number;
  display_type_name?: string;
  chipset_name?: string;
  price_unofficial?: number;
  price_official?: number;
}

class ApiClient {
  private retryDelays = [1000, 2000, 4000]; // Exponential backoff delays in ms
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle different HTTP status codes
        const errorMessage = await this.getResponseErrorMessage(response);
        
        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed (attempt ${retryCount + 1}):`, error);
      
      // Determine if we should retry
      const shouldRetry = this.shouldRetry(error, retryCount);
      
      if (shouldRetry && retryCount < this.retryDelays.length) {
        console.log(`Retrying request to ${endpoint} in ${this.retryDelays[retryCount]}ms...`);
        await this.delay(this.retryDelays[retryCount]);
        return this.request(endpoint, options, retryCount + 1);
      }
      
      return {
        success: false,
        data: null as T,
        error: {
          code: this.getErrorCode(error),
          message: this.getErrorMessage(error),
          status: this.getErrorStatus(error),
        },
      };
    }
  }

  private async getResponseErrorMessage(response: Response): Promise<string> {
    try {
      const errorData = await response.json();
      return errorData.error?.message || errorData.message || `HTTP ${response.status} error`;
    } catch {
      return `HTTP ${response.status} error`;
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return 'Request timed out. Please check your connection and try again.';
      }
      if (error.message.includes('Failed to fetch')) {
        return 'Unable to connect to server. Please check your internet connection.';
      }
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  private getErrorCode(error: unknown): string {
    if (error instanceof Error) {
      if (error.name === 'AbortError') return 'TIMEOUT_ERROR';
      if (error.message.includes('Failed to fetch')) return 'NETWORK_ERROR';
      if (error.message.includes('Status: 404')) return 'NOT_FOUND';
      if (error.message.includes('Status: 500')) return 'SERVER_ERROR';
      if (error.message.includes('Status: 429')) return 'RATE_LIMITED';
    }
    return 'UNKNOWN_ERROR';
  }

  private getErrorStatus(error: unknown): number {
    if (error instanceof Error) {
      const statusMatch = error.message.match(/Status: (\d+)/);
      if (statusMatch) {
        return parseInt(statusMatch[1], 10);
      }
      if (error.name === 'AbortError') return 408; // Request Timeout
      if (error.message.includes('Failed to fetch')) return 503; // Service Unavailable
    }
    return 500;
  }

  private shouldRetry(error: unknown, retryCount: number): boolean {
    if (retryCount >= this.retryDelays.length) return false;
    
    if (error instanceof Error) {
      // Don't retry for client errors (4xx), except for 408 (timeout) and 429 (rate limited)
      if (error.message.includes('Status: 4')) {
        const isRetryable = error.message.includes('Status: 408') || 
                           error.message.includes('Status: 429');
        return isRetryable;
      }
      
      // Retry for network errors, timeouts, and server errors (5xx)
      return error.name === 'AbortError' || 
             error.message.includes('Failed to fetch') ||
             error.message.includes('Status: 5');
    }
    
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getFilterOptions(): Promise<ApiResponse<FilterOptions>> {
    return this.request<FilterOptions>('/devices/filters');
  }

  async searchPhones(
    filters: FilterCriteria,
    sortBy: string = 'p.phone_id',
    sortOrder: 'asc' | 'desc' = 'asc',
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<PhoneSearchResponse>> {
    return this.request<PhoneSearchResponse>('/devices/search', {
      method: 'POST',
      body: JSON.stringify({
        filters,
        sortBy,
        sortOrder,
        page,
        limit,
      }),
    });
  }

  async getPhoneDetails(phoneId: number): Promise<ApiResponse<{ phone: any }>> {
    return this.request<{ phone: any }>(`/devices/${phoneId}`);
  }
}

export const apiClient = new ApiClient();