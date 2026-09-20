# Operations guide

This document describes the supported local and process-level operating model.
The repository does not prescribe a container or hosting platform.

## Configuration

Copy mobile-phone-app/.env.example to .env.local for local work. The API loads
configuration at startup and fails fast when required database values are
missing.

| Variable | Default | Purpose |
| --- | --- | --- |
| NODE_ENV | development | development, test, or production |
| PORT | 3001 | Express listen port |
| FRONTEND_URL | http://localhost:3000 | Comma-separated CORS allowlist |
| TRUST_PROXY | false | Enable only behind a known trusted proxy |
| BODY_LIMIT | 1mb | JSON and URL-encoded body limit |
| MAX_PAGE_SIZE | 100 | Maximum API page size |
| EXPOSE_QUERY_DIAGNOSTICS | false | Development-only SQL and timing metadata |
| DB_HOST | localhost | MySQL host |
| DB_PORT | 3306 | MySQL port |
| DB_USER | required | MySQL username |
| DB_PASSWORD | required | MySQL password |
| DB_NAME | required | MySQL database name |
| DB_CONNECTION_LIMIT | 10 | Shared pool size |
| DB_SSL | false | Enable certificate-verifying MySQL TLS |
| SEED_FILE | data/phones.csv | CSV seed path |
| NEXT_PUBLIC_API_URL | http://localhost:3001/api | Browser API base URL |
| LOG_LEVEL | info | Minimum severity emitted by the structured logger |

EXPOSE_QUERY_DIAGNOSTICS is forced off when NODE_ENV=production. Keep database
credentials and local environment files outside source control.

## Process lifecycle

Start the API only after migrations have been applied:

~~~text
configuration -> MySQL connection -> HTTP listener -> readiness
~~~

The API does not begin listening when the initial database connection fails.
SIGINT and SIGTERM stop accepting new connections, wait for the HTTP server to
close, and then close the shared MySQL pool.

## Health checks

- /health/live verifies that the Node process is responding.
- /health/ready verifies the MySQL dependency.
- /health provides a backwards-compatible status shape and bounded pool facts.

Use liveness for process supervision and readiness for traffic decisions. A
ready response is not a statement about data freshness.

## Logging and diagnostics

The logger emits structured JSON records with level, timestamp, message, and
context. HTTP records include request ID, method, route, status, duration, and
user agent. Database failures include safe error codes and duration, never raw
SQL or parameter values.

Query diagnostics are an opt-in development response feature. They are not
application logs and are not enabled in production.

## Safe maintenance

Before applying migrations, review pending files and take a database backup
appropriate to the environment. Migration checksums stop accidental edits to
applied files.

The database cleaner drops and recreates only the configured database and
requires --confirm. It is blocked in production. Use it only against a
disposable local database:

~~~powershell
npm run db:reset:dev
~~~

## Release checklist

1. Provide all required environment variables through the runtime secret
   mechanism.
2. Keep EXPOSE_QUERY_DIAGNOSTICS disabled.
3. Apply migrations and check migration status.
4. Run typecheck, lint, unit tests, and the production build.
5. Verify /health/live and /health/ready.
6. Review logs for startup, migration, and database errors.
7. Confirm the frontend API URL and CORS allowlist match the actual origins.
