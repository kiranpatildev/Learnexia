@echo off
echo ========================================
echo Premium Educational Platform
echo Frontend Setup Script
echo ========================================
echo.

echo Step 1: Creating React + Vite project...
cd C:\Users\HOME\Desktop
call npm create vite@latest premium_edu_frontend -- --template react

echo.
echo Step 2: Installing dependencies...
cd premium_edu_frontend

echo Installing core dependencies...
call npm install

echo Installing Tailwind CSS...
call npm install -D tailwindcss postcss autoprefixer
call npx tailwindcss init -p

echo Installing React Router and state management...
call npm install react-router-dom @tanstack/react-query zustand

echo Installing Axios for API calls...
call npm install axios

echo Installing UI components...
call npm install class-variance-authority clsx tailwind-merge lucide-react

echo Installing Radix UI components...
call npm install @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-dropdown-menu
call npm install @radix-ui/react-label @radix-ui/react-select @radix-ui/react-tabs
call npm install @radix-ui/react-toast @radix-ui/react-slot

echo Installing form handling...
call npm install react-hook-form @hookform/resolvers zod

echo Installing charts...
call npm install recharts

echo Installing utilities...
call npm install date-fns react-dropzone

echo Installing rich text editor...
call npm install @tiptap/react @tiptap/starter-kit

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. cd premium_edu_frontend
echo 2. Copy configuration files from FRONTEND_IMPLEMENTATION_GUIDE.md
echo 3. npm run dev
echo.
echo Backend should be running on: http://localhost:8000
echo Frontend will run on: http://localhost:3000
echo.
pause
