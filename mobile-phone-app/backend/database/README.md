# Mobile Phone Database - Schema and Seeding

## Overview

This directory contains the database schema, migration scripts, and seeding functionality for the Mobile Phone Recommendation System. The database follows a normalized design (3NF/BCNF) with 15 interconnected tables.

## Database Structure

### Normalized Schema (3NF/BCNF Compliant)

The database transforms a flat CSV with 67+ columns into 15 normalized tables:

#### Core Entity Tables
- **brands** - Eliminates brand name redundancy
- **phones** - Main entity with core device information

#### Lookup Tables (3NF Compliant)
- **chipsets** - Processor information with architecture and fabrication
- **operating_systems** - OS details with version and UI interface
- **display_types** - Display technology categories
- **storage_types** - Storage technology specifications
- **ram_types** - Memory technology specifications

#### Specification Tables (BCNF Compliant)
- **phone_specifications** - Technical specs (CPU, RAM, storage, battery, connectivity)
- **display_specifications** - Screen-related attributes
- **physical_specifications** - Dimensions and durability
- **camera_specifications** - Camera and video capabilities
- **audio_features** - Audio jack and speaker information
- **additional_features** - Miscellaneous features (GPS, sensors, SIM)

#### Relationship Tables
- **phone_colors** - Many-to-many relationship for device colors
- **phone_pricing** - Multiple price variants per device

## Files Structure

```
backend/database/
├── connection.ts           # Database connection pool management
├── migrate.ts             # Migration runner with CLI interface
├── seed.ts               # CSV seeding script with CLI interface
├── README.md             # This documentation
├── migrations/           # Database schema migrations
│   ├── 001_create_schema.sql    # Initial schema creation
│   └── 002_fix_column_sizes.sql # Column size adjustments
└── seeders/
    └── csvSeeder.ts      # CSV data import functionality
```

## Usage

### Database Migration

```bash
# Run all pending migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback
```

### Data Seeding

```bash
# Seed all data from CSV
npm run seed

# Seed limited number of records (for testing)
npm run seed -- ../phones_data_20250729_181901.csv 100

# Complete database setup (migrate + seed)
npm run db:setup
```

## Migration System

The migration system provides:
- **Version Control**: Tracks executed migrations in `migrations` table
- **Rollback Support**: Can rollback the last migration
- **SQL Statement Parsing**: Handles complex SQL files with multiple statements
- **Error Handling**: Graceful failure handling with detailed error messages

### Creating New Migrations

1. Create a new SQL file in `migrations/` with format: `XXX_description.sql`
2. Run `npm run migrate` to execute pending migrations

## CSV Seeding System

The CSV seeder provides:
- **Batch Processing**: Processes data in configurable batches (default: 50 records)
- **Lookup Caching**: Caches foreign key lookups for performance
- **Data Validation**: Parses and validates data types before insertion
- **Error Resilience**: Continues processing even if individual records fail
- **Duplicate Handling**: Uses `ON DUPLICATE KEY UPDATE` for idempotent operations

### Data Processing Features

- **Date Parsing**: Handles various date formats from CSV
- **Boolean Conversion**: Converts string values to boolean flags
- **Numeric Parsing**: Extracts numeric values from formatted strings
- **Color Processing**: Splits comma-separated color lists
- **Price Handling**: Processes multiple price variants

## Database Indexes

Performance indexes are created on:
- **Foreign Keys**: All foreign key columns
- **Search Columns**: Brand, RAM, storage, price
- **Date Columns**: Release dates for temporal queries
- **Size Columns**: Screen size for range queries

## Normalization Benefits

1. **Data Integrity**: Foreign key constraints prevent invalid data
2. **Storage Efficiency**: Eliminates redundant brand names, chipset details
3. **Consistency**: Single source of truth for each data element
4. **Scalability**: Easy to add new phones without data duplication
5. **Query Flexibility**: Complex joins enable sophisticated filtering
6. **Maintenance**: Updates to brand info only need single table change

## Sample Queries

```sql
-- Get phone specs with brand info
SELECT p.model, b.brand_name, ps.ram_gb, ps.internal_storage_gb, ps.battery_capacity 
FROM phones p 
JOIN brands b ON p.brand_id = b.brand_id 
JOIN phone_specifications ps ON p.phone_id = ps.phone_id;

-- Get phone colors and pricing
SELECT p.model, GROUP_CONCAT(pc.color_name) as colors, pp.price_unofficial 
FROM phones p 
LEFT JOIN phone_colors pc ON p.phone_id = pc.phone_id 
LEFT JOIN phone_pricing pp ON p.phone_id = pp.phone_id 
GROUP BY p.phone_id, pp.pricing_id;

-- Filter phones by specifications
SELECT p.model, b.brand_name, ps.ram_gb, ps.internal_storage_gb
FROM phones p
JOIN brands b ON p.brand_id = b.brand_id
JOIN phone_specifications ps ON p.phone_id = ps.phone_id
WHERE ps.ram_gb >= 8 AND ps.internal_storage_gb >= 128;
```

## Environment Configuration

Required environment variables in `.env.local`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mobile_specs
```

## Current Database Status

After successful setup:
- **257 phones** imported from CSV
- **30 brands** normalized and indexed
- **81 chipsets** with architecture details
- **15 tables** with proper relationships and constraints
- **Multiple indexes** for optimal query performance

## Troubleshooting

### Common Issues

1. **Column Size Errors**: Some CSV data may exceed column limits
   - Solution: Run migration 002_fix_column_sizes.sql

2. **Connection Errors**: Database connection failures
   - Check MySQL server is running
   - Verify credentials in .env.local

3. **Migration Failures**: SQL syntax or permission errors
   - Check MySQL user has CREATE/ALTER permissions
   - Verify SQL syntax in migration files

4. **Seeding Errors**: CSV parsing or data type issues
   - Check CSV file path and format
   - Review error logs for specific data issues

### Performance Optimization

- Use appropriate batch sizes for seeding (default: 50)
- Monitor query execution times in logs
- Add additional indexes for specific query patterns
- Consider partitioning for very large datasets

## Future Enhancements

- **Data Validation**: Add more comprehensive data validation rules
- **Backup System**: Automated database backup before migrations
- **Monitoring**: Query performance monitoring and optimization
- **Caching**: Redis caching layer for frequently accessed data
- **API Integration**: Direct integration with phone specification APIs