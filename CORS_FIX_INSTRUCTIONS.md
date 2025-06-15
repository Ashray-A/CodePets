# CORS Production Fix Instructions

## The Issue

You're getting CORS errors when trying to login in production:

```
Access to XMLHttpRequest at 'https://codepets-server.onrender.com/api/auth/github/url' from origin 'https://code-pets.vercel.app' has been blocked by CORS policy
```

## Root Causes

1. The server's CORS configuration doesn't include your actual Vercel domain
2. Missing environment variables in Render deployment
3. Possible GitHub OAuth app configuration issues

## Fixes Applied

### 1. Updated Server CORS Configuration

- Added your actual Vercel domain: `https://code-pets.vercel.app`
- Added multiple possible deployment URLs
- Added better logging for debugging

### 2. Updated render.yaml

- Added `CLIENT_URL` environment variable
- Set to your actual Vercel domain

### 3. Improved OAuth URL Generation

- Better fallback logic for production environment
- More detailed logging

## Steps to Deploy the Fix

### 1. Redeploy the Server to Render

After pushing these changes to your repository:

1. Go to your Render dashboard
2. Find your `codepets-api` service
3. Click "Manual Deploy" or trigger a new deployment
4. Check the logs to see the CORS origins being logged

### 2. Set Environment Variables in Render Dashboard

In addition to the render.yaml, manually set these in your Render dashboard:

1. Go to your service settings → Environment
2. Add/verify these variables:
   - `CLIENT_URL` = `https://code-pets.vercel.app`
   - `MONGODB_URI` = Your MongoDB connection string
   - `GITHUB_CLIENT_ID` = Your GitHub OAuth App Client ID
   - `GITHUB_CLIENT_SECRET` = Your GitHub OAuth App Client Secret
   - `JWT_SECRET` = A secure random string

### 3. Update GitHub OAuth App Settings

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Find your CodePets OAuth app
3. Update the "Authorization callback URL" to:
   ```
   https://code-pets.vercel.app/auth/callback
   ```

### 4. Test the CORS Fix

After redeploying, you can test if CORS is working by visiting:

```
https://codepets-server.onrender.com/api/cors-test
```

This should return a JSON response showing the CORS configuration.

## Debug Steps if Still Not Working

1. **Check Server Logs**: Look at your Render deployment logs for CORS-related messages
2. **Test CORS Endpoint**: Visit the `/api/cors-test` endpoint to see current configuration
3. **Check Environment Variables**: Ensure all required environment variables are set in Render
4. **GitHub OAuth App**: Verify the callback URL matches your domain exactly

## Expected Result

After applying these fixes, you should be able to:

1. Click "Login with GitHub" without CORS errors
2. Complete the OAuth flow successfully
3. Be redirected back to the dashboard

The key fix is ensuring your server knows about your actual Vercel domain (`code-pets.vercel.app` with the hyphen) and has it in the CORS allowed origins list.
