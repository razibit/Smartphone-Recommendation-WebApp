# Contributing

Thank you for improving PhoneDB. Keep changes focused on the catalogue product,
preserve the existing Next.js, Express, TypeScript, and MySQL boundaries, and
update the relevant documentation when behavior or configuration changes.

## Before changing code

Read the root README and the architecture, API, and database guides. Inspect
the affected frontend route, API controller, query builder, migration, or
seeder before editing it. Avoid adding a dependency when the existing stack
already provides the required capability.

## Local workflow

From mobile-phone-app:

~~~powershell
npm install
npm run typecheck
npm run lint
npm test
npm run build
~~~

Database-backed changes also require a disposable local MySQL database. Apply
migrations and seed a small controlled sample before exercising the affected
API flow. Never use a production database for local reset or seed operations.

## Implementation standards

- Keep request validation at the API boundary.
- Use parameterized SQL and an explicit allowlist for dynamic SQL fragments.
- Keep database access behind the shared connection and query builder.
- Preserve stable response envelopes and request IDs.
- Do not log credentials, SQL parameters, or raw request bodies.
- Add a migration for schema changes; do not edit an applied migration.
- Keep development-only diagnostics visibly disabled in production.
- Add or update tests for changed behavior.
- Keep UI states accessible, keyboard usable, and responsive.

## Documentation

Update README or the focused guide when a command, environment variable,
endpoint, migration behavior, or runtime assumption changes. Document
limitations plainly instead of implying unsupported capabilities.
