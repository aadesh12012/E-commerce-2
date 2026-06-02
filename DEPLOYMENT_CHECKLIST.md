# 🚀 PRODUCTION DEPLOYMENT CHECKLIST

This checklist ensures your MERN e-commerce authentication works correctly after deployment.

---

## ✅ PRE-DEPLOYMENT VERIFICATION

### Backend Checks (Render/Heroku/AWS)

- [ ] **Node Environment Set**
  ```bash
  # Verify on hosting platform dashboard
  NODE_ENV = production
  ```

- [ ] **JWT Secrets Configured** (CRITICAL)
  ```bash
  # Both must be strong, random 32+ character strings
  JWT_SECRET = [unique-random-string]
  JWT_SECRET_SELLER = [unique-random-string]
  ```
  Generate with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] **Frontend URLs Configured** (CRITICAL)
  ```bash
  # For Vercel: https://yourdomain.com,https://www.yourdomain.com
  FRONTEND_URLS = https://your-production-domain.com
  ```

- [ ] **MongoDB Atlas Connected**
  ```bash
  MONGO_URL = mongodb+srv://user:password@cluster.mongodb.net/?appName=Cluster0
  ```
  - Database exists and is accessible
  - Network access allows your server IP

- [ ] **Email Credentials Set**
  ```bash
  EMAIL = your-email@gmail.com
  EMAIL_PASS = [app-specific-password]
  ```

- [ ] **Payment Gateway Keys (if applicable)**
  ```bash
  KEY_ID = rzp_live_xxxxx
  KEY_SECRET = xxxxx
  ```

### Frontend Checks (Vercel/Netlify/AWS)

- [ ] **API Base URL Set**
  ```bash
  VITE_API_BASE_URL = https://your-backend-domain.com
  ```

- [ ] **Environment File Committed** (but not .env)
  - `.env.example` is in repository
  - `.env` is in `.gitignore`

---

## 🧪 POST-DEPLOYMENT TESTING

### 1. Backend Health Check

```bash
# Test from terminal or browser
curl https://your-backend-domain.com/api/health

# Expected response:
# { "status": "ok", "environment": "production", "timestamp": "..." }
```

### 2. CORS Verification

Run this in your browser console while on your frontend domain:

```javascript
fetch('https://your-backend-domain.com/api/health', {
    credentials: 'include'
})
.then(r => r.json())
.then(data => console.log('✅ CORS OK:', data))
.catch(err => console.error('❌ CORS Error:', err));
```

Expected: ✅ No CORS errors, successful response

### 3. Login Flow Test

#### Step 1: Open Browser DevTools
- Press F12 → Network tab
- Filter by "XHR" (XMLHttpRequest)

#### Step 2: Attempt Login
- Go to your frontend login page
- Enter test credentials:
  ```
  Email: test@example.com
  Password: testpassword123
  ```
- Click Sign In

#### Step 3: Verify Network Request

Look for POST request to `/login`:

**Request Tab:**
- URL: `https://your-backend-domain.com/login`
- Method: `POST`
- Headers should include:
  ```
  Content-Type: application/json
  Origin: https://your-frontend-domain.com
  ```

**Response Tab:**
- Status: `200` (not 400, 401, or 403)
- Body:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "user": {
      "_id": "...",
      "name": "User Name",
      "email": "user@example.com",
      "role": "user"
    }
  }
  ```

### 4. Cookie Verification

In DevTools Console:

```javascript
// Check if cookie was set
console.log(document.cookie);
// Should show: token=eyJhbGc...

// Check cookie attributes
// Go to DevTools → Application → Cookies → your-domain
// Verify:
// - Name: token
// - Value: JWT token starting with "eyJ"
// - Domain: your-domain.com
// - Path: /
// - Expires/Max-Age: 7 days from now
// - Secure: ✅ (must be checked in production)
// - HttpOnly: ✅ (must be checked)
// - SameSite: None (for cross-origin) or Lax (for same-origin)
```

### 5. Authentication Persistence

```javascript
// After successful login, check localStorage
console.log(JSON.parse(localStorage.getItem('user')));
// Should show: { _id: "...", name: "...", email: "...", role: "user" }
```

### 6. Protected Route Test

After successful login:

```javascript
// Try accessing a protected endpoint
fetch('https://your-backend-domain.com/admin', {
    credentials: 'include'
})
.then(r => r.json())
.then(data => {
    if (data.success) {
        console.log('✅ Protected route accessible');
    } else {
        console.error('❌ Auth failed:', data.message);
    }
})
.catch(err => console.error('❌ Error:', err));
```

---

## 🔍 COMMON ISSUES & QUICK FIXES

### Issue: "CORS error" in console

**Diagnostic:**
```javascript
// Run in console
fetch('https://your-backend.com/api/health', { credentials: 'include' })
```

**Fixes:**
1. Verify `FRONTEND_URLS` env var on backend
2. Check URL includes protocol (https://)
3. No trailing slashes in URL
4. Wait 5-10 minutes after deploying for env changes to take effect

### Issue: "Invalid credentials" despite correct password

**Diagnostic:**
1. Check backend logs for errors
2. Verify MongoDB connection: Run in backend console
   ```javascript
   const user = await User.findOne({ email: "test@example.com" });
   console.log("User found:", user); // Should not be null
   ```
3. Test bcrypt comparison:
   ```javascript
   const bcrypt = require('bcrypt');
   const isMatch = await bcrypt.compare('password', user.password);
   console.log("Password match:", isMatch); // Should be true
   ```

**Fixes:**
1. Ensure `JWT_SECRET` is set (not using default "nahibatauga")
2. Verify user exists in database with correct email
3. Check password hashing with `bcrypt` (no plain text passwords)

### Issue: "Cookie not being set"

**Diagnostic:**
```javascript
// Check if token cookie exists
console.log(document.cookie);

// Check browser's Storage → Cookies → your-domain
```

**Fixes:**
1. Verify `NODE_ENV=production` on backend
2. Check cookie has `secure: true` and `sameSite: none` in production
3. Ensure frontend domain exactly matches `FRONTEND_URLS`
4. Clear browser cache and cookies, try again
5. Check browser console for cookie warnings

### Issue: "Token expired immediately"

**Diagnostic:**
```javascript
// Check JWT expiration
const token = document.cookie.split('token=')[1];
const payload = JSON.parse(atob(token.split('.')[1]));
console.log("Expires in (seconds):", payload.exp - Math.floor(Date.now()/1000));
```

**Fixes:**
1. Verify token has proper `expiresIn` set (should be "7d")
2. Check server clock is in sync
3. Verify JWT_SECRET hasn't changed (different secret = invalid token)

### Issue: "MongoDB connection fails"

**Diagnostic:**
1. Test connection string locally:
   ```bash
   mongo "your_mongodb_atlas_url"
   ```
2. Check MongoDB Atlas dashboard for:
   - Database exists
   - Credentials are correct
   - Network access allows your server IP

**Fixes:**
1. Add server IP to MongoDB Atlas network access list
2. Verify `MONGO_URL` env variable is set correctly
3. Check database user permissions

---

## 📊 MONITORING AFTER DEPLOYMENT

### Log Checks

Backend logs should show (for production):

```
✅ Server started on port 3000 in production mode
✅ MongoDB Connected
CORS Origins: https://your-domain.com
NODE_ENV: production
✅ User logged in successfully: user@example.com
```

### Error Patterns to Watch For

```
❌ JWT_SECRET is not set or using unsafe default!
❌ MONGO_URL is not set!
❌ CORS Blocked - Origin not in allowlist: ...
❌ Token verification error: ...
```

### Monitor These Endpoints

```bash
# Health check
curl -i https://your-backend.com/api/health

# Login attempt
curl -X POST https://your-backend.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass"}'

# Protected route (after login)
curl -i -H "Cookie: token=your_token" \
  https://your-backend.com/admin
```

---

## 🔐 SECURITY BEST PRACTICES

- [ ] **Never commit .env files** - ensure `.env` is in `.gitignore`
- [ ] **Use strong JWT secrets** - minimum 32 random characters
- [ ] **HTTPS only in production** - set `secure: true` for cookies
- [ ] **CORS whitelist specific domains** - not `*`
- [ ] **Rotate secrets periodically** - especially if exposed
- [ ] **Use HTTPS everywhere** - for both backend and frontend
- [ ] **Set proper cookie flags**:
  ```javascript
  httpOnly: true    // Prevent JS access (security)
  secure: true      // HTTPS only
  sameSite: "none"  // Cross-origin safe
  ```
- [ ] **Monitor failed login attempts** - add rate limiting
- [ ] **Use strong password hashing** - bcrypt with salt rounds ≥ 10

---

## 📞 DEBUGGING COMMANDS

### View Backend Logs (Render)
```bash
# In Render dashboard, go to: Services → your-service → Logs
```

### Check MongoDB Connection
```bash
# SSH into your server
ssh your_server

# Test MongoDB connection
mongosh "your_mongodb_atlas_url"
db.user.find().limit(1)
```

### Test CORS Headers
```bash
curl -i -X OPTIONS https://your-backend.com/login \
  -H "Origin: https://your-frontend.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"

# Look for:
# Access-Control-Allow-Origin: https://your-frontend.com
# Access-Control-Allow-Credentials: true
```

---

## ✅ FINAL VERIFICATION CHECKLIST

- [ ] Backend deployed and running
- [ ] Frontend deployed and running
- [ ] `/api/health` endpoint returns 200
- [ ] CORS test passes without errors
- [ ] Login with valid credentials succeeds
- [ ] Cookie is set in browser (HttpOnly, Secure, SameSite)
- [ ] Protected routes require authentication
- [ ] No 401/403 errors on valid requests
- [ ] User data persists after page reload
- [ ] Logout clears session properly
- [ ] Error messages are clear and helpful
- [ ] Backend logs show successful operations
- [ ] MongoDB has created users collection
- [ ] All environment variables are set
- [ ] SSL certificate is valid (HTTPS)

---

## 📞 SUPPORT

If you still have issues after following this checklist:

1. **Check backend logs** for specific error messages
2. **Check browser console** for network errors
3. **Check Network tab** in DevTools for request/response
4. **Check MongoDB** for data integrity
5. **Check environment variables** on hosting platform
6. **Clear browser cache** and cookies

**Common solution:** Most auth issues are solved by:
- Setting `NODE_ENV=production`
- Setting correct `FRONTEND_URLS`
- Setting strong `JWT_SECRET`
- Waiting 5-10 minutes for env changes to propagate