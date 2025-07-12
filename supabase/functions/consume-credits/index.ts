import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConsumeRequest {
  credits_to_consume: number;
  description?: string;
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
    const { credits_to_consume, description = 'CV generation' }: ConsumeRequest = await req.json();

    if (!credits_to_consume || credits_to_consume < 1) {
      throw new Error('Invalid credit amount');
    }

    // Check if user has enough credits first
    const { data: availableCredits, error: creditsError } = await supabaseClient.rpc('calculate_user_credits', {
      user_uuid: user.id
    });

    if (creditsError) {
      throw new Error(`Failed to check credits: ${creditsError.message}`);
    }

    if (availableCredits < credits_to_consume) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Insufficient credits',
          available_credits: availableCredits,
          required_credits: credits_to_consume
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Consume the credits
    const { data: consumptionResult, error: consumeError } = await supabaseClient.rpc('consume_credits', {
      user_uuid: user.id,
      credits_to_consume: credits_to_consume
    });

    if (consumeError) {
      throw new Error(`Failed to consume credits: ${consumeError.message}`);
    }

    if (!consumptionResult) {
      throw new Error('Credit consumption failed');
    }

    // Get updated credit balance
    const { data: newBalance, error: balanceError } = await supabaseClient.rpc('calculate_user_credits', {
      user_uuid: user.id
    });

    if (balanceError) {
      console.error('Failed to get updated balance:', balanceError);
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        credits_consumed: credits_to_consume,
        remaining_credits: newBalance || 0,
        description: description
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Consume credits error:', error);
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
