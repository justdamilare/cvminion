#!/bin/bash

# Stripe Webhook Test Script (Bash Version)
#
# This script tests the Stripe webhook endpoint with a basic request.
# Note: This version uses a simplified approach without proper signature generation.
# For production testing, use the Node.js or Python versions.

set -e

# Configuration
WEBHOOK_URL="https://zhlpovxcsalhfxzjfcun.supabase.co/functions/v1/stripe-webhook"
TEST_USER_ID="test-user-12345"
TEST_CREDITS=10
TEST_PACKAGE_NAME="Test Credits Package"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "        STRIPE WEBHOOK TEST (BASH)       "
echo "=========================================="
echo ""

echo -e "${BLUE}🚀 Testing Stripe Webhook Endpoint${NC}"
echo -e "📍 Endpoint: ${WEBHOOK_URL}"
echo -e "👤 Test User ID: ${TEST_USER_ID}"
echo -e "💰 Test Credits: ${TEST_CREDITS}"
echo -e "📦 Package Name: ${TEST_PACKAGE_NAME}"
echo ""

# Generate a timestamp
TIMESTAMP=$(date +%s)

# Create a mock checkout.session.completed event payload
PAYLOAD=$(cat <<EOF
{
  "id": "evt_test_$(openssl rand -hex 5)",
  "object": "event",
  "api_version": "2023-10-16",
  "created": ${TIMESTAMP},
  "data": {
    "object": {
      "id": "cs_test_$(openssl rand -hex 5)",
      "object": "checkout.session",
      "amount_subtotal": 1000,
      "amount_total": 1000,
      "currency": "usd",
      "customer": "cus_test_$(openssl rand -hex 5)",
      "customer_email": "test@example.com",
      "metadata": {
        "mode": "credits",
        "user_id": "${TEST_USER_ID}",
        "credits": "${TEST_CREDITS}",
        "package_name": "${TEST_PACKAGE_NAME}"
      },
      "mode": "payment",
      "payment_intent": "pi_test_$(openssl rand -hex 5)",
      "payment_status": "paid",
      "status": "complete"
    }
  },
  "livemode": false,
  "type": "checkout.session.completed"
}
EOF
)

echo -e "${BLUE}📝 Generated mock event payload${NC}"
echo ""

# Test 1: Request without signature (should fail)
echo -e "${YELLOW}🚫 Test 1: Request without signature header...${NC}"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}" \
  "${WEBHOOK_URL}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

echo "   Status: ${HTTP_STATUS}"
echo "   Response: ${RESPONSE_BODY}"

if [ "$HTTP_STATUS" = "400" ]; then
    echo -e "   ${GREEN}✅ GOOD: Webhook correctly rejected request without signature${NC}"
else
    echo -e "   ${YELLOW}⚠️  WARNING: Expected 400 status for missing signature${NC}"
fi

echo ""

# Test 2: Request with invalid signature (should fail)
echo -e "${YELLOW}🔓 Test 2: Request with invalid signature...${NC}"

INVALID_SIGNATURE="t=1234567890,v1=invalid_signature_here"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Content-Type: application/json" \
  -H "stripe-signature: ${INVALID_SIGNATURE}" \
  -d "${PAYLOAD}" \
  "${WEBHOOK_URL}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

echo "   Status: ${HTTP_STATUS}"
echo "   Response: ${RESPONSE_BODY}"

if [ "$HTTP_STATUS" = "400" ]; then
    echo -e "   ${GREEN}✅ GOOD: Webhook correctly rejected invalid signature${NC}"
else
    echo -e "   ${YELLOW}⚠️  WARNING: Expected 400 status for invalid signature${NC}"
fi

echo ""

# Test 3: CORS preflight request
echo -e "${BLUE}🌐 Test 3: CORS preflight request...${NC}"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X OPTIONS \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: stripe-signature,content-type" \
  "${WEBHOOK_URL}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

echo "   Status: ${HTTP_STATUS}"
echo "   Response: ${RESPONSE_BODY}"

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "   ${GREEN}✅ GOOD: CORS preflight request handled correctly${NC}"
else
    echo -e "   ${YELLOW}⚠️  WARNING: CORS preflight may not be working properly${NC}"
fi

echo ""
echo "=========================================="
echo "             TEST COMPLETE               "
echo "=========================================="
echo ""
echo -e "${BLUE}💡 NOTES:${NC}"
echo "   • This bash version cannot generate proper Stripe signatures"
echo "   • Use the Node.js or Python versions for full signature testing"
echo "   • All requests should return 400 due to missing/invalid signatures"
echo "   • Check your Supabase function logs for detailed output"
echo "   • To test with valid signatures, run:"
echo "     node test-stripe-webhook.js"
echo "     python3 test-stripe-webhook.py"