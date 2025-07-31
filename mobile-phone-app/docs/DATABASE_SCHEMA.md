# 🗄️ Database Schema Documentation

## Overview

The PhoneDB system implements a fully normalized relational database schema that transforms a flat CSV dataset (67+ columns) into **15 interconnected tables**, demonstrating perfect adherence to Third Normal Form (3NF) and Boyce-Codd Normal Form (BCNF) principles.

## 📊 Schema Visualization

![Database Schema Diagram](../README.md#database-schema-overview)

## 🏗️ Table Structure & Relationships

### Core Entity Tables

#### 1. `brands` - Device Manufacturers
```sql
CREATE TABLE brands (
    brand_id INT PRIMARY KEY AUTO_INCREMENT,
    brand_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose**: Eliminates brand name redundancy across the dataset
**Normalization**: Satisfies 3NF/BCNF - brand_name is fully dependent on brand_id

#### 2. `chipsets` - Processor Information
```sql
CREATE TABLE chipsets (
    chipset_id INT PRIMARY KEY AUTO_INCREMENT,
    chipset_name VARCHAR(200) NOT NULL UNIQUE,
    architecture VARCHAR(50),
    fabrication VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose**: Separates chipset specifications from phone data
**Normalization**: All attributes depend solely on chipset_id (BCNF compliant)

#### 3. `operating_systems` - OS Details
```sql
CREATE TABLE operating_systems (
    os_id INT PRIMARY KEY AUTO_INCREMENT,
    os_name VARCHAR(50) NOT NULL,
    os_version VARCHAR(150),
    user_interface VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_os_version (os_name, os_version)
);
```
**Purpose**: Normalizes operating system information
**Special**: Composite unique constraint ensures one record per OS version

### Lookup/Reference Tables

#### 4. `display_types` - Screen Technologies
```sql
CREATE TABLE display_types (
    display_type_id INT PRIMARY KEY AUTO_INCREMENT,
    display_type_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. `storage_types` - Memory Technologies
```sql
CREATE TABLE storage_types (
    storage_type_id INT PRIMARY KEY AUTO_INCREMENT,
    storage_type_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. `ram_types` - RAM Technologies
```sql
CREATE TABLE ram_types (
    ram_type_id INT PRIMARY KEY AUTO_INCREMENT,
    ram_type_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Main Entity Table

#### 7. `phones` - Core Device Information
```sql
CREATE TABLE phones (
    phone_id INT PRIMARY KEY AUTO_INCREMENT,
    brand_id INT NOT NULL,
    model VARCHAR(100) NOT NULL,
    device_type VARCHAR(20) DEFAULT 'Smartphone',
    release_date DATE,
    status ENUM('Available', 'Upcoming', 'Rumored', 'Discontinued') DEFAULT 'Available',
    detail_url VARCHAR(500),
    image_url VARCHAR(500),
    scraped_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(brand_id),
    UNIQUE KEY unique_brand_model (brand_id, model)
);
```
**Purpose**: Central entity linking all phone specifications
**Business Rule**: Each brand-model combination must be unique

### Specification Tables (One-to-One with phones)

#### 8. `phone_specifications` - Technical Specifications
```sql
CREATE TABLE phone_specifications (
    spec_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    chipset_id INT,
    os_id INT,
    display_type_id INT,
    storage_type_id INT,
    ram_type_id INT,
    -- CPU details
    cpu VARCHAR(300),
    cpu_cores VARCHAR(300),
    gpu VARCHAR(200),
    -- Memory and Storage
    ram_gb INT,
    internal_storage_gb INT,
    expandable_memory BOOLEAN DEFAULT FALSE,
    -- Battery
    battery_capacity VARCHAR(50),
    quick_charging VARCHAR(300),
    -- Connectivity
    bluetooth_version VARCHAR(50),
    network VARCHAR(100),
    wlan VARCHAR(400),
    usb VARCHAR(200),
    usb_otg BOOLEAN DEFAULT FALSE,
    usb_type_c BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_id) REFERENCES phones(phone_id) ON DELETE CASCADE,
    FOREIGN KEY (chipset_id) REFERENCES chipsets(chipset_id),
    FOREIGN KEY (os_id) REFERENCES operating_systems(os_id),
    FOREIGN KEY (display_type_id) REFERENCES display_types(display_type_id),
    FOREIGN KEY (storage_type_id) REFERENCES storage_types(storage_type_id),
    FOREIGN KEY (ram_type_id) REFERENCES ram_types(ram_type_id)
);
```
**Purpose**: Contains core technical specifications with foreign key references
**Normalization**: All specifications depend on phone_id, lookup values normalized

#### 9. `display_specifications` - Screen Details
```sql
CREATE TABLE display_specifications (
    display_spec_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    screen_size VARCHAR(50),
    resolution VARCHAR(800),
    pixel_density INT,
    refresh_rate INT,
    brightness INT,
    aspect_ratio VARCHAR(50),
    screen_protection VARCHAR(100),
    screen_to_body_ratio DECIMAL(6,2),
    touch_screen VARCHAR(100),
    notch VARCHAR(100),
    edge BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_id) REFERENCES phones(phone_id) ON DELETE CASCADE
);
```

#### 10. `physical_specifications` - Dimensions & Build
```sql
CREATE TABLE physical_specifications (
    physical_spec_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    height DECIMAL(6,2),
    width DECIMAL(6,2),
    thickness DECIMAL(5,2),
    weight VARCHAR(200),
    ip_rating VARCHAR(20),
    waterproof VARCHAR(200),
    ruggedness VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_id) REFERENCES phones(phone_id) ON DELETE CASCADE
);
```

#### 11. `camera_specifications` - Camera System
```sql
CREATE TABLE camera_specifications (
    camera_spec_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    primary_camera_resolution VARCHAR(300),
    primary_camera_features TEXT,
    primary_camera_autofocus BOOLEAN DEFAULT FALSE,
    primary_camera_flash BOOLEAN DEFAULT FALSE,
    primary_camera_image_resolution VARCHAR(50),
    video VARCHAR(300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_id) REFERENCES phones(phone_id) ON DELETE CASCADE
);
```

#### 12. `audio_features` - Audio Capabilities
```sql
CREATE TABLE audio_features (
    audio_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    audio_jack VARCHAR(100),
    loudspeaker BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_id) REFERENCES phones(phone_id) ON DELETE CASCADE
);
```

#### 13. `additional_features` - Extra Features
```sql
CREATE TABLE additional_features (
    feature_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    features TEXT,
    face_unlock BOOLEAN DEFAULT FALSE,
    gps VARCHAR(200),
    gprs BOOLEAN DEFAULT FALSE,
    volte BOOLEAN DEFAULT FALSE,
    sim_size VARCHAR(100),
    sim_slot VARCHAR(100),
    speed VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_id) REFERENCES phones(phone_id) ON DELETE CASCADE
);
```

### Variant Tables (One-to-Many with phones)

#### 14. `phone_colors` - Available Colors
```sql
CREATE TABLE phone_colors (
    color_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    color_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_id) REFERENCES phones(phone_id) ON DELETE CASCADE,
    UNIQUE KEY unique_phone_color (phone_id, color_name)
);
```
**Purpose**: Handles phones with multiple color variants
**Business Rule**: One phone can have multiple colors, but no duplicate colors per phone

#### 15. `phone_pricing` - Price Information
```sql
CREATE TABLE phone_pricing (
    pricing_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    price_official DECIMAL(10,2),
    price_unofficial DECIMAL(10,2),
    price_old DECIMAL(10,2),
    price_savings DECIMAL(10,2),
    price_updated DATE,
    variant_description VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_id) REFERENCES phones(phone_id) ON DELETE CASCADE
);
```
**Purpose**: Manages multiple pricing variants (official, unofficial, historical)
**Business Rule**: Supports price tracking over time and multiple sales channels

## 🔗 Relationship Types

### One-to-Many Relationships
- `brands` → `phones` (one brand manufactures many phones)
- `chipsets` → `phone_specifications` (one chipset used in many phones)
- `operating_systems` → `phone_specifications` (one OS version on many phones)
- `display_types` → `phone_specifications` (one display type in many phones)
- `storage_types` → `phone_specifications` (one storage type in many phones)
- `ram_types` → `phone_specifications` (one RAM type in many phones)
- `phones` → `phone_colors` (one phone available in many colors)
- `phones` → `phone_pricing` (one phone with multiple pricing variants)

### One-to-One Relationships
- `phones` → `phone_specifications` (each phone has one spec record)
- `phones` → `display_specifications` (each phone has one display spec)
- `phones` → `physical_specifications` (each phone has one physical spec)
- `phones` → `camera_specifications` (each phone has one camera spec)
- `phones` → `audio_features` (each phone has one audio spec)
- `phones` → `additional_features` (each phone has one feature spec)

## 📈 Performance Optimization

### Primary Indexes (Automatic)
- All primary keys are automatically indexed
- All unique constraints create unique indexes

### Custom Indexes for Query Optimization
```sql
-- Basic phone queries
CREATE INDEX idx_phones_brand ON phones(brand_id);
CREATE INDEX idx_phones_release_date ON phones(release_date);
CREATE INDEX idx_phones_status ON phones(status);

-- Specification filtering
CREATE INDEX idx_phone_specs_phone ON phone_specifications(phone_id);
CREATE INDEX idx_phone_specs_chipset ON phone_specifications(chipset_id);
CREATE INDEX idx_phone_specs_ram ON phone_specifications(ram_gb);
CREATE INDEX idx_phone_specs_storage ON phone_specifications(internal_storage_gb);

-- Display filtering
CREATE INDEX idx_display_specs_phone ON display_specifications(phone_id);
CREATE INDEX idx_display_specs_size ON display_specifications(screen_size(20));

-- Physical specifications
CREATE INDEX idx_physical_specs_phone ON physical_specifications(phone_id);

-- Camera queries
CREATE INDEX idx_camera_specs_phone ON camera_specifications(phone_id);

-- Pricing queries
CREATE INDEX idx_pricing_phone ON phone_pricing(phone_id);
CREATE INDEX idx_pricing_unofficial ON phone_pricing(price_unofficial);

-- Color queries
CREATE INDEX idx_colors_phone ON phone_colors(phone_id);
```

### Advanced Indexes (Added in Migration 003)
- **Composite indexes** for multi-column queries
- **Covering indexes** that contain all needed columns
- **Foreign key indexes** for join optimization
- **Full-text indexes** for text search capabilities

## 🧮 Data Integrity Constraints

### Foreign Key Constraints
- **CASCADE DELETE**: Specification tables automatically delete when parent phone is deleted
- **RESTRICT**: Lookup tables cannot be deleted if referenced by phones
- **NULL handling**: Optional foreign keys allow for incomplete data

### Unique Constraints
- `brands.brand_name` - No duplicate brand names
- `chipsets.chipset_name` - No duplicate chipset names
- `phones(brand_id, model)` - No duplicate models within same brand
- `phone_colors(phone_id, color_name)` - No duplicate colors per phone
- `operating_systems(os_name, os_version)` - No duplicate OS versions

### Check Constraints (Enforced at Application Level)
- Price values must be positive
- RAM and storage values must be positive integers
- Screen dimensions must be realistic values
- Date fields validated for reasonable ranges

## 🔄 Data Flow & Transformation

### Original CSV Structure
```
brand_name, model, price_unofficial, chipset_name, cpu, gpu, ram_gb, 
internal_storage_gb, screen_size, resolution, pixel_density, os_name, 
os_version, battery_capacity, primary_camera_resolution, ...
(67+ columns total)
```

### Normalized Structure
1. **Extract brands** → `brands` table (eliminates brand redundancy)
2. **Extract chipsets** → `chipsets` table (eliminates chipset redundancy)
3. **Extract OS info** → `operating_systems` table
4. **Extract display types** → `display_types` table
5. **Split specifications** → Multiple `*_specifications` tables
6. **Handle variants** → `phone_colors` and `phone_pricing` tables

### Benefits of Normalization
- **Eliminated Redundancy**: Brand names stored once, referenced by ID
- **Data Consistency**: Updates to brand names apply system-wide
- **Reduced Storage**: Significant space savings with large datasets
- **Query Flexibility**: Join-based queries enable complex filtering
- **Referential Integrity**: Foreign keys prevent orphaned records
- **Extensibility**: Easy to add new brands, chipsets, or features

## 🔍 Common Query Patterns

### Filter by Brand and Chipset
```sql
SELECT p.model, b.brand_name, c.chipset_name, ps.ram_gb
FROM phones p
JOIN brands b ON p.brand_id = b.brand_id
JOIN phone_specifications ps ON p.phone_id = ps.phone_id
JOIN chipsets c ON ps.chipset_id = c.chipset_id
WHERE b.brand_name = 'Samsung' 
  AND c.chipset_name LIKE '%Snapdragon%';
```

### Complex Filtering with Multiple Joins
```sql
SELECT DISTINCT p.phone_id, p.model, b.brand_name,
       ps.ram_gb, ps.internal_storage_gb, pr.price_unofficial
FROM phones p
JOIN brands b ON p.brand_id = b.brand_id
JOIN phone_specifications ps ON p.phone_id = ps.phone_id
JOIN phone_pricing pr ON p.phone_id = pr.phone_id
WHERE ps.ram_gb >= 8
  AND ps.internal_storage_gb >= 128
  AND pr.price_unofficial BETWEEN 300 AND 1000
ORDER BY pr.price_unofficial;
```

### Aggregate Queries for Statistics
```sql
SELECT b.brand_name, 
       COUNT(*) as phone_count,
       AVG(pr.price_unofficial) as avg_price,
       MIN(ps.ram_gb) as min_ram,
       MAX(ps.ram_gb) as max_ram
FROM phones p
JOIN brands b ON p.brand_id = b.brand_id
JOIN phone_specifications ps ON p.phone_id = ps.phone_id
JOIN phone_pricing pr ON p.phone_id = pr.phone_id
GROUP BY b.brand_id, b.brand_name
HAVING COUNT(*) >= 10
ORDER BY avg_price DESC;
```

## 📚 Educational Value

This schema demonstrates several key database concepts:

1. **Normalization Theory**: Practical application of 3NF/BCNF rules
2. **Entity-Relationship Design**: Proper identification of entities and relationships
3. **Referential Integrity**: Foreign key constraints maintain data consistency
4. **Index Design**: Strategic indexing for query performance
5. **Data Type Selection**: Appropriate types for different kinds of data
6. **Constraint Design**: Business rules enforced at database level

The transformation from a flat CSV to this normalized schema shows how proper database design eliminates redundancy, ensures consistency, and enables flexible querying while maintaining data integrity.