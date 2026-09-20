import { DatabaseConnection, QueryValue, QueryResult as DatabaseQueryResult } from './connection';
import { FilterCriteria, NumericRange, SortOrder } from '../types';

export interface QueryResult {
  query: string;
  params: QueryValue[];
}

export interface SortOptions {
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface FilterOptionQueries {
  brands: QueryResult;
  chipsets: QueryResult;
  displayTypes: QueryResult;
  storageOptions: QueryResult;
  priceRange: QueryResult;
}

const SORT_COLUMNS: Record<string, string> = {
  'p.phone_id': 'p.phone_id',
  'b.brand_name': 'b.brand_name',
  'p.model': 'p.model',
  'p.release_date': 'p.release_date',
  'ps.ram_gb': 'ps.ram_gb',
  'ps.internal_storage_gb': 'ps.internal_storage_gb',
  'ps.battery_capacity': 'CAST(ps.battery_capacity AS UNSIGNED)',
  'ds.screen_size': 'CAST(ds.screen_size AS DECIMAL(5,2))',
  'pr.price_unofficial': 'pr.price_unofficial',
  'pr.price_official': 'pr.price_official',
};

export function isSupportedSortColumn(value: string): boolean {
  return Object.prototype.hasOwnProperty.call(SORT_COLUMNS, value);
}

const BASE_FROM = `
  FROM phones p
  INNER JOIN brands b ON p.brand_id = b.brand_id
  LEFT JOIN phone_specifications ps ON p.phone_id = ps.phone_id
  LEFT JOIN display_specifications ds ON p.phone_id = ds.phone_id
  LEFT JOIN display_types dt ON ps.display_type_id = dt.display_type_id
  LEFT JOIN chipsets c ON ps.chipset_id = c.chipset_id
  LEFT JOIN (
    SELECT
      phone_id,
      COALESCE(
        MAX(CASE WHEN variant_description = 'base' THEN price_unofficial END),
        MAX(price_unofficial)
      ) AS price_unofficial,
      COALESCE(
        MAX(CASE WHEN variant_description = 'base' THEN price_official END),
        MAX(price_official)
      ) AS price_official
    FROM phone_pricing
    GROUP BY phone_id
  ) pr ON p.phone_id = pr.phone_id
`;

function addRange(
  conditions: string[],
  params: QueryValue[],
  expression: string,
  range: NumericRange | undefined,
): void {
  if (!range) return;
  if (range.min !== undefined) {
    conditions.push(expression + ' >= ?');
    params.push(range.min);
  }
  if (range.max !== undefined) {
    conditions.push(expression + ' <= ?');
    params.push(range.max);
  }
}

export class QueryBuilder {
  constructor(private readonly db: DatabaseConnection) {}

  private buildWhere(filters: FilterCriteria): { clause: string; params: QueryValue[] } {
    const conditions: string[] = [];
    const params: QueryValue[] = [];

    if (filters.brand) {
      conditions.push('b.brand_name = ?');
      params.push(filters.brand);
    }
    if (filters.chipset) {
      conditions.push('c.chipset_name = ?');
      params.push(filters.chipset);
    }
    if (filters.displayType) {
      conditions.push('dt.display_type_name = ?');
      params.push(filters.displayType);
    }
    if (filters.internalStorage !== undefined) {
      conditions.push('ps.internal_storage_gb >= ?');
      params.push(filters.internalStorage);
    }
    if (filters.ramGb !== undefined) {
      conditions.push('ps.ram_gb >= ?');
      params.push(filters.ramGb);
    }
    if (filters.batteryCapacity !== undefined) {
      conditions.push('CAST(ps.battery_capacity AS UNSIGNED) >= ?');
      params.push(filters.batteryCapacity);
    }

    addRange(conditions, params, 'CAST(ds.screen_size AS DECIMAL(5,2))', filters.screenSize);

    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (min !== undefined && max !== undefined) {
        conditions.push('(pr.price_unofficial BETWEEN ? AND ? OR pr.price_official BETWEEN ? AND ?)');
        params.push(min, max, min, max);
      } else if (min !== undefined) {
        conditions.push('(pr.price_unofficial >= ? OR pr.price_official >= ?)');
        params.push(min, min);
      } else if (max !== undefined) {
        conditions.push('(pr.price_unofficial <= ? OR pr.price_official <= ?)');
        params.push(max, max);
      }
    }

    return {
      clause: conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '',
      params,
    };
  }

  buildFilterQuery(
    filters: FilterCriteria,
    sortOptions: SortOptions = {},
    paginationOptions: PaginationOptions = {},
  ): QueryResult {
    const { clause, params } = this.buildWhere(filters);
    const requestedSort = sortOptions.sortBy || 'p.phone_id';
    const sortColumn = SORT_COLUMNS[requestedSort] || SORT_COLUMNS['p.phone_id'];
    const sortOrder = sortOptions.sortOrder === 'desc' ? 'DESC' : 'ASC';
    const page = Math.max(1, Math.trunc(paginationOptions.page || 1));
    const limit = Math.min(100, Math.max(1, Math.trunc(paginationOptions.limit || 20)));
    const offset = (page - 1) * limit;

    const query = `
      SELECT DISTINCT
        p.phone_id,
        b.brand_name,
        p.model,
        p.image_url,
        p.status,
        p.release_date,
        ps.ram_gb,
        ps.internal_storage_gb,
        CAST(NULLIF(REGEXP_SUBSTR(ps.battery_capacity, '[0-9]+'), '') AS UNSIGNED) AS battery_capacity,
        CAST(ds.screen_size AS DECIMAL(5,2)) AS screen_size,
        dt.display_type_name,
        c.chipset_name,
        pr.price_unofficial,
        pr.price_official
      ${BASE_FROM}
      ${clause}
      ORDER BY ${sortColumn} ${sortOrder}, p.phone_id ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return { query, params };
  }

  buildCountQuery(filters: FilterCriteria): QueryResult {
    const { clause, params } = this.buildWhere(filters);
    return {
      query: `SELECT COUNT(DISTINCT p.phone_id) AS total ${BASE_FROM} ${clause}`,
      params,
    };
  }

  buildFilterOptionQueries(): FilterOptionQueries {
    return {
      brands: {
        query: `
          SELECT DISTINCT b.brand_id, b.brand_name
          FROM brands b
          INNER JOIN phones p ON p.brand_id = b.brand_id
          ORDER BY b.brand_name
        `,
        params: [],
      },
      chipsets: {
        query: `
          SELECT DISTINCT c.chipset_id, c.chipset_name
          FROM chipsets c
          INNER JOIN phone_specifications ps ON ps.chipset_id = c.chipset_id
          ORDER BY c.chipset_name
        `,
        params: [],
      },
      displayTypes: {
        query: `
          SELECT DISTINCT dt.display_type_id, dt.display_type_name
          FROM display_types dt
          INNER JOIN phone_specifications ps ON ps.display_type_id = dt.display_type_id
          ORDER BY dt.display_type_name
        `,
        params: [],
      },
      storageOptions: {
        query: `
          SELECT DISTINCT internal_storage_gb
          FROM phone_specifications
          WHERE internal_storage_gb IS NOT NULL
          ORDER BY internal_storage_gb
        `,
        params: [],
      },
      priceRange: {
        query: `
          SELECT
            COALESCE(MIN(NULLIF(LEAST(
              COALESCE(price_unofficial, 999999999),
              COALESCE(price_official, 999999999)
            ), 999999999)), 0) AS min,
            COALESCE(MAX(GREATEST(
              COALESCE(price_unofficial, 0),
              COALESCE(price_official, 0)
            )), 0) AS max
          FROM phone_pricing
          WHERE price_unofficial IS NOT NULL OR price_official IS NOT NULL
        `,
        params: [],
      },
    };
  }

  buildDetailsQuery(phoneId: number): QueryResult {
    return {
      query: `
        SELECT
          p.phone_id, p.model, p.device_type, p.release_date, p.status,
          p.detail_url, p.image_url, p.scraped_at, b.brand_name,
          ps.cpu, ps.cpu_cores, ps.gpu, ps.ram_gb, ps.internal_storage_gb,
          ps.expandable_memory, ps.battery_capacity, ps.quick_charging,
          ps.bluetooth_version, ps.network, ps.wlan, ps.usb, ps.usb_otg,
          ps.usb_type_c, ds.screen_size, ds.resolution, ds.pixel_density,
          ds.refresh_rate, ds.brightness, ds.aspect_ratio, ds.screen_protection,
          ds.screen_to_body_ratio, ds.touch_screen, ds.notch, ds.edge,
          phys.height, phys.width, phys.thickness, phys.weight, phys.ip_rating,
          phys.waterproof, phys.ruggedness, cam.primary_camera_resolution,
          cam.primary_camera_features, cam.primary_camera_autofocus,
          cam.primary_camera_flash, cam.primary_camera_image_resolution, cam.video,
          audio.audio_jack, audio.loudspeaker, feat.features, feat.face_unlock,
          feat.gps, feat.gprs, feat.volte, feat.sim_size, feat.sim_slot, feat.speed,
          c.chipset_name, os.os_name, os.os_version, os.user_interface,
          dt.display_type_name, st.storage_type_name, rt.ram_type_name
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
        WHERE p.phone_id = ?
        LIMIT 1
      `,
      params: [phoneId],
    };
  }

  buildPhoneColorsQuery(phoneId: number): QueryResult {
    return {
      query: `
        SELECT color_name
        FROM phone_colors
        WHERE phone_id = ?
        ORDER BY color_name
      `,
      params: [phoneId],
    };
  }

  buildPhonePricingQuery(phoneId: number): QueryResult {
    return {
      query: `
        SELECT price_official, price_unofficial, price_old, price_savings,
               price_updated, variant_description
        FROM phone_pricing
        WHERE phone_id = ?
        ORDER BY pricing_id
      `,
      params: [phoneId],
    };
  }

  async execute(query: QueryResult): Promise<DatabaseQueryResult<unknown>> {
    return this.db.query(query.query, query.params);
  }
}
