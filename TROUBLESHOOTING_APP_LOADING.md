# 🔍 **TROUBLESHOOTING - APP NOT LOADING**

## ✅ **SERVERS ARE RUNNING**

Both servers are running successfully:
- ✅ **Django:** `http://localhost:8000`
- ✅ **Vite:** `http://localhost:3000`

The "exit code: 1" message is misleading - they're actually running fine!

---

## 🎯 **WHY `http://localhost:3000/` APPEARS NOT TO LOAD**

### **This is EXPECTED behavior!**

The app is configured to redirect to `/login` when you're not authenticated.

---

## 🚀 **HOW TO ACCESS THE APP**

### **Option 1: Go Directly to Login**
Navigate to: `http://localhost:3000/login`

### **Option 2: Let it Redirect**
1. Go to `http://localhost:3000/`
2. It will automatically redirect to `http://localhost:3000/login`
3. Login with credentials

---

## 🔐 **LOGIN CREDENTIALS**

### **Student:**
- Email: `student@test.com`
- Password: `test123`
- Redirects to: `/student/dashboard`

### **Teacher:**
- Email: `teacher@test.com`
- Password: `test123`
- Redirects to: `/teacher/dashboard`

### **Parent:**
- Email: `parent@test.com`
- Password: `test123`
- Redirects to: `/parent/dashboard`

---

## ✅ **VERIFICATION STEPS**

### **1. Check if Vite is Running:**
Open browser console (F12) and check for errors

### **2. Check Network Tab:**
- Open DevTools (F12)
- Go to Network tab
- Refresh page
- Look for any failed requests (red)

### **3. Check Console:**
- Open DevTools (F12)
- Go to Console tab
- Look for any JavaScript errors

---

## 🐛 **COMMON ISSUES & FIXES**

### **Issue 1: Blank White Screen**
**Cause:** JavaScript error  
**Fix:** Check browser console for errors

### **Issue 2: Stuck on Loading**
**Cause:** API connection issue  
**Fix:** Verify Django server is running on port 8000

### **Issue 3: 404 Errors**
**Cause:** Route not found  
**Fix:** Make sure you're going to `/login` not just `/`

### **Issue 4: CORS Errors**
**Cause:** Backend CORS not configured  
**Fix:** Already configured in Django settings

---

## 🎯 **QUICK TEST**

### **Test 1: Check Vite Dev Server**
```
http://localhost:3000/login
```
**Expected:** Login page with email/password fields

### **Test 2: Check Django API**
```
http://localhost:8000/api/v1/
```
**Expected:** API root or 404 (both are fine)

### **Test 3: Login as Teacher**
1. Go to `http://localhost:3000/login`
2. Enter: `teacher@test.com` / `test123`
3. Click Login
4. **Expected:** Redirect to `/teacher/dashboard`

### **Test 4: Test Lecture Creation**
1. Login as teacher
2. Go to `/teacher/lectures`
3. Click "Create Lecture"
4. **Expected:** Modal opens with 4-step wizard

---

## 📊 **SERVER STATUS CHECK**

### **Check Django:**
```bash
curl http://localhost:8000/admin/
```
**Expected:** HTML response (Django admin login page)

### **Check Vite:**
```bash
curl http://localhost:3000/
```
**Expected:** HTML response (React app)

---

## 🔧 **IF STILL NOT WORKING**

### **1. Clear Browser Cache:**
- Press `Ctrl + Shift + Delete`
- Clear cache and cookies
- Refresh page

### **2. Hard Refresh:**
- Press `Ctrl + Shift + R` (Windows)
- Or `Cmd + Shift + R` (Mac)

### **3. Try Incognito/Private Mode:**
- Open new incognito window
- Go to `http://localhost:3000/login`

### **4. Check Browser Console:**
- Press F12
- Look for red errors
- Share the error message

---

## ✅ **EXPECTED BEHAVIOR**

1. ✅ `http://localhost:3000/` → Redirects to `/login`
2. ✅ `/login` → Shows login page
3. ✅ Login → Redirects to role-based dashboard
4. ✅ All pages load without errors

---

## 🎉 **NEXT STEPS**

1. **Go to:** `http://localhost:3000/login`
2. **Login as teacher:** `teacher@test.com` / `test123`
3. **Navigate to:** `/teacher/lectures`
4. **Click:** "Create Lecture"
5. **Test the wizard!**

---

**The app IS working - just go to `/login` instead of `/`!** ✅
