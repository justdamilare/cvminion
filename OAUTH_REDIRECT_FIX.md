# OAuth Redirect URL Fix

## Issue
OAuth authentication redirects to localhost:3000 instead of production domain.

## Root Cause
The Google OAuth client configuration needs the production domain URLs added as authorized redirect URIs.

## Fix Required

### 1. Google OAuth Client Configuration
Go to [Google Cloud Console](https://console.developers.google.com/):

1. **Navigate to your OAuth client**:
   - APIs & Services > Credentials
   - Find your OAuth 2.0 Client ID: `1047831831220-3hvlp7thq7se6hs45vh2c581249tnv33.apps.googleusercontent.com`

2. **Add these Authorized Redirect URIs**:
   ```
   https://zhlpovxcsalhfxzjfcun.supabase.co/auth/v1/callback
   https://cvminion.com/auth/callback
   https://cvminion.vercel.app/auth/callback
   https://cvminion-rkhhsrf4k-srevana.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   http://localhost:5173/auth/callback
   ```

3. **Add these Authorized JavaScript Origins**:
   ```
   https://cvminion.com
   https://cvminion.vercel.app
   https://zhlpovxcsalhfxzjfcun.supabase.co
   http://localhost:3000
   http://localhost:5173
   ```

### 2. LinkedIn OAuth Client Configuration
Go to [LinkedIn Developer Console](https://www.linkedin.com/developers/apps):

1. **Navigate to your LinkedIn app**
2. **Add these Authorized Redirect URLs**:
   ```
   https://zhlpovxcsalhfxzjfcun.supabase.co/auth/v1/callback
   https://cvminion.com/auth/callback
   https://cvminion.vercel.app/auth/callback
   https://cvminion-rkhhsrf4k-srevana.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   http://localhost:5173/auth/callback
   ```

### 3. Supabase Auth Configuration
In Supabase Dashboard > Authentication > URL Configuration:

1. **Site URL**: `https://cvminion.com`
2. **Redirect URLs** (add all these):
   ```
   https://cvminion.com/auth/callback
   https://cvminion.vercel.app/auth/callback
   https://cvminion-rkhhsrf4k-srevana.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   http://localhost:5173/auth/callback
   ```

## Code Changes Made

Updated OAuth functions in `src/lib/auth.ts` to:
- Explicitly handle production domain detection
- Ensure correct redirect URLs are used
- Support both development and production environments

## Testing After Fix

1. **Production**: https://cvminion.com/signin
2. **Staging**: https://cvminion-5nzqat1i4-srevana.vercel.app/signin
3. **Local**: http://localhost:5173/signin

All should work correctly after the OAuth client configurations are updated.

## Priority
**HIGH** - This blocks all OAuth authentication flows in production.