import { useState, useEffect, useCallback } from 'react';
import { Profile } from '../types/profile';
import { getProfile, updateProfile } from '../lib/profiles';
import { getSupabaseClient } from '../lib/supabase';

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userProfile = await getProfile(user.id);
      setProfile(userProfile);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfileData = useCallback(async (data: Partial<Profile>) => {
    try {
      setUpdating(true);
      setError(null);
      
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updatedProfile = await updateProfile(user.id, data);
      setProfile(updatedProfile);
      
      return updatedProfile;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUpdating(false);
    }
  }, []);

  const refreshProfile = useCallback(() => {
    loadProfile();
  }, [loadProfile]);

  // Get completion percentage from database and fallback to calculation
  const getCompletionPercentage = useCallback(async () => {
    if (!profile) return 0;
    
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data } = await supabase
        .from('profiles')
        .select('profile_completion_percentage')
        .eq('user_id', user.id)
        .single();

      if (data?.profile_completion_percentage !== null && data?.profile_completion_percentage !== undefined) {
        return data.profile_completion_percentage;
      }

      // Fallback to calculation if not in database
      const { calculateProfileCompletion } = await import('../lib/profiles');
      return calculateProfileCompletion(profile);
    } catch (error) {
      console.error('Error getting completion percentage:', error);
      // Fallback to calculation
      const { calculateProfileCompletion } = await import('../lib/profiles');
      return calculateProfileCompletion(profile);
    }
  }, [profile]);

  // Update completion percentage when profile changes
  useEffect(() => {
    if (profile) {
      getCompletionPercentage().then(setCompletionPercentage);
    } else {
      setCompletionPercentage(0);
    }
  }, [profile, getCompletionPercentage]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return { 
    profile, 
    loading, 
    error, 
    updating, 
    completionPercentage,
    updateProfile: updateProfileData, 
    refreshProfile
  };
};
