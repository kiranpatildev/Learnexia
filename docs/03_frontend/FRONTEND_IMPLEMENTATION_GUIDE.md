# 🎨 **PREMIUM EDUCATIONAL PLATFORM - FRONTEND IMPLEMENTATION**

## 📋 **ADAPTED FOR YOUR PROJECT**

This guide adapts the comprehensive frontend specification to work with your existing Django REST API backend.

---

## 🎯 **PROJECT SETUP**

### **Step 1: Create React Frontend**

```bash
# Navigate to Desktop (outside backend folder)
cd C:\Users\HOME\Desktop

# Create Vite + React project
npm create vite@latest premium_edu_frontend -- --template react

# Navigate to project
cd premium_edu_frontend

# Install dependencies
npm install

# Install UI library and utilities
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install core dependencies
npm install axios @tanstack/react-query zustand react-router-dom

# Install UI components (shadcn/ui)
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-label @radix-ui/react-select @radix-ui/react-tabs
npm install @radix-ui/react-toast @radix-ui/react-slot

# Install form handling
npm install react-hook-form @hookform/resolvers zod

# Install charts
npm install recharts

# Install date utilities
npm install date-fns

# Install rich text editor
npm install @tiptap/react @tiptap/starter-kit

# Install file upload
npm install react-dropzone
```

---

## 📁 **PROJECT STRUCTURE**

```
C:\Users\HOME\Desktop\
├── premium_edu_platform/     # Django Backend (existing)
│   ├── apps/
│   ├── config/
│   └── ...
│
└── premium_edu_frontend/     # React Frontend (new)
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── ui/              # shadcn/ui components
    │   │   ├── common/          # Shared components
    │   │   ├── student/         # Student-specific
    │   │   ├── teacher/         # Teacher-specific
    │   │   └── parent/          # Parent-specific
    │   ├── pages/
    │   │   ├── auth/
    │   │   ├── student/
    │   │   ├── teacher/
    │   │   └── parent/
    │   ├── layouts/
    │   ├── hooks/
    │   ├── services/
    │   ├── store/
    │   ├── utils/
    │   ├── styles/
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## ⚙️ **CONFIGURATION FILES**

### **1. Tailwind Config (`tailwind.config.js`)**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### **2. Global Styles (`src/styles/globals.css`)**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 217.2 91.2% 59.8%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', 
                 'Segoe UI', 'Roboto', sans-serif;
  }
}
```

### **3. Environment Variables (`.env`)**

```bash
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Premium Educational Platform
```

### **4. Vite Config (`vite.config.js`)**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

---

## 🔌 **API INTEGRATION WITH YOUR BACKEND**

### **API Service (`src/services/api.js`)**

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/accounts/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### **Auth Service (`src/services/auth.service.js`)**

```javascript
import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/accounts/login/', { email, password });
    const { access, refresh, user } = response.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { access, refresh, user };
  },

  async register(userData) {
    const response = await api.post('/accounts/register/', userData);
    return response.data;
  },

  async logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  async getCurrentUser() {
    const response = await api.get('/accounts/users/me/');
    return response.data;
  },

  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },
};
```

### **Lecture Service (`src/services/lecture.service.js`)**

```javascript
import api from './api';

export const lectureService = {
  // Get all lectures
  async getLectures(params = {}) {
    const response = await api.get('/lectures/', { params });
    return response.data;
  },

  // Get single lecture
  async getLecture(id) {
    const response = await api.get(`/lectures/${id}/`);
    return response.data;
  },

  // Create lecture
  async createLecture(data) {
    const response = await api.post('/lectures/', data);
    return response.data;
  },

  // Update lecture
  async updateLecture(id, data) {
    const response = await api.patch(`/lectures/${id}/`, data);
    return response.data;
  },

  // Approve transcript
  async approveTranscript(id) {
    const response = await api.post(`/lectures/${id}/approve_transcript/`);
    return response.data;
  },

  // AI Features
  async generateNotes(id, data) {
    const response = await api.post(`/lectures/${id}/generate_notes/`, data);
    return response.data;
  },

  async generateQuiz(id, data) {
    const response = await api.post(`/lectures/${id}/generate_quiz/`, data);
    return response.data;
  },

  async generateFlashcards(id, data) {
    const response = await api.post(`/lectures/${id}/generate_flashcards/`, data);
    return response.data;
  },

  async detectBehaviors(id, data) {
    const response = await api.post(`/lectures/${id}/detect_behaviors/`, data);
    return response.data;
  },
};
```

---

## 🎣 **REACT QUERY HOOKS**

### **Auth Hook (`src/hooks/useAuth.js`)**

```javascript
import { create } from 'zustand';
import { authService } from '@/services/auth.service';

export const useAuthStore = create((set) => ({
  user: authService.getStoredUser(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { user } = await authService.login(email, password);
      set({ user, isAuthenticated: true, loading: false });
      return user;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', loading: false });
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.register(userData);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Registration failed', loading: false });
      throw error;
    }
  },
}));

export function useAuth() {
  return useAuthStore();
}
```

### **Lectures Hook (`src/hooks/useLectures.js`)**

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lectureService } from '@/services/lecture.service';

export function useLectures(params) {
  return useQuery({
    queryKey: ['lectures', params],
    queryFn: () => lectureService.getLectures(params),
  });
}

export function useLecture(id) {
  return useQuery({
    queryKey: ['lecture', id],
    queryFn: () => lectureService.getLecture(id),
    enabled: !!id,
  });
}

export function useCreateLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: lectureService.createLecture,
    onSuccess: () => {
      queryClient.invalidateQueries(['lectures']);
    },
  });
}

export function useGenerateNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => lectureService.generateNotes(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['lecture', variables.id]);
    },
  });
}

export function useGenerateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => lectureService.generateQuiz(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['lecture', variables.id]);
    },
  });
}

export function useGenerateFlashcards() {
  return useMutation({
    mutationFn: ({ id, data }) => lectureService.generateFlashcards(id, data),
  });
}

export function useDetectBehaviors() {
  return useMutation({
    mutationFn: ({ id, data }) => lectureService.detectBehaviors(id, data),
  });
}
```

---

## 🛣️ **ROUTING SETUP**

### **Main App (`src/App.jsx`)**

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

// Layouts
import { StudentLayout } from '@/layouts/StudentLayout';
import { TeacherLayout } from '@/layouts/TeacherLayout';
import { ParentLayout } from '@/layouts/ParentLayout';
import { AuthLayout } from '@/layouts/AuthLayout';

// Auth Pages
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';

// Student Pages
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { MyLectureNotes } from '@/pages/student/MyLectureNotes';
import { LectureNoteDetail } from '@/pages/student/LectureNoteDetail';

// Teacher Pages
import { TeacherDashboard } from '@/pages/teacher/TeacherDashboard';
import { LectureManagement } from '@/pages/teacher/LectureManagement';
import { CreateLecture } from '@/pages/teacher/CreateLecture';

// Parent Pages
import { ParentDashboard } from '@/pages/parent/ParentDashboard';

// Components
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="notes" element={<MyLectureNotes />} />
              <Route path="notes/:id" element={<LectureNoteDetail />} />
            </Route>
          </Route>

          {/* Teacher Routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="lectures" element={<LectureManagement />} />
              <Route path="lectures/create" element={<CreateLecture />} />
            </Route>
          </Route>

          {/* Parent Routes */}
          <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
            <Route path="/parent" element={<ParentLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ParentDashboard />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

---

## 🔒 **PROTECTED ROUTE COMPONENT**

```javascript
// src/components/auth/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
```

---

## 📄 **SAMPLE PAGE IMPLEMENTATIONS**

### **Login Page (`src/pages/auth/Login.jsx`)**

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      
      // Redirect based on role
      if (user.role === 'student') {
        navigate('/student/dashboard');
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (user.role === 'parent') {
        navigate('/parent/dashboard');
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
```

---

## 🚀 **NEXT STEPS**

### **1. Create the Frontend Project**
```bash
cd C:\Users\HOME\Desktop
npm create vite@latest premium_edu_frontend -- --template react
cd premium_edu_frontend
npm install
```

### **2. Install All Dependencies**
Run all the npm install commands from Step 1 above.

### **3. Configure Files**
- Copy all configuration files (tailwind.config.js, vite.config.js, etc.)
- Create .env file with API URL

### **4. Build Component Library**
- Start with shadcn/ui components
- Create common components (Sidebar, Navbar, StatCard, etc.)
- Build role-specific components

### **5. Implement Pages**
- Auth pages (Login, Register)
- Student dashboard
- Teacher dashboard
- Parent dashboard

### **6. Test Integration**
- Start Django backend: `python manage.py runserver`
- Start React frontend: `npm run dev`
- Test authentication flow
- Test API endpoints

---

## 📚 **ADDITIONAL RESOURCES**

I'll create separate detailed files for:
1. ✅ Complete component library
2. ✅ All page implementations
3. ✅ Utility functions
4. ✅ Design system tokens
5. ✅ Testing guide

**Ready to start building?** Let me know which part you'd like to implement first!
