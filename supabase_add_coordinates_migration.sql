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

-- Set default coordinates for existing properties (centered around UTHM/Parit Raja area)
-- This gives a good starting point - landlords can update with exact coordinates later
UPDATE properties 
SET 
    latitude = CASE 
        -- Add slight variation to spread properties on map
        WHEN id % 5 = 0 THEN 1.8546  -- UTHM Main Gate
        WHEN id % 5 = 1 THEN 1.8586  -- Parit Raja Town
        WHEN id % 5 = 2 THEN 1.8520  -- South of UTHM
        WHEN id % 5 = 3 THEN 1.8600  -- North area
        ELSE 1.8560                   -- Central area
    END,
    longitude = CASE 
        WHEN id % 5 = 0 THEN 103.0833
        WHEN id % 5 = 1 THEN 103.1028
        WHEN id % 5 = 2 THEN 103.0800
        WHEN id % 5 = 3 THEN 103.1050
        ELSE 103.0900
    END
WHERE latitude IS NULL OR longitude IS NULL;

-- Verify the update
SELECT COUNT(*) as total_properties, 
       COUNT(latitude) as properties_with_coordinates 
FROM properties;
