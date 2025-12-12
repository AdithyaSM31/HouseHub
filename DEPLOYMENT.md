# Deployment Guide - Vercel & Render

## 🚀 Deploy Frontend to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub** (already done ✅)
   ```bash
   https://github.com/AdithyaSM31/HouseHub.git
   ```

2. **Go to [Vercel](https://vercel.com)**
   - Sign in with your GitHub account
   - Click "Add New Project"
   - Import your `HouseHub` repository

3. **Configure Project Settings**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Add Environment Variable**
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
   - Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

---

## 🖥️ Deploy Backend to Render

### Step 1: Prepare Backend

Your backend is ready! It includes:
- ✅ `render.yaml` configuration file
- ✅ SQLite database setup script
- ✅ Start script in package.json

### Step 2: Deploy via Render Dashboard

1. **Go to [Render](https://render.com)**
   - Sign in with your GitHub account
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Select your `HouseHub` repository
   - Click "Connect"

3. **Configure Service**
   - **Name:** `househub-backend`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && node setupSQLite.js`
   - **Start Command:** `npm start`

4. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-random-secret-key-here
   ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   ```

5. **Select Plan**
   - Free tier is fine for testing
   - Click "Create Web Service"

### Step 3: Initialize Database

After deployment:
1. Go to Shell tab in Render dashboard
2. Run: `node setupSQLite.js`

---

## 🔄 Update Frontend with Backend URL

After backend is deployed:

1. **Get your Render backend URL**
   - Example: `https://househub-backend.onrender.com`

2. **Update Vercel Environment Variable**
   - Go to your Vercel project
   - Settings → Environment Variables
   - Update `VITE_API_URL` to: `https://househub-backend.onrender.com/api`
   - Redeploy

---

## 🔐 Security Checklist

### Backend (.env on Render)
- ✅ Set strong `JWT_SECRET` (min 32 characters)
- ✅ Add your Vercel frontend URL to `ALLOWED_ORIGINS`
- ✅ Set `NODE_ENV=production`

### Frontend (.env on Vercel)
- ✅ Update `VITE_API_URL` to production backend URL

---

## 📝 Post-Deployment

### Test Your Deployment

1. **Visit your Vercel frontend URL**
2. **Try to sign up/login**
3. **Browse properties**
4. **Test messaging feature**

### Common Issues

#### 1. CORS Errors
- Make sure `ALLOWED_ORIGINS` on backend includes your Vercel URL
- No trailing slash in URLs

#### 2. Database Issues
- Render free tier has ephemeral filesystem
- Database resets on restart
- Solution: Run `node setupSQLite.js` in Render shell after each restart
- Or upgrade to paid plan with persistent disk

#### 3. Build Errors
- Check build logs in Vercel/Render dashboard
- Verify all dependencies are in package.json
- Check Node version compatibility

---

## 🎯 Quick Deployment Checklist

### Backend (Render)
- [ ] Push code to GitHub
- [ ] Create new Web Service on Render
- [ ] Set Root Directory to `backend`
- [ ] Add environment variables
- [ ] Deploy
- [ ] Run database setup in Shell

### Frontend (Vercel)
- [ ] Create new project on Vercel
- [ ] Set Root Directory to `frontend`
- [ ] Set Framework to Vite
- [ ] Add VITE_API_URL environment variable
- [ ] Deploy

---

## 🌐 Your Live URLs

After deployment:
- **Frontend:** `https://house-hub-xyz.vercel.app`
- **Backend:** `https://househub-backend.onrender.com`

---

## 💡 Tips

1. **Free Tier Limitations:**
   - Render: Cold starts (30-60s delay after inactivity)
   - Vercel: Excellent for static sites, instant loads

2. **Database Persistence:**
   - Consider upgrading Render to paid plan for persistent disk
   - Or migrate to external database (PostgreSQL on Render/Neon)

3. **Custom Domain:**
   - Both Vercel and Render support custom domains
   - Configure in project settings

---

## 🔄 Continuous Deployment

Both platforms auto-deploy on git push:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel and Render will automatically rebuild and deploy! 🚀
