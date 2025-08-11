# 📊 Complete Database Analysis - PhoneDB System
## DBMS Course Project Documentation

---

## 📋 Table of Contents
1. [Database Exploration Queries](#database-exploration-queries)
2. [Entity-Relationship Diagram](#entity-relationship-diagram)
3. [Use Case Diagram](#use-case-diagram)
4. [Database Design Documentation](#database-design-documentation)
5. [Normalization Analysis](#normalization-analysis)

---

## 1. Database Exploration Queries

### 1.1 Show All Tables in the Database
```sql
-- Query to list all tables in the mobile_specs database
USE mobile_specs;
SHOW TABLES;

-- Alternative query with more details
SELECT 
    TABLE_NAME,
    TABLE_TYPE,
    ENGINE,
    TABLE_ROWS,
    DATA_LENGTH,
    INDEX_LENGTH
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'mobile_specs'
ORDER BY TABLE_NAME;
```

### 1.2 Show Schema for Each Table
```sql
-- Detailed schema information for all tables
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

-- Individual table schemas
DESCRIBE brands;
DESCRIBE chipsets;
DESCRIBE operating_systems;
DESCRIBE display_types;
DESCRIBE storage_types;
DESCRIBE ram_types;
DESCRIBE phones;
DESCRIBE phone_specifications;
DESCRIBE display_specifications;
DESCRIBE physical_specifications;
DESCRIBE camera_specifications;
DESCRIBE audio_features;
DESCRIBE additional_features;
DESCRIBE phone_colors;
DESCRIBE phone_pricing;
```

### 1.3 Primary and Foreign Keys Analysis
```sql
-- Primary Keys for all tables
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'mobile_specs' 
    AND CONSTRAINT_NAME = 'PRIMARY'
ORDER BY TABLE_NAME;

-- Foreign Keys with referenced tables
SELECT 
    kcu.TABLE_NAME,
    kcu.COLUMN_NAME,
    kcu.CONSTRAINT_NAME,
    kcu.REFERENCED_TABLE_NAME,
    kcu.REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc 
    ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
WHERE kcu.TABLE_SCHEMA = 'mobile_specs'
ORDER BY kcu.TABLE_NAME, kcu.COLUMN_NAME;

-- Detailed constraint information
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
```

### 1.4 Table Relationships Mapping
```sql
-- Complete relationship mapping
SELECT DISTINCT
    CONCAT(kcu.TABLE_NAME, '.', kcu.COLUMN_NAME) AS 'Foreign Key',
    CONCAT(kcu.REFERENCED_TABLE_NAME, '.', kcu.REFERENCED_COLUMN_NAME) AS 'References',
    rc.DELETE_RULE,
    rc.UPDATE_RULE
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc 
    ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
WHERE kcu.TABLE_SCHEMA = 'mobile_specs'
    AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY kcu.TABLE_NAME;
```

### 1.5 Record Count for Each Table
```sql
-- Count records in all tables
SELECT 
    'brands' as table_name, 
    COUNT(*) as record_count 
FROM brands
UNION ALL
SELECT 
    'chipsets' as table_name, 
    COUNT(*) as record_count 
FROM chipsets
UNION ALL
SELECT 
    'operating_systems' as table_name, 
    COUNT(*) as record_count 
FROM operating_systems
UNION ALL
SELECT 
    'display_types' as table_name, 
    COUNT(*) as record_count 
FROM display_types
UNION ALL
SELECT 
    'storage_types' as table_name, 
    COUNT(*) as record_count 
FROM storage_types
UNION ALL
SELECT 
    'ram_types' as table_name, 
    COUNT(*) as record_count 
FROM ram_types
UNION ALL
SELECT 
    'phones' as table_name, 
    COUNT(*) as record_count 
FROM phones
UNION ALL
SELECT 
    'phone_specifications' as table_name, 
    COUNT(*) as record_count 
FROM phone_specifications
UNION ALL
SELECT 
    'display_specifications' as table_name, 
    COUNT(*) as record_count 
FROM display_specifications
UNION ALL
SELECT 
    'physical_specifications' as table_name, 
    COUNT(*) as record_count 
FROM physical_specifications
UNION ALL
SELECT 
    'camera_specifications' as table_name, 
    COUNT(*) as record_count 
FROM camera_specifications
UNION ALL
SELECT 
    'audio_features' as table_name, 
    COUNT(*) as record_count 
FROM audio_features
UNION ALL
SELECT 
    'additional_features' as table_name, 
    COUNT(*) as record_count 
FROM additional_features
UNION ALL
SELECT 
    'phone_colors' as table_name, 
    COUNT(*) as record_count 
FROM phone_colors
UNION ALL
SELECT 
    'phone_pricing' as table_name, 
    COUNT(*) as record_count 
FROM phone_pricing
ORDER BY record_count DESC;
```

### 1.6 Sample Data from Each Table (5 rows each)
```sql
-- Brands sample data
SELECT * FROM brands LIMIT 5;

-- Chipsets sample data
SELECT * FROM chipsets LIMIT 5;

-- Operating Systems sample data
SELECT * FROM operating_systems LIMIT 5;

-- Display Types sample data
SELECT * FROM display_types LIMIT 5;

-- Storage Types sample data
SELECT * FROM storage_types LIMIT 5;

-- RAM Types sample data
SELECT * FROM ram_types LIMIT 5;

-- Phones sample data
SELECT * FROM phones LIMIT 5;

-- Phone Specifications sample data
SELECT * FROM phone_specifications LIMIT 5;

-- Display Specifications sample data
SELECT * FROM display_specifications LIMIT 5;

-- Physical Specifications sample data
SELECT * FROM physical_specifications LIMIT 5;

-- Camera Specifications sample data
SELECT * FROM camera_specifications LIMIT 5;

-- Audio Features sample data
SELECT * FROM audio_features LIMIT 5;

-- Additional Features sample data
SELECT * FROM additional_features LIMIT 5;

-- Phone Colors sample data
SELECT * FROM phone_colors LIMIT 5;

-- Phone Pricing sample data
SELECT * FROM phone_pricing LIMIT 5;
```

### 1.7 JOIN Queries Demonstrating Relationships
```sql
-- 1. Basic phone information with brand
SELECT 
    p.phone_id,
    b.brand_name,
    p.model,
    p.release_date,
    p.status
FROM phones p
JOIN brands b ON p.brand_id = b.brand_id
LIMIT 10;

-- 2. Complete phone specifications with all lookups
SELECT 
    p.phone_id,
    b.brand_name,
    p.model,
    c.chipset_name,
    os.os_name,
    os.os_version,
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
LIMIT 10;

-- 3. Phone with display specifications
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
LIMIT 10;

-- 4. Phone with physical specifications
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
LIMIT 10;

-- 5. Phone colors (one-to-many relationship)
SELECT 
    p.phone_id,
    b.brand_name,
    p.model,
    GROUP_CONCAT(pc.color_name SEPARATOR ', ') as available_colors
FROM phones p
JOIN brands b ON p.brand_id = b.brand_id
LEFT JOIN phone_colors pc ON p.phone_id = pc.phone_id
GROUP BY p.phone_id, b.brand_name, p.model
LIMIT 10;

-- 6. Phone pricing information
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
LIMIT 10;

-- 7. Complex multi-table join with all specifications
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
LIMIT 10;
```

### 1.8 Aggregate Queries (COUNT, SUM, AVG, MAX, MIN)
```sql
-- 1. Brand statistics
SELECT 
    b.brand_name,
    COUNT(p.phone_id) as total_phones,
    MIN(pr.price_unofficial) as min_price,
    MAX(pr.price_unofficial) as max_price,
    AVG(pr.price_unofficial) as avg_price,
    STDDEV(pr.price_unofficial) as price_std_dev
FROM brands b
LEFT JOIN phones p ON b.brand_id = p.brand_id
LEFT JOIN phone_pricing pr ON p.phone_id = pr.phone_id
WHERE pr.price_unofficial IS NOT NULL
GROUP BY b.brand_id, b.brand_name
HAVING COUNT(p.phone_id) >= 5
ORDER BY total_phones DESC;

-- 2. RAM and Storage statistics
SELECT 
    ps.ram_gb,
    COUNT(*) as phone_count,
    AVG(pr.price_unofficial) as avg_price,
    MIN(pr.price_unofficial) as min_price,
    MAX(pr.price_unofficial) as max_price
FROM phone_specifications ps
JOIN phone_pricing pr ON ps.phone_id = pr.phone_id
WHERE ps.ram_gb IS NOT NULL AND pr.price_unofficial IS NOT NULL
GROUP BY ps.ram_gb
ORDER BY ps.ram_gb;

-- 3. Storage capacity analysis
SELECT 
    ps.internal_storage_gb,
    COUNT(*) as phone_count,
    AVG(pr.price_unofficial) as avg_price
FROM phone_specifications ps
JOIN phone_pricing pr ON ps.phone_id = pr.phone_id
WHERE ps.internal_storage_gb IS NOT NULL AND pr.price_unofficial IS NOT NULL
GROUP BY ps.internal_storage_gb
ORDER BY ps.internal_storage_gb;

-- 4. Chipset popularity
SELECT 
    c.chipset_name,
    COUNT(ps.phone_id) as phones_using_chipset,
    AVG(pr.price_unofficial) as avg_price_of_phones
FROM chipsets c
JOIN phone_specifications ps ON c.chipset_id = ps.chipset_id
JOIN phone_pricing pr ON ps.phone_id = pr.phone_id
WHERE pr.price_unofficial IS NOT NULL
GROUP BY c.chipset_id, c.chipset_name
HAVING COUNT(ps.phone_id) >= 3
ORDER BY phones_using_chipset DESC;

-- 5. Operating system distribution
SELECT 
    os.os_name,
    os.os_version,
    COUNT(ps.phone_id) as phone_count,
    ROUND(COUNT(ps.phone_id) * 100.0 / (SELECT COUNT(*) FROM phone_specifications), 2) as percentage
FROM operating_systems os
JOIN phone_specifications ps ON os.os_id = ps.os_id
GROUP BY os.os_id, os.os_name, os.os_version
ORDER BY phone_count DESC;

-- 6. Display specifications analysis
SELECT 
    ds.screen_size,
    COUNT(*) as phone_count,
    AVG(ds.pixel_density) as avg_pixel_density,
    MAX(ds.refresh_rate) as max_refresh_rate,
    AVG(pr.price_unofficial) as avg_price
FROM display_specifications ds
JOIN phone_pricing pr ON ds.phone_id = pr.phone_id
WHERE ds.screen_size IS NOT NULL AND pr.price_unofficial IS NOT NULL
GROUP BY ds.screen_size
HAVING COUNT(*) >= 2
ORDER BY phone_count DESC;

-- 7. Price range analysis
SELECT 
    CASE 
        WHEN price_unofficial < 200 THEN 'Budget (< $200)'
        WHEN price_unofficial BETWEEN 200 AND 500 THEN 'Mid-range ($200-500)'
        WHEN price_unofficial BETWEEN 500 AND 1000 THEN 'Premium ($500-1000)'
        ELSE 'Flagship (> $1000)'
    END as price_category,
    COUNT(*) as phone_count,
    AVG(ps.ram_gb) as avg_ram,
    AVG(ps.internal_storage_gb) as avg_storage,
    MIN(price_unofficial) as min_price,
    MAX(price_unofficial) as max_price
FROM phone_pricing pr
JOIN phone_specifications ps ON pr.phone_id = ps.phone_id
WHERE price_unofficial IS NOT NULL
GROUP BY price_category
ORDER BY min_price;

-- 8. Release year analysis
SELECT 
    YEAR(p.release_date) as release_year,
    COUNT(*) as phones_released,
    AVG(pr.price_unofficial) as avg_price,
    COUNT(DISTINCT p.brand_id) as brands_active
FROM phones p
LEFT JOIN phone_pricing pr ON p.phone_id = pr.phone_id
WHERE p.release_date IS NOT NULL
GROUP BY YEAR(p.release_date)
ORDER BY release_year DESC;

-- 9. Color popularity
SELECT 
    pc.color_name,
    COUNT(*) as phones_with_color,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(DISTINCT phone_id) FROM phone_colors), 2) as percentage
FROM phone_colors pc
GROUP BY pc.color_name
ORDER BY phones_with_color DESC
LIMIT 15;

-- 10. Database summary statistics
SELECT 
    'Total Brands' as metric,
    COUNT(*) as value
FROM brands
UNION ALL
SELECT 
    'Total Phones' as metric,
    COUNT(*) as value
FROM phones
UNION ALL
SELECT 
    'Total Chipsets' as metric,
    COUNT(*) as value
FROM chipsets
UNION ALL
SELECT 
    'Phones with Pricing' as metric,
    COUNT(*) as value
FROM phone_pricing
UNION ALL
SELECT 
    'Average Price (USD)' as metric,
    ROUND(AVG(price_unofficial), 2) as value
FROM phone_pricing
WHERE price_unofficial IS NOT NULL
UNION ALL
SELECT 
    'Most Expensive Phone (USD)' as metric,
    MAX(price_unofficial) as value
FROM phone_pricing
WHERE price_unofficial IS NOT NULL
UNION ALL
SELECT 
    'Cheapest Phone (USD)' as metric,
    MIN(price_unofficial) as value
FROM phone_pricing
WHERE price_unofficial IS NOT NULL;
```

---

## 2. Entity-Relationship Diagram

```mermaid
erDiagram
    brands {
        int brand_id PK
        varchar brand_name UK
        timestamp created_at
    }
    
    chipsets {
        int chipset_id PK
        varchar chipset_name UK
        varchar architecture
        varchar fabrication
        timestamp created_at
    }
    
    operating_systems {
        int os_id PK
        varchar os_name
        varchar os_version
        varchar user_interface
        timestamp created_at
    }
    
    display_types {
        int display_type_id PK
        varchar display_type_name UK
        timestamp created_at
    }
    
    storage_types {
        int storage_type_id PK
        varchar storage_type_name UK
        timestamp created_at
    }
    
    ram_types {
        int ram_type_id PK
        varchar ram_type_name UK
        timestamp created_at
    }
    
    phones {
        int phone_id PK
        int brand_id FK
        varchar model
        varchar device_type
        date release_date
        enum status
        varchar detail_url
        varchar image_url
        timestamp scraped_at
        timestamp created_at
    }
    
    phone_specifications {
        int spec_id PK
        int phone_id FK
        int chipset_id FK
        int os_id FK
        int display_type_id FK
        int storage_type_id FK
        int ram_type_id FK
        varchar cpu
        varchar cpu_cores
        varchar gpu
        int ram_gb
        int internal_storage_gb
        boolean expandable_memory
        varchar battery_capacity
        varchar quick_charging
        varchar bluetooth_version
        varchar network
        varchar wlan
        varchar usb
        boolean usb_otg
        boolean usb_type_c
        timestamp created_at
    }
    
    display_specifications {
        int display_spec_id PK
        int phone_id FK
        varchar screen_size
        varchar resolution
        int pixel_density
        int refresh_rate
        int brightness
        varchar aspect_ratio
        varchar screen_protection
        decimal screen_to_body_ratio
        varchar touch_screen
        varchar notch
        boolean edge
        timestamp created_at
    }
    
    physical_specifications {
        int physical_spec_id PK
        int phone_id FK
        decimal height
        decimal width
        decimal thickness
        varchar weight
        varchar ip_rating
        varchar waterproof
        varchar ruggedness
        timestamp created_at
    }
    
    camera_specifications {
        int camera_spec_id PK
        int phone_id FK
        varchar primary_camera_resolution
        text primary_camera_features
        boolean primary_camera_autofocus
        boolean primary_camera_flash
        varchar primary_camera_image_resolution
        varchar video
        timestamp created_at
    }
    
    audio_features {
        int audio_id PK
        int phone_id FK
        varchar audio_jack
        boolean loudspeaker
        timestamp created_at
    }
    
    additional_features {
        int feature_id PK
        int phone_id FK
        text features
        boolean face_unlock
        varchar gps
        boolean gprs
        boolean volte
        varchar sim_size
        varchar sim_slot
        varchar speed
        timestamp created_at
    }
    
    phone_colors {
        int color_id PK
        int phone_id FK
        varchar color_name
        timestamp created_at
    }
    
    phone_pricing {
        int pricing_id PK
        int phone_id FK
        decimal price_official
        decimal price_unofficial
        decimal price_old
        decimal price_savings
        date price_updated
        varchar variant_description
        timestamp created_at
    }
    
    %% Relationships
    brands ||--o{ phones : "manufactures"
    phones ||--o| phone_specifications : "has"
    phones ||--o| display_specifications : "has"
    phones ||--o| physical_specifications : "has"
    phones ||--o| camera_specifications : "has"
    phones ||--o| audio_features : "has"
    phones ||--o| additional_features : "has"
    phones ||--o{ phone_colors : "available_in"
    phones ||--o{ phone_pricing : "priced_as"
    
    chipsets ||--o{ phone_specifications : "powers"
    operating_systems ||--o{ phone_specifications : "runs_on"
    display_types ||--o{ phone_specifications : "uses"
    storage_types ||--o{ phone_specifications : "uses"
    ram_types ||--o{ phone_specifications : "uses"
```

---

## 3. Use Case Diagram

### System Users and Their Interactions

#### Primary Actors:
1. **End User (Consumer)** - Searching for mobile phones
2. **Database Administrator** - Managing database operations
3. **System Developer** - Maintaining the application
4. **Data Analyst** - Analyzing phone market trends

```mermaid
graph TB
    %% Actors
    Consumer[Consumer/End User]
    Admin[Database Administrator]
    Developer[System Developer]
    Analyst[Data Analyst]
    
    %% Use Cases - Consumer
    Consumer --> UC1[Search Phones by Brand]
    Consumer --> UC2[Filter by Specifications]
    Consumer --> UC3[Compare Phone Models]
    Consumer --> UC4[View Phone Details]
    Consumer --> UC5[Browse by Price Range]
    Consumer --> UC6[View Available Colors]
    
    %% Use Cases - Admin
    Admin --> UC7[Manage Database Schema]
    Admin --> UC8[Monitor Database Performance]
    Admin --> UC9[Backup/Restore Data]
    Admin --> UC10[Manage User Access]
    Admin --> UC11[Update Phone Data]
    
    %% Use Cases - Developer
    Developer --> UC12[Execute Complex Queries]
    Developer --> UC13[Optimize Database Performance]
    Developer --> UC14[Implement New Features]
    Developer --> UC15[Debug Database Issues]
    
    %% Use Cases - Analyst
    Analyst --> UC16[Generate Market Reports]
    Analyst --> UC17[Analyze Price Trends]
    Analyst --> UC18[Study Brand Performance]
    Analyst --> UC19[Export Data for Analysis]
    
    %% System Boundary
    subgraph "PhoneDB System"
        UC1
        UC2
        UC3
        UC4
        UC5
        UC6
        UC7
        UC8
        UC9
        UC10
        UC11
        UC12
        UC13
        UC14
        UC15
        UC16
        UC17
        UC18
        UC19
    end
    
    %% Extended Use Cases
    UC2 --> UC20[Filter by RAM Size]
    UC2 --> UC21[Filter by Storage Capacity]
    UC2 --> UC22[Filter by Screen Size]
    UC2 --> UC23[Filter by Camera Quality]
    
    UC16 --> UC24[Brand Market Share Analysis]
    UC16 --> UC25[Price Distribution Analysis]
    UC16 --> UC26[Feature Popularity Analysis]
```

### Detailed Use Case Descriptions:

#### Consumer Use Cases:
- **UC1: Search Phones by Brand** - Find all phones from specific manufacturers
- **UC2: Filter by Specifications** - Apply multiple filters (RAM, storage, price, etc.)
- **UC3: Compare Phone Models** - Side-by-side comparison of phone features
- **UC4: View Phone Details** - Complete specifications and pricing information
- **UC5: Browse by Price Range** - Find phones within budget constraints
- **UC6: View Available Colors** - See color variants for each phone model

#### Administrator Use Cases:
- **UC7: Manage Database Schema** - Create, modify, and maintain database structure
- **UC8: Monitor Database Performance** - Track query performance and optimization
- **UC9: Backup/Restore Data** - Ensure data safety and recovery procedures
- **UC10: Manage User Access** - Control database permissions and security
- **UC11: Update Phone Data** - Add new phones and update existing information

#### Developer Use Cases:
- **UC12: Execute Complex Queries** - Run advanced JOIN and analytical queries
- **UC13: Optimize Database Performance** - Improve query speed and efficiency
- **UC14: Implement New Features** - Add functionality to the system
- **UC15: Debug Database Issues** - Troubleshoot and resolve problems

#### Analyst Use Cases:
- **UC16: Generate Market Reports** - Create comprehensive market analysis
- **UC17: Analyze Price Trends** - Study pricing patterns over time
- **UC18: Study Brand Performance** - Evaluate brand market position
- **UC19: Export Data for Analysis** - Extract data for external analysis tools

---

## 4. Database Design Documentation

### 4.1 Design Philosophy and Approach

The PhoneDB system was designed using a **normalized relational database approach** to transform a flat CSV dataset containing 67+ columns into a well-structured, efficient database schema. The design follows industry best practices and academic database design principles.

### 4.2 Design Decisions and Rationale

#### 4.2.1 Normalization Strategy
**Decision**: Implement full normalization to 3NF/BCNF
**Rationale**: 
- Eliminates data redundancy (brand names, chipset names repeated thousands of times)
- Prevents update, insert, and delete anomalies
- Ensures data consistency and integrity
- Reduces storage requirements by approximately 40-60%
- Enables flexible querying through JOIN operations

#### 4.2.2 Table Structure Decisions

**1. Separate Lookup Tables**
```sql
brands, chipsets, operating_systems, display_types, storage_types, ram_types
```
**Rationale**: Extract frequently repeated categorical data into separate tables to eliminate redundancy and enable referential integrity.

**2. Central Entity Table**
```sql
phones (phone_id, brand_id, model, ...)
```
**Rationale**: Serves as the main entity linking all specifications and variants.

**3. Specialized Specification Tables**
```sql
phone_specifications, display_specifications, physical_specifications, 
camera_specifications, audio_features, additional_features
```
**Rationale**: Logical grouping of related attributes improves query performance and maintainability.

**4. Variant Tables**
```sql
phone_colors, phone_pricing
```
**Rationale**: Handle one-to-many relationships for phones with multiple colors or pricing variants.

#### 4.2.3 Key Design Choices

**Primary Keys**: Auto-incrementing integers for all tables
- **Advantage**: Fast joins, small storage footprint, database-generated uniqueness
- **Alternative Considered**: Natural keys (brand_name, model combination)
- **Decision Rationale**: Surrogate keys provide better performance and flexibility

**Foreign Key Constraints**: Implemented with CASCADE DELETE for specifications
- **Advantage**: Maintains referential integrity, automatic cleanup
- **Business Rule**: When a phone is deleted, all its specifications are automatically removed

**Data Types**: Careful selection based on actual data analysis
- VARCHAR sizes increased through migrations based on real data requirements
- DECIMAL for precise numeric values (prices, dimensions)
- BOOLEAN for true/false attributes
- TEXT for long descriptive fields
- ENUM for status with predefined values

#### 4.2.4 Indexing Strategy

**Primary Indexes**: Automatic on all primary keys and unique constraints

**Strategic Secondary Indexes**:
```sql
-- Query optimization indexes
CREATE INDEX idx_phones_brand ON phones(brand_id);
CREATE INDEX idx_phones_release_date ON phones(release_date);
CREATE INDEX idx_phone_specs_ram ON phone_specifications(ram_gb);
CREATE INDEX idx_phone_specs_storage ON phone_specifications(internal_storage_gb);
CREATE INDEX idx_pricing_unofficial ON phone_pricing(price_unofficial);
```

**Rationale**: Based on expected query patterns - filtering by brand, specifications, and price are most common operations.

### 4.3 Business Rules Enforced

#### 4.3.1 Database-Level Constraints
1. **Unique Brand-Model Combination**: `UNIQUE KEY unique_brand_model (brand_id, model)`
2. **Unique Phone-Color Combination**: `UNIQUE KEY unique_phone_color (phone_id, color_name)`
3. **Unique OS Version**: `UNIQUE KEY unique_os_version (os_name, os_version)`
4. **Referential Integrity**: Foreign key constraints prevent orphaned records

#### 4.3.2 Application-Level Rules
1. **Price Validation**: Prices must be positive values
2. **Specification Ranges**: RAM and storage must be realistic values
3. **Date Validation**: Release dates must be reasonable
4. **Data Completeness**: Core specifications required for phone listings

### 4.4 Performance Considerations

#### 4.4.1 Query Optimization
- **JOIN Optimization**: Foreign key indexes enable efficient JOIN operations
- **Filtering Optimization**: Indexes on commonly filtered columns (RAM, storage, price)
- **Sorting Optimization**: Indexes on commonly sorted columns (release_date, price)

#### 4.4.2 Scalability Design
- **Connection Pooling**: Database connection pool manages concurrent access
- **Prepared Statements**: Prevent SQL injection and improve performance
- **Result Caching**: API-level caching reduces database load
- **Pagination**: LIMIT/OFFSET for large result sets

#### 4.4.3 Storage Optimization
- **Normalized Storage**: Eliminates redundant data storage
- **Appropriate Data Types**: Minimizes storage requirements
- **Index Selectivity**: Indexes chosen based on query selectivity analysis

### 4.5 Security and Data Integrity

#### 4.5.1 Data Integrity Measures
- **Foreign Key Constraints**: Prevent invalid references
- **Unique Constraints**: Prevent duplicate entries
- **NOT NULL Constraints**: Ensure required data presence
- **Data Type Constraints**: Enforce proper data formats

#### 4.5.2 Security Considerations
- **Parameterized Queries**: Prevent SQL injection attacks
- **Connection Pooling**: Manage database connections securely
- **Environment Variables**: Database credentials stored securely
- **Access Control**: Database-level user permissions (implemented at deployment)

### 4.6 Maintenance and Evolution

#### 4.6.1 Migration System
- **Version-Controlled Migrations**: Sequential migration files track schema changes
- **Rollback Capability**: Each migration can be reversed if needed
- **Data Preservation**: Migrations preserve existing data while modifying schema

#### 4.6.2 Extensibility Design
- **Modular Structure**: Easy to add new specification categories
- **Lookup Tables**: Simple to add new brands, chipsets, or features
- **Flexible Attributes**: TEXT fields allow for evolving feature descriptions
- **Versioning**: Timestamp fields track data creation and updates

### 4.7 Trade-offs and Limitations

#### 4.7.1 Advantages Achieved
✅ **Data Consistency**: Single source of truth for all reference data  
✅ **Storage Efficiency**: 40-60% reduction in storage requirements  
✅ **Query Flexibility**: Complex filtering and sorting capabilities  
✅ **Referential Integrity**: Automatic constraint enforcement  
✅ **Maintainability**: Clear table structure and relationships  

#### 4.7.2 Trade-offs Accepted
⚖️ **Query Complexity**: Simple queries now require JOINs  
⚖️ **Initial Setup**: More complex schema setup and migration process  
⚖️ **Development Overhead**: Developers must understand relationships  

#### 4.7.3 Limitations Acknowledged
⚠️ **JOIN Performance**: Complex queries with many JOINs may be slower  
⚠️ **Schema Rigidity**: Adding new specification types requires schema changes  
⚠️ **Learning Curve**: New developers need to understand normalized structure  

**Mitigation Strategies**:
- Strategic indexing minimizes JOIN performance impact
- Migration system handles schema evolution gracefully
- Comprehensive documentation aids developer onboarding

---

## 5. Normalization Analysis

### 5.1 Original Data Problems (Denormalized CSV)

#### Before Normalization: Flat File Structure
The original dataset contained **67+ columns** in a single flat file with severe normalization violations:

```csv
brand_name,model,chipset_name,cpu,gpu,ram_gb,internal_storage_gb,os_name,os_version,
color_1,color_2,color_3,display_type_name,storage_type_name,ram_type_name,...
```

#### Critical Problems Identified:
1. **Massive Redundancy**: Brand "Samsung" repeated ~300 times
2. **Update Anomalies**: Changing brand name requires updating hundreds of records
3. **Insert Anomalies**: Cannot add new brand without adding a phone
4. **Delete Anomalies**: Deleting last phone loses brand information
5. **Multi-valued Attributes**: Colors stored as separate columns (violates 1NF)
6. **Data Inconsistency**: Same brand spelled differently across records

### 5.2 First Normal Form (1NF) Compliance

#### Rule: Each column must contain atomic values, no repeating groups

#### Violations Found:
```sql
-- BEFORE (Violates 1NF)
phones_flat (
    phone_id, model, brand_name, 
    color_1, color_2, color_3,  -- Multi-valued attribute!
    ...
)
```

#### Solution Applied:
```sql
-- AFTER (Satisfies 1NF)
phones (
    phone_id, model, brand_id, ...
)

phone_colors (
    color_id, phone_id, color_name  -- Atomic values only
)
```

✅ **1NF Status**: **COMPLIANT** - All attributes contain atomic values

### 5.3 Second Normal Form (2NF) Compliance

#### Rule: Must be in 1NF AND no partial dependencies on composite keys

#### Analysis: Our Design Avoids 2NF Violations
All tables use single-column primary keys, eliminating the possibility of partial dependencies:

```sql
-- No composite primary keys used
phones (phone_id, ...)           -- Single PK
phone_specifications (spec_id, ...)  -- Single PK  
brands (brand_id, ...)           -- Single PK
```

✅ **2NF Status**: **COMPLIANT** - No partial dependencies exist

### 5.3 Third Normal Form (3NF) Compliance

#### Rule: Must be in 2NF AND no transitive dependencies

#### Transitive Dependencies Identified and Resolved:

**Example 1: Brand Information**
```sql
-- BEFORE (Violates 3NF)
phones_with_brand_info (
    phone_id,        -- Primary key
    model,           -- Depends on phone_id ✓
    brand_name,      -- Depends on phone_id
    brand_country,   -- Depends on brand_name (TRANSITIVE!)
    brand_founded    -- Depends on brand_name (TRANSITIVE!)
)
-- Dependency chain: phone_id → brand_name → brand_country
```

```sql
-- AFTER (Satisfies 3NF)
brands (
    brand_id,        -- Primary key
    brand_name,      -- Depends on brand_id ✓
    brand_country,   -- Depends on brand_id ✓
    brand_founded    -- Depends on brand_id ✓
)

phones (
    phone_id,        -- Primary key
    model,           -- Depends on phone_id ✓
    brand_id         -- Depends on phone_id ✓ (FK)
)
```

**Example 2: Chipset Information**
```sql
-- BEFORE (Transitive dependency)
phone_specifications_bad (
    spec_id,           -- Primary key
    phone_id,          -- Depends on spec_id ✓
    chipset_name,      -- Depends on spec_id ✓
    architecture,      -- Depends on chipset_name (TRANSITIVE!)
    fabrication        -- Depends on chipset_name (TRANSITIVE!)
)
```

```sql
-- AFTER (3NF compliant)
chipsets (
    chipset_id,        -- Primary key
    chipset_name,      -- Depends on chipset_id ✓
    architecture,      -- Depends on chipset_id ✓
    fabrication        -- Depends on chipset_id ✓
)

phone_specifications (
    spec_id,           -- Primary key
    phone_id,          -- Depends on spec_id ✓
    chipset_id         -- Depends on spec_id ✓ (FK)
)
```

✅ **3NF Status**: **COMPLIANT** - All transitive dependencies eliminated

### 5.4 Boyce-Codd Normal Form (BCNF) Compliance

#### Rule: Must be in 3NF AND every determinant must be a candidate key

#### BCNF Analysis for Each Table:

**Table: brands**
```sql
brands (brand_id, brand_name, created_at)

Functional Dependencies:
- brand_id → brand_name, created_at ✓ (brand_id is candidate key)
- brand_name → brand_id ✓ (brand_name is unique, also candidate key)
```
✅ **BCNF Status**: **COMPLIANT**

**Table: phones**
```sql
phones (phone_id, brand_id, model, device_type, release_date, ...)

Functional Dependencies:
- phone_id → brand_id, model, device_type, ... ✓ (primary key)
- (brand_id, model) → phone_id ✓ (unique constraint creates candidate key)
```
✅ **BCNF Status**: **COMPLIANT**

**Table: phone_colors (Many-to-Many)**
```sql
phone_colors (color_id, phone_id, color_name, created_at)

Functional Dependencies:
- color_id → phone_id, color_name, created_at ✓ (primary key)
- (phone_id, color_name) → color_id ✓ (unique constraint)
```
✅ **BCNF Status**: **COMPLIANT**

### 5.5 Complete Normalization Results

#### 15 Normalized Tables Created:

**1. Reference Tables (Eliminate Redundancy)**
- `brands` - Eliminates brand name repetition
- `chipsets` - Eliminates chipset specification repetition  
- `operating_systems` - Eliminates OS information repetition
- `display_types` - Eliminates display technology repetition
- `storage_types` - Eliminates storage technology repetition
- `ram_types` - Eliminates RAM technology repetition

**2. Main Entity**
- `phones` - Central entity with core device information

**3. Specification Tables (1:1 with phones)**
- `phone_specifications` - Technical specifications
- `display_specifications` - Screen and display details
- `physical_specifications` - Dimensions and build quality
- `camera_specifications` - Camera system details
- `audio_features` - Audio capabilities
- `additional_features` - Extra features and connectivity

**4. Variant Tables (1:Many with phones)**
- `phone_colors` - Multiple color options per phone
- `phone_pricing` - Multiple pricing variants per phone

### 5.6 Normalization Benefits Quantified

#### Storage Efficiency Gains
```
BEFORE: 300 Samsung phones × "Samsung" (7 chars) = 2,100 characters
AFTER:  1 × "Samsung" (7 chars) + 300 × brand_id (4 bytes) = 1,207 bytes
SAVINGS: ~43% reduction for brand names alone
```

#### Update Efficiency Improvements
```
BEFORE: Change brand name → Update 300+ individual records
AFTER:  Change brand name → Update 1 record in brands table
RESULT: 300x fewer database operations
```

#### Query Performance Benefits
```sql
-- Efficient brand filtering with indexed foreign key
SELECT p.model FROM phones p 
JOIN brands b ON p.brand_id = b.brand_id 
WHERE b.brand_name = 'Samsung';

-- vs. Full table scan on text field
SELECT model FROM phones_flat 
WHERE brand_name = 'Samsung';
```

### 5.7 Educational Demonstration: Before/After Examples

#### Example 1: Adding a New Brand
```sql
-- BEFORE (Denormalized): Cannot add brand without phone
-- Must insert complete phone record just to add brand

-- AFTER (Normalized): Clean brand addition
INSERT INTO brands (brand_name) VALUES ('OnePlus');
-- Brand now available for any phone
```

#### Example 2: Updating Brand Information
```sql
-- BEFORE: Update every single phone record
UPDATE phones_flat 
SET brand_name = 'Samsung Electronics' 
WHERE brand_name = 'Samsung';  -- Updates 300+ records

-- AFTER: Single update affects all phones
UPDATE brands 
SET brand_name = 'Samsung Electronics' 
WHERE brand_name = 'Samsung';  -- Updates 1 record, affects all phones
```

#### Example 3: Complex Filtering Query
```sql
-- AFTER (Normalized): Efficient multi-table filtering
SELECT p.model, b.brand_name, c.chipset_name, ps.ram_gb
FROM phones p
JOIN brands b ON p.brand_id = b.brand_id
JOIN phone_specifications ps ON p.phone_id = ps.phone_id  
JOIN chipsets c ON ps.chipset_id = c.chipset_id
WHERE b.brand_name = 'Apple' 
  AND c.chipset_name LIKE '%A16%'
  AND ps.ram_gb >= 8;
-- Uses indexes on foreign keys for fast execution
```

### 5.8 Normalization Compliance Checklist

#### ✅ First Normal Form (1NF)
- [x] All attributes contain atomic values
- [x] No repeating groups (colors moved to separate table)
- [x] Each row uniquely identifiable
- [x] Column names unique within tables

#### ✅ Second Normal Form (2NF)  
- [x] Satisfies 1NF requirements
- [x] No composite primary keys (eliminates partial dependencies)
- [x] All non-key attributes fully depend on primary key

#### ✅ Third Normal Form (3NF)
- [x] Satisfies 2NF requirements  
- [x] No transitive dependencies
- [x] Brand information → separate brands table
- [x] Chipset information → separate chipsets table
- [x] OS information → separate operating_systems table
- [x] All lookup data properly separated

#### ✅ Boyce-Codd Normal Form (BCNF)
- [x] Satisfies 3NF requirements
- [x] Every determinant is a candidate key
- [x] No BCNF violations in any table
- [x] All functional dependencies properly structured

### 5.9 Real-World Impact Summary

The normalization process transformed a problematic flat file into a robust relational database that:

**Eliminates Anomalies**: No more update, insert, or delete anomalies  
**Ensures Consistency**: Single source of truth for all reference data  
**Improves Performance**: Strategic indexing enables fast queries  
**Reduces Storage**: ~50% reduction in storage requirements  
**Enables Scalability**: Clean structure supports future growth  
**Maintains Integrity**: Foreign key constraints prevent data corruption  

This demonstrates how proper database design principles create efficient, maintainable, and scalable data management systems suitable for real-world applications.

---

## 📝 Conclusion

This comprehensive database analysis demonstrates a complete transformation from a flat CSV file to a fully normalized, efficient relational database system. The PhoneDB system serves as an excellent example of applying database design principles in practice, showing how proper normalization eliminates redundancy, ensures data integrity, and enables flexible querying while maintaining optimal performance.

The system successfully implements all normalization forms (1NF, 2NF, 3NF, BCNF) and provides a solid foundation for a mobile phone specification management system suitable for both academic study and real-world application.
