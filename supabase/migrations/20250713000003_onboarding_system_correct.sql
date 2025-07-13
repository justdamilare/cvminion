-- Add onboarding columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_step TEXT,
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;

-- Update existing users to mark them as having completed onboarding
-- (so they don't see the onboarding flow)
UPDATE profiles 
SET onboarding_completed = TRUE, 
    onboarding_step = 'completed'
WHERE onboarding_completed IS NULL OR onboarding_completed = FALSE;

-- Create function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_uuid uuid)
RETURNS integer AS $$
DECLARE
  completion_score integer := 0;
  total_fields integer := 10; -- Total possible fields to complete
  profile_record RECORD;
BEGIN
  -- Get profile data
  SELECT * INTO profile_record 
  FROM profiles 
  WHERE user_id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Basic info (4 fields)
  IF profile_record.full_name IS NOT NULL AND profile_record.full_name != '' THEN
    completion_score := completion_score + 1;
  END IF;
  
  IF profile_record.email IS NOT NULL AND profile_record.email != '' THEN
    completion_score := completion_score + 1;
  END IF;
  
  IF profile_record.phone_number IS NOT NULL AND profile_record.phone_number != '' THEN
    completion_score := completion_score + 1;
  END IF;
  
  IF profile_record.address IS NOT NULL AND profile_record.address != '' THEN
    completion_score := completion_score + 1;
  END IF;
  
  -- Professional summary (1 field)
  IF profile_record.summary IS NOT NULL AND profile_record.summary != '' THEN
    completion_score := completion_score + 1;
  END IF;
  
  -- Check if user has experience entries (2 points)
  IF profile_record.experience IS NOT NULL AND 
     jsonb_array_length(profile_record.experience) > 0 THEN
    completion_score := completion_score + 2;
  END IF;
  
  -- Check if user has education entries (1 point)
  IF profile_record.education IS NOT NULL AND 
     jsonb_array_length(profile_record.education) > 0 THEN
    completion_score := completion_score + 1;
  END IF;
  
  -- Check if user has skills (1 point)
  IF profile_record.skills IS NOT NULL AND 
     jsonb_array_length(profile_record.skills) > 0 THEN
    completion_score := completion_score + 1;
  END IF;
  
  -- Check if user has languages (1 point)
  IF profile_record.languages IS NOT NULL AND 
     jsonb_array_length(profile_record.languages) > 0 THEN
    completion_score := completion_score + 1;
  END IF;
  
  -- Return percentage
  RETURN (completion_score * 100) / total_fields;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update profile completion percentage
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion_percentage := calculate_profile_completion(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to profiles table
DROP TRIGGER IF EXISTS trigger_update_profile_completion ON profiles;
CREATE TRIGGER trigger_update_profile_completion
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

-- Initialize profile completion percentages for existing users
UPDATE profiles 
SET profile_completion_percentage = calculate_profile_completion(user_id)
WHERE profile_completion_percentage = 0 OR profile_completion_percentage IS NULL;