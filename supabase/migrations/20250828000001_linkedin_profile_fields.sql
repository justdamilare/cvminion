-- Add LinkedIn profile fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS oauth_provider TEXT;

-- Add index for oauth_provider for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_oauth_provider ON profiles(oauth_provider);

-- Add comment for documentation
COMMENT ON COLUMN profiles.headline IS 'Professional headline from LinkedIn or user input';
COMMENT ON COLUMN profiles.location IS 'User location from OAuth provider or manual input';  
COMMENT ON COLUMN profiles.oauth_provider IS 'OAuth provider used for registration (google, linkedin_oidc, etc.)';