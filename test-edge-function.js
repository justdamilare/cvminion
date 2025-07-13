// Quick test to see if the Edge Function is accessible
async function testEdgeFunction() {
  try {
    const response = await fetch('https://zhlpovxcsalhfxzjfcun.supabase.co/functions/v1/create-checkout-session', {
      method: 'OPTIONS',
    });
    
    console.log('OPTIONS request status:', response.status);
    console.log('CORS headers:', response.headers.get('Access-Control-Allow-Origin'));
    
    if (response.ok) {
      console.log('✅ Edge Function is accessible');
    } else {
      console.log('❌ Edge Function is not accessible');
    }
  } catch (error) {
    console.error('Error testing Edge Function:', error);
  }
}

testEdgeFunction();