import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PurchaseRequest {
  package_id: string;
  payment_method_id?: string;
}

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
    const { package_id, payment_method_id = 'demo' }: PurchaseRequest = await req.json();

    if (!package_id) {
      throw new Error('Package ID is required');
    }

    // Get the credit package details
    const { data: creditPackage, error: packageError } = await supabaseClient
      .from('credit_packages')
      .select('*')
      .eq('id', package_id)
      .eq('is_active', true)
      .single();

    if (packageError || !creditPackage) {
      throw new Error('Invalid credit package');
    }

    // Process payment (demo mode for development)
    if (payment_method_id === 'demo') {
      // Demo mode - only allow in development environment
      const isDevelopment = Deno.env.get('ENVIRONMENT') !== 'production';
      if (!isDevelopment) {
        throw new Error('Demo payments not allowed in production');
      }
      console.log(`Demo payment processed for ${creditPackage.credits} credits at $${creditPackage.price_cents / 100}`);
    } else {
      // Production payment processing is handled via Stripe checkout sessions
      // This function should only be called after successful payment verification
      // from the stripe-webhook or retrieve-checkout-session functions
      throw new Error('Direct payment processing not supported. Use Stripe checkout flow.');
    }

    // Add credits to user account (expires in 12 months for purchased credits)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const { error: addCreditsError } = await supabaseClient.rpc('add_credits', {
      user_uuid: user.id,
      credits_to_add: creditPackage.credits,
      credit_type_param: 'purchased',
      expires_at_param: expiresAt.toISOString()
    });

    if (addCreditsError) {
      throw new Error(`Failed to add credits: ${addCreditsError.message}`);
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        credits_added: creditPackage.credits,
        package_name: creditPackage.name,
        amount_charged: creditPackage.price_cents / 100
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Purchase credits error:', error);
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
