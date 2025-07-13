-- Test the add_credits function directly
-- First, let's check if the function exists and what its signature is

-- Check function exists
SELECT 
    routine_name, 
    routine_type,
    data_type,
    specific_name
FROM information_schema.routines 
WHERE routine_name = 'add_credits';

-- Check function parameters
SELECT 
    parameter_name,
    data_type,
    parameter_mode
FROM information_schema.parameters 
WHERE specific_name = 'add_credits_18568';

-- Test calling the function with test data
-- Note: Replace 'test-user-id' with an actual user ID from your auth.users table
SELECT add_credits(
    'test-user-id'::uuid,
    10,
    'purchased'::credit_type,
    (NOW() + INTERVAL '1 year')::timestamptz
);