-- Add generation tracking fields to profiles table if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS images_generated INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing rows to have default values
UPDATE profiles 
SET images_generated = 0 
WHERE images_generated IS NULL;

UPDATE profiles 
SET paid = false 
WHERE paid IS NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_paid ON profiles(paid);
CREATE INDEX IF NOT EXISTS idx_profiles_images_generated ON profiles(images_generated);