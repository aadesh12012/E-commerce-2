# 🐛 AUTHENTICATION TROUBLESHOOTING GUIDE

This guide helps you diagnose and fix authentication issues in your MERN e-commerce app.

---

## 🔴 CRITICAL AUTHENTICATION ISSUES & SOLUTIONS

### **1. "CORS error" - Request blocked by browser**

**Error Message:**
```
Access to XMLHttpRequest at 'https://backend.com/login' from origin 'https://frontend.com' 
has been blocked by CORS policy
```

**Root Causes:**
- [ ] `FRONTEND_URLS` not set on backend
- [ ] Frontend domain not in allowed origins
- [ ] Missing `credentials: true` in CORS
- [ ] Missing `withCredentials: true` in frontend request

**How to Fix:**

**Step 1: Set Backend Environment Variable**
```bash
# On Render/Heroku/AWS dashboard, set:
FRONTEND_URLS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

**Step 2: Verify Backend CORS Config**
```javascript
// backend/index.js should have:
const allowedOrigins = process.env.FRONTEND_URLS 
    ? process.env.FRONTEND_URLS.split(',').map(url => url.trim())
    : [...];

app.use(cors({
    origin: allowedOrigins,
    credentials: true  // ✅ Must be true
}));
```

**Step 3: Verify Frontend Uses withCredentials**
```javascript
// client/src/api/axios.js should have:
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true  // ✅ Must be true
});
```

**Test Fix:**
```javascript
// In browser console on your frontend
fetch('https://your-backend.com/api/health', { 
    credentials: 'include' 
})
.then(r => r.json())
.then(data => console.log('✅ Fixed:', data))
.catch(err => console.error('❌ Still broken:', err));
```

---

### **2. "Invalid credentials" despite correct password**

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Root Causes:**
- [ ] User doesn't exist in database
- [ ] Password not hashed correctly during registration
- [ ] bcrypt comparison failing
- [ ] Email case sensitivity issue

**How to Diagnose:**

**Check 1: User Exists in Database**
```javascript
// In Node.js REPL connected to your MongoDB:
const User = require('./backend/models/User');
const user = await User.findOne({ email: "your-test@example.com" });
console.log("User found:", user);  // Should show user object, not null
```

**Check 2: Password Comparison**
```javascript
const bcrypt = require('bcrypt');
const storedPassword = user.password;  // From database
const inputPassword = "your-password";

const isMatch = await bcrypt.compare(inputPassword, storedPassword);
console.log("Password match:", isMatch);  // Should be true
```

**Check 3: Email Normalization**
```javascript
// Ensure emails are lowercased consistently
const normalizedEmail = email.toLowerCase().trim();
const user = await User.findOne({ email: normalizedEmail });
```

**How to Fix:**

**Solution 1: Register Test User Properly**
```javascript
// Use registration endpoint with OTP verification
// Or manually in MongoDB:
const testUser = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: await bcrypt.hash("testpassword123", 10),  // Hashed!
    role: "user"
});
```

**Solution 2: Ensure Bcrypt Hashing in Controller**
```javascript
// backend/controller/userControler.js
const hashpassword = await bcrypt.hash(password, 10);  // ✅ 10 salt rounds
```

**Solution 3: Fix Email Normalization**
```javascript
// backend/controller/userControler.js
const user = await UserModel.findOne({ 
    email: normalizeEmail(email).toLowerCase() 
});
```

**Test Fix:**
1. Register a new account through frontend
2. Wait for OTP email
3. Verify email with OTP
4. Try logging in
5. Should succeed ✅

---

### **3. "Access Denied: Please login first" on protected routes**

**Error Response:**
```json
{
  "success": false,
  "message": "Access Denied: Please login first"
}
```

**Root Causes:**
- [ ] Cookie not being sent by browser
- [ ] Cookie was set but with wrong attributes
- [ ] JWT_SECRET doesn't match between sign and verify
- [ ] Token expired

**How to Diagnose:**

**Check 1: Cookie Exists in Browser**
```javascript
// In browser console
console.log(document.cookie);
// Should show: token=eyJhbGc...
```

**Check 2: Cookie Attributes**
```javascript
// DevTools → Application → Cookies → your-domain
// Verify:
// - Name: token
// - Value: JWT token (starts with "eyJ")
// - Domain: .your-domain.com
// - Path: /
// - Secure: ✅ (checked in production)
// - HttpOnly: ✅ (checked)
// - SameSite: None or Lax
```

**Check 3: JWT Token Valid**
```javascript
// Decode token in console
const token = document.cookie.split('token=')[1];
const payload = JSON.parse(atob(token.split('.')[1]));
console.log("Token payload:", payload);
console.log("Expires:", new Date(payload.exp * 1000));
```

**Check 4: Cookie Being Sent in Requests**
```javascript
// DevTools → Network → Click protected request
// Headers tab → Request Headers
// Should have: Cookie: token=eyJhbGc...
```

**How to Fix:**

**Solution 1: Verify Cookie Settings in Backend**
```javascript
// backend/controller/userControler.js
const isProduction = process.env.NODE_ENV === "production";

res.cookie("token", token, {
    httpOnly: true,           // ✅ Prevents JS access
    secure: isProduction,     // ✅ HTTPS only in production
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

**Solution 2: Ensure NODE_ENV is Set**
```bash
# On hosting platform, set:
NODE_ENV=production
```

**Solution 3: Set Strong JWT_SECRET**
```bash
# On hosting platform, set:
JWT_SECRET=[random-32-char-string]

# Generate with:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Solution 4: Clear Old Cookies and Login Again**
```javascript
// In browser console
document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
// Then go to /login and try again
```

**Test Fix:**
1. DevTools → Application → Cookies → Clear all for domain
2. Log in again
3. Check Network tab - login response should have Set-Cookie header
4. Check Application tab - token cookie should appear
5. Reload page and try protected route
6. Should work ✅

---

### **4. "Invalid or Expired Token"**

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid or Expired Token"
}
```

**Root Causes:**
- [ ] JWT_SECRET changed between login and request
- [ ] Token actually expired (>7 days old)
- [ ] Different JWT_SECRET used for signing vs verification
- [ ] Corrupted token in cookie

**How to Diagnose:**

**Check 1: Token Expiration**
```javascript
const token = document.cookie.split('token=')[1];
const payload = JSON.parse(atob(token.split('.')[1]));
const expiresIn = (payload.exp * 1000) - Date.now();
console.log("Expires in (ms):", expiresIn);  // Should be positive
console.log("Expires at:", new Date(payload.exp * 1000));
```

**Check 2: Backend Logs for Verification Errors**
```
// Look for in backend logs:
Token verification error: JsonWebTokenError: invalid signature
Token verification error: TokenExpiredError: jwt expired
```

**How to Fix:**

**Solution 1: Verify JWT_SECRET Consistency**
```javascript
// backend/controller/userControler.js - Signing
const jwtSecret = process.env.JWT_SECRET;
let token = jwt.sign(payload, jwtSecret, { expiresIn: "7d" });

// backend/middlewares/authMiddleware.js - Verifying
const jwtSecret = process.env.JWT_SECRET;
const decoded = jwt.verify(token, jwtSecret);  // ✅ Same secret
```

**Solution 2: If JWT_SECRET Changed, Logout All Users**
```bash
# Clear all cookies/sessions
# Force users to log in again to get new tokens
```

**Solution 3: Increase Token Expiry if Needed**
```javascript
// backend/controller/userControler.js
let token = jwt.sign(payload, jwtSecret, { 
    expiresIn: "30d"  // Changed from 7d
});
```

**Test Fix:**
1. Log out
2. Clear cookies
3. Log in again
4. Verify new token issued
5. Try protected route
6. Should work ✅

---

### **5. "Cannot connect to server" / Network Error**

**Error Message:**
```
XMLHttpRequest failed: Network Error
Something went wrong. Please try again.
```

**Root Causes:**
- [ ] Backend server not running
- [ ] Wrong backend URL in frontend
- [ ] Backend down or crashed
- [ ] Network connectivity issue
- [ ] Firewall blocking requests

**How to Diagnose:**

**Check 1: Backend is Running**
```bash
# Test from terminal
curl https://your-backend.com/api/health

# Should return:
# { "status": "ok", "environment": "production" }
```

**Check 2: Correct URL Used in Frontend**
```javascript
// Check axios.js configuration
console.log(import.meta.env.VITE_API_BASE_URL);
// Should be: https://your-backend-domain.com

// Check it matches your actual backend
```

**Check 3: Network Tab Shows Request**
```
DevTools → Network → Try login
• Should see POST request to /login
• If request shows red × : backend not reachable
• If no request at all: frontend URL wrong
```

**Check 4: Backend Logs for Crashes**
```bash
# On Render/Heroku dashboard:
Services → your-service → Logs
# Look for errors like:
# MongoDB connection failed
# Port not available
# Memory/CPU limits exceeded
```

**How to Fix:**

**Solution 1: Verify Backend is Deployed**
```bash
# Check deployment status on Render/Heroku
# Should show "Live" or "Deployed"

# Test health endpoint
curl -i https://your-backend.com/api/health
# Should return 200 OK
```

**Solution 2: Fix Frontend URL**
```bash
# Verify VITE_API_BASE_URL in frontend .env
VITE_API_BASE_URL=https://your-backend.com

# Redeploy frontend
```

**Solution 3: Restart Backend Service**
```bash
# On Render: 
# Services → your-service → Restart

# On Heroku:
heroku restart --app your-app-name
```

**Solution 4: Check MongoDB Connection**
```bash
# In backend logs, should see:
# ✅ MongoDB Connected

# If not, check:
# - MONGO_URL env variable set
# - MongoDB Atlas network access allows server IP
# - MongoDB credentials correct
```

**Test Fix:**
1. Curl health endpoint - should succeed
2. Check backend logs - should show "Server started"
3. Try login from frontend
4. Should work ✅

---

### **6. Cookies Not Being Stored/Sent**

**Symptoms:**
- Login "succeeds" but cookie not visible in DevTools
- Each request acts like user is not logged in
- localStorage has user, but cookie doesn't

**Root Causes:**
- [ ] Browser blocking cookies
- [ ] Cookie attributes don't match production requirements
- [ ] Different domain between frontend and backend
- [ ] Browser privacy settings

**How to Diagnose:**

**Check 1: Cookie Present in Response**
```
DevTools → Network → Login request
• Response Headers tab
• Look for: Set-Cookie: token=eyJhbGc...
• If not present, server didn't set cookie
```

**Check 2: Cookie Attributes**
```
DevTools → Application → Cookies → your-domain
• Secure: Should be ✅ in production (HTTP in dev)
• HttpOnly: Should be ✅
• SameSite: Should be "None" or "Lax"
```

**Check 3: Browser Console for Cookie Warnings**
```javascript
// Check console for messages like:
// "Cookie blocked: This Set-Cookie was blocked..."
```

**How to Fix:**

**Solution 1: Enable Cookies in Browser**
```
Chrome/Edge: Settings → Privacy → Cookies
Firefox: Preferences → Privacy → Cookies
Safari: Preferences → Privacy → Block all cookies (uncheck)
```

**Solution 2: Fix Cookie Settings for Production**
```javascript
// backend/index.js
const isProduction = process.env.NODE_ENV === "production";

res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,      // true for HTTPS, false for HTTP
    sameSite: isProduction ? "none" : "lax",
    path: "/"
});
```

**Solution 3: Ensure Frontend and Backend Match Domain**
```
Frontend: https://app.mydomain.com
Backend: https://api.mydomain.com
• Must be same parent domain (mydomain.com)
• Cookie set with: domain: .mydomain.com
• Will work for both subdomains
```

**Solution 4: Clear Browser Data and Retry**
```javascript
// In console
document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970;";
// Then reload and log in again
```

**Test Fix:**
1. Clear all cookies for domain
2. Log in
3. Immediately check DevTools → Network
4. Should see Set-Cookie header
5. Check Application → Cookies
6. Cookie should appear with correct flags
7. Reload page
8. Should still be logged in ✅

---

## 📋 VERIFICATION CHECKLIST

Before declaring authentication "fixed", verify:

- [ ] Login with valid credentials → Success
- [ ] Login with wrong password → Error message
- [ ] Token cookie present in browser
- [ ] Protected routes accessible after login
- [ ] Logout clears cookie
- [ ] Page reload maintains session
- [ ] Admin route checks role correctly
- [ ] No CORS errors in console
- [ ] No 401/403 errors on valid requests
- [ ] Backend health endpoint returns 200
- [ ] MongoDB has users
- [ ] All env variables set

---

## 🔧 DEBUGGING COMMANDS

### Backend Health Check
```bash
# Terminal or browser
curl https://your-backend.com/api/health -v

# Look for:
# < HTTP/2 200
# { "status": "ok", "environment": "production" }
```

### Check CORS Headers
```bash
curl -i -X OPTIONS https://your-backend.com/login \
  -H "Origin: https://your-frontend.com" \
  -H "Access-Control-Request-Method: POST"

# Look for:
# Access-Control-Allow-Origin: https://your-frontend.com
# Access-Control-Allow-Credentials: true
```

### Test Login Endpoint
```bash
curl -X POST https://your-backend.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'

# Should return user data or error message
```

### Decode JWT Token
```javascript
// In browser console
const parts = 'your-token-here'.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log(payload);
```

### Monitor Backend Logs (Real-time)
```bash
# On Render
# Dashboard → Your Service → Logs → (live updates)

# On Heroku
heroku logs --tail --app your-app-name

# On AWS
ssh your-server
tail -f /var/log/your-app.log
```

---

## ⚡ QUICK FIX PRIORITY ORDER

1. **Check Environment Variables** (5 min)
   - NODE_ENV=production
   - JWT_SECRET set
   - FRONTEND_URLS set
   - MONGO_URL set

2. **Verify Deployment** (5 min)
   - Backend is running
   - Frontend is deployed
   - API health endpoint works

3. **Test CORS** (2 min)
   - Frontend domain in FRONTEND_URLS
   - CORS header check passes

4. **Check Database** (5 min)
   - MongoDB connected
   - Test user exists

5. **Review Code** (10 min)
   - Compare with provided fixes
   - Check for typos in URLs

6. **Clear Cache & Cookies** (1 min)
   - Ctrl+Shift+Delete or Cmd+Shift+Delete
   - Log in again

---

## 📞 WHEN STUCK

Follow these steps systematically:

1. **Enable debug logging** in backend/frontend
2. **Check all error messages** carefully
3. **Google error message** + "MERN" or "Express"
4. **Check GitHub issues** for similar problems
5. **Review your code changes** vs original
6. **Test in development** to isolate issue
7. **Ask for help** with:
   - Exact error message
   - Terminal output
   - Network tab screenshot
   - Backend logs
   - Environment variables (not secrets)