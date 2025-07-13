import crypto from 'crypto';

// Test webhook with real Stripe secret
const WEBHOOK_URL = 'https://zhlpovxcsalhfxzjfcun.supabase.co/functions/v1/stripe-webhook';
const WEBHOOK_SECRET = 'whsec_12kZd6yyhytKKcDiNHDGKVekyRbICK1w'; // Real webhook secret

// Create mock payload
const payload = JSON.stringify({
  "id": "evt_test_webhook",
  "object": "event",
  "api_version": "2023-10-16",
  "created": 1234567890,
  "data": {
    "object": {
      "id": "cs_test_12345",
      "object": "checkout.session",
      "status": "complete",
      "metadata": {
        "mode": "credits",
        "user_id": "test-user-12345",
        "credits": "10",
        "package_name": "Test Package"
      }
    }
  },
  "livemode": false,
  "pending_webhooks": 1,
  "request": {
    "id": "req_test_12345"
  },
  "type": "checkout.session.completed"
});

// Generate proper Stripe signature
const timestamp = Math.floor(Date.now() / 1000);
const signedPayload = timestamp + '.' + payload;
const signature = crypto.createHmac('sha256', WEBHOOK_SECRET.replace('whsec_', '')).update(signedPayload, 'utf8').digest('hex');
const stripeSignature = `t=${timestamp},v1=${signature}`;

console.log('Testing webhook with proper signature...');
console.log('Payload:', payload);
console.log('Signature:', stripeSignature);

// Make request
const response = await fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': stripeSignature
  },
  body: payload
});

const result = await response.text();
console.log('Response status:', response.status);
console.log('Response:', result);

if (response.status === 200) {
  console.log('✅ Webhook test successful!');
} else {
  console.log('❌ Webhook test failed');
}