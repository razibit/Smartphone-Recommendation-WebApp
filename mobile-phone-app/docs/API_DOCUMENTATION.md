# 🔌 API Documentation

## Base URL & Configuration

**Base URL**: `http://localhost:3001/api`

**Content-Type**: `application/json`

**CORS Policy**: Configured to accept requests from `http://localhost:3000`

**Rate Limiting**: No limits for development (consider implementing for production)

**Caching**: In-memory TTL-based caching enabled for all endpoints

## 📋 Response Format

All API responses follow a consistent structure:

### Success Response
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "sqlQuery": "/* executed SQL query for transparency */",
  "executionTime": 125
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "status": 400
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔍 Core Device Endpoints

### 1. Get Filter Options

Retrieves all available filter options for the search interface.

```http
GET /api/devices/filters
```

#### Headers
```
Accept: application/json
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "brands": [
      {
        "brand_id": 1,
        "brand_name": "Samsung"
      },
      {
        "brand_id": 2,
        "brand_name": "Apple"
      }
    ],
    "chipsets": [
      {
        "chipset_id": 1,
        "chipset_name": "Snapdragon 8 Gen 2"
      },
      {
        "chipset_id": 2,
        "chipset_name": "A16 Bionic"
      }
    ],
    "displayTypes": [
      {
        "display_type_id": 1,
        "display_type_name": "AMOLED"
      },
      {
        "display_type_id": 2,
        "display_type_name": "LCD"
      }
    ],
    "storageOptions": [64, 128, 256, 512, 1024],
    "priceRange": {
      "min": 99,
      "max": 1599
    }
  },
  "sqlQuery": "SELECT 'brands' as type, JSON_ARRAYAGG(JSON_OBJECT('brand_id', brand_id, 'brand_name', brand_name)) as options FROM brands UNION ALL ...",
  "executionTime": 45
}
```

#### Cache Information
- **TTL**: 10 minutes
- **Cache Key**: `filter-options:/filters`
- **Reason**: Filter options change infrequently

---

### 2. Search Phones

Search and filter phones based on multiple criteria with pagination.

```http
POST /api/devices/search
```

#### Headers
```
Content-Type: application/json
Accept: application/json
```

#### Request Body
```json
{
  "filters": {
    "brand": "Samsung",
    "chipset": "Snapdragon",
    "displayType": "AMOLED",
    "internalStorage": "256",
    "ramGb": 8,
    "batteryCapacity": 4000,
    "priceRange": {
      "min": 300,
      "max": 1000
    },
    "screenSize": {
      "min": 6.0,
      "max": 7.0
    }
  },
  "sortBy": "price_unofficial",
  "sortOrder": "asc",
  "page": 1,
  "limit": 20
}
```

#### Filter Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `brand` | string | Brand name (partial match) | `"Samsung"` |
| `chipset` | string | Chipset name (partial match) | `"Snapdragon"` |
| `displayType` | string | Display technology | `"AMOLED"` |
| `internalStorage` | string | Storage size in GB | `"256"` |
| `ramGb` | number | RAM size in GB | `8` |
| `batteryCapacity` | number | Battery capacity in mAh | `4000` |
| `priceRange` | object | Price filter | `{"min": 300, "max": 1000}` |
| `screenSize` | object | Screen size in inches | `{"min": 6.0, "max": 7.0}` |

#### Sorting Options

| Parameter | Values | Description |
|-----------|--------|-------------|
| `sortBy` | `price_unofficial`, `release_date`, `ram_gb`, `internal_storage_gb`, `screen_size` | Column to sort by |
| `sortOrder` | `asc`, `desc` | Sort direction |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "phones": [
      {
        "phone_id": 123,
        "brand_name": "Samsung",
        "model": "Galaxy S23",
        "price_unofficial": 799.99,
        "chipset_name": "Snapdragon 8 Gen 2",
        "ram_gb": 8,
        "internal_storage_gb": 256,
        "screen_size": "6.1",
        "display_type_name": "Dynamic AMOLED",
        "battery_capacity": "3900",
        "image_url": "https://example.com/galaxy-s23.jpg",
        "release_date": "2023-02-01",
        "status": "Available"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    },
    "filters": {
      "brand": "Samsung",
      "chipset": "Snapdragon",
      "priceRange": {"min": 300, "max": 1000}
    },
    "sorting": {
      "sortBy": "price_unofficial",
      "sortOrder": "asc"
    }
  },
  "sqlQuery": "SELECT DISTINCT p.phone_id, p.model, b.brand_name, ps.ram_gb, ps.internal_storage_gb, pr.price_unofficial, c.chipset_name, ds.screen_size, dt.display_type_name, ps.battery_capacity, p.image_url, p.release_date, p.status FROM phones p INNER JOIN brands b ON p.brand_id = b.brand_id LEFT JOIN phone_specifications ps ON p.phone_id = ps.phone_id LEFT JOIN chipsets c ON ps.chipset_id = c.chipset_id LEFT JOIN display_types dt ON ps.display_type_id = dt.display_type_id LEFT JOIN display_specifications ds ON p.phone_id = ds.phone_id LEFT JOIN phone_pricing pr ON p.phone_id = pr.phone_id WHERE b.brand_name LIKE ? AND c.chipset_name LIKE ? AND pr.price_unofficial BETWEEN ? AND ? ORDER BY pr.price_unofficial ASC LIMIT 20 OFFSET 0",
  "executionTime": 89
}
```

#### Validation Errors (400 Bad Request)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Page must be a positive integer",
    "status": 400
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Cache Information
- **TTL**: 5 minutes
- **Cache Key**: `search-results:<hash-of-request-body>`
- **Reason**: Search results can be cached temporarily for identical queries

---

### 3. Get All Devices

Retrieve all devices with pagination (no filtering applied).

```http
GET /api/devices?page=1&limit=20
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (min: 1) |
| `limit` | number | 20 | Items per page (min: 1, max: 100) |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "phone_id": 1,
        "brand_name": "Samsung",
        "model": "Galaxy S23 Ultra",
        "price_unofficial": 1199.99,
        "chipset_name": "Snapdragon 8 Gen 2",
        "ram_gb": 12,
        "internal_storage_gb": 512,
        "screen_size": "6.8",
        "display_type_name": "Dynamic AMOLED",
        "battery_capacity": "5000",
        "image_url": "https://example.com/s23-ultra.jpg",
        "release_date": "2023-02-01",
        "status": "Available"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2547,
      "totalPages": 128
    }
  },
  "sqlQuery": "SELECT DISTINCT p.phone_id, p.model, b.brand_name, ps.ram_gb, ps.internal_storage_gb, pr.price_unofficial, c.chipset_name, ds.screen_size, dt.display_type_name, ps.battery_capacity, p.image_url, p.release_date, p.status FROM phones p INNER JOIN brands b ON p.brand_id = b.brand_id LEFT JOIN phone_specifications ps ON p.phone_id = ps.phone_id LEFT JOIN chipsets c ON ps.chipset_id = c.chipset_id LEFT JOIN display_types dt ON ps.display_type_id = dt.display_type_id LEFT JOIN display_specifications ds ON p.phone_id = ds.phone_id LEFT JOIN phone_pricing pr ON p.phone_id = pr.phone_id ORDER BY p.phone_id ASC LIMIT 20 OFFSET 0",
  "executionTime": 45
}
```

---

### 4. Get Phone Details

Retrieve comprehensive details for a specific phone by ID.

```http
GET /api/devices/{id}
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Phone ID (positive integer) |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "phone": {
      "phone_id": 123,
      "brand_name": "Samsung",
      "model": "Galaxy S23",
      "device_type": "Smartphone",
      "release_date": "2023-02-01",
      "status": "Available",
      "image_url": "https://example.com/galaxy-s23.jpg",
      
      // Technical Specifications
      "chipset_name": "Snapdragon 8 Gen 2",
      "architecture": "4 nm",
      "cpu": "1x3.36 GHz Cortex-X3 & 2x2.8 GHz Cortex-A715 & 2x2.8 GHz Cortex-A710 & 3x2.0 GHz Cortex-A510",
      "gpu": "Adreno 740",
      "os_name": "Android",
      "os_version": "13, One UI 5.1",
      
      // Memory & Storage
      "ram_gb": 8,
      "ram_type_name": "LPDDR5X",
      "internal_storage_gb": 256,
      "storage_type_name": "UFS 4.0",
      "expandable_memory": false,
      
      // Display
      "screen_size": "6.1",
      "resolution": "1080 x 2340 pixels",
      "pixel_density": 425,
      "refresh_rate": 120,
      "brightness": 1750,
      "display_type_name": "Dynamic AMOLED 2X",
      "aspect_ratio": "19.5:9",
      "screen_protection": "Corning Gorilla Glass Victus 2",
      
      // Physical
      "height": 146.3,
      "width": 70.9,
      "thickness": 7.6,
      "weight": "168",
      "ip_rating": "IP68",
      
      // Camera
      "primary_camera_resolution": "50 MP, f/1.8, 24mm (wide), 1/1.56\", 1.0µm, multi-directional PDAF, OIS",
      "primary_camera_features": "LED flash, auto-HDR, panorama",
      "video": "8K@24/30fps, 4K@30/60fps, 1080p@30/60/240fps, 720p@960fps, HDR10+, stereo sound rec., gyro-EIS",
      
      // Battery & Charging
      "battery_capacity": "3900",
      "quick_charging": "25W wired, 15W wireless, 4.5W reverse wireless",
      
      // Connectivity
      "network": "GSM / CDMA / HSPA / EVDO / LTE / 5G",
      "bluetooth_version": "5.3, A2DP, LE",
      "wlan": "Wi-Fi 802.11 a/b/g/n/ac/6e, dual band, Wi-Fi Direct",
      "usb": "USB Type-C 3.2, USB On-The-Go",
      
      // Audio
      "audio_jack": "No",
      "loudspeaker": true,
      
      // Additional Features
      "features": "Fingerprint (under display, ultrasonic), accelerometer, gyro, proximity, compass, barometer",
      "face_unlock": true,
      "gps": "GPS, GLONASS, BDS, GALILEO",
      
      // Colors & Pricing
      "colors": ["Phantom Black", "Cream", "Green", "Lavender"],
      "pricing_variants": [
        {
          "pricing_id": 456,
          "price_official": 799.99,
          "price_unofficial": 729.99,
          "price_old": 899.99,
          "price_savings": 170.00,
          "variant_description": "128GB",
          "price_updated": "2024-01-15"
        },
        {
          "pricing_id": 457,
          "price_official": 899.99,
          "price_unofficial": 829.99,
          "price_old": 999.99,
          "price_savings": 170.00,
          "variant_description": "256GB",
          "price_updated": "2024-01-15"
        }
      ]
    }
  },
  "sqlQuery": "SELECT p.phone_id, p.model, p.device_type, p.release_date, p.status, p.image_url, b.brand_name, c.chipset_name, c.architecture, c.fabrication, ps.cpu, ps.cpu_cores, ps.gpu, os.os_name, os.os_version, os.user_interface, ps.ram_gb, rt.ram_type_name, ps.internal_storage_gb, st.storage_type_name, ps.expandable_memory, ps.battery_capacity, ps.quick_charging, ps.bluetooth_version, ps.network, ps.wlan, ps.usb, ps.usb_otg, ps.usb_type_c, ds.screen_size, ds.resolution, ds.pixel_density, ds.refresh_rate, ds.brightness, dt.display_type_name, ds.aspect_ratio, ds.screen_protection, ds.screen_to_body_ratio, ds.touch_screen, ds.notch, ds.edge, phys.height, phys.width, phys.thickness, phys.weight, phys.ip_rating, phys.waterproof, phys.ruggedness, cs.primary_camera_resolution, cs.primary_camera_features, cs.primary_camera_autofocus, cs.primary_camera_flash, cs.primary_camera_image_resolution, cs.video, af.audio_jack, af.loudspeaker, feat.features, feat.face_unlock, feat.gps, feat.gprs, feat.volte, feat.sim_size, feat.sim_slot, feat.speed FROM phones p LEFT JOIN brands b ON p.brand_id = b.brand_id LEFT JOIN phone_specifications ps ON p.phone_id = ps.phone_id LEFT JOIN chipsets c ON ps.chipset_id = c.chipset_id LEFT JOIN operating_systems os ON ps.os_id = os.os_id LEFT JOIN display_types dt ON ps.display_type_id = dt.display_type_id LEFT JOIN storage_types st ON ps.storage_type_id = st.storage_type_id LEFT JOIN ram_types rt ON ps.ram_type_id = rt.ram_type_id LEFT JOIN display_specifications ds ON p.phone_id = ds.phone_id LEFT JOIN physical_specifications phys ON p.phone_id = phys.phone_id LEFT JOIN camera_specifications cs ON p.phone_id = cs.phone_id LEFT JOIN audio_features af ON p.phone_id = af.phone_id LEFT JOIN additional_features feat ON p.phone_id = feat.phone_id WHERE p.phone_id = ?",
  "executionTime": 67
}
```

#### Not Found Error (404)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Phone with ID 999999 not found",
    "status": 404
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Cache Information
- **TTL**: 15 minutes
- **Cache Key**: `phone-details:{id}`
- **Reason**: Phone details rarely change, can be cached longer

---

## 🏥 System Health Endpoints

### Health Check

Monitor server and database health status.

```http
GET /health
```

#### Response (200 OK)
```json
{
  "success": true,
  "status": "OK",
  "message": "Server is running",
  "services": {
    "database": {
      "status": "Connected",
      "responseTime": "2ms",
      "pool": {
        "totalConnections": 10,
        "activeConnections": 2,
        "freeConnections": 8,
        "pendingConnections": 0
      }
    },
    "server": {
      "status": "Running",
      "uptime": 3600.45,
      "memory": {
        "rss": 67108864,
        "heapTotal": 41943040,
        "heapUsed": 28123456,
        "external": 1234567,
        "arrayBuffers": 12345
      },
      "nodeVersion": "v18.17.0"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Service Unavailable (503)
```json
{
  "success": false,
  "status": "ERROR",
  "message": "Database connection failed",
  "error": "Connection timeout after 30000ms",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 📊 Cache Management Endpoints

### Cache Statistics

Get current cache performance metrics.

```http
GET /api/cache/stats
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "cache": {
      "totalKeys": 45,
      "maxSize": 1000,
      "hitRate": 78.5,
      "totalHits": 1245,
      "totalMisses": 340,
      "totalRequests": 1585,
      "oldestEntry": "2024-01-15T09:15:00.000Z",
      "newestEntry": "2024-01-15T10:25:00.000Z"
    },
    "endpoints": {
      "filter-options": {
        "hits": 456,
        "misses": 12,
        "hitRate": 97.4,
        "avgTtl": 580000
      },
      "search-results": {
        "hits": 689,
        "misses": 234,
        "hitRate": 74.6,
        "avgTtl": 280000
      },
      "phone-details": {
        "hits": 100,
        "misses": 94,
        "hitRate": 51.5,
        "avgTtl": 850000
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Clear Cache

Clear all cached data (useful for development/debugging).

```http
POST /api/cache/clear
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Cache cleared successfully",
  "data": {
    "clearedKeys": 45,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 📋 API Information

Get general API information and available endpoints.

```http
GET /api
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Mobile Phone Recommendation API",
  "version": "1.0.0",
  "endpoints": {
    "GET /api/devices": "Get all devices with pagination",
    "GET /api/devices/filters": "Get filter options",
    "POST /api/devices/search": "Search devices with filters",
    "GET /api/devices/:id": "Get device details by ID"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## ⚠️ Error Handling

### Error Types

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `NOT_FOUND` | 404 | Resource not found |
| `DATABASE_ERROR` | 500 | Database connection/query error |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |
| `ROUTE_NOT_FOUND` | 404 | API endpoint not found |

### Common Validation Rules

#### Pagination
- `page`: Must be positive integer ≥ 1
- `limit`: Must be positive integer between 1 and 100

#### Phone ID
- Must be positive integer ≥ 1
- Non-existent IDs return 404 error

#### Search Filters
- String filters: Trimmed automatically, empty strings ignored
- Numeric filters: Must be valid numbers
- Price ranges: `min` and `max` must be positive numbers
- Sort order: Must be "asc" or "desc"

### Error Response Examples

#### Invalid Pagination
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Limit must be a positive integer between 1 and 100",
    "status": 400
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Database Connection Error
```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Failed to execute query",
    "status": 500
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Route Not Found
```json
{
  "success": false,
  "error": {
    "code": "ROUTE_NOT_FOUND",
    "message": "Route GET /api/invalid not found",
    "status": 404,
    "availableEndpoints": [
      "GET /",
      "GET /health",
      "GET /api",
      "GET /api/devices",
      "GET /api/devices/filters",
      "POST /api/devices/search",
      "GET /api/devices/:id"
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🚀 Performance Considerations

### Database Query Optimization
- All queries use proper JOIN operations across normalized tables
- Indexes are strategically placed on frequently queried columns
- Query execution times are monitored and logged
- Connection pooling prevents connection exhaustion

### Caching Strategy
- **Filter Options**: 10-minute TTL (data changes infrequently)
- **Search Results**: 5-minute TTL (balance between freshness and performance)
- **Phone Details**: 15-minute TTL (detailed data rarely changes)
- **Cache Keys**: Hashed request parameters for consistent caching

### Response Time Targets
- Filter options: < 50ms (cached)
- Search queries: < 100ms (with indexes)
- Phone details: < 75ms (cached)
- Health check: < 5ms

### Scalability Features
- Connection pooling with configurable limits
- Efficient pagination to handle large datasets
- SQL query optimization with EXPLAIN analysis
- Memory-efficient result processing

---

## 📝 Usage Examples

### JavaScript/Fetch
```javascript
// Search for Samsung phones under $800
const searchPhones = async () => {
  const response = await fetch('http://localhost:3001/api/devices/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filters: {
        brand: 'Samsung',
        priceRange: { min: 0, max: 800 }
      },
      sortBy: 'price_unofficial',
      sortOrder: 'asc',
      page: 1,
      limit: 10
    })
  });
  
  const data = await response.json();
  console.log(data.data.phones);
};
```

### cURL Examples
```bash
# Get filter options
curl -X GET "http://localhost:3001/api/devices/filters"

# Search with filters
curl -X POST "http://localhost:3001/api/devices/search" \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "brand": "Apple",
      "ramGb": 8
    },
    "page": 1,
    "limit": 5
  }'

# Get phone details
curl -X GET "http://localhost:3001/api/devices/123"

# Check health
curl -X GET "http://localhost:3001/health"
```

---

## 🔧 Development Notes

### SQL Query Visibility
All endpoints return the executed SQL query in the response for educational purposes. This helps understand how the normalized database structure is queried.

### Cache Headers
Responses include cache-related headers:
- `X-Cache`: "HIT" or "MISS"
- `X-Cache-Key`: Cache key used
- `X-Cache-TTL`: Remaining TTL in seconds

### Database Connection Pool
The API uses MySQL connection pooling with the following configuration:
- **Connection Limit**: 10 concurrent connections
- **Acquire Timeout**: 60 seconds
- **Idle Timeout**: 60 seconds
- **Reconnect**: Enabled for connection recovery

This API serves as both a functional backend and an educational tool for understanding normalized database design and modern web API development practices.