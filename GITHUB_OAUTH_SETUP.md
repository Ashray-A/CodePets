# GitHub OAuth Setup Instructions

## Step 1: Create a GitHub OAuth Application

1. Go to **GitHub Settings** → **Developer settings** → **OAuth Apps**
   - Direct link: https://github.com/settings/applications/new

2. Fill in the application details:
   - **Application name**: `CodePets - Digital Pet for Coders`
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Application description**: `A digital pet that grows based on your coding habits and GitHub activity`
   - **Authorization callback URL**: `http://localhost:3000/auth/callback`

3. Click **Register application**

4. Copy the **Client ID** and **Client Secret**

## Step 2: Update Environment Variables

Update your `backend/.env` file with the real GitHub OAuth credentials:

```env
# GitHub OAuth (replace with your actual values)
GITHUB_CLIENT_ID=your_actual_client_id_here
GITHUB_CLIENT_SECRET=your_actual_client_secret_here
```

## Step 3: For Production Deployment

When deploying to production, you'll need to:

1. Create a new GitHub OAuth App for production with:
   - **Homepage URL**: `https://your-app-domain.com`
   - **Authorization callback URL**: `https://your-app-domain.com/auth/callback`

2. Update environment variables in your hosting service:
   - Vercel: Add environment variables in project settings
   - Render: Add environment variables in service settings

## Notes

- The callback URL must match exactly what's configured in GitHub
- Client Secret should never be exposed in frontend code
- For development, make sure both frontend (port 3000) and backend (port 5000) are running
