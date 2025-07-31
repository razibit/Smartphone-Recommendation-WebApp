-- Migration: 006_fix_column_sizes_final
-- Description: Final fix for column sizes and index issues
-- Date: 2025-08-01

USE mobile_specs;

-- Drop problematic indexes first
DROP INDEX IF EXISTS idx_display_resolution ON display_specifications;

-- Fix display_specifications columns
ALTER TABLE display_specifications MODIFY COLUMN resolution VARCHAR(800);
ALTER TABLE display_specifications MODIFY COLUMN touch_screen VARCHAR(100);
ALTER TABLE display_specifications MODIFY COLUMN screen_protection VARCHAR(100);

-- Fix camera_specifications columns
ALTER TABLE camera_specifications MODIFY COLUMN primary_camera_resolution VARCHAR(300);
ALTER TABLE camera_specifications MODIFY COLUMN video VARCHAR(300);

-- Fix phone_specifications columns
ALTER TABLE phone_specifications MODIFY COLUMN wlan VARCHAR(400);
ALTER TABLE phone_specifications MODIFY COLUMN quick_charging VARCHAR(300);
ALTER TABLE phone_specifications MODIFY COLUMN cpu VARCHAR(300);
ALTER TABLE phone_specifications MODIFY COLUMN cpu_cores VARCHAR(300);
ALTER TABLE phone_specifications MODIFY COLUMN gpu VARCHAR(200);
ALTER TABLE phone_specifications MODIFY COLUMN usb VARCHAR(200);
ALTER TABLE phone_specifications MODIFY COLUMN network VARCHAR(100);

-- Fix additional_features columns
ALTER TABLE additional_features MODIFY COLUMN gps VARCHAR(200);
ALTER TABLE additional_features MODIFY COLUMN sim_size VARCHAR(100);
ALTER TABLE additional_features MODIFY COLUMN sim_slot VARCHAR(100);
ALTER TABLE additional_features MODIFY COLUMN speed VARCHAR(200);

-- Fix physical_specifications columns
ALTER TABLE physical_specifications MODIFY COLUMN waterproof VARCHAR(200);
ALTER TABLE physical_specifications MODIFY COLUMN weight VARCHAR(200);

-- Recreate indexes with proper prefixes to avoid key length issues
CREATE INDEX idx_display_resolution ON display_specifications(resolution(100));
