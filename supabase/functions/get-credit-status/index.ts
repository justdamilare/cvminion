import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Authentication required');
    }

    // Get user profile with credit information
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('subscription_tier, available_credits, total_credits')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      throw new Error(`Failed to get profile: ${profileError.message}`);
    }

    // Get subscription details
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('user_subscriptions')
      .select('tier, billing_cycle_end, billing_cycle_start, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (subscriptionError) {
      throw new Error(`Failed to get subscription: ${subscriptionError.message}`);
    }

    // Get credit breakdown
    const { data: credits, error: creditsError } = await supabaseClient
      .from('credits')
      .select('credit_type, amount, expires_at, created_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .gt('amount', 0)
      .order('created_at', { ascending: true });

    if (creditsError) {
      throw new Error(`Failed to get credits: ${creditsError.message}`);
    }

    // Calculate credit breakdown
    const monthlyCredits = credits?.filter(c => c.credit_type === 'monthly')
      .reduce((sum, c) => sum + c.amount, 0) || 0;
    
    const purchasedCredits = credits?.filter(c => c.credit_type === 'purchased')
      .reduce((sum, c) => sum + c.amount, 0) || 0;
    
    const bonusCredits = credits?.filter(c => c.credit_type === 'bonus')
      .reduce((sum, c) => sum + c.amount, 0) || 0;

    // Get recent transactions
    const { data: transactions, error: transactionsError } = await supabaseClient
      .from('credit_transactions')
      .select('transaction_type, amount, created_at, description')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (transactionsError) {
      console.error('Failed to get transactions:', transactionsError);
    }

    // Return comprehensive credit status
    return new Response(
      JSON.stringify({
        success: true,
        user_id: user.id,
        credit_status: {
          available_credits: profile.available_credits || 0,
          total_credits: profile.total_credits || 0,
          credit_breakdown: {
            monthly: monthlyCredits,
            purchased: purchasedCredits,
            bonus: bonusCredits
          }
        },
        subscription: {
          tier: subscription.tier,
          billing_cycle_start: subscription.billing_cycle_start,
          billing_cycle_end: subscription.billing_cycle_end,
          is_active: subscription.is_active
        },
        recent_transactions: transactions || []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Get credit status error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}); 
