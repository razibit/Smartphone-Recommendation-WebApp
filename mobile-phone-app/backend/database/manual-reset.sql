-- Manual Database Reset Script
-- Run this script directly in MySQL to completely reset the database

-- Drop the database if it exists
DROP DATABASE IF EXISTS mobile_specs;

-- Create a fresh database
CREATE DATABASE mobile_specs;

-- Use the database
USE mobile_specs;

-- Create the migrations table
CREATE TABLE migrations (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Show confirmation
SELECT 'Database reset completed successfully' AS status;