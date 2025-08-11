-- ============================================================================
-- DATABASE EXPLORATION QUERIES - PhoneDB System
-- DBMS Course Project - Complete SQL Query Collection
-- ============================================================================

-- Use the mobile_specs database
USE mobile_specs;

-- ============================================================================
-- 1. DATABASE STRUCTURE EXPLORATION
-- ============================================================================

-- 1.1 Show all tables in the database
SHOW TABLES;

-- 1.2 Detailed table information
SELECT 
    TABLE_NAME,
    TABLE_TYPE,
    ENGINE,
    TABLE_ROWS,
    DATA_LENGTH,
    INDEX_LENGTH,
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Size_MB'
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'mobile_specs'
ORDER BY TABLE_NAME;

-- 1.3 Complete schema information for all tables
SELECT 
    t.TABLE_NAME,
    c.COLUMN_NAME,
    c.DATA_TYPE,
    c.IS_NULLABLE,
    c.COLUMN_KEY,
    c.COLUMN_DEFAULT,
    c.EXTRA,
    c.CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.TABLES t
JOIN INFORMATION_SCHEMA.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
WHERE t.TABLE_SCHEMA = 'mobile_specs'
ORDER BY t.TABLE_NAME, c.ORDINAL_POSITION;

-- ============================================================================
-- 2. KEYS AND CONSTRAINTS ANALYSIS
-- ============================================================================

-- 2.1 Primary keys for all tables
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'mobile_specs' 
    AND CONSTRAINT_NAME = 'PRIMARY'
ORDER BY TABLE_NAME;

-- 2.2 Foreign keys with referenced tables
SELECT 
    kcu.TABLE_NAME AS 'Child_Table',
    kcu.COLUMN_NAME AS 'FK_Column',
    kcu.CONSTRAINT_NAME AS 'Constraint_Name',
    kcu.REFERENCED_TABLE_NAME AS 'Parent_Table',
    kcu.REFERENCED_COLUMN_NAME AS 'Referenced_Column'
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc 
    ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
WHERE kcu.TABLE_SCHEMA = 'mobile_specs'
ORDER BY kcu.TABLE_NAME, kcu.COLUMN_NAME;

-- 2.3 All constraints (Primary, Foreign, Unique)
SELECT 
    tc.TABLE_NAME,
    tc.CONSTRAINT_NAME,
    tc.CONSTRAINT_TYPE,
    kcu.COLUMN_NAME,
    kcu.REFERENCED_TABLE_NAME,
    kcu.REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
    ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
WHERE tc.TABLE_SCHEMA = 'mobile_specs'
ORDER BY tc.TABLE_NAME, tc.CONSTRAINT_TYPE;

-- ============================================================================
-- 3. RELATIONSHIP MAPPING
-- ============================================================================

-- 3.1 Complete relationship mapping with cascade rules
SELECT DISTINCT
    CONCAT(kcu.TABLE_NAME, '.', kcu.COLUMN_NAME) AS 'Foreign_Key',
    CONCAT(kcu.REFERENCED_TABLE_NAME, '.', kcu.REFERENCED_COLUMN_NAME) AS 'References',
    rc.DELETE_RULE,
    rc.UPDATE_RULE
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc 
    ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
WHERE kcu.TABLE_SCHEMA = 'mobile_specs'
    AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY kcu.TABLE_NAME;

-- ============================================================================
-- 4. RECORD COUNTS
-- ============================================================================

-- 4.1 Record count for all tables
SELECT 'brands' as table_name, COUNT(*) as record_count FROM brands
UNION ALL SELECT 'chipsets', COUNT(*) FROM chipsets
UNION ALL SELECT 'operating_systems', COUNT(*) FROM operating_systems
UNION ALL SELECT 'display_types', COUNT(*) FROM display_types
UNION ALL SELECT 'storage_types', COUNT(*) FROM storage_types
UNION ALL SELECT 'ram_types', COUNT(*) FROM ram_types
UNION ALL SELECT 'phones', COUNT(*) FROM phones
UNION ALL SELECT 'phone_specifications', COUNT(*) FROM phone_specifications
UNION ALL SELECT 'display_specifications', COUNT(*) FROM display_specifications
UNION ALL SELECT 'physical_specifications', COUNT(*) FROM physical_specifications
UNION ALL SELECT 'camera_specifications', COUNT(*) FROM camera_specifications
UNION ALL SELECT 'audio_features', COUNT(*) FROM audio_features
UNION ALL SELECT 'additional_features', COUNT(*) FROM additional_features
UNION ALL SELECT 'phone_colors', COUNT(*) FROM phone_colors
UNION ALL SELECT 'phone_pricing', COUNT(*) FROM phone_pricing
ORDER BY record_count DESC;

-- ============================================================================
-- 5. SAMPLE DATA FROM EACH TABLE
-- ============================================================================

-- 5.1 Brands sample data
SELECT 'BRANDS SAMPLE:' as info;
SELECT * FROM brands ORDER BY brand_name LIMIT 5;

-- 5.2 Chipsets sample data
SELECT 'CHIPSETS SAMPLE:' as info;
SELECT * FROM chipsets ORDER BY chipset_name LIMIT 5;

-- 5.3 Operating Systems sample data
SELECT 'OPERATING SYSTEMS SAMPLE:' as info;
SELECT * FROM operating_systems ORDER BY os_name, os_version LIMIT 5;

-- 5.4 Display Types sample data
SELECT 'DISPLAY TYPES SAMPLE:' as info;
SELECT * FROM display_types ORDER BY display_type_name LIMIT 5;

-- 5.5 Storage Types sample data
SELECT 'STORAGE TYPES SAMPLE:' as info;
SELECT * FROM storage_types ORDER BY storage_type_name LIMIT 5;

-- 5.6 RAM Types sample data
SELECT 'RAM TYPES SAMPLE:' as info;
SELECT * FROM ram_types ORDER BY ram_type_name LIMIT 5;

-- 5.7 Phones sample data
SELECT 'PHONES SAMPLE:' as info;
SELECT phone_id, brand_id, model, device_type, release_date, status 
FROM phones ORDER BY phone_id LIMIT 5;

-- 5.8 Phone Specifications sample data
SELECT 'PHONE SPECIFICATIONS SAMPLE:' as info;
SELECT spec_id, phone_id, chipset_id, os_id, ram_gb, internal_storage_gb, battery_capacity 
FROM phone_specifications ORDER BY spec_id LIMIT 5;

-- 5.9 Display Specifications sample data
SELECT 'DISPLAY SPECIFICATIONS SAMPLE:' as info;
SELECT display_spec_id, phone_id, screen_size, resolution, pixel_density, refresh_rate 
FROM display_specifications ORDER BY display_spec_id LIMIT 5;

-- 5.10 Physical Specifications sample data
SELECT 'PHYSICAL SPECIFICATIONS SAMPLE:' as info;
SELECT physical_spec_id, phone_id, height, width, thickness, weight, ip_rating 
FROM physical_specifications ORDER BY physical_spec_id LIMIT 5;

-- 5.11 Camera Specifications sample data
SELECT 'CAMERA SPECIFICATIONS SAMPLE:' as info;
SELECT camera_spec_id, phone_id, primary_camera_resolution, primary_camera_autofocus, primary_camera_flash 
FROM camera_specifications ORDER BY camera_spec_id LIMIT 5;

-- 5.12 Audio Features sample data
SELECT 'AUDIO FEATURES SAMPLE:' as info;
SELECT * FROM audio_features ORDER BY audio_id LIMIT 5;

-- 5.13 Additional Features sample data
SELECT 'ADDITIONAL FEATURES SAMPLE:' as info;
SELECT feature_id, phone_id, face_unlock, gps, gprs, volte, sim_size 
FROM additional_features ORDER BY feature_id LIMIT 5;

-- 5.14 Phone Colors sample data
SELECT 'PHONE COLORS SAMPLE:' as info;
SELECT * FROM phone_colors ORDER BY phone_id, color_name LIMIT 5;

-- 5.15 Phone Pricing sample data
SELECT 'PHONE PRICING SAMPLE:' as info;
SELECT pricing_id, phone_id, price_official, price_unofficial, price_old, variant_description 
FROM phone_pricing ORDER BY pricing_id LIMIT 5;

-- ============================================================================
-- 6. JOIN QUERIES DEMONSTRATING RELATIONSHIPS
-- ============================================================================

-- 6.1 Basic phone information with brand
SELECT 'PHONES WITH BRANDS:' as info;
SELECT 
    p.phone_id,
    b.brand_name,
    p.model,
    p.release_date,
    p.status
FROM phones p
JOIN brands b ON p.brand_id = b.brand_id
ORDER BY b.brand_name, p.model
LIMIT 10;

-- 6.2 Complete phone specifications with all lookups
SELECT 'COMPLETE PHONE SPECIFICATIONS:' as info;
SELECT 
    p.phone_id,
    b.brand_name,
    p.model,
    c.chipset_name,
    CONCAT(os.os_name, ' ', os.os_version) as operating_system,
    dt.display_type_name,
    st.storage_type_name,
    rt.ram_type_name,
    ps.ram_gb,
    ps.internal_storage_gb
FROM phones p
JOIN brands b ON p.brand_id = b.brand_id
LEFT JOIN phone_specifications ps ON p.phone_id = ps.phone_id
LEFT JOIN chipsets c ON ps.chipset_id = c.chipset_id
LEFT JOIN operating_systems os ON ps.os_id = os.os_id
LEFT JOIN display_types dt ON ps.display_type_id = dt.display_type_id
LEFT JOIN storage_types st ON ps.storage_type_id = st.storage_type_id
LEFT JOIN ram_types rt ON ps.ram_type_id = rt.ram_type_id
ORDER BY b.brand_name, p.model
LIMIT 10;

-- 6.3 Phone with display specifications
SELECT 'PHONES WITH DISPLAY SPECS:' as info;
SELECT 
    p.phone_id,
    b.brand_name,
    p.model,
    ds.screen_size,
    ds.resolution,
    ds.pixel_density,
    ds.refresh_rate,
    ds.brightness
FROM phones p
JOIN brands b ON p.brand_id = b.brand_id
JOIN display_specifications ds ON p.phone_id = ds.phone_id
ORDER BY b.brand_name, p.model
LIMIT 10;

-- 6.4 Phone with physical specifications
SELECT 'PHONES WITH PHYSICAL SPECS:' as info;
SELECT 
    p.phone_id,
    b.brand_name,
    p.model,
    phy.height,
    phy.width,
    phy.thickness,
    phy.weight,
    phy.ip_rating
FROM phones p
JOIN brands b ON p.brand_id = b.brand_id
JOIN physical_specifications phy ON p.phone_id = phy.phone_id
ORDER BY b.brand_name, p.model
LIMIT 10;

-- 6.5 Phone colors (one-to-many relationship demonstration)
SELECT 'PHONES WITH COLORS:' as info;
SELECT 
    p.phone_id,
    b.brand_name,
    p.model,
    GROUP_CONCAT(pc.color_name ORDER BY pc.color_name SEPARATOR ', ') as available_colors
FROM phones p
JOIN brands b ON p.brand_id = b.brand_id
LEFT JOIN phone_colors pc ON p.phone_id = pc.phone_id
GROUP BY p.phone_id, b.brand_name, p.model
HAVING available_colors IS NOT NULL
ORDER BY b.brand_name, p.model
LIMIT 10;

-- 6.6 Phone pricing information
SELECT 'PHONES WITH PRICING:' as info;
SELECT 
    p.phone_id,
    b.brand_name,
    p.model,
    pr.price_official,
    pr.price_unofficial,
    pr.price_old,
    pr.price_savings,
    pr.variant_description
FROM phones p
JOIN brands b ON p.brand_id = b.brand_id
LEFT JOIN phone_pricing pr ON p.phone_id = pr.phone_id
WHERE pr.price_unofficial IS NOT NULL
ORDER BY pr.price_unofficial
LIMIT 10;

-- 6.7 Complex multi-table join with all major specifications
SELECT 'COMPREHENSIVE PHONE DATA:' as info;
SELECT 
    p.phone_id,
    b.brand_name,
    p.model,
    ps.ram_gb,
    ps.internal_storage_gb,
    ds.screen_size,
    ds.resolution,
    cs.primary_camera_resolution,
    pr.price_unofficial
FROM phones p
JOIN brands b ON p.brand_id = b.brand_id
LEFT JOIN phone_specifications ps ON p.phone_id = ps.phone_id
LEFT JOIN display_specifications ds ON p.phone_id = ds.phone_id
LEFT JOIN camera_specifications cs ON p.phone_id = cs.phone_id
LEFT JOIN phone_pricing pr ON p.phone_id = pr.phone_id
WHERE pr.price_unofficial IS NOT NULL
ORDER BY pr.price_unofficial
LIMIT 10;

-- ============================================================================
-- 7. AGGREGATE QUERIES (COUNT, SUM, AVG, MAX, MIN)
-- ============================================================================

-- 7.1 Brand statistics
SELECT 'BRAND STATISTICS:' as info;
SELECT 
    b.brand_name,
    COUNT(p.phone_id) as total_phones,
    COALESCE(MIN(pr.price_unofficial), 0) as min_price,
    COALESCE(MAX(pr.price_unofficial), 0) as max_price,
    COALESCE(ROUND(AVG(pr.price_unofficial), 2), 0) as avg_price,
    COALESCE(ROUND(STDDEV(pr.price_unofficial), 2), 0) as price_std_dev
FROM brands b
LEFT JOIN phones p ON b.brand_id = p.brand_id
LEFT JOIN phone_pricing pr ON p.phone_id = pr.phone_id
GROUP BY b.brand_id, b.brand_name
HAVING COUNT(p.phone_id) >= 3
ORDER BY total_phones DESC;

-- 7.2 RAM and Storage statistics
SELECT 'RAM STATISTICS:' as info;
SELECT 
    ps.ram_gb,
    COUNT(*) as phone_count,
    ROUND(AVG(pr.price_unofficial), 2) as avg_price,
    MIN(pr.price_unofficial) as min_price,
    MAX(pr.price_unofficial) as max_price
FROM phone_specifications ps
JOIN phone_pricing pr ON ps.phone_id = pr.phone_id
WHERE ps.ram_gb IS NOT NULL AND pr.price_unofficial IS NOT NULL
GROUP BY ps.ram_gb
ORDER BY ps.ram_gb;

-- 7.3 Storage capacity analysis
SELECT 'STORAGE STATISTICS:' as info;
SELECT 
    ps.internal_storage_gb,
    COUNT(*) as phone_count,
    ROUND(AVG(pr.price_unofficial), 2) as avg_price
FROM phone_specifications ps
JOIN phone_pricing pr ON ps.phone_id = pr.phone_id
WHERE ps.internal_storage_gb IS NOT NULL AND pr.price_unofficial IS NOT NULL
GROUP BY ps.internal_storage_gb
ORDER BY ps.internal_storage_gb;

-- 7.4 Chipset popularity
SELECT 'CHIPSET POPULARITY:' as info;
SELECT 
    c.chipset_name,
    COUNT(ps.phone_id) as phones_using_chipset,
    ROUND(AVG(pr.price_unofficial), 2) as avg_price_of_phones
FROM chipsets c
JOIN phone_specifications ps ON c.chipset_id = ps.chipset_id
LEFT JOIN phone_pricing pr ON ps.phone_id = pr.phone_id
WHERE pr.price_unofficial IS NOT NULL
GROUP BY c.chipset_id, c.chipset_name
HAVING COUNT(ps.phone_id) >= 2
ORDER BY phones_using_chipset DESC
LIMIT 10;

-- 7.5 Operating system distribution
SELECT 'OS DISTRIBUTION:' as info;
SELECT 
    os.os_name,
    os.os_version,
    COUNT(ps.phone_id) as phone_count,
    ROUND(COUNT(ps.phone_id) * 100.0 / (SELECT COUNT(*) FROM phone_specifications), 2) as percentage
FROM operating_systems os
JOIN phone_specifications ps ON os.os_id = ps.os_id
GROUP BY os.os_id, os.os_name, os.os_version
ORDER BY phone_count DESC
LIMIT 10;

-- 7.6 Display specifications analysis
SELECT 'DISPLAY SIZE ANALYSIS:' as info;
SELECT 
    ds.screen_size,
    COUNT(*) as phone_count,
    ROUND(AVG(ds.pixel_density), 0) as avg_pixel_density,
    MAX(ds.refresh_rate) as max_refresh_rate,
    ROUND(AVG(pr.price_unofficial), 2) as avg_price
FROM display_specifications ds
LEFT JOIN phone_pricing pr ON ds.phone_id = pr.phone_id
WHERE ds.screen_size IS NOT NULL
GROUP BY ds.screen_size
HAVING COUNT(*) >= 2
ORDER BY phone_count DESC
LIMIT 10;

-- 7.7 Price range analysis
SELECT 'PRICE RANGE ANALYSIS:' as info;
SELECT 
    CASE 
        WHEN price_unofficial < 200 THEN 'Budget (< $200)'
        WHEN price_unofficial BETWEEN 200 AND 500 THEN 'Mid-range ($200-500)'
        WHEN price_unofficial BETWEEN 500 AND 1000 THEN 'Premium ($500-1000)'
        ELSE 'Flagship (> $1000)'
    END as price_category,
    COUNT(*) as phone_count,
    ROUND(AVG(ps.ram_gb), 1) as avg_ram,
    ROUND(AVG(ps.internal_storage_gb), 1) as avg_storage,
    MIN(price_unofficial) as min_price,
    MAX(price_unofficial) as max_price
FROM phone_pricing pr
LEFT JOIN phone_specifications ps ON pr.phone_id = ps.phone_id
WHERE price_unofficial IS NOT NULL
GROUP BY price_category
ORDER BY min_price;

-- 7.8 Release year analysis
SELECT 'RELEASE YEAR ANALYSIS:' as info;
SELECT 
    YEAR(p.release_date) as release_year,
    COUNT(*) as phones_released,
    ROUND(AVG(pr.price_unofficial), 2) as avg_price,
    COUNT(DISTINCT p.brand_id) as brands_active
FROM phones p
LEFT JOIN phone_pricing pr ON p.phone_id = pr.phone_id
WHERE p.release_date IS NOT NULL
GROUP BY YEAR(p.release_date)
ORDER BY release_year DESC
LIMIT 10;

-- 7.9 Color popularity
SELECT 'COLOR POPULARITY:' as info;
SELECT 
    pc.color_name,
    COUNT(*) as phones_with_color,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(DISTINCT phone_id) FROM phone_colors), 2) as percentage
FROM phone_colors pc
GROUP BY pc.color_name
ORDER BY phones_with_color DESC
LIMIT 15;

-- 7.10 Database summary statistics
SELECT 'DATABASE SUMMARY:' as info;
SELECT 
    'Total Brands' as metric,
    COUNT(*) as value,
    '' as unit
FROM brands
UNION ALL
SELECT 
    'Total Phones' as metric,
    COUNT(*) as value,
    'devices' as unit
FROM phones
UNION ALL
SELECT 
    'Total Chipsets' as metric,
    COUNT(*) as value,
    'different chipsets' as unit
FROM chipsets
UNION ALL
SELECT 
    'Phones with Pricing' as metric,
    COUNT(*) as value,
    'phones' as unit
FROM phone_pricing
UNION ALL
SELECT 
    'Average Price' as metric,
    ROUND(AVG(price_unofficial), 2) as value,
    'USD' as unit
FROM phone_pricing
WHERE price_unofficial IS NOT NULL
UNION ALL
SELECT 
    'Most Expensive Phone' as metric,
    MAX(price_unofficial) as value,
    'USD' as unit
FROM phone_pricing
WHERE price_unofficial IS NOT NULL
UNION ALL
SELECT 
    'Cheapest Phone' as metric,
    MIN(price_unofficial) as value,
    'USD' as unit
FROM phone_pricing
WHERE price_unofficial IS NOT NULL;

-- ============================================================================
-- 8. ADVANCED ANALYTICAL QUERIES
-- ============================================================================

-- 8.1 Top 10 most expensive phones with full details
SELECT 'TOP 10 MOST EXPENSIVE PHONES:' as info;
SELECT 
    b.brand_name,
    p.model,
    pr.price_unofficial,
    ps.ram_gb,
    ps.internal_storage_gb,
    ds.screen_size,
    cs.primary_camera_resolution
FROM phones p
JOIN brands b ON p.brand_id = b.brand_id
LEFT JOIN phone_pricing pr ON p.phone_id = pr.phone_id
LEFT JOIN phone_specifications ps ON p.phone_id = ps.phone_id
LEFT JOIN display_specifications ds ON p.phone_id = ds.phone_id
LEFT JOIN camera_specifications cs ON p.phone_id = cs.phone_id
WHERE pr.price_unofficial IS NOT NULL
ORDER BY pr.price_unofficial DESC
LIMIT 10;

-- 8.2 Best value phones (highest specs per dollar)
SELECT 'BEST VALUE PHONES:' as info;
SELECT 
    b.brand_name,
    p.model,
    pr.price_unofficial,
    ps.ram_gb,
    ps.internal_storage_gb,
    ROUND((ps.ram_gb + ps.internal_storage_gb/10) / pr.price_unofficial * 1000, 2) as value_score
FROM phones p
JOIN brands b ON p.brand_id = b.brand_id
JOIN phone_pricing pr ON p.phone_id = pr.phone_id
JOIN phone_specifications ps ON p.phone_id = ps.phone_id
WHERE pr.price_unofficial > 0 
    AND ps.ram_gb IS NOT NULL 
    AND ps.internal_storage_gb IS NOT NULL
ORDER BY value_score DESC
LIMIT 10;

-- 8.3 Market share by brand (based on number of models)
SELECT 'BRAND MARKET SHARE:' as info;
SELECT 
    b.brand_name,
    COUNT(p.phone_id) as model_count,
    ROUND(COUNT(p.phone_id) * 100.0 / (SELECT COUNT(*) FROM phones), 2) as market_share_percent
FROM brands b
JOIN phones p ON b.brand_id = p.brand_id
GROUP BY b.brand_id, b.brand_name
ORDER BY model_count DESC
LIMIT 10;

-- ============================================================================
-- END OF QUERIES
-- ============================================================================

-- Summary message
SELECT 
    '============================================================================' as message
UNION ALL SELECT 
    'DATABASE EXPLORATION COMPLETE' as message
UNION ALL SELECT 
    'All tables analyzed, relationships mapped, sample data displayed' as message
UNION ALL SELECT 
    'Ready for presentation and further analysis' as message
UNION ALL SELECT 
    '============================================================================' as message;
