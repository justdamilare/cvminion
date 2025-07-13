#!/usr/bin/env node

/**
 * Stripe Webhook Test Script
 * 
 * This script tests the Stripe webhook endpoint by:
 * 1. Creating a mock checkout.session.completed event
 * 2. Generating a proper Stripe webhook signature
 * 3. Sending the request to the webhook endpoint
 * 4. Reporting the results
 */

import crypto from 'crypto';

// Configuration
const WEBHOOK_URL = 'https://zhlpovxcsalhfxzjfcun.supabase.co/functions/v1/stripe-webhook';

// Mock webhook secret - In production, this would be your actual webhook secret
// For testing, you can use any string, but it should match what's configured in your environment
const WEBHOOK_SECRET = 'whsec_test_secret_key'; // Replace with your actual webhook secret if testing against real endpoint

// Test data
const TEST_USER_ID = 'test-user-12345';
const TEST_CREDITS = 10;
const TEST_PACKAGE_NAME = 'Test Credits Package';

/**
 * Generate a Stripe webhook signature
 */
function generateStripeSignature(payload, secret, timestamp) {
  const payloadString = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadString, 'utf8')
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

/**
 * Create a mock Stripe checkout.session.completed event
 */
function createMockCheckoutEvent() {
  const timestamp = Math.floor(Date.now() / 1000);
  
  const event = {
    id: `evt_test_${Math.random().toString(36).substr(2, 9)}`,
    object: 'event',
    api_version: '2023-10-16',
    created: timestamp,
    data: {
      object: {
        id: `cs_test_${Math.random().toString(36).substr(2, 9)}`,
        object: 'checkout.session',
        amount_subtotal: 1000, // $10.00 in cents
        amount_total: 1000,
        billing_address_collection: null,
        cancel_url: 'https://example.com/cancel',
        client_reference_id: null,
        consent: null,
        consent_collection: null,
        created: timestamp,
        currency: 'usd',
        customer: `cus_test_${Math.random().toString(36).substr(2, 9)}`,
        customer_creation: 'if_required',
        customer_details: {
          address: null,
          email: 'test@example.com',
          name: 'Test User',
          phone: null,
          tax_exempt: 'none',
          tax_ids: []
        },
        customer_email: 'test@example.com',
        expires_at: timestamp + 86400, // 24 hours from now
        invoice: null,
        invoice_creation: null,
        livemode: false,
        locale: null,
        metadata: {
          mode: 'credits',
          user_id: TEST_USER_ID,
          credits: TEST_CREDITS.toString(),
          package_name: TEST_PACKAGE_NAME
        },
        mode: 'payment',
        payment_intent: `pi_test_${Math.random().toString(36).substr(2, 9)}`,
        payment_link: null,
        payment_method_collection: 'if_required',
        payment_method_configuration_details: null,
        payment_method_options: {},
        payment_method_types: ['card'],
        payment_status: 'paid',
        phone_number_collection: {
          enabled: false
        },
        recovered_from: null,
        setup_intent: null,
        shipping_address_collection: null,
        shipping_cost: null,
        shipping_details: null,
        shipping_options: [],
        status: 'complete',
        submit_type: null,
        subscription: null,
        success_url: 'https://example.com/success',
        total_details: {
          amount_discount: 0,
          amount_shipping: 0,
          amount_tax: 0
        },
        ui_mode: 'hosted',
        url: null
      }
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: `req_${Math.random().toString(36).substr(2, 9)}`,
      idempotency_key: null
    },
    type: 'checkout.session.completed'
  };

  return event;
}

/**
 * Test the webhook endpoint
 */
async function testWebhook() {
  console.log('🚀 Testing Stripe Webhook Endpoint');
  console.log(`📍 Endpoint: ${WEBHOOK_URL}`);
  console.log(`👤 Test User ID: ${TEST_USER_ID}`);
  console.log(`💰 Test Credits: ${TEST_CREDITS}`);
  console.log(`📦 Package Name: ${TEST_PACKAGE_NAME}`);
  console.log('');

  try {
    // Create mock event
    const event = createMockCheckoutEvent();
    const payload = JSON.stringify(event);
    
    // Generate timestamp and signature
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateStripeSignature(payload, WEBHOOK_SECRET, timestamp);
    
    console.log('📝 Generated mock event:');
    console.log(`   Event ID: ${event.id}`);
    console.log(`   Session ID: ${event.data.object.id}`);
    console.log(`   Payment Status: ${event.data.object.payment_status}`);
    console.log(`   Status: ${event.data.object.status}`);
    console.log('');
    
    console.log('🔐 Generated webhook signature:');
    console.log(`   Timestamp: ${timestamp}`);
    console.log(`   Signature: ${signature}`);
    console.log('');
    
    // Send request to webhook
    console.log('📡 Sending webhook request...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
      body: payload,
    });
    
    const responseText = await response.text();
    
    console.log('📬 Webhook Response:');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response: ${responseText}`);
    console.log('');
    
    // Analyze results
    if (response.status === 200) {
      console.log('✅ SUCCESS: Webhook processed the request successfully!');
      console.log('   The webhook endpoint is working correctly.');
      
      if (responseText === 'OK') {
        console.log('   Response indicates successful processing.');
      }
    } else if (response.status === 400) {
      console.log('❌ ERROR: Webhook returned 400 Bad Request');
      
      if (responseText.includes('signature')) {
        console.log('   This is likely due to webhook signature verification failure.');
        console.log('   Make sure the WEBHOOK_SECRET in this script matches your environment.');
      } else {
        console.log('   This could indicate a processing error in the webhook.');
      }
    } else if (response.status === 401) {
      console.log('❌ ERROR: Webhook returned 401 Unauthorized');
      console.log('   Check your API keys and authentication.');
    } else if (response.status === 404) {
      console.log('❌ ERROR: Webhook endpoint not found (404)');
      console.log('   Verify the webhook URL is correct.');
    } else if (response.status === 500) {
      console.log('❌ ERROR: Internal server error (500)');
      console.log('   There may be an issue with the webhook function itself.');
    } else {
      console.log(`❌ ERROR: Unexpected response status: ${response.status}`);
    }
    
  } catch (error) {
    console.log('💥 NETWORK ERROR: Failed to send request to webhook');
    console.log(`   Error: ${error.message}`);
    
    if (error.code === 'ENOTFOUND') {
      console.log('   The webhook URL appears to be invalid or unreachable.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   Connection was refused. The service may be down.');
    }
  }
}

/**
 * Test with invalid signature
 */
async function testInvalidSignature() {
  console.log('');
  console.log('🔓 Testing with Invalid Signature...');
  
  try {
    const event = createMockCheckoutEvent();
    const payload = JSON.stringify(event);
    const invalidSignature = 't=1234567890,v1=invalid_signature_here';
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': invalidSignature,
      },
      body: payload,
    });
    
    const responseText = await response.text();
    
    console.log('📬 Invalid Signature Test Response:');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response: ${responseText}`);
    
    if (response.status === 400 && responseText.includes('signature')) {
      console.log('✅ GOOD: Webhook correctly rejected invalid signature');
    } else {
      console.log('⚠️  WARNING: Webhook may not be properly validating signatures');
    }
    
  } catch (error) {
    console.log(`❌ Error testing invalid signature: ${error.message}`);
  }
}

/**
 * Test without signature header
 */
async function testMissingSignature() {
  console.log('');
  console.log('🚫 Testing without Signature Header...');
  
  try {
    const event = createMockCheckoutEvent();
    const payload = JSON.stringify(event);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No stripe-signature header
      },
      body: payload,
    });
    
    const responseText = await response.text();
    
    console.log('📬 Missing Signature Test Response:');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response: ${responseText}`);
    
    if (response.status === 400) {
      console.log('✅ GOOD: Webhook correctly rejected request without signature');
    } else {
      console.log('⚠️  WARNING: Webhook should reject requests without signature header');
    }
    
  } catch (error) {
    console.log(`❌ Error testing missing signature: ${error.message}`);
  }
}

// Main execution
async function main() {
  console.log('==========================================');
  console.log('        STRIPE WEBHOOK TEST SUITE        ');
  console.log('==========================================');
  console.log('');
  
  // Test 1: Valid webhook request
  await testWebhook();
  
  // Test 2: Invalid signature
  await testInvalidSignature();
  
  // Test 3: Missing signature
  await testMissingSignature();
  
  console.log('');
  console.log('==========================================');
  console.log('             TEST COMPLETE               ');
  console.log('==========================================');
  console.log('');
  console.log('💡 NOTES:');
  console.log('   • If signature verification fails, update WEBHOOK_SECRET');
  console.log('   • A 200 "OK" response indicates successful processing');
  console.log('   • Check your Supabase function logs for detailed output');
  console.log('   • Ensure your environment variables are properly set');
}

// Run the tests
main().catch(console.error);