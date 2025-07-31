import { Request, Response, NextFunction } from 'express';
import { DatabaseConnection } from '../database/connection';
import { QueryBuilder, FilterCriteria, SortOptions, PaginationOptions } from '../database/queryBuilder';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';

export class DeviceController {
  private db: DatabaseConnection;
  private queryBuilder: QueryBuilder;

  constructor() {
    this.db = new DatabaseConnection();
    this.queryBuilder = new QueryBuilder();
  }

  // Get all devices with pagination
  getAllDevices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      // Validate pagination parameters
      if (page < 1) throw new ValidationError('Page must be a positive integer');
      if (limit < 1 || limit > 100) throw new ValidationError('Limit must be between 1 and 100');

      const paginationOptions: PaginationOptions = {
        page: Math.max(1, page),
        limit: Math.min(100, Math.max(1, limit))
      };

      const sortOptions: SortOptions = {
        sortBy: 'p.phone_id',
        sortOrder: 'asc'
      };

      // Use empty filters to get all devices
      const emptyFilters: FilterCriteria = {};
      
      // Build and execute the query
      const queryResult = this.queryBuilder.buildFilterQuery(emptyFilters, sortOptions, paginationOptions);
      const result = await this.queryBuilder.executeQueryWithDetails(queryResult);

      // Get total count
      const countQueryResult = this.queryBuilder.buildCountQuery(emptyFilters);
      const countResult = await this.queryBuilder.executeQueryWithDetails(countQueryResult);
      const total = Array.isArray(countResult.results) && countResult.results.length > 0 
        ? countResult.results[0].total 
        : 0;

      const totalPages = Math.ceil(total / paginationOptions.limit);

      res.json({
        success: true,
        data: {
          devices: result.results || [],
          pagination: {
            page: paginationOptions.page,
            limit: paginationOptions.limit,
            total,
            totalPages
          }
        },
        sqlQuery: result.query,
        executionTime: result.executionTime
      });
    } catch (error) {
      next(error);
    }
  };

  // Get filter options for dropdowns
  getFilterOptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryResult = this.queryBuilder.buildFilterOptionsQuery();
      const result = await this.queryBuilder.executeQueryWithDetails(queryResult);
      
      // Process the results to structure them properly
      const filterOptions = {
        brands: [],
        chipsets: [],
        displayTypes: [],
        storageOptions: [],
        priceRange: { min: 0, max: 0 }
      };

      // Parse the union results
      if (Array.isArray(result.results)) {
        result.results.forEach((row: any) => {
          try {
            if (row.type === 'brands' && row.options) {
              filterOptions.brands = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
            } else if (row.type === 'chipsets' && row.options) {
              filterOptions.chipsets = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
            } else if (row.type === 'displayTypes' && row.options) {
              filterOptions.displayTypes = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
            } else if (row.type === 'storageOptions' && row.options) {
              const storageData = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
              filterOptions.storageOptions = Array.isArray(storageData) ? storageData.sort((a: number, b: number) => a - b) : [];
            } else if (row.type === 'priceRange' && row.options) {
              filterOptions.priceRange = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
            }
          } catch (parseError) {
            console.warn(`Failed to parse ${row.type} options:`, parseError);
          }
        });
      }

      res.json({
        success: true,
        data: filterOptions,
        sqlQuery: result.query,
        executionTime: result.executionTime
      });
    } catch (error) {
      next(error);
    }
  };

  // Search phones with filters
  searchPhones = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filters = {}, sortBy, sortOrder = 'asc', page = 1, limit = 20 } = req.body;

      // Validate and sanitize filters
      const filterCriteria: FilterCriteria = {
        brand: filters.brand?.trim() || undefined,
        chipset: filters.chipset?.trim() || undefined,
        displayType: filters.displayType?.trim() || undefined,
        internalStorage: filters.internalStorage?.toString().trim() || undefined,
        ramGb: filters.ramGb ? parseInt(filters.ramGb) : undefined,
        batteryCapacity: filters.batteryCapacity ? parseInt(filters.batteryCapacity) : undefined,
        priceRange: filters.priceRange ? {
          min: parseFloat(filters.priceRange.min) || 0,
          max: parseFloat(filters.priceRange.max) || 0
        } : undefined,
        screenSize: filters.screenSize ? {
          min: parseFloat(filters.screenSize.min) || 0,
          max: parseFloat(filters.screenSize.max) || 0
        } : undefined
      };

      const sortOptions: SortOptions = {
        sortBy: sortBy?.trim() || 'p.phone_id',
        sortOrder: sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc'
      };

      const paginationOptions: PaginationOptions = {
        page: Math.max(1, parseInt(page) || 1),
        limit: Math.min(100, Math.max(1, parseInt(limit) || 20))
      };

      // Build and execute the main query
      const queryResult = this.queryBuilder.buildFilterQuery(filterCriteria, sortOptions, paginationOptions);
      const result = await this.queryBuilder.executeQueryWithDetails(queryResult);

      // Get total count for pagination
      const countQueryResult = this.queryBuilder.buildCountQuery(filterCriteria);
      const countResult = await this.queryBuilder.executeQueryWithDetails(countQueryResult);
      const total = Array.isArray(countResult.results) && countResult.results.length > 0 
        ? countResult.results[0].total 
        : 0;

      const totalPages = Math.ceil(total / paginationOptions.limit);

      res.json({
        success: true,
        data: {
          phones: result.results || [],
          pagination: {
            page: paginationOptions.page,
            limit: paginationOptions.limit,
            total,
            totalPages
          },
          filters: filterCriteria,
          sorting: sortOptions
        },
        sqlQuery: result.query,
        executionTime: result.executionTime
      });
    } catch (error) {
      next(error);
    }
  };

  // Get phone details by ID
  getPhoneDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deviceId = parseInt(req.params.id);

      if (isNaN(deviceId) || deviceId < 1) {
        throw new ValidationError('Invalid phone ID');
      }

      // Build and execute the details query
      const queryResult = this.queryBuilder.buildDetailsQuery(deviceId);
      const result = await this.queryBuilder.executeQueryWithDetails(queryResult);

      if (!result.results || (Array.isArray(result.results) && result.results.length === 0)) {
        throw new NotFoundError(`Phone with ID ${deviceId} not found`);
      }

      // Get the main phone data
      const phoneData = Array.isArray(result.results) ? result.results[0] : result.results;
      
      // Get colors separately
      const colorsQuery = this.queryBuilder.buildPhoneColorsQuery(deviceId);
      const colorsResult = await this.queryBuilder.executeQueryWithDetails(colorsQuery);
      phoneData.colors = Array.isArray(colorsResult.results) 
        ? colorsResult.results.map((row: any) => row.color_name)
        : [];

      // Get pricing variants separately
      const pricingQuery = this.queryBuilder.buildPhonePricingQuery(deviceId);
      const pricingResult = await this.queryBuilder.executeQueryWithDetails(pricingQuery);
      phoneData.pricing_variants = Array.isArray(pricingResult.results) 
        ? pricingResult.results.filter((variant: any) => 
            variant.price_official !== null || variant.price_unofficial !== null
          )
        : [];

      res.json({
        success: true,
        data: {
          phone: phoneData
        },
        sqlQuery: result.query,
        executionTime: result.executionTime
      });
    } catch (error) {
      next(error);
    }
  };
}