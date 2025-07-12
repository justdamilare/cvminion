import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpgradeRequest {
  new_tier: 'free' | 'pro' | 'enterprise';
  payment_method_id?: string;
}

const tierPricing = {
  free: 0,
  pro: 9.99,
  enterprise: 29.99
};

const tierCredits = {
  free: 3,
  pro: 30,
  enterprise: 100
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

    // Parse request body
    const { new_tier, payment_method_id = 'demo' }: UpgradeRequest = await req.json();

    if (!new_tier || !['free', 'pro', 'enterprise'].includes(new_tier)) {
      throw new Error('Invalid subscription tier');
    }

    // Get current subscription
    const { data: currentSubscription, error: subscriptionError } = await supabaseClient
      .from('user_subscriptions')
      .select('tier, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (subscriptionError) {
      throw new Error(`Failed to get current subscription: ${subscriptionError.message}`);
    }

    // Check if already on the same tier
    if (currentSubscription?.tier === new_tier) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Already subscribed to ${new_tier} tier`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Process payment for paid tiers
    const upgradePrice = tierPricing[new_tier];
    if (upgradePrice > 0) {
      if (payment_method_id === 'demo') {
        console.log(`Demo payment processed for ${new_tier} upgrade at $${upgradePrice}/month`);
      } else {
        // TODO: Integrate with real payment processor (Stripe, etc.)
        throw new Error('Real payment processing not yet implemented');
      }
    }

    // Upgrade subscription using database function
    const { error: upgradeError } = await supabaseClient.rpc('upgrade_subscription', {
      user_uuid: user.id,
      new_tier: new_tier
    });

    if (upgradeError) {
      throw new Error(`Failed to upgrade subscription: ${upgradeError.message}`);
    }

    // Get updated subscription details
    const { data: updatedSubscription, error: updatedError } = await supabaseClient
      .from('user_subscriptions')
      .select('tier, billing_cycle_start, billing_cycle_end, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (updatedError) {
      console.error('Failed to get updated subscription:', updatedError);
    }

    // Get updated credit balance
    const { data: creditBalance, error: balanceError } = await supabaseClient.rpc('calculate_user_credits', {
      user_uuid: user.id
    });

    if (balanceError) {
      console.error('Failed to get updated credit balance:', balanceError);
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        previous_tier: currentSubscription?.tier,
        new_tier: new_tier,
        monthly_credits: tierCredits[new_tier],
        monthly_price: upgradePrice,
        current_credits: creditBalance || 0,
        subscription: updatedSubscription || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Upgrade subscription error:', error);
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
