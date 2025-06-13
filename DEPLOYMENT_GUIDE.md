# CodePets Deployment Guide

## 🚀 Easy Deployment with Vercel + Render

### Prerequisites

- GitHub account
- Vercel account (free)
- Render account (free)
- MongoDB Atlas account (free)

---

## 📋 Deployment Steps

### **Step 1: Database Setup (MongoDB Atlas)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster if you haven't already
3. Get your connection string from the Connect button
4. Make sure to whitelist all IPs (0.0.0.0/0) for production or specific Render IPs

### **Step 2: GitHub OAuth App Setup**

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: CodePets
   - **Homepage URL**: `https://your-app-name.vercel.app` (will update after Vercel deploy)
   - **Authorization callback URL**: `https://your-app-name.vercel.app/auth/callback`
4. Save the Client ID and Client Secret

### **Step 3: Deploy Backend to Render**

1. Go to [Render](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Choose the `server` folder as the root directory
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Add environment variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   JWT_SECRET=your_jwt_secret_key
   CLIENT_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```
8. Click "Create Web Service"
9. Note your backend URL: `https://your-service.onrender.com`

### **Step 4: Deploy Frontend to Vercel**

1. Go to [Vercel](https://vercel.com) and sign up with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Set root directory to `client`
5. Framework preset should auto-detect as "Vite"
6. Add environment variable:
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com/api
   ```
7. Click "Deploy"
8. Note your frontend URL: `https://your-app.vercel.app`

### **Step 5: Update GitHub OAuth URLs**

1. Go back to your GitHub OAuth App settings
2. Update the callback URL to: `https://your-app.vercel.app/auth/callback`
3. Update homepage URL to: `https://your-app.vercel.app`

### **Step 6: Update Backend Environment**

1. Go to your Render dashboard
2. Update the `CLIENT_URL` environment variable to: `https://your-app.vercel.app`
3. Redeploy the service

---

## 🔧 Environment Variables Reference

### Backend (.env)

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codepets
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
JWT_SECRET=your_random_jwt_secret_key
CLIENT_URL=https://your-app.vercel.app
NODE_ENV=production
```

### Frontend (.env)

```bash
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

---

## ✅ Testing Your Deployment

1. Visit your Vercel app URL
2. Try logging in with GitHub
3. Check if your pet data loads
4. Test GitHub repository sync
5. Try logging coding time

---

## 🐛 Troubleshooting

### Common Issues:

**1. OAuth Callback Error**

- Make sure GitHub OAuth callback URL matches exactly
- Check for trailing slashes

**2. API Connection Error**

- Verify VITE_API_BASE_URL in Vercel environment variables
- Check CORS settings in backend

**3. Database Connection Issues**

- Verify MongoDB Atlas connection string
- Check IP whitelist settings

**4. GitHub API Errors**

- Verify GitHub OAuth credentials
- Check GitHub API rate limits

---

## 📱 URLs After Deployment

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **API Health Check**: `https://your-backend.onrender.com/api/health`

---

## 🔄 Future Updates

To update your deployment:

1. **Frontend**: Push changes to main branch → Vercel auto-deploys
2. **Backend**: Push changes to main branch → Render auto-deploys
3. **Environment Variables**: Update in respective platform dashboards

---

## 💡 Tips

- Render free tier may sleep after 15 minutes of inactivity
- First request after sleep might be slow (cold start)
- Monitor your MongoDB Atlas usage on free tier
- Keep your GitHub OAuth secrets secure

Happy coding with your CodePets! 🐱💻
