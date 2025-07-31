-- Mobile Specs Database - Normalized Schema (3NF/BCNF)
-- Database: mobile_specs

-- Drop database if exists and create new one
DROP DATABASE IF EXISTS mobile_specs;
CREATE DATABASE mobile_specs;
USE mobile_specs;

-- 1. Brands table (eliminates brand redundancy)
CREATE TABLE brands (
    brand_id INT PRIMARY KEY AUTO_INCREMENT,
    brand_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Chipsets table (eliminates chipset redundancy)
CREATE TABLE chipsets (
    chipset_id INT PRIMARY KEY AUTO_INCREMENT,
    chipset_name VARCHAR(100) NOT NULL UNIQUE,
    architecture VARCHAR(20),
    fabrication VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Operating Systems table
CREATE TABLE operating_systems (
    os_id INT PRIMARY KEY AUTO_INCREMENT,
    os_name VARCHAR(50) NOT NULL,
    os_version VARCHAR(20),
    user_interface VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_os_version (os_name, os_version)
);

-- 4. Display Types table
CREATE TABLE display_types (
    display_type_id INT PRIMARY KEY AUTO_INCREMENT,
    display_type_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Storage Types table
CREATE TABLE storage_types (
    storage_type_id INT PRIMARY KEY AUTO_INCREMENT,
    storage_type_name VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. RAM Types table
CREATE TABLE ram_types (
    ram_type_id INT PRIMARY KEY AUTO_INCREMENT,
    ram_type_name VARCHAR(20) NOT NULL UNIQUE,
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
    cpu VARCHAR(200),
    cpu_cores INT,
    gpu VARCHAR(100),
    
    -- Memory and Storage
    ram_gb INT,
    internal_storage_gb INT,
    expandable_memory BOOLEAN DEFAULT FALSE,
    
    -- Battery
    battery_capacity INT, -- in mAh
    quick_charging VARCHAR(100),
    
    -- Connectivity
    bluetooth_version VARCHAR(10),
    network VARCHAR(50),
    wlan VARCHAR(200),
    usb VARCHAR(100),
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
    screen_size DECIMAL(3,2), -- in inches
    resolution VARCHAR(20),
    pixel_density INT, -- ppi
    refresh_rate INT, -- Hz
    brightness INT, -- nits
    aspect_ratio VARCHAR(10),
    screen_protection VARCHAR(50),
    screen_to_body_ratio DECIMAL(4,2), -- percentage
    touch_screen VARCHAR(50),
    notch VARCHAR(20),
    edge BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_id) REFERENCES phones(phone_id) ON DELETE CASCADE
);

-- 10. Physical Specifications table
CREATE TABLE physical_specifications (
    physical_spec_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    height DECIMAL(5,2), -- mm
    width DECIMAL(5,2), -- mm
    thickness DECIMAL(4,2), -- mm
    weight DECIMAL(5,1), -- grams
    ip_rating VARCHAR(20),
    waterproof VARCHAR(100),
    ruggedness VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_id) REFERENCES phones(phone_id) ON DELETE CASCADE
);

-- 11. Camera Specifications table
CREATE TABLE camera_specifications (
    camera_spec_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    primary_camera_resolution VARCHAR(100),
    primary_camera_features TEXT,
    primary_camera_autofocus BOOLEAN DEFAULT FALSE,
    primary_camera_flash BOOLEAN DEFAULT FALSE,
    primary_camera_image_resolution VARCHAR(50),
    video VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_id) REFERENCES phones(phone_id) ON DELETE CASCADE
);

-- 12. Audio Features table
CREATE TABLE audio_features (
    audio_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    audio_jack VARCHAR(20),
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
    gps VARCHAR(100),
    gprs BOOLEAN DEFAULT FALSE,
    volte BOOLEAN DEFAULT FALSE,
    sim_size VARCHAR(50),
    sim_slot VARCHAR(50),
    speed VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_id) REFERENCES phones(phone_id) ON DELETE CASCADE
);

-- 14. Phone Colors table (many-to-many relationship)
CREATE TABLE phone_colors (
    color_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_id INT NOT NULL,
    color_name VARCHAR(50) NOT NULL,
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
CREATE INDEX idx_phone_specs_phone ON phone_specifications(phone_id);
CREATE INDEX idx_display_specs_phone ON display_specifications(phone_id);
CREATE INDEX idx_physical_specs_phone ON physical_specifications(phone_id);
CREATE INDEX idx_camera_specs_phone ON camera_specifications(phone_id);
CREATE INDEX idx_pricing_phone ON phone_pricing(phone_id);

-- Sample INSERT statements based on CSV data

-- Insert sample brands
INSERT INTO brands (brand_name) VALUES 
('Oppo'),
('Samsung'),
('Xiaomi');

-- Insert sample chipsets
INSERT INTO chipsets (chipset_name, architecture, fabrication) VALUES 
('Qualcomm SM8735 Snapdragon 8s Gen 4', '64 bit', '4 nm'),
('Exynos 1380', '64 bit', '5 nm'),
('Qualcomm SM7325-AE Snapdragon 778G Plus 5G', '64 bit', '6 nm');

-- Insert sample operating systems
INSERT INTO operating_systems (os_name, os_version, user_interface) VALUES 
('Android', 'v15', 'ColorOS 15'),
('Android', 'v15', 'One UI 7'),
('Android', 'v12', 'MIUI 13');

-- Insert sample display types
INSERT INTO display_types (display_type_name) VALUES 
('AMOLED'),
('Super AMOLED'),
('OLED');

-- Insert sample storage types
INSERT INTO storage_types (storage_type_name) VALUES 
('UFS 4.0'),
('UFS 2.2'),
('UFS 2.2');

-- Insert sample RAM types
INSERT INTO ram_types (ram_type_name) VALUES 
('LPDDR5X'),
('LPDDR4X'),
('LPDDR4X');

-- Insert sample phones
INSERT INTO phones (brand_id, model, device_type, release_date, status, detail_url, image_url, scraped_at) VALUES 
(1, 'K13 Turbo Pro (512GB)', 'Smartphone', '2025-07-25', 'Available', 
 'https://www.mobiledokan.com/mobile/oppo-k13-turbo-pro-512gb',
 'https://www.mobiledokan.com/media/oppo-k13-turbo-pro-knight-silver-official-image_1.webp',
 '2025-07-29 17:02:23'),
(2, 'Galaxy M36', 'Smartphone', '2025-07-12', 'Available',
 'https://www.mobiledokan.com/mobile/samsung-galaxy-m36',
 'https://www.mobiledokan.com/media/samsung-galaxy-m36-orange-haze-official-image.webp',
 '2025-07-29 17:02:33');

-- Insert phone specifications
INSERT INTO phone_specifications (phone_id, chipset_id, os_id, display_type_id, storage_type_id, ram_type_id,
    cpu, cpu_cores, gpu, ram_gb, internal_storage_gb, expandable_memory, battery_capacity, quick_charging,
    bluetooth_version, network, wlan, usb, usb_otg, usb_type_c) VALUES 
(1, 1, 1, 1, 1, 1,
 'Octa-core (1x3.21 GHz Cortex-X4 & 3x3.0 GHz Cortex-A720 & 2x2.8 GHz Cortex-A720 & 2x2.0 GHz Cortex-A720)', 
 8, 'Adreno 825', 12, 512, FALSE, 7000, '80W wired, 13.5W PD, 44W UFCS, 33W PPS',
 'v5.4', '2G, 3G, 4G, 5G', 'Wi-Fi 7 (802.11 a/b/g/n/ac/be/ax) 5GHz 6GHz, MIMO',
 'Mass storage device, USB charging', TRUE, TRUE),
(2, 2, 2, 2, 2, 2,
 'Octa-core (4x2.4 GHz Cortex-A78 & 4x2.0 GHz Cortex-A55)',
 8, 'Mali-G68 MP5', 6, 128, TRUE, 5000, '25W wired',
 'v5.3', '2G, 3G, 4G, 5G', 'Wi-Fi 6 (802.11 a/b/g/n/ac/ax) 5GHz, MIMO',
 'Mass storage device, USB charging', TRUE, TRUE);

-- Insert display specifications
INSERT INTO display_specifications (phone_id, screen_size, resolution, pixel_density, refresh_rate, brightness,
    aspect_ratio, screen_protection, screen_to_body_ratio, touch_screen, notch, edge) VALUES 
(1, 6.8, '1280x2800p', 453, 120, 1600, '19.5:9', 'Gorilla Glass', 89.80, 
 'Capacitive Touchscreen, Multi-touch', 'Punch-hole', TRUE),
(2, 6.7, '1080x2340p', 385, 120, NULL, '19.5:9', 'Corning Gorilla Glass Victus Plus', 86.00,
 'Capacitive Touchscreen, Multi-touch', 'Punch-hole', TRUE);

-- Insert physical specifications
INSERT INTO physical_specifications (phone_id, height, width, thickness, weight, ip_rating, waterproof, ruggedness) VALUES 
(1, 162.8, 77.2, 7.3, 208.0, 'IP68/IP69', 'Water resistant (up to 2m for 30 min)', 'Dust proof'),
(2, 164.4, 77.9, 7.7, 197.0, NULL, NULL, NULL);

-- Insert camera specifications
INSERT INTO camera_specifications (phone_id, primary_camera_resolution, primary_camera_features, 
    primary_camera_autofocus, primary_camera_flash, video) VALUES 
(1, '50 MP, f/1.8, Wide Angle, Primary Camera, 2 MP, Camera', NULL, FALSE, FALSE, 
 '4K@30/60fps, 1080p@30fps'),
(2, '50 MP, f/1.8, Wide Angle, Primary Camera, 8 MP, f/2.2, Ultra-Wide Angle Camera, 2 MP, f/2.4, Macro Camera', 
 NULL, FALSE, FALSE, '4K@30fps, 1080p@30/60fps, 720p@480fps, gyro-EIS');

-- Insert audio features
INSERT INTO audio_features (phone_id, audio_jack, loudspeaker) VALUES 
(1, 'USB Type-C', TRUE),
(2, 'USB Type-C', TRUE);

-- Insert additional features
INSERT INTO additional_features (phone_id, features, face_unlock, gps, gprs, volte, sim_size, sim_slot, speed) VALUES 
(1, 'Accelerometer, gyro, proximity, compass', TRUE, 'Yes with A-GPS, Glonass', TRUE, TRUE,
 'SIM1: Nano, SIM2: Nano', 'Dual SIM, GSM+GSM', 'HSPA, LTE, 5G'),
(2, 'Accelerometer, gyro, compass', TRUE, 'Yes with A-GPS, Glonass', TRUE, TRUE,
 'SIM1: Nano, SIM2: Nano', 'Dual SIM, GSM+GSM', 'HSPA, LTE, 5G');

-- Insert phone colors
INSERT INTO phone_colors (phone_id, color_name) VALUES 
(1, 'Black Warrior'),
(1, 'Purple No. 1'),
(1, 'Knight Silver'),
(2, 'Orange Haze'),
(2, 'Velvet Black'),
(2, 'Serene Green');

-- Insert pricing information
INSERT INTO phone_pricing (phone_id, price_unofficial, price_updated, variant_description) VALUES 
(1, 56000.00, '2025-07-28', '12GB+512GB CN'),
(1, 46000.00, '2025-07-28', '12GB+256GB CN'),
(2, 29500.00, '2025-07-21', '6GB+128GB');