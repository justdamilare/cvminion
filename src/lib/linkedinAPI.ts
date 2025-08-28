import { getSupabaseClient } from './supabase';
import { toast } from 'react-hot-toast';

// LinkedIn API v2 Interfaces
interface LinkedInProfile {
  id: string;
  localizedFirstName: string;
  localizedLastName: string;
  localizedHeadline?: string;
  vanityName?: string;
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

interface LinkedInPosition {
  id: number;
  title: string;
  summary?: string;
  startDate: {
    month?: number;
    year: number;
  };
  endDate?: {
    month?: number;
    year: number;
  };
  company: {
    name: string;
    industry?: string;
    size?: string;
  };
  location?: {
    country?: string;
    region?: string;
  };
  isCurrent: boolean;
}

interface LinkedInEducation {
  id: number;
  schoolName: string;
  fieldOfStudy?: string;
  degree?: string;
  grade?: string;
  startDate?: {
    month?: number;
    year: number;
  };
  endDate?: {
    month?: number;
    year: number;
  };
  activities?: string;
  notes?: string;
}

interface LinkedInSkill {
  id: number;
  name: string;
  endorsementCount?: number;
}

interface LinkedInComprehensiveProfile {
  profile: LinkedInProfile;
  positions: LinkedInPosition[];
  educations: LinkedInEducation[];
  skills: LinkedInSkill[];
}

/**
 * LinkedIn API Service for comprehensive profile data extraction
 * Requires LinkedIn API access tokens and proper application setup
 */
class LinkedInAPIService {
  private baseURL = 'https://api.linkedin.com/v2';
  
  /**
   * Get comprehensive LinkedIn profile data using API access token
   */
  async getComprehensiveProfile(accessToken: string): Promise<LinkedInComprehensiveProfile | null> {
    try {
      // Fetch all required data in parallel
      const [profileResponse, positionsResponse, educationsResponse, skillsResponse] = await Promise.all([
        this.fetchProfile(accessToken),
        this.fetchPositions(accessToken),
        this.fetchEducations(accessToken),
        this.fetchSkills(accessToken)
      ]);

      return {
        profile: profileResponse,
        positions: positionsResponse,
        educations: educationsResponse,
        skills: skillsResponse
      };
    } catch (error) {
      console.error('LinkedIn API comprehensive fetch error:', error);
      throw new Error('Failed to fetch comprehensive LinkedIn data');
    }
  }

  /**
   * Fetch basic profile information
   */
  private async fetchProfile(accessToken: string): Promise<LinkedInProfile> {
    const response = await fetch(`${this.baseURL}/people/~`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Profile fetch failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Fetch work positions/experience
   */
  private async fetchPositions(accessToken: string): Promise<LinkedInPosition[]> {
    const response = await fetch(`${this.baseURL}/people/~/positions`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Positions fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.values || [];
  }

  /**
   * Fetch education history
   */
  private async fetchEducations(accessToken: string): Promise<LinkedInEducation[]> {
    const response = await fetch(`${this.baseURL}/people/~/educations`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Educations fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.values || [];
  }

  /**
   * Fetch skills (Note: Skills API has been deprecated by LinkedIn)
   * This is a placeholder for potential future skills API
   */
  private async fetchSkills(accessToken: string): Promise<LinkedInSkill[]> {
    // LinkedIn deprecated the Skills API
    // Would need to be extracted from profile description or use alternative methods
    console.warn('LinkedIn Skills API is deprecated. Using fallback method.');
    return [];
  }
}

/**
 * Transform LinkedIn API data to CVMinion profile format
 */
export const transformLinkedInData = (data: LinkedInComprehensiveProfile) => {
  const profile = data.profile;
  const positions = data.positions;
  const educations = data.educations;

  return {
    // Basic info
    full_name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
    title: profile.localizedHeadline || '',
    
    // Experience
    experience: positions.map(pos => ({
      title: pos.title,
      company: pos.company.name,
      location: pos.location ? `${pos.location.region}, ${pos.location.country}` : '',
      start_date: pos.startDate ? `${pos.startDate.month || 1}/${pos.startDate.year}` : '',
      end_date: pos.endDate ? `${pos.endDate.month || 12}/${pos.endDate.year}` : pos.isCurrent ? 'Present' : '',
      description: pos.summary || '',
      is_current: pos.isCurrent
    })),

    // Education
    education: educations.map(edu => ({
      school: edu.schoolName,
      degree: edu.degree || '',
      field_of_study: edu.fieldOfStudy || '',
      start_date: edu.startDate ? `${edu.startDate.month || 1}/${edu.startDate.year}` : '',
      end_date: edu.endDate ? `${edu.endDate.month || 12}/${edu.endDate.year}` : '',
      grade: edu.grade || '',
      activities: edu.activities || '',
      description: edu.notes || ''
    })),

    // Skills (from headline/summary since Skills API is deprecated)
    skills: extractSkillsFromText(profile.localizedHeadline || ''),
    
    // Professional summary
    summary: profile.localizedHeadline || '',
    
    // Profile picture
    avatar_url: extractProfilePicture(profile.profilePicture)
  };
};

/**
 * Extract skills from text using keyword matching
 * Since LinkedIn Skills API is deprecated
 */
const extractSkillsFromText = (text: string): string[] => {
  const commonSkills = [
    // Tech skills
    'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java', 'C++', 'SQL',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'MongoDB', 'PostgreSQL',
    
    // Business skills
    'Project Management', 'Leadership', 'Strategy', 'Marketing', 'Sales',
    'Communication', 'Team Management', 'Business Development',
    
    // Design skills
    'UI/UX', 'Figma', 'Adobe Creative', 'Design Thinking', 'User Research',
    
    // Data skills
    'Data Analysis', 'Machine Learning', 'Analytics', 'Excel', 'Tableau'
  ];

  const foundSkills = commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );

  return foundSkills;
};

/**
 * Extract profile picture URL from LinkedIn API response
 */
const extractProfilePicture = (profilePicture?: LinkedInProfile['profilePicture']): string | null => {
  try {
    const elements = profilePicture?.['displayImage~']?.elements;
    if (elements && elements.length > 0) {
      const lastElement = elements[elements.length - 1];
      return lastElement.identifiers[0]?.identifier || null;
    }
  } catch (error) {
    console.warn('Failed to extract profile picture:', error);
  }
  return null;
};

/**
 * Main function to get LinkedIn access token and fetch comprehensive data
 */
export const getComprehensiveLinkedInData = async (userId: string) => {
  const supabase = getSupabaseClient();
  
  try {
    // Get user's LinkedIn access token
    // This would require storing the access token during OAuth flow
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    // Check if we have LinkedIn access token stored
    // Note: This requires modifying the OAuth flow to store the access token
    const linkedinToken = user.user.user_metadata?.linkedin_access_token;
    
    if (!linkedinToken) {
      throw new Error('LinkedIn access token not available. Please reconnect your LinkedIn account.');
    }

    // Fetch comprehensive data
    const apiService = new LinkedInAPIService();
    const linkedinData = await apiService.getComprehensiveProfile(linkedinToken);
    
    if (!linkedinData) {
      throw new Error('Failed to fetch LinkedIn data');
    }

    // Transform to CVMinion format
    const profileData = transformLinkedInData(linkedinData);
    
    return profileData;
    
  } catch (error) {
    console.error('Comprehensive LinkedIn fetch error:', error);
    throw error;
  }
};

/**
 * Update OAuth flow to capture and store LinkedIn access token
 * This would need to be integrated into the auth callback
 */
export const storeLinkedInAccessToken = async (accessToken: string) => {
  const supabase = getSupabaseClient();
  
  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        linkedin_access_token: accessToken
      }
    });
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to store LinkedIn access token:', error);
    return false;
  }
};

export { LinkedInAPIService };