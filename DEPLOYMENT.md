# Deployment Guide

## Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend) - FREE

#### Backend Deployment (Render)

1. **Create Render Account**
   - Go to [Render](https://render.com/)
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Choose free tier
   - Copy the "Internal Database URL"

3. **Deploy Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `campus-lost-found-api`
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Instance Type: Free

4. **Set Environment Variables**
   Add all variables from your `.env`:
   - PORT (leave as default)
   - DATABASE_URL (use Internal Database URL from step 2)
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
   - FIREBASE_PROJECT_ID
   - FIREBASE_CLIENT_EMAIL
   - FIREBASE_PRIVATE_KEY
   - JWT_SECRET
   - ALLOWED_DOMAINS
   - NODE_ENV: `production`

5. **Run Database Setup**
   - After deployment, go to Shell tab
   - Run: `npm run db:setup`

6. **Copy Backend URL**
   - Note the URL (e.g., `https://campus-lost-found-api.onrender.com`)

#### Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to [Vercel](https://vercel.com/)
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Framework Preset: Create React App
   - Root Directory: `frontend`

3. **Configure Environment Variables**
   - REACT_APP_API_URL: `https://your-backend-url.onrender.com/api`
   - REACT_APP_FIREBASE_API_KEY
   - REACT_APP_FIREBASE_AUTH_DOMAIN
   - REACT_APP_FIREBASE_PROJECT_ID
   - REACT_APP_FIREBASE_STORAGE_BUCKET
   - REACT_APP_FIREBASE_MESSAGING_SENDER_ID
   - REACT_APP_FIREBASE_APP_ID

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

5. **Update Firebase**
   - Go to Firebase Console
   - Add your Vercel domain to authorized domains

### Option 2: Railway (All-in-One) - FREE

1. **Create Railway Account**
   - Go to [Railway](https://railway.app/)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"

3. **Add PostgreSQL**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Copy DATABASE_URL from variables

4. **Deploy Backend**
   - Click "New" → "GitHub Repo"
   - Select your repository
   - Configure:
     - Root Directory: `/backend`
     - Build Command: `npm install`
     - Start Command: `npm start`
   - Add all environment variables

5. **Deploy Frontend**
   - Add another service from the same repo
   - Root Directory: `/frontend`
   - Build Command: `npm run build`
   - Start Command: `npx serve -s build -l $PORT`
   - Add environment variables

### Option 3: Heroku - FREE

#### Backend

```bash
cd backend
heroku create campus-lost-found-api
heroku addons:create heroku-postgresql:mini
git push heroku main
heroku config:set CLOUDINARY_CLOUD_NAME=xxx CLOUDINARY_API_KEY=xxx ...
heroku run npm run db:setup
```

#### Frontend

```bash
cd frontend
heroku create campus-lost-found-web
heroku config:set REACT_APP_API_URL=https://campus-lost-found-api.herokuapp.com/api
git push heroku main
```

## Post-Deployment Checklist

- [ ] Database is set up and tables are created
- [ ] Backend health check works (`/health` endpoint)
- [ ] Frontend can reach backend API
- [ ] Google authentication works
- [ ] Email domain restriction is enforced
- [ ] Image upload to Cloudinary works
- [ ] AI model loads successfully
- [ ] Matching algorithm processes items
- [ ] Firebase authorized domains include production URLs

## Environment-Specific Configuration

### Production Optimizations

1. **Backend (.env)**
```env
NODE_ENV=production
# Enable CORS for your frontend domain only
# Add rate limiting
# Enable request logging
```

2. **Frontend**
- Build with production flag
- Enable service workers
- Optimize images
- Enable caching

## Monitoring

### Free Monitoring Tools

1. **Uptime Monitoring**
   - [UptimeRobot](https://uptimerobot.com/) - Free
   - Monitor `/health` endpoint

2. **Error Tracking**
   - [Sentry](https://sentry.io/) - Free tier
   - Add to both frontend and backend

3. **Analytics**
   - Google Analytics
   - Firebase Analytics

## Scaling Considerations

### When you outgrow free tiers:

1. **Database**: Upgrade PostgreSQL instance
2. **Backend**: Add more workers/instances
3. **Storage**: Cloudinary has affordable paid tiers
4. **CDN**: Use Cloudinary's CDN for images

## Backup Strategy

1. **Database Backups**
   - Most free providers include daily backups
   - Export data periodically: `pg_dump`

2. **Image Backups**
   - Cloudinary stores images reliably
   - Images can be downloaded via API if needed

## Security Checklist

- [ ] All secrets are in environment variables (not in code)
- [ ] Firebase private key is properly escaped
- [ ] CORS is configured for production domains only
- [ ] Rate limiting is enabled
- [ ] SQL injection prevention (using parameterized queries ✓)
- [ ] XSS protection (React default ✓)
- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] Email domain validation works

## Custom Domain (Optional)

1. Purchase domain (e.g., from Namecheap, Google Domains)
2. Add to Vercel/Render
3. Update Firebase authorized domains
4. Update CORS configuration

## Cost Estimate

With free tiers:
- **Total Cost**: $0/month for up to:
  - 500MB database (Supabase)
  - 750 hours/month backend uptime (Render)
  - Unlimited frontend requests (Vercel)
  - 25GB storage, 25GB bandwidth (Cloudinary)

This is sufficient for a campus-wide deployment with moderate usage.
