import { getSupabaseClient } from './supabase';
import { toast } from 'react-hot-toast';

interface LinkedInProfile {
  id: string;
  localizedFirstName?: string;
  localizedLastName?: string;
  localizedHeadline?: string;
  publicProfileUrl?: string;
  profilePicture?: {
    'displayImage~': {
      elements: Array<{
        identifiers: Array<{
          identifier: string;
        }>;
      }>;
    };
  };
}

interface LinkedInProfileData {
  full_name: string;
  headline?: string;
  profile_url?: string;
  avatar_url?: string;
  location?: string;
  industry?: string;
  summary?: string;
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
  }>;
  education?: Array<{
    school: string;
    degree: string;
    field: string;
    years?: string;
  }>;
  skills?: string[];
}

/**
 * Extract LinkedIn data from OAuth user metadata
 */
export const extractLinkedInData = (userMetadata: any): Partial<LinkedInProfileData> => {
  const data: Partial<LinkedInProfileData> = {};
  
  // Basic profile info
  if (userMetadata?.name) {
    data.full_name = userMetadata.name;
  } else if (userMetadata?.given_name || userMetadata?.family_name) {
    data.full_name = `${userMetadata.given_name || ''} ${userMetadata.family_name || ''}`.trim();
  }
  
  if (userMetadata?.headline) {
    data.headline = userMetadata.headline;
  }
  
  if (userMetadata?.picture) {
    data.avatar_url = userMetadata.picture;
  }
  
  if (userMetadata?.location) {
    data.location = userMetadata.location;
  }
  
  // LinkedIn profile URL if available
  if (userMetadata?.sub) {
    data.profile_url = `https://linkedin.com/in/${userMetadata.sub}`;
  }
  
  return data;
};

/**
 * Update user profile with LinkedIn data
 */
export const updateProfileWithLinkedInData = async (
  userId: string, 
  linkedinData: Partial<LinkedInProfileData>
) => {
  const supabase = getSupabaseClient();
  
  try {
    const updateData: any = {};
    
    // Map LinkedIn data to profile fields
    if (linkedinData.full_name) {
      updateData.full_name = linkedinData.full_name;
    }
    
    if (linkedinData.headline) {
      updateData.bio = linkedinData.headline;
    }
    
    if (linkedinData.avatar_url) {
      updateData.avatar_url = linkedinData.avatar_url;
    }
    
    // Update profile completion percentage based on imported data
    let completionBonus = 0;
    if (linkedinData.headline) completionBonus += 10;
    if (linkedinData.location) completionBonus += 5;
    if (linkedinData.avatar_url) completionBonus += 5;
    
    if (completionBonus > 0) {
      // Get current completion percentage
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('profile_completion_percentage')
        .eq('user_id', userId)
        .single();
      
      const currentCompletion = currentProfile?.profile_completion_percentage || 0;
      updateData.profile_completion_percentage = Math.min(100, currentCompletion + completionBonus);
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Failed to update profile with LinkedIn data:', error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating profile with LinkedIn data:', error);
    return { success: false, error };
  }
};

/**
 * Enhanced LinkedIn data import that could integrate with LinkedIn API
 * Note: This requires LinkedIn API access tokens and proper permissions
 */
export const importLinkedInProfileData = async (accessToken?: string): Promise<LinkedInProfileData | null> => {
  if (!accessToken) {
    console.warn('LinkedIn access token not available for extended data import');
    return null;
  }
  
  try {
    // This would require LinkedIn API access
    // Currently LinkedIn OAuth with Supabase provides limited data
    console.log('Extended LinkedIn import would require LinkedIn API integration');
    
    // Placeholder for LinkedIn API integration
    // const profileResponse = await fetch('https://api.linkedin.com/v2/people/~', {
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    
    return null;
  } catch (error) {
    console.error('LinkedIn API import error:', error);
    return null;
  }
};

/**
 * Create resume suggestions from LinkedIn profile data
 */
export const generateResumeFromLinkedIn = async (linkedinData: LinkedInProfileData) => {
  const suggestions = {
    summary: linkedinData.headline || linkedinData.summary || '',
    experience: linkedinData.experience || [],
    education: linkedinData.education || [],
    skills: linkedinData.skills || [],
    location: linkedinData.location || ''
  };
  
  return suggestions;
};

/**
 * Show LinkedIn import success message
 */
export const showLinkedInImportSuccess = (importedFields: string[]) => {
  if (importedFields.length > 0) {
    toast.success(
      `LinkedIn data imported: ${importedFields.join(', ')}`, 
      { duration: 4000 }
    );
  }
};