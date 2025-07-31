-- Migration: 008_fix_additional_column_sizes
-- Description: Fix additional column size issues found during data seeding
-- Date: 2025-08-01

USE mobile_specs;

-- Fix operating_systems table
ALTER TABLE operating_systems MODIFY COLUMN os_version VARCHAR(150);

-- Fix phone_specifications table
ALTER TABLE phone_specifications MODIFY COLUMN bluetooth_version VARCHAR(50);

-- Fix audio_features table
ALTER TABLE audio_features MODIFY COLUMN audio_jack VARCHAR(100);

-- Fix ram_types table
ALTER TABLE ram_types MODIFY COLUMN ram_type_name VARCHAR(100);

-- Fix display_specifications table for larger ranges
ALTER TABLE display_specifications MODIFY COLUMN screen_size DECIMAL(5,2);
ALTER TABLE display_specifications MODIFY COLUMN screen_to_body_ratio DECIMAL(6,2);

-- Fix other potential size issues that might come up
ALTER TABLE chipsets MODIFY COLUMN chipset_name VARCHAR(200);
ALTER TABLE chipsets MODIFY COLUMN architecture VARCHAR(50);
ALTER TABLE chipsets MODIFY COLUMN fabrication VARCHAR(20);

-- Fix display types
ALTER TABLE display_types MODIFY COLUMN display_type_name VARCHAR(100);

-- Fix storage types
ALTER TABLE storage_types MODIFY COLUMN storage_type_name VARCHAR(50);

-- Fix brands table for longer brand names
ALTER TABLE brands MODIFY COLUMN brand_name VARCHAR(100);
