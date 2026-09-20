# PhoneDB application package

This directory contains the runnable Next.js frontend and TypeScript Express
API for PhoneDB. The canonical product and setup documentation lives in the
repository root:

- [Project README](../README.md)
- [Architecture](../docs/architecture.md)
- [API reference](../docs/api.md)
- [Database guide](../docs/database.md)
- [Operations guide](../docs/operations.md)

## Quick start

~~~powershell
Copy-Item .env.example .env.local
npm install
npm run db:setup
~~~

Start the API and frontend in separate terminals:

~~~powershell
npm run backend
npm run dev
~~~

Run the local checks with:

~~~powershell
npm run verify
~~~

The API requires DB_USER, DB_PASSWORD, and DB_NAME. The example configuration
is safe to copy but must be reviewed before use.
