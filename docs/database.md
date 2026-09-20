# Database guide

PhoneDB uses MySQL and a normalized catalogue schema. The schema is owned by
the SQL files in mobile-phone-app/backend/database/migrations. The root-level
SQL files and historical analysis files are not runtime inputs.

## Schema responsibilities

The schema separates the phone identity and shared lookup values from
device-specific specifications:

- phones and brands identify a device;
- chipsets, operating_systems, display_types, storage_types, and ram_types are
  reusable lookup tables;
- phone_specifications stores performance, platform, and connectivity values;
- display_specifications, physical_specifications, and
  camera_specifications store physical and imaging details;
- audio_features and additional_features store optional feature groups;
- phone_colors and phone_pricing store one-to-many device collections.

The API joins these tables for list and detail views. Details use separate
queries for colors and pricing variants so a device is not duplicated by its
one-to-many rows.

## Migrations

Migration files are applied lexicographically and recorded in the migrations
table with a SHA-256 checksum. Already-applied files are not rerun. A changed
checksum stops the process so schema drift is visible.

The current repository repairs several historical migration files so fresh
databases no longer depend on a fixed database name or unsupported SQL. A
database that recorded checksums for the pre-repair files will therefore stop
with a checksum mismatch. Review that migration history and use a separately
approved reconciliation or disposable rebuild; the runner never rewrites
checksums automatically.

Migrations are forward-only. The database cleaner is intentionally separate
from the migration runner and refuses to operate in production or without the
explicit --confirm flag.

Current migration responsibilities include:

1. create the base schema;
2. correct column sizes and data types;
3. add supported query indexes;
4. refine resolution, range, and optional-column definitions;
5. add one-to-one uniqueness constraints and unique pricing variants.

Migration 011 can fail on an existing database that already contains duplicate
one-to-one rows or duplicate phone/variant pairs. Resolve those duplicates
through a reviewed data operation before applying the constraint; the migration
does not delete data silently.

Check state with:

~~~powershell
Set-Location mobile-phone-app
npm run migrate:status
npm run migrate
~~~

## Seed data

The default source is data/phones.csv. SEED_FILE can point to another CSV.
The seeder:

- validates the presence of a brand and model;
- normalizes numeric, date, timestamp, boolean, and status values;
- caches lookup-table IDs for the run;
- upserts the phone identity and one-to-one specification groups;
- replaces colors and pricing rows inside the same device transaction;
- preserves valid pricing variants;
- reports row-level failures after processing.

Rows are keyed by normalized brand and model, so rerunning the same source is
idempotent for the catalogue records it contains. A numeric row limit is
available for a controlled local smoke run:

~~~powershell
npm run seed -- ../data/phones.csv 25
~~~

## Database safety

Use a separate local database account and database name for development. Do not
point db:reset:dev or db:clean at a production server. Never place credentials
in source files, SQL fixtures, or documentation.

The runtime pool uses a bounded connection limit, parameterized statements, and
utf8mb4. Query errors are logged with request context and duration, but SQL
parameters are not written to logs.
