# PhoneDB

PhoneDB is a searchable mobile phone catalogue backed by MySQL. It helps people
research device specifications, narrow a catalogue with structured filters,
inspect detailed records, and compare up to four phones side by side.

The repository contains a Next.js frontend and a TypeScript Express API. The API
owns request validation, query construction, database access, health checks, and
development-only query diagnostics. MySQL remains the source of persisted
catalogue data.

## Capabilities

- Filter phones by brand, chipset, display type, storage, RAM, battery, screen
  size, and price.
- Browse deterministic, paginated results.
- Open a detailed device view with specifications, colors, and pricing variants.
- Select up to four devices for a responsive comparison workspace.
- Expose generated SQL and measured query timing only when explicitly enabled in
  a non-production API process.
- Seed a local MySQL database from the tracked CSV dataset with idempotent
  upserts and transactional row processing.

## Technology

- Next.js 16, React 19, and TypeScript
- Express 4 and TypeScript
- MySQL with mysql2
- Tailwind CSS 4
- Node.js 20.19 or newer

## Repository layout

~~~text
.
├── data/                         # Seed data used by the local database setup
├── docs/                         # Architecture, API, database, and operations guides
├── mobile-phone-app/
│   ├── backend/                  # Express app, configuration, migrations, and seeder
│   ├── src/                      # Next.js app and shared client types
│   ├── tests/                    # Unit and integration tests
│   ├── .env.example              # Safe local configuration template
│   └── package.json              # Frontend/backend scripts
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md
~~~

## Local setup

### Prerequisites

Install Node.js 20.19+ and a local MySQL server. The API expects a database
account with permission to create the configured database during first-time
setup. Use a disposable local database for development and verification.

### Configure

From the repository root:

~~~powershell
Copy-Item mobile-phone-app/.env.example mobile-phone-app/.env.local
~~~

Edit mobile-phone-app/.env.local and set DB_USER, DB_PASSWORD, and DB_NAME. The
example uses phonedb as the local database name. Keep the local environment file
private; it is ignored by Git.

### Install and initialize

~~~powershell
Set-Location mobile-phone-app
npm install
npm run db:setup
~~~

db:setup applies forward-only migrations and seeds the configured CSV file. The
default seed path is data/phones.csv relative to the repository root. A
different file can be passed to npm run seed -- <path> [limit].

### Run the services

Use separate terminals:

~~~powershell
# Terminal 1
Set-Location mobile-phone-app
npm run backend

# Terminal 2
Set-Location mobile-phone-app
npm run dev
~~~

The frontend is served at http://localhost:3000 and the API at
http://localhost:3001. The API root and health endpoints are useful for a quick
check:

~~~powershell
Invoke-RestMethod http://localhost:3001/health/live
Invoke-RestMethod http://localhost:3001/health/ready
~~~

## Development commands

Run commands from mobile-phone-app:

| Command | Purpose |
| --- | --- |
| npm run dev | Start the Next.js development server |
| npm run backend:dev | Start the API with TypeScript watch mode |
| npm run typecheck | Run the TypeScript compiler without emitting files |
| npm run lint | Run ESLint with warnings treated as failures |
| npm test | Run the unit test suite |
| npm run test:integration | Run MySQL integration tests when configured |
| npm run build | Create the production frontend build |
| npm run verify | Run typecheck, lint, tests, and the production build |
| npm run migrate:status | Show applied and pending migrations |
| npm run db:reset:dev | Recreate the configured non-production database after --confirm |

The reset command refuses to run with NODE_ENV=production and requires an
explicit confirmation flag. It is intended only for a disposable development
database.

## Configuration

The complete configuration reference is in
[docs/operations.md](docs/operations.md). The most important values are:

- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME
- PORT and FRONTEND_URL
- NEXT_PUBLIC_API_URL
- MAX_PAGE_SIZE and BODY_LIMIT
- EXPOSE_QUERY_DIAGNOSTICS, which defaults to false and is ignored in
  production

## Architecture and API

- [Architecture](docs/architecture.md) — components and request/data flow
- [API reference](docs/api.md) — endpoints, request validation, and response shapes
- [Database guide](docs/database.md) — schema ownership, migrations, and seeding
- [Operations guide](docs/operations.md) — configuration, health checks, and safe runtime practices
- [Contribution guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## Product boundaries

The repository currently provides a read-focused catalogue, comparison UI,
database migrations, and CSV seeding. It does not include user accounts,
administration workflows, device editing endpoints, or live commerce
integrations. Those boundaries are intentional and should not be inferred from
the catalogue UI.

## Verification status

The verification commands above are the source of truth for local checks. A
working MySQL service is required for migration, seed, API readiness, and
end-to-end data-flow verification. When that prerequisite is unavailable,
static checks and frontend error states can still be verified, but database
results must not be replaced with mock data.
