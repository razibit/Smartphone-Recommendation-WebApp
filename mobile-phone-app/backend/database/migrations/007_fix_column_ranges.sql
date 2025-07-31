-- Migration: 007_fix_column_ranges
-- Description: Fix column ranges and data types for out-of-range values
-- Date: 2025-08-01

USE mobile_specs;

-- Fix display specifications columns for range issues
ALTER TABLE display_specifications MODIFY COLUMN screen_size DECIMAL(4,2);
ALTER TABLE display_specifications MODIFY COLUMN screen_to_body_ratio DECIMAL(5,2);

-- Fix physical specifications weight column (should be VARCHAR for mixed data)
ALTER TABLE physical_specifications MODIFY COLUMN weight VARCHAR(100);

-- Also increase physical dimensions to handle larger values if needed
ALTER TABLE physical_specifications MODIFY COLUMN height DECIMAL(6,2);
ALTER TABLE physical_specifications MODIFY COLUMN width DECIMAL(6,2);
ALTER TABLE physical_specifications MODIFY COLUMN thickness DECIMAL(5,2);
