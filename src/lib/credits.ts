import { getSupabaseClient } from './supabase';
import { getEnvConfig } from '../config/env';
import { 
  UserSubscription, 
  CreditTransaction, 
  CreditPackage,
  UserCreditSummary,
  SubscriptionTier,
  CreditType
} from '../types/credits';

export const getSupabaseCreditsClient = () => {
  return getSupabaseClient();
};

// Get user's subscription details
export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  const supabase = getSupabaseCreditsClient();
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No subscription found - this might be a new user
      return null;
    }
    throw error;
  }
  
  return data as unknown as UserSubscription;
};

// Get user's credits summary
export const getUserCreditSummary = async (userId: string): Promise<UserCreditSummary> => {
  const supabase = getSupabaseCreditsClient();
  
  try {
    // Get subscription details
    const subscription = await getUserSubscription(userId);
    
    if (!subscription) {
      throw new Error('No subscription found for user');
    }
    
    // Get credits breakdown
    const { data: credits, error: creditsError } = await supabase
      .from('credits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true });
    
    if (creditsError) throw creditsError;
    
    // Calculate totals
    const monthlyCredits = credits?.filter(c => c.credit_type === 'monthly')
      .reduce((sum, c) => sum + (c.amount as number), 0) || 0;
    
    const purchasedCredits = credits?.filter(c => c.credit_type === 'purchased')
      .reduce((sum, c) => sum + (c.amount as number), 0) || 0;
    
    const totalCredits = monthlyCredits + purchasedCredits;
    
    return {
      total_credits: totalCredits,
      available_credits: totalCredits,
      monthly_credits: monthlyCredits,
      purchased_credits: purchasedCredits,
      subscription_tier: subscription.tier,
      billing_cycle_end: subscription.billing_cycle_end,
      next_reset_date: subscription.billing_cycle_end
    };
  } catch (error) {
    console.error('Error getting user credit summary:', error);
    throw error;
  }
};

// Get user's credit history
export const getCreditTransactions = async (userId: string, limit = 50): Promise<CreditTransaction[]> => {
  const supabase = getSupabaseCreditsClient();
  
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
  return (data || []) as unknown as CreditTransaction[];
};

// Get available credit packages
export const getCreditPackages = async (): Promise<CreditPackage[]> => {
  const supabase = getSupabaseCreditsClient();
  
  const { data, error } = await supabase
    .from('credit_packages')
    .select('*')
    .eq('is_active', true)
    .order('credits', { ascending: true });
  
  if (error) throw error;
  
  return (data || []) as unknown as CreditPackage[];
};

// Consume credits (for CV generation)
export const consumeCredits = async (userId: string, amount: number): Promise<boolean> => {
  const supabase = getSupabaseCreditsClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // Use the correct Supabase URL for Edge Functions
    const config = getEnvConfig();
    const edgeFunctionUrl = `${config.supabaseUrl}/functions/v1/consume-credits`;

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credits_to_consume: amount,
        description: 'CV generation'
      })
    });

    if (!response.ok) {
      let errorMessage = 'Failed to consume credits';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If JSON parsing fails, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Edge Function returned non-JSON response');
    }

    const result = await response.json();
    return result.success || false;
  } catch (error) {
    console.error('Error consuming credits:', error);
    return false;
  }
};

// Add credits to user account
export const addCredits = async (
  userId: string, 
  amount: number, 
  creditType: CreditType, 
  expiresAt?: string
): Promise<void> => {
  const supabase = getSupabaseCreditsClient();
  
  const { error } = await supabase.rpc('add_credits', {
    user_uuid: userId,
    credits_to_add: amount,
    credit_type_param: creditType,
    expires_at_param: expiresAt
  });
  
  if (error) throw error;
};

// Upgrade user subscription
export const upgradeSubscription = async (
  userId: string, 
  newTier: SubscriptionTier
): Promise<void> => {
  const supabase = getSupabaseCreditsClient();
  
  const { error } = await supabase.rpc('upgrade_subscription', {
    user_uuid: userId,
    new_tier: newTier
  });
  
  if (error) throw error;
};

// Check if user has enough credits
export const hasEnoughCredits = async (userId: string, requiredCredits: number): Promise<boolean> => {
  try {
    const summary = await getUserCreditSummary(userId);
    return summary.available_credits >= requiredCredits;
  } catch (error) {
    console.error('Error checking credits:', error);
    return false;
  }
};

// Purchase credits using Edge Function
export const purchaseCredits = async (
  userId: string, 
  packageId: string,
  paymentMethodId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const supabase = getSupabaseCreditsClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // Use the correct Supabase URL for Edge Functions
    const config = getEnvConfig();
    const edgeFunctionUrl = `${config.supabaseUrl}/functions/v1/purchase-credits`;

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        package_id: packageId,
        payment_method_id: paymentMethodId || 'demo'
      })
    });

    if (!response.ok) {
      let errorMessage = 'Failed to purchase credits';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If JSON parsing fails, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Edge Function returned non-JSON response');
    }

    const result = await response.json();
    return { success: result.success || false };
  } catch (error) {
    console.error('Error purchasing credits:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// Get user's current credits from profile (cached)
export const getProfileCredits = async (userId: string): Promise<{ available: number; total: number }> => {
  const supabase = getSupabaseCreditsClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('available_credits, total_credits')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  
  return {
    available: (data?.available_credits as number) || 0,
    total: (data?.total_credits as number) || 0
  };
};

// Refresh user's credit count in profile
export const refreshUserCredits = async (userId: string): Promise<void> => {
  const supabase = getSupabaseCreditsClient();
  
  const { error } = await supabase.rpc('calculate_user_credits', {
    user_uuid: userId
  });
  
  if (error) throw error;
}; 
