#!/usr/bin/env python3

"""
Stripe Webhook Test Script (Python Version)

This script tests the Stripe webhook endpoint by:
1. Creating a mock checkout.session.completed event
2. Generating a proper Stripe webhook signature
3. Sending the request to the webhook endpoint
4. Reporting the results
"""

import hashlib
import hmac
import json
import time
import random
import string
import requests

# Configuration
WEBHOOK_URL = 'https://zhlpovxcsalhfxzjfcun.supabase.co/functions/v1/stripe-webhook'

# Mock webhook secret - In production, this would be your actual webhook secret
# For testing, you can use any string, but it should match what's configured in your environment
WEBHOOK_SECRET = 'whsec_test_secret_key'  # Replace with your actual webhook secret if testing against real endpoint

# Test data
TEST_USER_ID = 'test-user-12345'
TEST_CREDITS = 10
TEST_PACKAGE_NAME = 'Test Credits Package'


def generate_stripe_signature(payload: str, secret: str, timestamp: int) -> str:
    """Generate a Stripe webhook signature"""
    payload_string = f"{timestamp}.{payload}"
    signature = hmac.new(
        secret.encode('utf-8'),
        payload_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return f"t={timestamp},v1={signature}"


def random_string(length: int = 9) -> str:
    """Generate a random string for IDs"""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))


def create_mock_checkout_event() -> dict:
    """Create a mock Stripe checkout.session.completed event"""
    timestamp = int(time.time())
    
    event = {
        "id": f"evt_test_{random_string()}",
        "object": "event",
        "api_version": "2023-10-16",
        "created": timestamp,
        "data": {
            "object": {
                "id": f"cs_test_{random_string()}",
                "object": "checkout.session",
                "amount_subtotal": 1000,  # $10.00 in cents
                "amount_total": 1000,
                "billing_address_collection": None,
                "cancel_url": "https://example.com/cancel",
                "client_reference_id": None,
                "consent": None,
                "consent_collection": None,
                "created": timestamp,
                "currency": "usd",
                "customer": f"cus_test_{random_string()}",
                "customer_creation": "if_required",
                "customer_details": {
                    "address": None,
                    "email": "test@example.com",
                    "name": "Test User",
                    "phone": None,
                    "tax_exempt": "none",
                    "tax_ids": []
                },
                "customer_email": "test@example.com",
                "expires_at": timestamp + 86400,  # 24 hours from now
                "invoice": None,
                "invoice_creation": None,
                "livemode": False,
                "locale": None,
                "metadata": {
                    "mode": "credits",
                    "user_id": TEST_USER_ID,
                    "credits": str(TEST_CREDITS),
                    "package_name": TEST_PACKAGE_NAME
                },
                "mode": "payment",
                "payment_intent": f"pi_test_{random_string()}",
                "payment_link": None,
                "payment_method_collection": "if_required",
                "payment_method_configuration_details": None,
                "payment_method_options": {},
                "payment_method_types": ["card"],
                "payment_status": "paid",
                "phone_number_collection": {
                    "enabled": False
                },
                "recovered_from": None,
                "setup_intent": None,
                "shipping_address_collection": None,
                "shipping_cost": None,
                "shipping_details": None,
                "shipping_options": [],
                "status": "complete",
                "submit_type": None,
                "subscription": None,
                "success_url": "https://example.com/success",
                "total_details": {
                    "amount_discount": 0,
                    "amount_shipping": 0,
                    "amount_tax": 0
                },
                "ui_mode": "hosted",
                "url": None
            }
        },
        "livemode": False,
        "pending_webhooks": 1,
        "request": {
            "id": f"req_{random_string()}",
            "idempotency_key": None
        },
        "type": "checkout.session.completed"
    }
    
    return event


def test_webhook():
    """Test the webhook endpoint with a valid request"""
    print('🚀 Testing Stripe Webhook Endpoint')
    print(f'📍 Endpoint: {WEBHOOK_URL}')
    print(f'👤 Test User ID: {TEST_USER_ID}')
    print(f'💰 Test Credits: {TEST_CREDITS}')
    print(f'📦 Package Name: {TEST_PACKAGE_NAME}')
    print()

    try:
        # Create mock event
        event = create_mock_checkout_event()
        payload = json.dumps(event, separators=(',', ':'))
        
        # Generate timestamp and signature
        timestamp = int(time.time())
        signature = generate_stripe_signature(payload, WEBHOOK_SECRET, timestamp)
        
        print('📝 Generated mock event:')
        print(f'   Event ID: {event["id"]}')
        print(f'   Session ID: {event["data"]["object"]["id"]}')
        print(f'   Payment Status: {event["data"]["object"]["payment_status"]}')
        print(f'   Status: {event["data"]["object"]["status"]}')
        print()
        
        print('🔐 Generated webhook signature:')
        print(f'   Timestamp: {timestamp}')
        print(f'   Signature: {signature}')
        print()
        
        # Send request to webhook
        print('📡 Sending webhook request...')
        
        headers = {
            'Content-Type': 'application/json',
            'stripe-signature': signature,
        }
        
        response = requests.post(WEBHOOK_URL, headers=headers, data=payload, timeout=30)
        
        print('📬 Webhook Response:')
        print(f'   Status: {response.status_code} {response.reason}')
        print(f'   Response: {response.text}')
        print()
        
        # Analyze results
        if response.status_code == 200:
            print('✅ SUCCESS: Webhook processed the request successfully!')
            print('   The webhook endpoint is working correctly.')
            
            if response.text.strip() == 'OK':
                print('   Response indicates successful processing.')
        elif response.status_code == 400:
            print('❌ ERROR: Webhook returned 400 Bad Request')
            
            if 'signature' in response.text.lower():
                print('   This is likely due to webhook signature verification failure.')
                print('   Make sure the WEBHOOK_SECRET in this script matches your environment.')
            else:
                print('   This could indicate a processing error in the webhook.')
        elif response.status_code == 401:
            print('❌ ERROR: Webhook returned 401 Unauthorized')
            print('   Check your API keys and authentication.')
        elif response.status_code == 404:
            print('❌ ERROR: Webhook endpoint not found (404)')
            print('   Verify the webhook URL is correct.')
        elif response.status_code == 500:
            print('❌ ERROR: Internal server error (500)')
            print('   There may be an issue with the webhook function itself.')
        else:
            print(f'❌ ERROR: Unexpected response status: {response.status_code}')
            
    except requests.exceptions.RequestException as error:
        print('💥 NETWORK ERROR: Failed to send request to webhook')
        print(f'   Error: {error}')
        
        if 'Name or service not known' in str(error):
            print('   The webhook URL appears to be invalid or unreachable.')
        elif 'Connection refused' in str(error):
            print('   Connection was refused. The service may be down.')


def test_invalid_signature():
    """Test with invalid signature"""
    print()
    print('🔓 Testing with Invalid Signature...')
    
    try:
        event = create_mock_checkout_event()
        payload = json.dumps(event, separators=(',', ':'))
        invalid_signature = 't=1234567890,v1=invalid_signature_here'
        
        headers = {
            'Content-Type': 'application/json',
            'stripe-signature': invalid_signature,
        }
        
        response = requests.post(WEBHOOK_URL, headers=headers, data=payload, timeout=30)
        
        print('📬 Invalid Signature Test Response:')
        print(f'   Status: {response.status_code} {response.reason}')
        print(f'   Response: {response.text}')
        
        if response.status_code == 400 and 'signature' in response.text.lower():
            print('✅ GOOD: Webhook correctly rejected invalid signature')
        else:
            print('⚠️  WARNING: Webhook may not be properly validating signatures')
            
    except requests.exceptions.RequestException as error:
        print(f'❌ Error testing invalid signature: {error}')


def test_missing_signature():
    """Test without signature header"""
    print()
    print('🚫 Testing without Signature Header...')
    
    try:
        event = create_mock_checkout_event()
        payload = json.dumps(event, separators=(',', ':'))
        
        headers = {
            'Content-Type': 'application/json',
            # No stripe-signature header
        }
        
        response = requests.post(WEBHOOK_URL, headers=headers, data=payload, timeout=30)
        
        print('📬 Missing Signature Test Response:')
        print(f'   Status: {response.status_code} {response.reason}')
        print(f'   Response: {response.text}')
        
        if response.status_code == 400:
            print('✅ GOOD: Webhook correctly rejected request without signature')
        else:
            print('⚠️  WARNING: Webhook should reject requests without signature header')
            
    except requests.exceptions.RequestException as error:
        print(f'❌ Error testing missing signature: {error}')


def main():
    """Main execution function"""
    print('==========================================')
    print('        STRIPE WEBHOOK TEST SUITE        ')
    print('==========================================')
    print()
    
    # Test 1: Valid webhook request
    test_webhook()
    
    # Test 2: Invalid signature
    test_invalid_signature()
    
    # Test 3: Missing signature
    test_missing_signature()
    
    print()
    print('==========================================')
    print('             TEST COMPLETE               ')
    print('==========================================')
    print()
    print('💡 NOTES:')
    print('   • If signature verification fails, update WEBHOOK_SECRET')
    print('   • A 200 "OK" response indicates successful processing')
    print('   • Check your Supabase function logs for detailed output')
    print('   • Ensure your environment variables are properly set')


if __name__ == '__main__':
    main()