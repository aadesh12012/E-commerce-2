# Deployment Guide

This guide provides step-by-step instructions for deploying the E-commerce application to production.

## Table of Contents
- [Pre-deployment Checklist](#pre-deployment-checklist)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## Pre-deployment Checklist

Before deploying, ensure:
- [ ] All sensitive data is removed from source code
- [ ] `.env` files are in `.gitignore` (already configured)
- [ ] `.env.example` files are created with dummy values
- [ ] Production environment variables are prepared
- [ ] MongoDB instance is set up for production
- [ ] Razorpay API keys are obtained
- [ ] Email service credentials are ready
- [ ] SSL certificate obtained for HTTPS
- [ ] Build tested locally with production settings

## Backend Deployment

### Using Heroku

1. **Install Heroku CLI**
```bash
# Download and install from https://devcenter.heroku.com/articles/heroku-cli
```

2. **Create Heroku App**
```bash
heroku login
heroku create your-app-name
```

3. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGO_URL=your_production_mongodb_uri
heroku config:set JWT_SECRET=your_strong_secret
heroku config:set JWT_SECRET_SELLER=your_seller_secret
heroku config:set KEY_ID=your_razorpay_key
heroku config:set KEY_SECRET=your_razorpay_secret
heroku config:set EMAIL=your_email@gmail.com
heroku config:set EMAIL_PASS=your_app_password
heroku config:set FRONTEND_URLS=https://yourfrontend.com,https://www.yourfrontend.com
```

4. **Deploy**
```bash
git push heroku main
```

### Using Railway

1. **Create Project**
   - Visit https://railway.app
   - Create new project
   - Connect your GitHub repository

2. **Configure Environment**
   - Add environment variables in Railway dashboard
   - Set buildpack to Node.js if not detected automatically

3. **Deploy**
   - Railway will automatically deploy on git push
   - Monitor deployment in dashboard

### Using AWS EC2

1. **Launch EC2 Instance**
   - Choose Ubuntu 20.04 LTS AMI
   - Configure security groups (open ports 80, 443, 3000)

2. **Install Dependencies**
```bash
sudo apt update
sudo apt install nodejs npm git
```

3. **Clone Repository**
```bash
git clone https://github.com/aadesh12012/E-commerce-2.git
cd E-commerce-2/backend
```

4. **Install and Run**
```bash
npm install --production
nano .env  # Add environment variables
npm start
```

5. **Setup PM2 Process Manager**
```bash
npm install -g pm2
pm2 start index.js --name "ecommerce-backend"
pm2 startup
pm2 save
```

6. **Setup Nginx Reverse Proxy**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo systemctl restart nginx
```

## Frontend Deployment

### Using Vercel

1. **Push to GitHub**
   - Ensure code is on GitHub
   - Repository should be public or connected to Vercel

2. **Import Project**
   - Visit https://vercel.com
   - Click "New Project"
   - Import from GitHub
   - Select `client` as root directory

3. **Configure Build**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Set environment variables in Vercel dashboard

4. **Deploy**
   - Vercel will automatically deploy
   - Configure custom domain if needed

### Using Netlify

1. **Build Project Locally**
```bash
cd client
npm run build
```

2. **Deploy via Netlify UI**
   - Visit https://netlify.com
   - Drag and drop `dist` folder
   - Or connect GitHub for automatic deployments

3. **Configure Environment**
   - Site settings → Build & deploy
   - Add environment variables

### Using AWS S3 + CloudFront

1. **Create S3 Bucket**
```bash
aws s3 mb s3://your-ecommerce-bucket
```

2. **Build and Upload**
```bash
cd client
npm run build
aws s3 sync dist/ s3://your-ecommerce-bucket
```

3. **Setup CloudFront**
   - Create CloudFront distribution
   - Point to S3 bucket
   - Configure as origin
   - Set default root object to `index.html`
   - Enable caching

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Visit https://www.mongodb.com/cloud/atlas
   - Create account and new project
   - Create M0 free cluster

2. **Create Database User**
   - Click "Database Access"
   - Add database user with username and auto-generated password
   - Copy connection string

3. **Network Access**
   - Click "Network Access"
   - Add IP 0.0.0.0/0 for development (restrict in production)

4. **Get Connection String**
   - Click "Clusters"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy URI and replace password and database name

## Environment Variables

### Backend Production .env

```
# Server
NODE_ENV=production
PORT=3000

# Database
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_very_strong_secret_key_here_min_32_chars
JWT_SECRET_SELLER=your_seller_secret_key_here_min_32_chars

# Razorpay
KEY_ID=rzp_live_xxxxxxxxxxxxx
KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx

# Email Service
EMAIL=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_HOST=smtp.gmail.com

# Frontend URLs
FRONTEND_URLS=https://yourdomain.com,https://www.yourdomain.com
```

### Frontend Production .env

```
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_ENVIRONMENT=production
```

## Post-Deployment Steps

1. **Test All Features**
   - Test user registration/login
   - Test product browsing
   - Test cart functionality
   - Test payment processing
   - Test seller operations
   - Test admin panel

2. **Enable HTTPS**
   - Obtain SSL certificate (Let's Encrypt for free)
   - Configure in your hosting provider
   - Update CORS origins to use HTTPS

3. **Setup Monitoring**
   - Setup error tracking (Sentry)
   - Setup performance monitoring
   - Setup uptime monitoring

4. **Backup Strategy**
   - Configure MongoDB backup schedule
   - Test backup restoration
   - Setup automated backups

## Troubleshooting

### Common Issues

**"MongoDB connection failed"**
- Check connection string in `.env`
- Verify database credentials
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

**"CORS errors"**
- Verify `FRONTEND_URLS` environment variable
- Check frontend domain matches CORS origins
- Clear browser cache

**"Payment not processing"**
- Verify Razorpay credentials
- Check if using test or live keys
- Verify webhook configuration

**"Email not sending"**
- Verify Gmail app password (not regular password)
- Check "Less secure app access" settings
- Verify SMTP server address

**"File uploads not working"**
- Check upload folder permissions
- Verify multer configuration
- Check file size limits

### Performance Optimization

1. **Enable Compression**
```javascript
const compression = require('compression');
app.use(compression());
```

2. **Add Caching Headers**
```javascript
app.set('view cache', true);
app.use(express.static('uploads', { maxAge: '1d' }));
```

3. **Database Indexing**
   - Create indexes on frequently queried fields
   - Monitor database performance

4. **CDN for Static Files**
   - Use CloudFront or similar for static assets
   - Reduce server load

## Support

For deployment issues, check:
- Hosting provider documentation
- GitHub Issues
- Application logs
- Environment variables configuration

---

**Last Updated:** 2026-05-29
**Status:** Deployment Ready
