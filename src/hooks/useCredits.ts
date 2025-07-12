import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { SubscriptionTier } from '../types/credits';

export interface CreditInfo {
  availableCredits: number;
  totalCredits: number;
  subscriptionTier: SubscriptionTier;
  billingCycleEnd: string;
  loading: boolean;
  error: string | null;
}

export const useCredits = (userId?: string) => {
  const [creditInfo, setCreditInfo] = useState<CreditInfo>({
    availableCredits: 0,
    totalCredits: 0,
    subscriptionTier: 'free',
    billingCycleEnd: '',
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!userId) return;

    const fetchCreditInfo = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Get user profile with credit information
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('available_credits, total_credits, subscription_tier')
          .eq('user_id', userId)
          .single();

        if (profileError) throw profileError;

        // Get subscription details
        const { data: subscription, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select('billing_cycle_end')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();

        if (subscriptionError) throw subscriptionError;

        setCreditInfo({
          availableCredits: (profile?.available_credits as number) || 0,
          totalCredits: (profile?.total_credits as number) || 0,
          subscriptionTier: (profile?.subscription_tier as SubscriptionTier) || 'free',
          billingCycleEnd: (subscription?.billing_cycle_end as string) || '',
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching credit info:', error);
        setCreditInfo(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load credit information'
        }));
      }
    };

    fetchCreditInfo();

    // Set up real-time subscription for profile changes
    const supabase = getSupabaseClient();
    const subscription = supabase
      .channel('profile-credits')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles', 
          filter: `user_id=eq.${userId}` 
        }, 
        (payload) => {
          // Update credit info when profile changes
          setCreditInfo(prev => ({
            ...prev,
            availableCredits: (payload.new.available_credits as number) || 0,
            totalCredits: (payload.new.total_credits as number) || 0,
            subscriptionTier: (payload.new.subscription_tier as SubscriptionTier) || 'free',
          }));
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  const refreshCredits = async () => {
    if (!userId) return;

    setCreditInfo(prev => ({ ...prev, loading: true }));
    
    try {
      const supabase = getSupabaseClient();
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('available_credits, total_credits, subscription_tier')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      setCreditInfo(prev => ({
        ...prev,
        availableCredits: (profile?.available_credits as number) || 0,
        totalCredits: (profile?.total_credits as number) || 0,
        subscriptionTier: (profile?.subscription_tier as SubscriptionTier) || 'free',
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error refreshing credits:', error);
      setCreditInfo(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh credits'
      }));
    }
  };

  const consumeCredits = async (amount: number = 1): Promise<boolean> => {
    if (!userId) return false;

    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase.rpc('consume_credits', {
        user_uuid: userId,
        credits_to_consume: amount
      });

      if (error) throw error;

      if (data) {
        // Refresh credit info after successful consumption
        await refreshCredits();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error consuming credits:', error);
      return false;
    }
  };

  const hasEnoughCredits = (required: number = 1): boolean => {
    return creditInfo.availableCredits >= required;
  };

  return {
    ...creditInfo,
    refreshCredits,
    consumeCredits,
    hasEnoughCredits
  };
}; 
