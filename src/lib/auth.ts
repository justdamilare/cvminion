import { getSupabaseClient } from './supabase';
import { toast } from 'react-hot-toast';
import { AuthError } from '@supabase/supabase-js';

interface AuthApiError extends Error {
  code: string;
  status: number;
}

interface CustomAuthError extends Error {
  name: string;
}

const handleAuthError = (error: unknown) => {
  if (error instanceof Error && error.name === 'AuthRetryableFetchError') {
    throw error; // Let the hook handle retryable errors
  }

  // Map error messages and codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
    'user_not_found': 'No account found with this email. Please sign up first.',
    'email_not_confirmed': 'Please check your email and confirm your account before signing in.',
    'invalid_grant': 'Invalid email or password. Please check your credentials and try again.',
    'email_taken': 'An account with this email already exists. Please sign in instead.',
    'weak_password': 'Password is too weak. Please use a stronger password.',
    'refresh_token_not_found': 'Your session has expired. Please sign in again.',
    'email_provider_disabled': 'Email sign-in is currently disabled.',
    'phone_provider_disabled': 'Phone sign-in is currently disabled.',
    'oauth_provider_not_supported': 'This OAuth provider is not supported.',
    'over_request_rate_limit': 'Too many requests. Please try again later.',
    'session_expired': 'Your session has expired. Please sign in again.',
    'unexpected_failure': 'An unexpected error occurred. Please try again.',
  };

  // Get error code from various possible locations in the error object
  const errorCode = (error as AuthApiError).code || 
                   (error as CustomAuthError).name ||
                   (error instanceof Error && error.message.toLowerCase().includes('invalid') ? 'invalid_credentials' : null);

  const message = errorCode ? errorMessages[errorCode] : 
                 error instanceof Error ? error.message : 
                 'An unexpected error occurred. Please try again.';
  
  // Create proper AuthError instance
  const enhancedError = new AuthError(message);
  enhancedError.code = errorCode || 'unexpected_failure';
  
  throw enhancedError;
};

export const signUp = async (email: string, password: string) => {
  const supabase = getSupabaseClient();
  try {
    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });

    if (error) {
      handleAuthError(error);
    }

    toast.success('Account created successfully! You can now sign in.');
    return data;
  } catch (error: unknown) {
    handleAuthError(error);
  }
};

export const signIn = async (email: string, password: string) => {
  const supabase = getSupabaseClient();
  try {
    // Basic validation
    if (!email || !password) {
      throw new Error('Please enter both email and password');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      handleAuthError(error);
    }

    return data;
  } catch (error: unknown) {
    handleAuthError(error);
  }
};

export const signOut = async () => {
  const supabase = getSupabaseClient();
  try {
    // Clear any stored session data first
    localStorage.removeItem('supabase.auth.token');
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      handleAuthError(error);
    }
  } catch (error: unknown) {
    handleAuthError(error);
  }
};

// OAuth Sign-in Functions
export const signInWithGoogle = async () => {
  const supabase = getSupabaseClient();
  try {
    // Determine the correct redirect URL based on environment
    const getRedirectUrl = () => {
      const origin = window.location.origin;
      
      // Production domains
      if (origin.includes('cvminion.com') || origin.includes('cvminion.vercel.app')) {
        return `${origin}/auth/callback`;
      }
      
      // Development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return `${origin}/auth/callback`;
      }
      
      // Default fallback
      return `${origin}/auth/callback`;
    };

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectUrl(),
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });

    if (error) {
      handleAuthError(error);
    }

    return data;
  } catch (error: unknown) {
    handleAuthError(error);
  }
};

export const signInWithLinkedIn = async () => {
  const supabase = getSupabaseClient();
  try {
    // Determine the correct redirect URL based on environment
    const getRedirectUrl = () => {
      const origin = window.location.origin;
      
      // Production domains
      if (origin.includes('cvminion.com') || origin.includes('cvminion.vercel.app')) {
        return `${origin}/auth/callback`;
      }
      
      // Development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return `${origin}/auth/callback`;
      }
      
      // Default fallback
      return `${origin}/auth/callback`;
    };

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: getRedirectUrl(),
        scopes: 'openid profile email',
      }
    });

    if (error) {
      handleAuthError(error);
    }

    return data;
  } catch (error: unknown) {
    handleAuthError(error);
  }
};
