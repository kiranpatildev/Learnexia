# 🚀 **QUICK START - FRONTEND SETUP**

## ⚡ **5-MINUTE SETUP**

### **Step 1: Run Setup Script**
```bash
cd C:\Users\HOME\Desktop\premium_edu_platform
setup_frontend.bat
```
**This installs everything automatically!**

---

### **Step 2: Create `.env` File**
```bash
cd C:\Users\HOME\Desktop\premium_edu_frontend
```

Create `.env`:
```
VITE_API_URL=http://localhost:8000/api/v1
```

---

### **Step 3: Configure Tailwind**

**`tailwind.config.js`** (copy from FRONTEND_IMPLEMENTATION_GUIDE.md)

**`src/styles/globals.css`** (copy from guide)

---

### **Step 4: Start Development**

**Terminal 1 - Backend:**
```bash
cd C:\Users\HOME\Desktop\premium_edu_platform
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd C:\Users\HOME\Desktop\premium_edu_frontend
npm run dev
```

---

## 📋 **FILES TO CREATE**

### **1. API Service**
`src/services/api.js` - Copy from guide

### **2. Auth Service**
`src/services/auth.service.js` - Copy from guide

### **3. Auth Hook**
`src/hooks/useAuth.js` - Copy from guide

### **4. Login Page**
`src/pages/auth/Login.jsx` - Copy from guide

### **5. App Router**
`src/App.jsx` - Copy from guide

---

## 🎯 **TESTING CHECKLIST**

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Can access login page
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Redirects to correct dashboard
- [ ] API calls work
- [ ] Token refresh works

---

## 📚 **FULL DOCUMENTATION**

1. **FRONTEND_IMPLEMENTATION_GUIDE.md** - Complete guide
2. **FRONTEND_READY.md** - Implementation roadmap
3. **setup_frontend.bat** - Automated setup

---

## 💡 **NEED HELP?**

Ask me for:
- Complete component code
- Specific page implementations
- Styling examples
- API integration help
- Bug fixes

---

**Ready? Run `setup_frontend.bat` now!** 🚀
