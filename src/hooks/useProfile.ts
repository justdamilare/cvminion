import { useState, useEffect, useCallback } from 'react';
import { Profile } from '../types/profile';
import { getProfile, updateProfile } from '../lib/profiles';
import { getSupabaseClient } from '../lib/supabase';

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

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

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return { 
    profile, 
    loading, 
    error, 
    updating, 
    updateProfile: updateProfileData, 
    refreshProfile 
  };
};
