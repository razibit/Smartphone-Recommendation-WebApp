-- Mobile Specs Database - Normalized Schema (3NF/BCNF)
-- Migration: 001_create_schema
-- Description: Create normalized database schema with all tables and indexes

-- Drop database if exists and create new one
DROP DATABASE IF EXISTS mobile_specs;
CREATE DATABASE mobile_specs;
USE mobile_specs;

-- 1. Brands table (eliminates brand redundancy)
CREATE TABLE brands (
    brand_id INT PRIMARY KEY AUTO_INCREMENT,
    brand_name VARCHAR(100) NOT NULL UNIQUE, -- increased from 50
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Chipsets table (eliminates chipset redundancy)
CREATE TABLE chipsets (
    chipset_id INT PRIMARY KEY AUTO_INCREMENT,
    chipset_name VARCHAR(200) NOT NULL UNIQUE, -- increased from 100
    architecture VARCHAR(50), -- increased from 20
    fabrication VARCHAR(20), -- increased from 10
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Operating Systems table
CREATE TABLE operating_systems (
    os_id INT PRIMARY KEY AUTO_INCREMENT,
    os_name VARCHAR(50) NOT NULL,
    os_version VARCHAR(150), -- increased from 100 to handle longer version strings
    user_interface VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_os_version (os_name, os_version)
);

-- 4. Display Types table
CREATE TABLE display_types (
    display_type_id INT PRIMARY KEY AUTO_INCREMENT,
    display_type_name VARCHAR(100) NOT NULL UNIQUE, -- increased from 50
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Storage Types table
CREATE TABLE storage_types (
    storage_type_id INT PRIMARY KEY AUTO_INCREMENT,
    storage_type_name VARCHAR(50) NOT NULL UNIQUE, -- increased from 20
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. RAM Types table
CREATE TABLE ram_types (
    ram_type_id INT PRIMARY KEY AUTO_INCREMENT,
    ram_type_name VARCHAR(100) NOT NULL UNIQUE, -- increased from 20
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Main Phones table (core device information)
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

-- 8. Phone Specifications table (technical specs)
CREATE TABLE phone_specifications (
    spec_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    chipset_id INT,
    os_id INT,
    display_type_id INT,
    storage_type_id INT,
    ram_type_id INT,
    
    -- CPU details
    cpu VARCHAR(300), -- increased from 200
    cpu_cores varchar(300), -- increased from 200
    gpu VARCHAR(200), -- increased from 100
    
    -- Memory and Storage
    ram_gb INT,
    internal_storage_gb INT,
    expandable_memory BOOLEAN DEFAULT FALSE,
    
    -- Battery
    battery_capacity VARCHAR(50), -- changed from INT to handle non-numeric data
    quick_charging VARCHAR(300), -- increased from 100
    
    -- Connectivity
    bluetooth_version VARCHAR(50), -- increased from 10
    network VARCHAR(100), -- increased from 50
    wlan VARCHAR(400), -- increased from 200
    usb VARCHAR(200), -- increased from 100
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

-- 9. Display Specifications table
CREATE TABLE display_specifications (
    display_spec_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    screen_size VARCHAR(50), -- changed from DECIMAL to handle non-numeric data
    resolution VARCHAR(800), -- increased from 600 to handle longer strings
    pixel_density INT, -- ppi
    refresh_rate INT, -- Hz
    brightness INT, -- nits
    aspect_ratio VARCHAR(50), -- increased from 10
    screen_protection VARCHAR(100), -- increased from 50
    screen_to_body_ratio DECIMAL(6,2), -- percentage (increased from 5,2 to handle extreme values)
    touch_screen VARCHAR(100), -- increased from 50
    notch VARCHAR(100), -- increased from 20
    edge BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_id) REFERENCES phones(phone_id) ON DELETE CASCADE
);

-- 10. Physical Specifications table
CREATE TABLE physical_specifications (
    physical_spec_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    height DECIMAL(6,2), -- mm (increased from 5,2)
    width DECIMAL(6,2), -- mm (increased from 5,2)
    thickness DECIMAL(5,2), -- mm (increased from 4,2)
    weight varchar(200), -- grams (increased from 100)
    ip_rating VARCHAR(20),
    waterproof VARCHAR(200), -- increased from 100
    ruggedness VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_id) REFERENCES phones(phone_id) ON DELETE CASCADE
);

-- 11. Camera Specifications table
CREATE TABLE camera_specifications (
    camera_spec_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    primary_camera_resolution VARCHAR(300), -- increased from 100
    primary_camera_features TEXT,
    primary_camera_autofocus BOOLEAN DEFAULT FALSE,
    primary_camera_flash BOOLEAN DEFAULT FALSE,
    primary_camera_image_resolution VARCHAR(50),
    video VARCHAR(300), -- increased from 200
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_id) REFERENCES phones(phone_id) ON DELETE CASCADE
);

-- 12. Audio Features table
CREATE TABLE audio_features (
    audio_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    audio_jack VARCHAR(100), -- increased from 20
    loudspeaker BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_id) REFERENCES phones(phone_id) ON DELETE CASCADE
);

-- 13. Additional Features table
CREATE TABLE additional_features (
    feature_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    features TEXT,
    face_unlock BOOLEAN DEFAULT FALSE,
    gps VARCHAR(200), -- increased from 100
    gprs BOOLEAN DEFAULT FALSE,
    volte BOOLEAN DEFAULT FALSE,
    sim_size VARCHAR(100), -- increased from 50
    sim_slot VARCHAR(100), -- increased from 50
    speed VARCHAR(200), -- increased from 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_id) REFERENCES phones(phone_id) ON DELETE CASCADE
);

-- 14. Phone Colors table (many-to-many relationship)
CREATE TABLE phone_colors (
    color_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    color_name VARCHAR(100) NOT NULL, -- increased from 50
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_id) REFERENCES phones(phone_id) ON DELETE CASCADE,
    UNIQUE KEY unique_phone_color (phone_id, color_name)
);

-- 15. Phone Pricing table (handles multiple price variants)
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

-- Create indexes for better performance
CREATE INDEX idx_phones_brand ON phones(brand_id);
CREATE INDEX idx_phones_release_date ON phones(release_date);
CREATE INDEX idx_phones_status ON phones(status);
CREATE INDEX idx_phone_specs_phone ON phone_specifications(phone_id);
CREATE INDEX idx_phone_specs_chipset ON phone_specifications(chipset_id);
CREATE INDEX idx_phone_specs_ram ON phone_specifications(ram_gb);
CREATE INDEX idx_phone_specs_storage ON phone_specifications(internal_storage_gb);
CREATE INDEX idx_display_specs_phone ON display_specifications(phone_id);
CREATE INDEX idx_display_specs_size ON display_specifications(screen_size(20)); -- with prefix for VARCHAR
CREATE INDEX idx_physical_specs_phone ON physical_specifications(phone_id);
CREATE INDEX idx_camera_specs_phone ON camera_specifications(phone_id);
CREATE INDEX idx_pricing_phone ON phone_pricing(phone_id);
CREATE INDEX idx_pricing_unofficial ON phone_pricing(price_unofficial);
CREATE INDEX idx_colors_phone ON phone_colors(phone_id);