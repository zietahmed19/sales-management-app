# Deployment Guide for Sales Management App on Render.com

## Overview
This guide will help you deploy the Sales Management App to Render.com as two separate services:
1. **Backend API** (Node.js/Express)
2. **Frontend App** (React Static Site)

## Prerequisites
- GitHub account
- Render.com account (free)
- Your project pushed to GitHub

---

## Step 1: Prepare Your Repository

### 1.1 Update Environment Configuration
Create `.env` file in your project root:
```bash
REACT_APP_API_URL=https://your-backend-name.onrender.com
```

### 1.2 Commit and Push to GitHub
```bash
git add .
git commit -m "Prepare for Render.com deployment"
git push origin main
```

---

## Step 2: Deploy Backend (API Server)

### 2.1 Create Backend Service
1. Go to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

**Build & Deploy Settings:**
- **Name**: `sales-management-backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Instance Type**: `Free`

**Environment Variables:**
```
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-here
```

### 2.2 Deploy Backend
1. Click "Create Web Service"
2. Wait for deployment to complete (5-10 minutes)
3. Note your backend URL: `https://sales-management-backend.onrender.com`

---

## Step 3: Deploy Frontend (React App)

### 3.1 Update Frontend Configuration
Update your `.env` file with the actual backend URL:
```bash
REACT_APP_API_URL=https://sales-management-backend.onrender.com
```

### 3.2 Build React App Locally
```bash
npm run build
```

### 3.3 Create Frontend Service
1. Go back to Render dashboard
2. Click "New +" → "Static Site"
3. Connect your GitHub repository again
4. Configure the service:

**Build & Deploy Settings:**
- **Name**: `sales-management-frontend`
- **Build Command**: `npm run build`
- **Publish Directory**: `build`

**Environment Variables:**
```
REACT_APP_API_URL=https://sales-management-backend.onrender.com
```

### 3.4 Deploy Frontend
1. Click "Create Static Site"
2. Wait for deployment to complete
3. Your app will be available at: `https://sales-management-frontend.onrender.com`

---

## Step 4: Test Deployment

### 4.1 Test Backend API
Visit: `https://sales-management-backend.onrender.com/api/health`
Should return:
```json
{
  "status": "OK",
  "timestamp": "2025-01-31T...",
  "environment": "production"
}
```

### 4.2 Test Frontend App
1. Visit: `https://sales-management-frontend.onrender.com`
2. Try logging in with demo credentials:
   - **Username**: `ahmed`
   - **Password**: `123456`
3. Test the sales flow: Packs → Clients → Confirmation

---

## Step 5: Configure CORS (If Needed)

If you encounter CORS errors, update the backend CORS configuration in `server.js`:

```javascript
app.use(cors({
  origin: [
    'https://sales-management-frontend.onrender.com',
    'http://localhost:3000' // for local development
  ],
  credentials: true
}));
```

---

## Troubleshooting

### Common Issues:

**1. Backend Build Fails**
- Check if all dependencies are in `package.json`
- Ensure Node.js version compatibility

**2. Frontend Can't Connect to Backend**
- Verify `REACT_APP_API_URL` environment variable
- Check if backend is running: visit `/api/health` endpoint
- Check browser console for CORS errors

**3. Data Not Persisting**
- Render's free tier has ephemeral storage
- Data files are recreated on each deployment
- Consider upgrading to paid plan or using external database

**4. App Slow to Load**
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes 30+ seconds to wake up
- Consider upgrading for better performance

---

## Free Tier Limitations

⚠️ **Important Notes:**
- **Sleep Mode**: Free services sleep after 15 minutes of inactivity
- **Build Time**: Limited to 500 build hours/month
- **Bandwidth**: 100GB/month outbound data transfer
- **Storage**: Ephemeral (data resets on deployment)

---

## Upgrade Options

For production use, consider:
1. **Paid Plan**: $7/month for always-on services
2. **Database**: PostgreSQL for persistent data storage
3. **CDN**: For faster global content delivery

---

## Environment URLs

After deployment, you'll have:
- **Backend API**: `https://sales-management-backend.onrender.com`
- **Frontend App**: `https://sales-management-frontend.onrender.com`
- **API Health Check**: `https://sales-management-backend.onrender.com/api/health`

---

## Support

If you encounter issues:
1. Check Render.com logs in the dashboard
2. Verify environment variables are set correctly
3. Test API endpoints directly using browser or Postman
4. Check browser console for JavaScript errors

---

**🎉 Congratulations! Your Sales Management App is now live on Render.com!**
