#!/bin/bash

# Simple webhook test script
WEBHOOK_URL="https://zhlpovxcsalhfxzjfcun.supabase.co/functions/v1/stripe-webhook"

echo "Testing Stripe webhook endpoint..."

# Test CORS preflight
echo "1. Testing CORS preflight..."
curl -X OPTIONS "$WEBHOOK_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: stripe-signature,content-type" \
  -v

echo -e "\n\n2. Testing webhook with mock event..."

# Create a mock checkout.session.completed event
MOCK_EVENT='{
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
}'

# Generate a simple signature (not cryptographically correct but for testing)
TIMESTAMP=$(date +%s)
SIGNATURE="t=$TIMESTAMP,v1=test_signature"

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "stripe-signature: $SIGNATURE" \
  -d "$MOCK_EVENT" \
  -v

echo -e "\n\nTest completed!"