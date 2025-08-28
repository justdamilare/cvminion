import { getSupabaseClient } from './supabase';
import { Profile, Education, Experience } from '../types/profile';

const mapToDbFields = (data: Partial<Profile>) => {
  const mapped: Record<string, unknown> = {};
  
  if (data.full_name !== undefined) mapped.full_name = data.full_name;
  if (data.email !== undefined) mapped.email = data.email;
  if (data.phone_number !== undefined) mapped.phone_number = data.phone_number;
  if (data.address !== undefined) mapped.address = data.address;
  if (data.summary !== undefined) mapped.summary = data.summary;
  if (data.title !== undefined) mapped.title = data.title;
  if (data.website !== undefined) mapped.website = data.website;
  if (data.linkedin !== undefined) mapped.linkedin = data.linkedin;
  if (data.github !== undefined) mapped.github = data.github;
  
  // Handle arrays with proper date formatting
  if (data.education !== undefined) {
    mapped.education = data.education.map(edu => ({
      ...edu,
      start_date: edu.start_date,
      end_date: edu.end_date || null
    }));
  }
  
  if (data.experience !== undefined) {
    mapped.experience = data.experience.map(exp => ({
      ...exp,
      start_date: exp.start_date,
      end_date: exp.end_date || null
    }));
  }
  
  if (data.skills !== undefined) mapped.skills = data.skills;
  if (data.languages !== undefined) mapped.languages = data.languages;
  if (data.projects !== undefined) mapped.projects = data.projects;
  if (data.certifications !== undefined) mapped.certifications = data.certifications;
  return mapped;
};

const mapFromDbFields = (data: Profile): Profile => ({
  id: data.id,
  full_name: data.full_name || '',
  email: data.email || '',
  phone_number: data.phone_number || '',
  address: data.address || '',
  summary: data.summary || '',
  title: data.title || '',
  website: data.website || '',
  linkedin: data.linkedin || '',
  github: data.github || '',
  education: Array.isArray(data.education) ? data.education.map((edu: Education) => ({
    ...edu,
    start_date: edu.start_date || '',
    end_date: edu.end_date || ''
  })) : [],
  experience: Array.isArray(data.experience) ? data.experience.map((exp: Experience) => ({
    ...exp,
    start_date: exp.start_date || '',
    end_date: exp.end_date || ''
  })) : [],
  skills: Array.isArray(data.skills) ? data.skills : [],
  languages: Array.isArray(data.languages) ? data.languages : [],
  projects: Array.isArray(data.projects) ? data.projects : [],
  certifications: Array.isArray(data.certifications) ? data.certifications : [],
  subscription_tier: data.subscription_tier || 'free',
  total_credits: data.total_credits || 0,
  available_credits: data.available_credits || 0,
  created_at: data.created_at,
  updated_at: data.updated_at
});

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const supabase = getSupabaseClient();
  
  try {
    // First try to get existing profile
    const { data: existingProfile, error: getError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (getError) throw getError;
      if (existingProfile) {
      return mapFromDbFields(existingProfile as unknown as Profile);
    }

    // Use upsert instead of insert to handle race conditions
    const { data: newProfile, error: upsertError } = await supabase
      .from('profiles')
      .upsert([{
        user_id: userId,
        full_name: '',
        email: '',
        phone_number: '',
        address: '',
        summary: '',
        title: '',
        website: '',
        linkedin: '',
        github: '',
        education: [],
        experience: [],
        skills: [],
        languages: [],
        projects: [],
        certifications: []
      }], {
        onConflict: 'user_id',
        ignoreDuplicates: true
      })
      .select()
      .single();

    if (upsertError) {
      // If upsert fails, try one more time to get the profile
      // as it might have been created by another concurrent request
      const { data: retryProfile, error: retryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (retryError) throw retryError;
      return mapFromDbFields(retryProfile as unknown as Profile);
    }

    return mapFromDbFields(newProfile as unknown as Profile);

  } catch (error: unknown) {
    // Only log and throw if it's not a duplicate key error
    if (error instanceof Error && !error.message.includes('duplicate key value')) {
      console.error('Profile operation failed:', error);
      throw error;
    }
    
    // For duplicate key errors, try one final time to get the profile
    const { data: finalProfile, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (finalError) throw finalError;
    return mapFromDbFields(finalProfile as unknown as Profile);
  }
};

// Calculate profile completion percentage
export const calculateProfileCompletion = (profile: Profile): number => {
  let score = 0;
  const totalFields = 10;

  // Basic info (4 points)
  if (profile.full_name?.trim()) score += 1;
  if (profile.email?.trim()) score += 1;
  if (profile.phone_number?.trim()) score += 1;
  if (profile.address?.trim()) score += 1;

  // Professional summary (1 point)
  if (profile.summary?.trim() && profile.summary.length > 50) score += 1;

  // Professional title (1 point)
  if (profile.title?.trim()) score += 1;

  // Experience (2 points)
  if (profile.experience?.length >= 1) score += 2;

  // Education (1 point)
  if (profile.education?.length >= 1) score += 1;

  // Skills (1 point)
  if (profile.skills?.length >= 3) score += 1;

  return Math.round((score / totalFields) * 100);
};

export const updateProfile = async (userId: string, data: Partial<Profile>) => {
  const supabase = getSupabaseClient();
  
  const mappedData = mapToDbFields(data);

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(mappedData)
    .eq('user_id', userId)
    .select()
    .maybeSingle();

  if (error) throw error;
  
  const updatedProfile = mapFromDbFields(profile as unknown as Profile);
  
  // Calculate and update profile completion percentage
  const completionPercentage = calculateProfileCompletion(updatedProfile);
  
  // Update the completion percentage in the database
  await supabase
    .from('profiles')
    .update({ profile_completion_percentage: completionPercentage })
    .eq('user_id', userId);

  return updatedProfile;
};
