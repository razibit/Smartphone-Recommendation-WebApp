import { Request, Response, NextFunction } from 'express';
import { AppConfig } from '../config';
import { DatabaseConnection } from '../database/connection';
import { isSupportedSortColumn, QueryBuilder } from '../database/queryBuilder';
import { FilterCriteria, NumericRange, SearchRequest, SortOrder } from '../types';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';
import { requirePositiveId } from '../middleware/validation';

type Row = Record<string, unknown>;

function rowsFrom(value: unknown): Row[] {
  return Array.isArray(value) ? value as Row[] : [];
}

function textValue(value: unknown, field: string, maxLength = 120): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') throw new ValidationError(field + ' must be a string');
  const trimmed = value.trim();
  if (trimmed.length > maxLength) throw new ValidationError(field + ' is too long');
  return trimmed || undefined;
}

function numericValue(value: unknown, field: string, integer = false): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || (integer && !Number.isInteger(parsed))) {
    throw new ValidationError(field + ' must be a non-negative ' + (integer ? 'integer' : 'number'));
  }
  return parsed;
}

function numericRange(value: unknown, field: string): NumericRange | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError(field + ' must be an object');
  }

  const range = value as { min?: unknown; max?: unknown };
  const min = numericValue(range.min, field + '.min');
  const max = numericValue(range.max, field + '.max');
  if (min === undefined && max === undefined) return undefined;
  if (min !== undefined && max !== undefined && min > max) {
    throw new ValidationError(field + '.min cannot be greater than ' + field + '.max');
  }
  return { ...(min !== undefined ? { min } : {}), ...(max !== undefined ? { max } : {}) };
}

function parseFilters(value: unknown): FilterCriteria {
  if (value === undefined || value === null) return {};
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError('filters must be an object');
  }

  const filters = value as Record<string, unknown>;
  return {
    brand: textValue(filters.brand, 'brand'),
    chipset: textValue(filters.chipset, 'chipset'),
    displayType: textValue(filters.displayType, 'displayType'),
    internalStorage: numericValue(filters.internalStorage, 'internalStorage', true),
    ramGb: numericValue(filters.ramGb, 'ramGb', true),
    batteryCapacity: numericValue(filters.batteryCapacity, 'batteryCapacity', true),
    priceRange: numericRange(filters.priceRange, 'priceRange'),
    screenSize: numericRange(filters.screenSize, 'screenSize'),
  };
}

function positiveInteger(value: unknown, field: string, fallback: number): number {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = numericValue(value, field, true);
  if (!parsed || parsed < 1) throw new ValidationError(field + ' must be a positive integer');
  return parsed;
}

function parseSearchRequest(
  body: unknown,
  maxPageSize: number,
): Required<Pick<SearchRequest, 'filters' | 'sortBy' | 'sortOrder' | 'page' | 'limit'>> {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new ValidationError('Request body must be an object');
  }

  const input = body as SearchRequest;
  const sortOrder = input.sortOrder === undefined ? 'asc' : input.sortOrder;
  if (sortOrder !== 'asc' && sortOrder !== 'desc') {
    throw new ValidationError('sortOrder must be asc or desc');
  }

  const limit = positiveInteger(input.limit, 'limit', 20);
  if (limit > maxPageSize) {
    throw new ValidationError('limit must be between 1 and ' + maxPageSize);
  }

  const sortBy = textValue(input.sortBy, 'sortBy', 80) || 'p.phone_id';
  if (!isSupportedSortColumn(sortBy)) {
    throw new ValidationError('sortBy is not supported');
  }

  return {
    filters: parseFilters(input.filters),
    sortBy,
    sortOrder: sortOrder as SortOrder,
    page: positiveInteger(input.page, 'page', 1),
    limit,
  };
}

function diagnostics(
  config: AppConfig,
  query: string,
  executionTime: number,
  resultCount: number,
  requestId: string,
) {
  return {
    requestId,
    ...(config.exposeQueryDiagnostics
      ? { diagnostics: { sql: query, executionTime, resultCount } }
      : {}),
  };
}

export class DeviceController {
  private readonly queryBuilder: QueryBuilder;

  constructor(
    private readonly db: DatabaseConnection,
    private readonly config: AppConfig,
  ) {
    this.queryBuilder = new QueryBuilder(db);
  }

  private async search(
    request: Required<Pick<SearchRequest, 'filters' | 'sortBy' | 'sortOrder' | 'page' | 'limit'>>,
    requestId: string,
  ) {
    const query = this.queryBuilder.buildFilterQuery(
      request.filters,
      { sortBy: request.sortBy, sortOrder: request.sortOrder },
      { page: request.page, limit: request.limit },
    );
    const countQuery = this.queryBuilder.buildCountQuery(request.filters);
    const [result, countResult] = await Promise.all([
      this.queryBuilder.execute(query),
      this.queryBuilder.execute(countQuery),
    ]);

    const phones = rowsFrom(result.results);
    const total = Number(rowsFrom(countResult.results)[0]?.total || 0);
    const totalPages = total === 0 ? 0 : Math.ceil(total / request.limit);

    return {
      phones,
      pagination: { page: request.page, limit: request.limit, total, totalPages },
      filters: request.filters,
      sorting: { sortBy: request.sortBy, sortOrder: request.sortOrder },
      meta: diagnostics(this.config, result.query, result.executionTime, phones.length, requestId),
    };
  }

  getAllDevices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const request = parseSearchRequest({
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        filters: {},
      }, this.config.maxPageSize);
      const data = await this.search(request, String(res.locals.requestId));
      res.json({ success: true, data: { devices: data.phones, pagination: data.pagination }, meta: data.meta });
    } catch (error) {
      next(error);
    }
  };

  getFilterOptions = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queries = this.queryBuilder.buildFilterOptionQueries();
      const [brands, chipsets, displayTypes, storageOptions, priceRange] = await Promise.all([
        this.queryBuilder.execute(queries.brands),
        this.queryBuilder.execute(queries.chipsets),
        this.queryBuilder.execute(queries.displayTypes),
        this.queryBuilder.execute(queries.storageOptions),
        this.queryBuilder.execute(queries.priceRange),
      ]);

      const price = rowsFrom(priceRange.results)[0] || {};
      const data = {
        brands: rowsFrom(brands.results),
        chipsets: rowsFrom(chipsets.results),
        displayTypes: rowsFrom(displayTypes.results),
        storageOptions: rowsFrom(storageOptions.results)
          .map((row) => Number(row.internal_storage_gb))
          .filter((value) => Number.isFinite(value))
          .sort((a, b) => a - b),
        priceRange: {
          min: Number(price.min || 0),
          max: Number(price.max || 0),
        },
      };

      res.json({
        success: true,
        data,
        meta: { requestId: String(res.locals.requestId) },
      });
    } catch (error) {
      next(error);
    }
  };

  searchPhones = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const request = parseSearchRequest(req.body, this.config.maxPageSize);
      const data = await this.search(request, String(res.locals.requestId));
      res.json({ success: true, data, meta: data.meta });
    } catch (error) {
      next(error);
    }
  };

  getPhoneDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const phoneId = requirePositiveId(req.params.id, 'phone ID');
      const detailsQuery = this.queryBuilder.buildDetailsQuery(phoneId);
      const detailsResult = await this.queryBuilder.execute(detailsQuery);
      const phone = rowsFrom(detailsResult.results)[0];

      if (!phone) throw new NotFoundError('Phone with ID ' + phoneId);

      const [colorsResult, pricingResult] = await Promise.all([
        this.queryBuilder.execute(this.queryBuilder.buildPhoneColorsQuery(phoneId)),
        this.queryBuilder.execute(this.queryBuilder.buildPhonePricingQuery(phoneId)),
      ]);

      phone.colors = rowsFrom(colorsResult.results)
        .map((row) => row.color_name)
        .filter((color): color is string => typeof color === 'string');
      phone.pricing_variants = rowsFrom(pricingResult.results);

      res.json({
        success: true,
        data: { phone },
        meta: diagnostics(
          this.config,
          detailsResult.query,
          detailsResult.executionTime,
          1,
          String(res.locals.requestId),
        ),
      });
    } catch (error) {
      next(error);
    }
  };
}
