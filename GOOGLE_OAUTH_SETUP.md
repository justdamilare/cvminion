# 🔐 Google OAuth Setup - Step by Step

## **Step 1: Create Google Cloud Project**

### **Go to Google Cloud Console:**
👉 **https://console.cloud.google.com**

### **Create or Select Project:**
1. **Click** the project dropdown (top left)
2. **Click** "New Project" 
3. **Project Name**: `CVMinion`
4. **Click** "Create"

---

## **Step 2: Enable Required APIs**

### **Enable Google Identity API:**
1. **Go to**: APIs & Services → Library
2. **Search**: "Google Identity Services API"
3. **Click** on it → **Click** "Enable"

---

## **Step 3: Configure OAuth Consent Screen**

### **Go to OAuth Consent Screen:**
👉 **APIs & Services → OAuth consent screen**

### **Configuration:**
1. **User Type**: External (unless you have Google Workspace)
2. **Click** "Create"

### **App Information:**
```
App name: CVMinion
User support email: [YOUR EMAIL]
App logo: [Optional - upload CVMinion logo]
```

### **App domain (Optional but recommended):**
```
Application home page: https://cvminion-edc8am9b8-srevana.vercel.app
Privacy policy: https://cvminion-edc8am9b8-srevana.vercel.app/privacy
Terms of service: https://cvminion-edc8am9b8-srevana.vercel.app/terms
```

### **Developer contact information:**
```
Email addresses: [YOUR EMAIL]
```

### **Scopes (Step 2):**
Click "Add or Remove Scopes" and add:
- `email`
- `profile`
- `openid`

### **Save and Continue** through all steps

---

## **Step 4: Create OAuth Credentials**

### **Go to Credentials:**
👉 **APIs & Services → Credentials**

### **Create OAuth 2.0 Client ID:**
1. **Click** "Create Credentials"
2. **Select** "OAuth client ID"
3. **Application type**: Web application
4. **Name**: `CVMinion Web Client`

### **Authorized redirect URIs (IMPORTANT!):**
Add these URLs exactly:
```
https://zhlpovxcsalhfxzjfcun.supabase.co/auth/v1/callback

https://cvminion-edc8am9b8-srevana.vercel.app/auth/callback

https://cvminion-kvtec1jo8-srevana.vercel.app/auth/callback

http://localhost:3000/auth/callback
```

### **Click** "Create"

---

## **Step 5: Copy Your Credentials**

### **You'll see a popup with:**
- **Client ID**: `xxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxx`

### **IMPORTANT: Copy Both Values!**
I need these to configure Supabase:

```
Google Client ID: [PASTE HERE]
Google Client Secret: [PASTE HERE]
```

---

## **🎯 What These URLs Do:**

### **Supabase Callback:**
`https://zhlpovxcsalhfxzjfcun.supabase.co/auth/v1/callback`
- **Purpose**: Supabase handles OAuth flow
- **Required**: For authentication to work

### **Production Callback:**  
`https://cvminion-edc8am9b8-srevana.vercel.app/auth/callback`
- **Purpose**: Redirect after successful authentication
- **User sees**: CVMinion dashboard after login

### **Staging Callback:**
`https://cvminion-kvtec1jo8-srevana.vercel.app/auth/callback` 
- **Purpose**: Testing environment
- **Safe testing**: Before production deployment

### **Development Callback:**
`http://localhost:3000/auth/callback`
- **Purpose**: Local development testing
- **Development**: When running `npm run dev`

---

## **🚨 Common Issues & Solutions:**

### **"Redirect URI mismatch" error:**
- **Check**: URLs are exactly as shown above
- **No trailing slashes**: Don't add `/` at the end
- **Case sensitive**: Copy URLs exactly

### **"Access blocked" error:**
- **OAuth consent**: Make sure you completed OAuth consent screen
- **User type**: Set to "External" if you don't have Google Workspace

### **"App not verified" warning:**
- **Normal**: Google shows this for new apps
- **Testing**: Click "Advanced" → "Go to CVMinion (unsafe)"
- **Production**: Apply for verification later if needed

---

## **✅ Verification Steps:**

After creating credentials:

1. **✅ Client ID** starts with your project number
2. **✅ Client Secret** starts with `GOCSPX-`  
3. **✅ All 4 redirect URIs** are added exactly as shown
4. **✅ OAuth consent screen** is configured
5. **✅ Google Identity Services API** is enabled

---

## **🎯 Once You Have Credentials:**

Paste your Client ID and Client Secret here, and I'll:

1. **Configure Supabase** with your Google OAuth settings
2. **Update frontend code** to use Google Sign-In buttons
3. **Remove password authentication** completely  
4. **Test the flow** on staging environment
5. **Deploy to production**

**Ready! Please share your Google Client ID and Client Secret when you have them.**