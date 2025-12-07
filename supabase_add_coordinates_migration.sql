-- Migration: Add latitude and longitude columns to properties table
-- This enables nearby location calculations for property listings

-- Add latitude column
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;

-- Add longitude column
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add indexes for better query performance when searching by coordinates
CREATE INDEX IF NOT EXISTS idx_properties_coordinates ON properties(latitude, longitude);

-- Add comment to columns for documentation
COMMENT ON COLUMN properties.latitude IS 'Property latitude coordinate for nearby location calculations';
COMMENT ON COLUMN properties.longitude IS 'Property longitude coordinate for nearby location calculations';

-- Optional: Set default values for existing properties (Parit Raja area)
-- You can update these manually or remove this section if not needed
-- UPDATE properties SET latitude = 1.8546, longitude = 103.0833 WHERE latitude IS NULL;
