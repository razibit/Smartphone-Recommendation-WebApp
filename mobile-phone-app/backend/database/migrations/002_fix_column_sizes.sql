-- Migration: 002_fix_column_sizes
-- Description: Fix column sizes for data that's too long

USE mobile_specs;

-- Fix resolution column size (increased to handle longer data)
ALTER TABLE display_specifications MODIFY COLUMN resolution VARCHAR(800);

-- Fix other potentially problematic columns
ALTER TABLE display_specifications MODIFY COLUMN screen_protection VARCHAR(100);
ALTER TABLE display_specifications MODIFY COLUMN touch_screen VARCHAR(100);

-- Fix physical specifications columns
ALTER TABLE physical_specifications MODIFY COLUMN waterproof VARCHAR(200);

-- Fix camera specifications columns
ALTER TABLE camera_specifications MODIFY COLUMN primary_camera_resolution VARCHAR(200);

-- Fix additional features columns
ALTER TABLE additional_features MODIFY COLUMN gps VARCHAR(200);
ALTER TABLE additional_features MODIFY COLUMN sim_size VARCHAR(100);
ALTER TABLE additional_features MODIFY COLUMN sim_slot VARCHAR(100);
ALTER TABLE additional_features MODIFY COLUMN speed VARCHAR(200);

-- Fix phone specifications columns
ALTER TABLE phone_specifications MODIFY COLUMN network VARCHAR(100);
ALTER TABLE phone_specifications MODIFY COLUMN wlan VARCHAR(300);
ALTER TABLE phone_specifications MODIFY COLUMN usb VARCHAR(200);
ALTER TABLE phone_specifications MODIFY COLUMN quick_charging VARCHAR(200);

-- Fix display specifications precision issues
ALTER TABLE display_specifications MODIFY COLUMN screen_size DECIMAL(4,2);
ALTER TABLE display_specifications MODIFY COLUMN screen_to_body_ratio DECIMAL(5,2);

-- Fix physical specifications weight column (should be VARCHAR, not DECIMAL)
ALTER TABLE physical_specifications MODIFY COLUMN weight VARCHAR(100);