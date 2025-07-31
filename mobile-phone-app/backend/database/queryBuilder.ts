import { DatabaseConnection } from './connection';

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

export interface QueryResult {
  query: string;
  params: any[];
}

export interface SortOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export class QueryBuilder {
  private db: DatabaseConnection;

  constructor() {
    this.db = new DatabaseConnection();
  }

  /**
   * Build dynamic SQL query for filtering phones based on criteria
   * Joins across normalized tables to provide comprehensive filtering
   */
  buildFilterQuery(
    filters: FilterCriteria, 
    sortOptions: SortOptions = {}, 
    paginationOptions: PaginationOptions = {}
  ): QueryResult {
    const params: any[] = [];
    let paramIndex = 1;

    // Base query with all necessary joins
    let query = `
      SELECT DISTINCT
        p.phone_id,
        b.brand_name,
        p.model,
        p.image_url,
        p.status,
        p.release_date,
        ps.ram_gb,
        ps.internal_storage_gb,
        ps.battery_capacity,
        ds.screen_size,
        dt.display_type_name,
        c.chipset_name,
        pr.price_unofficial,
        pr.price_official
      FROM phones p
      INNER JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN phone_specifications ps ON p.phone_id = ps.phone_id
      LEFT JOIN display_specifications ds ON p.phone_id = ds.phone_id
      LEFT JOIN display_types dt ON ps.display_type_id = dt.display_type_id
      LEFT JOIN chipsets c ON ps.chipset_id = c.chipset_id
      LEFT JOIN phone_pricing pr ON p.phone_id = pr.phone_id
    `;

    // Build WHERE clause dynamically
    const whereConditions: string[] = [];

    // Brand filter
    if (filters.brand && filters.brand.trim() !== '') {
      whereConditions.push(`b.brand_name = ?`);
      params.push(filters.brand);
    }

    // Chipset filter
    if (filters.chipset && filters.chipset.trim() !== '') {
      whereConditions.push(`c.chipset_name = ?`);
      params.push(filters.chipset);
    }

    // Display type filter
    if (filters.displayType && filters.displayType.trim() !== '') {
      whereConditions.push(`dt.display_type_name = ?`);
      params.push(filters.displayType);
    }

    // Internal storage filter
    if (filters.internalStorage && filters.internalStorage.trim() !== '') {
      const storageValue = parseInt(filters.internalStorage);
      if (!isNaN(storageValue)) {
        whereConditions.push(`ps.internal_storage_gb >= ?`);
        params.push(storageValue);
      }
    }

    // RAM filter
    if (filters.ramGb && filters.ramGb > 0) {
      whereConditions.push(`ps.ram_gb >= ?`);
      params.push(filters.ramGb);
    }

    // Battery capacity filter
    if (filters.batteryCapacity && filters.batteryCapacity > 0) {
      whereConditions.push(`ps.battery_capacity >= ?`);
      params.push(filters.batteryCapacity);
    }

    // Price range filter
    if (filters.priceRange) {
      if (filters.priceRange.min > 0) {
        whereConditions.push(`(pr.price_unofficial >= ? OR pr.price_official >= ?)`);
        params.push(filters.priceRange.min, filters.priceRange.min);
      }
      if (filters.priceRange.max > 0) {
        whereConditions.push(`(pr.price_unofficial <= ? OR pr.price_official <= ?)`);
        params.push(filters.priceRange.max, filters.priceRange.max);
      }
    }

    // Screen size filter
    if (filters.screenSize) {
      if (filters.screenSize.min > 0) {
        whereConditions.push(`ds.screen_size >= ?`);
        params.push(filters.screenSize.min);
      }
      if (filters.screenSize.max > 0) {
        whereConditions.push(`ds.screen_size <= ?`);
        params.push(filters.screenSize.max);
      }
    }

    // Add WHERE clause if conditions exist
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Add ORDER BY clause
    const { sortBy = 'p.phone_id', sortOrder = 'asc' } = sortOptions;
    const validSortColumns = [
      'p.phone_id', 'b.brand_name', 'p.model', 'p.release_date',
      'ps.ram_gb', 'ps.internal_storage_gb', 'ps.battery_capacity',
      'ds.screen_size', 'pr.price_unofficial', 'pr.price_official'
    ];

    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'p.phone_id';
    const safeSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    
    query += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

    // Add LIMIT and OFFSET for pagination
    const { page = 1, limit = 20 } = paginationOptions;
    const offset = (page - 1) * limit;
    
    // Use string interpolation for LIMIT/OFFSET as MySQL doesn't support parameters here
    const safeLimit = Math.max(1, Math.min(100, parseInt(limit.toString())));
    const safeOffset = Math.max(0, parseInt(offset.toString()));
    
    query += ` LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    return { query, params };
  }

  /**
   * Build query to get filter options for dropdowns
   */
  buildFilterOptionsQuery(): QueryResult {
    const query = `
      SELECT 
        'brands' as type,
        JSON_ARRAYAGG(
          JSON_OBJECT('brand_id', brand_id, 'brand_name', brand_name)
        ) as options
      FROM brands
      WHERE brand_id IN (SELECT DISTINCT brand_id FROM phones)
      
      UNION ALL
      
      SELECT 
        'chipsets' as type,
        JSON_ARRAYAGG(
          JSON_OBJECT('chipset_id', chipset_id, 'chipset_name', chipset_name)
        ) as options
      FROM chipsets
      WHERE chipset_id IN (SELECT DISTINCT chipset_id FROM phone_specifications WHERE chipset_id IS NOT NULL)
      
      UNION ALL
      
      SELECT 
        'displayTypes' as type,
        JSON_ARRAYAGG(
          JSON_OBJECT('display_type_id', display_type_id, 'display_type_name', display_type_name)
        ) as options
      FROM display_types
      WHERE display_type_id IN (SELECT DISTINCT display_type_id FROM phone_specifications WHERE display_type_id IS NOT NULL)
      
      UNION ALL
      
      SELECT 
        'storageOptions' as type,
        JSON_ARRAYAGG(internal_storage_gb) as options
      FROM (
        SELECT DISTINCT internal_storage_gb
        FROM phone_specifications
        WHERE internal_storage_gb IS NOT NULL
        ORDER BY internal_storage_gb
      ) storage_opts
      
      UNION ALL
      
      SELECT 
        'priceRange' as type,
        JSON_OBJECT(
          'min', COALESCE(MIN(LEAST(COALESCE(price_unofficial, 999999), COALESCE(price_official, 999999))), 0),
          'max', COALESCE(MAX(GREATEST(COALESCE(price_unofficial, 0), COALESCE(price_official, 0))), 0)
        ) as options
      FROM phone_pricing
      WHERE (price_unofficial IS NOT NULL AND price_unofficial > 0) 
         OR (price_official IS NOT NULL AND price_official > 0)
    `;

    return { query, params: [] };
  }

  /**
   * Build query to get detailed phone information by ID
   */
  buildDetailsQuery(phoneId: number): QueryResult {
    const query = `
      SELECT 
        p.phone_id,
        p.model,
        p.device_type,
        p.release_date,
        p.status,
        p.detail_url,
        p.image_url,
        p.scraped_at,
        
        -- Brand information
        b.brand_name,
        
        -- Specifications
        ps.cpu,
        ps.cpu_cores,
        ps.gpu,
        ps.ram_gb,
        ps.internal_storage_gb,
        ps.expandable_memory,
        ps.battery_capacity,
        ps.quick_charging,
        ps.bluetooth_version,
        ps.network,
        ps.wlan,
        ps.usb,
        ps.usb_otg,
        ps.usb_type_c,
        
        -- Display specifications
        ds.screen_size,
        ds.resolution,
        ds.pixel_density,
        ds.refresh_rate,
        ds.brightness,
        ds.aspect_ratio,
        ds.screen_protection,
        ds.screen_to_body_ratio,
        ds.touch_screen,
        ds.notch,
        ds.edge,
        
        -- Physical specifications
        phys.height,
        phys.width,
        phys.thickness,
        phys.weight,
        phys.ip_rating,
        phys.waterproof,
        phys.ruggedness,
        
        -- Camera specifications
        cam.primary_camera_resolution,
        cam.primary_camera_features,
        cam.primary_camera_autofocus,
        cam.primary_camera_flash,
        cam.primary_camera_image_resolution,
        cam.video,
        
        -- Audio features
        audio.audio_jack,
        audio.loudspeaker,
        
        -- Additional features
        feat.features,
        feat.face_unlock,
        feat.gps,
        feat.gprs,
        feat.volte,
        feat.sim_size,
        feat.sim_slot,
        feat.speed,
        
        -- Lookup table names
        c.chipset_name,
        os.os_name,
        os.os_version,
        os.user_interface,
        dt.display_type_name,
        st.storage_type_name,
        rt.ram_type_name,
        
        -- Pricing information (first pricing record only)
        pr.price_official,
        pr.price_unofficial,
        pr.price_old,
        pr.price_savings,
        pr.price_updated,
        pr.variant_description
        
      FROM phones p
      INNER JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN phone_specifications ps ON p.phone_id = ps.phone_id
      LEFT JOIN display_specifications ds ON p.phone_id = ds.phone_id
      LEFT JOIN physical_specifications phys ON p.phone_id = phys.phone_id
      LEFT JOIN camera_specifications cam ON p.phone_id = cam.phone_id
      LEFT JOIN audio_features audio ON p.phone_id = audio.phone_id
      LEFT JOIN additional_features feat ON p.phone_id = feat.phone_id
      LEFT JOIN chipsets c ON ps.chipset_id = c.chipset_id
      LEFT JOIN operating_systems os ON ps.os_id = os.os_id
      LEFT JOIN display_types dt ON ps.display_type_id = dt.display_type_id
      LEFT JOIN storage_types st ON ps.storage_type_id = st.storage_type_id
      LEFT JOIN ram_types rt ON ps.ram_type_id = rt.ram_type_id
      LEFT JOIN phone_pricing pr ON p.phone_id = pr.phone_id
      
      WHERE p.phone_id = ?
      LIMIT 1
    `;

    return { query, params: [phoneId] };
  }

  /**
   * Build separate query to get phone colors
   */
  buildPhoneColorsQuery(phoneId: number): QueryResult {
    const query = `
      SELECT color_name
      FROM phone_colors
      WHERE phone_id = ?
      ORDER BY color_name
    `;

    return { query, params: [phoneId] };
  }

  /**
   * Build separate query to get phone pricing variants
   */
  buildPhonePricingQuery(phoneId: number): QueryResult {
    const query = `
      SELECT 
        price_official,
        price_unofficial,
        price_old,
        price_savings,
        price_updated,
        variant_description
      FROM phone_pricing
      WHERE phone_id = ?
      ORDER BY pricing_id
    `;

    return { query, params: [phoneId] };
  }

  /**
   * Build query to count total results for pagination
   */
  buildCountQuery(filters: FilterCriteria): QueryResult {
    const params: any[] = [];
    
    let query = `
      SELECT COUNT(DISTINCT p.phone_id) as total
      FROM phones p
      INNER JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN phone_specifications ps ON p.phone_id = ps.phone_id
      LEFT JOIN display_specifications ds ON p.phone_id = ds.phone_id
      LEFT JOIN display_types dt ON ps.display_type_id = dt.display_type_id
      LEFT JOIN chipsets c ON ps.chipset_id = c.chipset_id
      LEFT JOIN phone_pricing pr ON p.phone_id = pr.phone_id
    `;

    // Build WHERE clause (same logic as buildFilterQuery)
    const whereConditions: string[] = [];

    if (filters.brand && filters.brand.trim() !== '') {
      whereConditions.push(`b.brand_name = ?`);
      params.push(filters.brand);
    }

    if (filters.chipset && filters.chipset.trim() !== '') {
      whereConditions.push(`c.chipset_name = ?`);
      params.push(filters.chipset);
    }

    if (filters.displayType && filters.displayType.trim() !== '') {
      whereConditions.push(`dt.display_type_name = ?`);
      params.push(filters.displayType);
    }

    if (filters.internalStorage && filters.internalStorage.trim() !== '') {
      const storageValue = parseInt(filters.internalStorage);
      if (!isNaN(storageValue)) {
        whereConditions.push(`ps.internal_storage_gb >= ?`);
        params.push(storageValue);
      }
    }

    if (filters.ramGb && filters.ramGb > 0) {
      whereConditions.push(`ps.ram_gb >= ?`);
      params.push(filters.ramGb);
    }

    if (filters.batteryCapacity && filters.batteryCapacity > 0) {
      whereConditions.push(`ps.battery_capacity >= ?`);
      params.push(filters.batteryCapacity);
    }

    if (filters.priceRange) {
      if (filters.priceRange.min > 0) {
        whereConditions.push(`(pr.price_unofficial >= ? OR pr.price_official >= ?)`);
        params.push(filters.priceRange.min, filters.priceRange.min);
      }
      if (filters.priceRange.max > 0) {
        whereConditions.push(`(pr.price_unofficial <= ? OR pr.price_official <= ?)`);
        params.push(filters.priceRange.max, filters.priceRange.max);
      }
    }

    if (filters.screenSize) {
      if (filters.screenSize.min > 0) {
        whereConditions.push(`ds.screen_size >= ?`);
        params.push(filters.screenSize.min);
      }
      if (filters.screenSize.max > 0) {
        whereConditions.push(`ds.screen_size <= ?`);
        params.push(filters.screenSize.max);
      }
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    return { query, params };
  }

  /**
   * Execute query with timing for educational purposes
   */
  async executeQuery(queryResult: QueryResult): Promise<{
    results: any;
    executionTime: number;
    query: string;
    params: any[];
  }> {
    const startTime = Date.now();
    const results = await this.db.queryResults(queryResult.query, queryResult.params);
    const executionTime = Date.now() - startTime;

    return {
      results,
      executionTime,
      query: queryResult.query,
      params: queryResult.params
    };
  }

  /**
   * Execute query and return detailed result with timing
   */
  async executeQueryWithDetails(queryResult: QueryResult) {
    return await this.db.query(queryResult.query, queryResult.params);
  }
}