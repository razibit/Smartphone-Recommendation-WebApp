-- Migration: 010_fix_color_and_aspect_ratio
-- Description: Fix column sizes for color_name and aspect_ratio
-- Date: 2025-08-01

USE mobile_specs;

-- Fix color_name column size
ALTER TABLE phone_colors MODIFY COLUMN color_name VARCHAR(100);

-- Fix aspect_ratio column size
ALTER TABLE display_specifications MODIFY COLUMN aspect_ratio VARCHAR(50);
