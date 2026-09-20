# Architecture

PhoneDB is a two-process web application with MySQL as its persistence layer.
The frontend and API are intentionally kept as separate runtime boundaries so
each can be developed, tested, and operated independently.

## Runtime components

### Web application

The Next.js application in mobile-phone-app/src provides:

- catalogue search and filter controls;
- paginated phone cards;
- a device details modal;
- a URL-addressable comparison workspace;
- responsive navigation and error states.

The browser client in src/lib/api/client.ts owns the API base URL, request
timeouts, bounded retries for safe reads, and typed response envelopes. It does
not contain database logic.

### API service

The Express application in mobile-phone-app/backend provides:

- configuration loading and validation;
- request IDs and structured request logging;
- CORS and security response headers;
- bounded JSON and URL-encoded request bodies;
- strict path, pagination, filter, and sort validation;
- device, filter-option, details, and health endpoints;
- consistent error responses;
- graceful shutdown.

server.ts exposes createApp for tests and startServer for the real process.
DatabaseConnection creates the single shared MySQL pool used by the route
controllers.

### Database lifecycle

Migrations are applied by MigrationRunner before the API is considered ready.
CSVSeeder reads the configured source file and processes each valid device in a
transaction. Lookup tables are cached per run and device-specific collections
are replaced idempotently.

## Request and data flow

~~~text
Browser
  │
  │ typed HTTP request
  ▼
Next.js API client
  │
  ▼
Express middleware
  ├─ request ID and access log
  ├─ CORS, security headers, body limits
  └─ route validation
       │
       ▼
DeviceController
  │ parses filters and pagination
  ▼
QueryBuilder
  │ parameterized SQL and allowlisted sorting
  ▼
Shared MySQL pool
  │
  ▼
Normalized catalogue tables
~~~

Search and count queries share the same filter builder. The list query returns a
deterministic order and the count query uses distinct phone IDs, so pagination
metadata remains aligned with the result set. Pricing rows are aggregated to
one browse record per phone; complete variants remain available from the
details endpoint.

## Configuration boundary

Runtime configuration is loaded once at process startup. Required database
credentials are never supplied by source-code defaults. The frontend only
receives the public API URL. Query diagnostics are disabled by default and
cannot be enabled when NODE_ENV is production.

## Deliberate boundaries

The application is read-focused. It has no authentication layer, write API,
background job system, or external commerce integration. Adding those
capabilities would require an explicit product and security design rather than
being inferred from the current catalogue routes.
