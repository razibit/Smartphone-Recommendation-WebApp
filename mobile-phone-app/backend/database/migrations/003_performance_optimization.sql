-- Mobile Specs Database - Performance Optimization
-- Migration: 003_performance_optimization
-- Description: Add comprehensive indexes and query optimizations for better performance

USE mobile_specs;
-- =====================================
-- COMPOSITE INDEXES FOR FILTER QUERIES
-- =====================================

-- Main filter query optimization (brand + specs)
CREATE INDEX idx_phones_brand_status ON phones(brand_id, status, release_date);

-- Phone specifications - most common filter combinations
CREATE INDEX idx_phone_specs_filter ON phone_specifications(phone_id, ram_gb, internal_storage_gb, battery_capacity);
CREATE INDEX idx_phone_specs_chipset ON phone_specifications(chipset_id, ram_gb, internal_storage_gb);
CREATE INDEX idx_phone_specs_display ON phone_specifications(display_type_id, phone_id);

-- Display specifications for screen size filtering
CREATE INDEX idx_display_specs_size ON display_specifications(phone_id, screen_size);

-- Pricing table optimization for price range filtering
CREATE INDEX idx_phone_pricing_price ON phone_pricing(phone_id, price_unofficial, price_official);
CREATE INDEX idx_phone_pricing_range ON phone_pricing(price_unofficial, price_official);

-- Brand name search optimization (case-insensitive)
CREATE INDEX idx_brands_name_ci ON brands(brand_name);

-- Chipset name search optimization
CREATE INDEX idx_chipsets_name ON chipsets(chipset_name);

-- Display type optimization
CREATE INDEX idx_display_types_name ON display_types(display_type_name);

-- =====================================
-- COVERING INDEXES FOR COMMON QUERIES
-- =====================================

-- Covering index for main phone list query (includes all commonly selected columns)
CREATE INDEX idx_phones_covering ON phones(phone_id, brand_id, model, status, release_date, image_url);

-- Covering index for phone specifications
CREATE INDEX idx_specs_covering ON phone_specifications(
    phone_id, chipset_id, ram_gb, internal_storage_gb, 
    battery_capacity, display_type_id
);

-- =====================================
-- FOREIGN KEY OPTIMIZATION
-- =====================================

-- Ensure all foreign key columns have proper indexes (if not already existing)
CREATE INDEX idx_phones_brand_fk ON phones(brand_id) USING BTREE;
CREATE INDEX idx_phone_specs_phone_fk ON phone_specifications(phone_id) USING BTREE;
CREATE INDEX idx_phone_specs_chipset_fk ON phone_specifications(chipset_id) USING BTREE;
CREATE INDEX idx_phone_specs_os_fk ON phone_specifications(os_id) USING BTREE;
CREATE INDEX idx_phone_specs_display_type_fk ON phone_specifications(display_type_id) USING BTREE;
CREATE INDEX idx_phone_specs_storage_type_fk ON phone_specifications(storage_type_id) USING BTREE;
CREATE INDEX idx_phone_specs_ram_type_fk ON phone_specifications(ram_type_id) USING BTREE;

-- =====================================
-- FULL-TEXT SEARCH INDEXES
-- =====================================

-- Full-text search for phone model names and brands
ALTER TABLE phones ADD INDEX idx_phones_fulltext (model) USING FULLTEXT;
ALTER TABLE brands ADD INDEX idx_brands_fulltext (brand_name) USING FULLTEXT;
ALTER TABLE chipsets ADD INDEX idx_chipsets_fulltext (chipset_name) USING FULLTEXT;

-- =====================================
-- QUERY-SPECIFIC OPTIMIZATIONS
-- =====================================

-- Optimize filter options query (for dropdown population)
CREATE INDEX idx_brands_active ON brands(brand_id) WHERE brand_id IN (SELECT DISTINCT brand_id FROM phones);
CREATE INDEX idx_chipsets_active ON chipsets(chipset_id) WHERE chipset_id IN (SELECT DISTINCT chipset_id FROM phone_specifications WHERE chipset_id IS NOT NULL);

-- Optimize price range calculations
CREATE INDEX idx_pricing_minmax ON phone_pricing(
    LEAST(COALESCE(price_unofficial, 999999), COALESCE(price_official, 999999)),
    GREATEST(COALESCE(price_unofficial, 0), COALESCE(price_official, 0))
);

-- =====================================
-- PARTITIONING FOR LARGE DATASETS
-- =====================================

-- Note: Partitioning is commented out as it requires table restructuring
-- Consider implementing for very large datasets (100k+ phones)

/*
-- Partition phones by brand for better performance with large datasets
ALTER TABLE phones PARTITION BY HASH(brand_id) PARTITIONS 10;

-- Partition phone_specifications by phone_id range
ALTER TABLE phone_specifications PARTITION BY RANGE(phone_id) (
    PARTITION p0 VALUES LESS THAN (1000),
    PARTITION p1 VALUES LESS THAN (5000),
    PARTITION p2 VALUES LESS THAN (10000),
    PARTITION p3 VALUES LESS THAN MAXVALUE
);
*/

-- =====================================
-- QUERY CACHE OPTIMIZATION
-- =====================================

-- Enable query cache for repeated queries (if not already enabled)
-- Note: This is a server-level setting, included for reference
-- SET GLOBAL query_cache_type = ON;
-- SET GLOBAL query_cache_size = 67108864; -- 64MB

-- =====================================
-- TABLE OPTIMIZATION
-- =====================================

-- Optimize table storage and defragment
OPTIMIZE TABLE brands;
OPTIMIZE TABLE phones;
OPTIMIZE TABLE phone_specifications;
OPTIMIZE TABLE display_specifications;
OPTIMIZE TABLE phone_pricing;
OPTIMIZE TABLE chipsets;
OPTIMIZE TABLE display_types;

-- =====================================
-- STATISTICS UPDATE
-- =====================================

-- Update table statistics for better query planning
ANALYZE TABLE brands;
ANALYZE TABLE phones;
ANALYZE TABLE phone_specifications;
ANALYZE TABLE display_specifications;
ANALYZE TABLE phone_pricing;
ANALYZE TABLE chipsets;
ANALYZE TABLE display_types;

-- =====================================
-- VERIFICATION QUERIES
-- =====================================

-- Verify index usage for common queries
-- Use these queries to check if indexes are being used effectively:

/*
-- Check index usage for main filter query
EXPLAIN SELECT DISTINCT
    p.phone_id, b.brand_name, p.model, ps.ram_gb, ps.internal_storage_gb
FROM phones p
INNER JOIN brands b ON p.brand_id = b.brand_id
LEFT JOIN phone_specifications ps ON p.phone_id = ps.phone_id
WHERE b.brand_name = 'Apple' AND ps.ram_gb >= 8;

-- Check index usage for price range query
EXPLAIN SELECT p.phone_id, pr.price_unofficial
FROM phones p
LEFT JOIN phone_pricing pr ON p.phone_id = pr.phone_id
WHERE pr.price_unofficial BETWEEN 200 AND 1000;

-- Show all indexes on main tables
SHOW INDEX FROM phones;
SHOW INDEX FROM phone_specifications;
SHOW INDEX FROM phone_pricing;
*/

-- =====================================
-- PERFORMANCE MONITORING
-- =====================================

-- Create performance monitoring views
CREATE OR REPLACE VIEW v_query_performance AS
SELECT 
    'phones' as table_name,
    COUNT(*) as row_count,
    AVG(CHAR_LENGTH(model)) as avg_model_length,
    COUNT(DISTINCT brand_id) as unique_brands
FROM phones
UNION ALL
SELECT 
    'phone_specifications' as table_name,
    COUNT(*) as row_count,
    AVG(ram_gb) as avg_ram_gb,
    COUNT(DISTINCT chipset_id) as unique_chipsets
FROM phone_specifications
UNION ALL
SELECT 
    'phone_pricing' as table_name,
    COUNT(*) as row_count,
    AVG(price_unofficial) as avg_price,
    COUNT(DISTINCT phone_id) as unique_phones_with_pricing
FROM phone_pricing;

-- Create slow query monitoring (for development)
CREATE TABLE IF NOT EXISTS query_performance_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    query_type VARCHAR(50),
    execution_time_ms INT,
    row_count INT,
    query_hash VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_log_time_type (created_at, query_type, execution_time_ms)
);

-- Migration completed successfully
SELECT 'Performance optimization migration completed' as status;