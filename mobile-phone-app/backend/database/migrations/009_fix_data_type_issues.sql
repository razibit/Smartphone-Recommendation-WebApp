-- Migration: 009_fix_data_type_issues
-- Description: Fix data type issues for battery_capacity, screen_size, and notch
-- Date: 2025-08-01

USE mobile_specs;

-- Drop indexes that will conflict with data type changes
DROP INDEX IF EXISTS idx_display_specs_size ON display_specifications;

-- Fix battery_capacity to handle non-numeric data
ALTER TABLE phone_specifications MODIFY COLUMN battery_capacity VARCHAR(50);

-- Fix screen_size to handle non-numeric data (some CSV data might have text)
ALTER TABLE display_specifications MODIFY COLUMN screen_size VARCHAR(50);

-- Fix notch column size
ALTER TABLE display_specifications MODIFY COLUMN notch VARCHAR(100);

-- Recreate index with prefix for VARCHAR screen_size
CREATE INDEX idx_display_specs_size ON display_specifications(screen_size(20));
