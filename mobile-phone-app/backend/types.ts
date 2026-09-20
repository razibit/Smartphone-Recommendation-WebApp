export type SortOrder = 'asc' | 'desc';

export interface NumericRange {
  min?: number;
  max?: number;
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

export interface SearchRequest {
  filters?: FilterCriteria;
  sortBy?: string;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface QueryDiagnostics {
  sql: string;
  executionTime: number;
  resultCount?: number;
}

export interface ApiMeta {
  requestId: string;
  diagnostics?: QueryDiagnostics;
}
