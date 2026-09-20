const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: unknown;
}

export interface QueryDiagnostics {
  sql: string;
  executionTime: number;
  resultCount?: number;
}

export interface ApiMeta {
  requestId?: string;
  diagnostics?: QueryDiagnostics;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface NumericRange {
  min?: number;
  max?: number;
}

export interface FilterOptions {
  brands: Array<{ brand_id: number; brand_name: string }>;
  chipsets: Array<{ chipset_id: number; chipset_name: string }>;
  displayTypes: Array<{ display_type_id: number; display_type_name: string }>;
  storageOptions: number[];
  priceRange: { min: number; max: number };
}

export interface FilterCriteria {
  brand?: string;
  chipset?: string;
  displayType?: string;
  internalStorage?: number;
  priceRange?: NumericRange;
  ramGb?: number;
  batteryCapacity?: number;
  screenSize?: NumericRange;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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
  screen_size?: number | string;
  display_type_name?: string;
  chipset_name?: string;
  price_unofficial?: number;
  price_official?: number;
}

export interface DetailedPhone extends Phone {
  device_type?: string;
  detail_url?: string;
  scraped_at?: string;
  cpu?: string;
  cpu_cores?: number | string;
  gpu?: string;
  expandable_memory?: boolean;
  quick_charging?: string;
  bluetooth_version?: string;
  network?: string;
  wlan?: string;
  usb?: string;
  usb_otg?: boolean;
  usb_type_c?: boolean;
  resolution?: string;
  pixel_density?: number;
  refresh_rate?: number;
  brightness?: number;
  aspect_ratio?: string;
  screen_protection?: string;
  screen_to_body_ratio?: number;
  touch_screen?: string;
  notch?: string;
  edge?: boolean;
  height?: number;
  width?: number;
  thickness?: number;
  weight?: number | string;
  ip_rating?: string;
  waterproof?: string;
  ruggedness?: string;
  primary_camera_resolution?: string;
  primary_camera_features?: string;
  primary_camera_autofocus?: boolean;
  primary_camera_flash?: boolean;
  primary_camera_image_resolution?: string;
  video?: string;
  audio_jack?: string;
  loudspeaker?: boolean;
  features?: string;
  face_unlock?: boolean;
  gps?: string;
  gprs?: boolean;
  volte?: boolean;
  sim_size?: string;
  sim_slot?: string;
  speed?: string;
  os_name?: string;
  os_version?: string;
  user_interface?: string;
  storage_type_name?: string;
  ram_type_name?: string;
  price_old?: number;
  price_savings?: number;
  price_updated?: string;
  variant_description?: string;
  colors?: string[];
  pricing_variants?: Array<{
    price_official?: number;
    price_unofficial?: number;
    price_old?: number;
    price_savings?: number;
    price_updated?: string;
    variant_description?: string;
  }>;
}

export interface PhoneSearchResponse {
  phones: Phone[];
  pagination: Pagination;
  filters: FilterCriteria;
  sorting: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  meta?: ApiMeta;
}

class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

class ApiClient {
  private readonly retryDelays = [500, 1000, 2000];

  private async request<T>(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 30_000);
    const method = (options.method || 'GET').toUpperCase();
    const canRetry = method === 'GET' || (method === 'POST' && endpoint.endsWith('/search'));

    try {
      const response = await fetch(API_BASE_URL + endpoint, {
        ...options,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...options.headers,
        },
      });

      if (!response.ok) {
        let payload: Partial<ApiResponse<never>> = {};
        try {
          payload = await response.json() as Partial<ApiResponse<never>>;
        } catch {
          // The status code remains the source of truth when the server returned no JSON.
        }
        throw new ApiClientError(
          payload.error?.message || 'The API request failed',
          response.status,
          payload.error?.code || 'HTTP_ERROR',
          payload.error?.details,
        );
      }

      return await response.json() as ApiResponse<T>;
    } catch (error) {
      const retryable = canRetry && retryCount < this.retryDelays.length && this.shouldRetry(error);
      if (retryable) {
        await this.delay(this.retryDelays[retryCount]);
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      return {
        success: false,
        error: this.toApiError(error),
      };
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  private shouldRetry(error: unknown): boolean {
    if (error instanceof ApiClientError) {
      return error.status === 408 || error.status === 429 || error.status >= 500;
    }
    return error instanceof Error && (error.name === 'AbortError' || error.message.includes('fetch'));
  }

  private toApiError(error: unknown): ApiError {
    if (error instanceof ApiClientError) {
      return { code: error.code, message: error.message, status: error.status, details: error.details };
    }
    if (error instanceof Error && error.name === 'AbortError') {
      return { code: 'TIMEOUT_ERROR', message: 'The request timed out. Please try again.', status: 408 };
    }
    if (error instanceof Error && error.message.includes('fetch')) {
      return { code: 'NETWORK_ERROR', message: 'Unable to connect to the API service.', status: 503 };
    }
    return { code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred.', status: 500 };
  }

  private delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  getFilterOptions(): Promise<ApiResponse<FilterOptions>> {
    return this.request<FilterOptions>('/devices/filters');
  }

  searchPhones(
    filters: FilterCriteria,
    sortBy = 'p.phone_id',
    sortOrder: 'asc' | 'desc' = 'asc',
    page = 1,
    limit = 20,
  ): Promise<ApiResponse<PhoneSearchResponse>> {
    return this.request<PhoneSearchResponse>('/devices/search', {
      method: 'POST',
      body: JSON.stringify({ filters, sortBy, sortOrder, page, limit }),
    });
  }

  getPhoneDetails(phoneId: number): Promise<ApiResponse<{ phone: DetailedPhone }>> {
    return this.request<{ phone: DetailedPhone }>('/devices/' + phoneId);
  }
}

export const apiClient = new ApiClient();
