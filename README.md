# Learnexia 🎓✨

**AI-Powered Classroom Learning Platform** (Powered by Gemini API)

Learnexia is a two-sided educational platform that automatically transforms lectures into interactive learning experiences — saving teachers time and increasing student engagement.

**Watch the demo:** 👉 https://youtu.be/_7KlnmQOIT8

---

## 🧠 What is Learnexia?

Traditional classroom learning is passive:

> Teachers teach → Students listen → Students review notes

But students learn best through **repetition, interaction, and challenge**—just like they learn games.

Learnexia takes a lecture and turns it into meaningful learning assets **automatically**:

- 📘 **Structured Study Notes**
- 🧠 **Flashcards for Spaced Repetition**
- 📝 **Quizzes with Adjustable Difficulty**
- 🎮 **Learning Games** (Crossword, Word Search, Memory Match)
- 👩🏫 **AI-Driven Behavior Insights**

**Students learn by playing, not just reading.**

---

## ✨ Key Features

### 👩🏫 Teacher Portal

Teachers can:

- Create and publish lectures (audio/video/transcript/document)
- Use AI to generate notes, flashcards, quizzes, and games
- Track attendance and classroom engagement
- Review and approve AI behavior reports
- Manage assignments with AI-assisted grading
- Monitor student performance with analytics

### 🧑🎓 Student Portal

Students can:

- View and download lecture notes
- Play interactive learning games
- Practice flashcards with spaced repetition
- Take quizzes generated from lecture content
- Submit assignments online
- Track progress with scores, streaks, and leaderboards
- Compete on classroom leaderboards

---

## 🤖 AI Integration (Powered by Gemini API)

Learnexia uses the **Google Gemini API** to transform raw lecture content into learning assets:

- ✅ **Automatically generates study notes** from lecture transcripts
- ✅ **Creates flashcards** for revision and spaced repetition
- ✅ **Produces assessment quizzes** with multiple difficulty levels
- ✅ **Builds gameable question sets** for crosswords and word searches
- ✅ **Summarizes classroom behavior** from transcripts and interactions
- ✅ **Generates assignment questions** tailored to lecture content

**This moves the heavy lifting off teachers and into AI, while keeping teachers in control.**

---

## 🛠 Built With

### **Frontend Technologies**
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management
- **Axios** - HTTP client

### **Backend Technologies**
- **Django 4.2** - Python web framework
- **Django REST Framework** - RESTful API toolkit
- **PostgreSQL** - Relational database
- **Celery + Redis** - Async task processing
- **Gunicorn** - Production WSGI server
- **WhiteNoise** - Static file serving

### **AI & Machine Learning**
- **Google Gemini API** - AI content generation
- **FFmpeg** - Audio/video processing
- **ReportLab** - PDF generation

### **Deployment & Hosting**
- **Vercel** - Frontend hosting
- **Railway** - Backend hosting
- **Supabase** - Managed PostgreSQL
- **AWS S3** - Media storage (optional)

### **Development Tools**
- **Git & GitHub** - Version control
- **pytest** - Backend testing
- **ESLint & Prettier** - Code quality
- **Docker** - Containerization

---

## 📹 Demo Video

**Watch the product in action:**  
👉 **https://youtu.be/_7KlnmQOIT8**

The video shows:

- ✅ Teacher creating a lecture
- ✅ AI generating notes, flashcards, and quizzes
- ✅ Students using study tools and games
- ✅ Behavior tracking and reporting
- ✅ Gamification and leaderboards

---

## 🚀 Current Status

**Learnexia is already in use in 2 real classrooms daily** — a strong validation that the idea works.

### ✅ Fully Implemented Features

- Multi-role authentication (Student, Teacher, Parent, Admin)
- School and classroom management
- Lecture upload and management (video/audio/transcript)
- AI-powered note generation
- AI-powered flashcard generation
- AI-powered quiz generation
- Educational games (Crossword, Word Search, Memory Match)
- Assignment creation and submission
- Attendance tracking
- Behavior tracking and reporting
- Gamification system (XP, badges, leaderboards)
- Performance analytics
- Messaging and announcements
- Real-time notifications

---

## 🧭 What We Learned

- ✅ **AI should reduce teacher workload, not replace teachers**
- ✅ **Teachers need control and transparency with AI content**
- ✅ **Students engage more when learning feels like a challenge**
- ✅ **The real innovation is the lecture transformation engine, not just quizzes or notes**
- ✅ **Gamification drives consistent student engagement**

---

## 📈 What's Next

- 🎯 More game types and classroom multiplayer modes
- 🎯 Personalized learning paths for students
- 🎯 Concept-level performance analytics for teachers
- 🎯 Parent portal for progress and behavior updates
- 🎯 Support for multiple languages and local curricula
- 🎯 Wider deployment in schools for impact evaluation
- 🎯 Mobile app for iOS and Android
- 🎯 Offline mode for low-connectivity areas

---

## 📁 How to Run Locally

### **Prerequisites**
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis (for Celery)

### **Backend Setup**

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# 3. Install dependencies
pip install -r requirements/requirements.txt

# 4. Set up environment variables
# Create .env file in backend/ directory
# Add: DATABASE_URL, SECRET_KEY, GEMINI_API_KEY, etc.

# 5. Run migrations
python manage.py migrate

# 6. Create superuser
python manage.py createsuperuser

# 7. Start development server
python manage.py runserver
```

### **Frontend Setup**

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create .env file in frontend/ directory
# Add: VITE_API_URL=http://localhost:8000

# 4. Start development server
npm run dev
```

### **Access the Application**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/v1/
- **Admin Panel**: http://localhost:8000/admin/
- **API Docs**: http://localhost:8000/swagger/

---

## 🚀 Deployment Guide

For detailed deployment instructions, see [DEPLOYMENT_CHECKLIST.md](backend/DEPLOYMENT_CHECKLIST.md)

### **Quick Deploy (Free Tier)**

1. **Database**: Supabase (Free PostgreSQL)
2. **Backend**: Railway (Free tier)
3. **Frontend**: Vercel (Free tier)
4. **Total Cost**: $0/month

---

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Quick Start Guide](docs/01_setup/QUICK_START.md)** - Get up and running
- **[API Documentation](docs/02_architecture/API_ROUTES_COMPLETE.md)** - All endpoints
- **[AI Features](docs/05_ai/AI_FEATURES_MASTER_SUMMARY.md)** - AI capabilities
- **[Frontend Guide](docs/03_frontend/FRONTEND_QUICKSTART.md)** - Frontend setup

---

## 🎯 Tech Stack Summary

```
Frontend:  React + Vite + Tailwind CSS + Framer Motion
Backend:   Django + DRF + PostgreSQL + Celery + Redis
AI:        Google Gemini API
Hosting:   Vercel (Frontend) + Railway (Backend) + Supabase (Database)
Storage:   AWS S3 / Cloudinary (Optional)
Testing:   pytest + React Testing Library
DevOps:    Git + GitHub + Gunicorn + WhiteNoise
```

---

## 🏗️ Project Structure

```
premium_edu_platform/
├── backend/                    # Django backend
│   ├── apps/                   # 13 Django apps
│   ├── config/                 # Settings and configuration
│   ├── requirements/           # Python dependencies
│   ├── Procfile                # Railway deployment
│   └── runtime.txt             # Python version
│
├── frontend/                   # React frontend
│   ├── src/                    # Source code
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   └── store/              # State management
│   └── package.json            # Node dependencies
│
├── docs/                       # Documentation
│   ├── 01_setup/               # Setup guides
│   ├── 02_architecture/        # System design
│   ├── 05_ai/                  # AI features
│   └── 06_logs_and_fixes/      # Troubleshooting
│
└── README.md                   # This file
```

---

## 🙌 Thanks for Checking Out Learnexia!

**Our mission:**  
*Make learning feel like a game, and make teaching easier.*

---

## 📞 Contact & Support

For questions, issues, or contributions:

- **GitHub Issues**: [Report a bug or request a feature]
- **Documentation**: See `/docs` directory
- **Demo Video**: https://youtu.be/_7KlnmQOIT8

---

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for teachers and students everywhere.**
