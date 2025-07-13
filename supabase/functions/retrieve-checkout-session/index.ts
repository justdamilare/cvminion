import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@^14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RetrieveSessionRequest {
  session_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(
      Deno.env.get('STRIPE_SECRET_KEY') ?? '',
      {
        apiVersion: '2023-10-16',
        httpClient: Stripe.createFetchHttpClient(),
      }
    );

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Authentication required');
    }

    const { session_id }: RetrieveSessionRequest = await req.json();

    if (!session_id) {
      throw new Error('Session ID required');
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.status !== 'complete') {
      return new Response(
        JSON.stringify({
          status: session.status,
          error: 'Payment not completed',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Process the completed payment
    const metadata = session.metadata;
    const userId = metadata?.user_id;

    if (!userId || userId !== user.id) {
      throw new Error('Invalid session user');
    }

    const result: {
      status: string;
      mode?: string;
      credits?: number;
      package_name?: string;
      plan_name?: string;
    } = {
      status: 'complete',
      mode: metadata?.mode,
    };

    if (metadata?.mode === 'credits') {
      // Handle credit purchase verification (credits are added by webhook)
      const credits = parseInt(metadata.credits || '0');
      const packageName = metadata.package_name;

      // Note: Credits are added by the stripe-webhook function when payment_intent.succeeded 
      // or checkout.session.completed events are received. We just verify here.
      console.log(`Verified credit purchase: ${credits} credits for user ${userId}`);

      result.credits = credits;
      result.package_name = packageName;
    } else if (metadata?.mode === 'subscription') {
      // Handle subscription upgrade
      const tier = metadata.tier;

      // Upgrade subscription
      const { error: upgradeError } = await supabaseClient.rpc('upgrade_subscription', {
        user_uuid: userId,
        new_tier: tier
      });

      if (upgradeError) {
        console.error('Error upgrading subscription:', upgradeError);
        throw new Error('Failed to upgrade subscription');
      }

      result.plan_name = tier;
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}); 
