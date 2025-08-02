# Deployment Guide for Sales Management App on Render.com

## Overview
This guide will help you deploy the Sales Management App to Render.com with enhanced features:
1. **Backend API** (Node.js/Express) with pack quantity management
2. **Frontend App** (React Static Site) with admin delegation overview
3. **Persistent data storage** for packs and sales

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
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
ADMIN_PASSWORD=admin123456
```

### 1.2 New Features Added
- **Pack Quantity Management**: Each pack now shows and tracks available quantities
- **Persistent Pack Storage**: New packs are saved permanently in database
- **Admin Dashboard**: Admins can view all delegates' sales reports and performance
- **Multi-language Support**: Arabic and French language switching
- **Dark/Light Theme**: Theme switching with persistent settings

### 1.3 User Roles
- **Delegates**: Can view their own sales, manage their clients, create sales
- **Admins**: Can view all delegates' performance, manage global packs, see consolidated reports

### 1.4 Commit and Push to GitHub
```bash
# Create contexts for theme and language
mkdir src\contexts
echo. > src\contexts\ThemeContext.js
echo. > src\contexts\LanguageContext.js

# Add all changes including new admin features
git add .
git commit -m "Add pack quantities, persistent storage, admin dashboard, and theme/language support"
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
- **Start Command**: `node server-db.js`
- **Instance Type**: `Free`

**Environment Variables:**
```
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-here
ADMIN_PASSWORD=admin123456
DATABASE_URL=sqlite:./database.db
```

### 2.2 Database Schema Updates
The backend now includes:
- **Pack quantities** in pack management
- **Persistent pack storage** with SQLite
- **User roles** (delegate/admin)
- **Enhanced sales tracking** with delegate attribution

### 2.3 Deploy Backend
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

### 3.2 New Frontend Features
- **Quantity Selection**: When selecting packs, users can choose quantities
- **Admin Dashboard**: `/admin` route for administrators
- **Language Switching**: Arabic/French toggle in settings
- **Theme Switching**: Light/Dark mode in settings
- **Enhanced Pack Management**: Add/Edit packs with quantities

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

## Step 4: Test New Features

### 4.1 Test Pack Quantities
1. Go to pack selection
2. Verify quantities are displayed for each pack
3. Select different quantities and confirm in sales

### 4.2 Test Pack Persistence
1. Add a new pack with quantity
2. Refresh the page
3. Verify the pack is still there

### 4.3 Test Admin Dashboard
1. Login with admin credentials:
   - **Username**: `admin`
   - **Password**: `admin123456`
2. Access admin dashboard
3. View all delegates' sales reports

### 4.4 Test Theme and Language
1. Go to Settings/Preferences
2. Switch between Arabic and French
3. Toggle between Light and Dark themes
4. Refresh page to verify persistence

---

## Step 5: Admin Features

### 5.1 Admin Login
- **Username**: `admin`
- **Password**: `admin123456` (configurable via environment)

### 5.2 Admin Capabilities
- View all delegates' sales performance
- Manage global pack inventory and quantities
- See consolidated sales reports across all territories
- Export comprehensive sales data
- Monitor delegate activity and performance metrics

### 5.3 Delegate Management
- Assign territories to delegates
- Track individual performance
- Set sales targets and goals
- Generate individual performance reports

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

## New Environment URLs

After deployment, you'll have:
- **Backend API**: `https://sales-management-backend.onrender.com`
- **Frontend App**: `https://sales-management-frontend.onrender.com`
- **Admin Dashboard**: `https://sales-management-frontend.onrender.com/admin`
- **API Health Check**: `https://sales-management-backend.onrender.com/api/health`
- **Packs API**: `https://sales-management-backend.onrender.com/api/packs`
- **Sales Reports API**: `https://sales-management-backend.onrender.com/api/admin/sales`

---

## Support

If you encounter issues:
1. Check Render.com logs in the dashboard
2. Verify environment variables are set correctly
3. Test API endpoints directly using browser or Postman
4. Check browser console for JavaScript errors

---

**🎉 Your Enhanced Sales Management App with Admin Features is now live!**
