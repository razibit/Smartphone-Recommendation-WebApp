# API reference

The API listens on PORT, which defaults to 3001. All application responses are
JSON. Requests receive an X-Request-ID response header and a requestId field in
the response metadata or error envelope.

## Health and service metadata

### GET /health/live

Returns HTTP 200 when the process is running. It does not require MySQL.

### GET /health/ready

Returns HTTP 200 only when the configured MySQL connection responds to a
health query. It returns HTTP 503 with status not_ready when the database is
unavailable.

### GET /health

Returns the legacy health shape with database status and safe pool metadata.
Use /health/ready for readiness checks.

### GET /api

Returns the supported application routes.

## Device routes

### GET /api/devices

Returns a paginated list using optional query parameters:

| Parameter | Default | Notes |
| --- | --- | --- |
| page | 1 | Positive integer |
| limit | 20 | Positive integer bounded by MAX_PAGE_SIZE |
| sortBy | p.phone_id | Must be one of the allowlisted sort fields |
| sortOrder | asc | asc or desc |

The response shape is:

~~~json
{
  "success": true,
  "data": {
    "devices": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "meta": {
    "requestId": "request-id"
  }
}
~~~

### GET /api/devices/filters

Returns the current values available for the filter controls:

~~~json
{
  "success": true,
  "data": {
    "brands": [],
    "chipsets": [],
    "displayTypes": [],
    "storageOptions": [],
    "priceRange": { "min": 0, "max": 0 }
  },
  "meta": { "requestId": "request-id" }
}
~~~

### POST /api/devices/search

Requires Content-Type application/json. The request body is:

~~~json
{
  "filters": {
    "brand": "Example",
    "chipset": "Example chipset",
    "displayType": "AMOLED",
    "internalStorage": 128,
    "ramGb": 8,
    "batteryCapacity": 4000,
    "screenSize": { "min": 6, "max": 7 },
    "priceRange": { "min": 300, "max": 1000 }
  },
  "sortBy": "p.phone_id",
  "sortOrder": "asc",
  "page": 1,
  "limit": 20
}
~~~

All filter values are optional. Range minima cannot exceed maxima. Numeric
values must be non-negative, and page and limit are positive integers.

The response stores matching records under data.phones and includes filters,
sorting, and pagination metadata. The list query aggregates pricing to one
record per phone; pricing variants are returned by the details endpoint.

### GET /api/devices/:id

The ID must be a positive decimal integer. The response stores one record under
data.phone and includes colors and pricing_variants when present.

## Diagnostics

When EXPOSE_QUERY_DIAGNOSTICS=true in a non-production process, successful
search and details responses include meta.diagnostics with the generated
parameterized SQL text, measured database execution time, and result count.
Diagnostics are omitted by default and are always omitted in production.
Parameter values are not logged or returned.

## Error envelope

Validation, not-found, database, and unexpected failures use a consistent
shape:

~~~json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "limit must be between 1 and 100",
    "status": 400
  },
  "requestId": "request-id"
}
~~~

Internal database details are not exposed through this envelope. Request IDs
should be included when reporting an operational failure.
