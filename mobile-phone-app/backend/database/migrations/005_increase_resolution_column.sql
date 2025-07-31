-- Migration: 005_increase_resolution_column
-- Description: Increase resolution column size to handle longer data
-- Date: 2025-08-01

USE mobile_specs;

-- Increase resolution column size in display_specifications table
ALTER TABLE display_specifications 
MODIFY COLUMN resolution VARCHAR(800);

-- Also increase other columns that might face size issues
ALTER TABLE display_specifications 
MODIFY COLUMN touch_screen VARCHAR(100);

ALTER TABLE display_specifications 
MODIFY COLUMN screen_protection VARCHAR(100);

-- Increase camera resolution column
ALTER TABLE camera_specifications 
MODIFY COLUMN primary_camera_resolution VARCHAR(300);

-- Increase wlan column size
ALTER TABLE phone_specifications 
MODIFY COLUMN wlan VARCHAR(400);

-- Increase quick_charging column size
ALTER TABLE phone_specifications 
MODIFY COLUMN quick_charging VARCHAR(300);
