import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from './pages/Login';
import { StudentLayout } from './layouts/StudentLayout';
import { TeacherLayout } from './layouts/TeacherLayout';
import { ParentLayout } from './layouts/ParentLayout';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentLectureDetail } from './pages/student/StudentLectureDetail';
import { StudentNotesPage } from './pages/student/StudentNotesPage';
import { NoteViewerPage } from './pages/student/NoteViewerPage';
import { StudentFlashcardsPage } from './pages/student/StudentFlashcardsPage';
import { FlashcardStudyPage } from './pages/student/FlashcardStudyPage';
import { StudentQuizzesPage } from './pages/student/StudentQuizzesPage';
import { QuizTakePage } from './pages/student/QuizTakePage';
import { StudentAssignmentsPage } from './pages/student/StudentAssignmentsPage';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage';
import { StudentLeaderboardPage } from './pages/student/StudentLeaderboardPage';
import { StudentMessagesPage } from './pages/student/StudentMessagesPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentBehaviorPage } from './pages/student/StudentBehaviorPage';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { AIFeaturesPage } from './pages/teacher/AIFeaturesPage';
import { TeacherLecturesPage } from './pages/teacher/TeacherLecturesPage';
import { TeacherLectureDetailPage } from './pages/teacher/TeacherLectureDetailPage';
import { TeacherAssignmentsPage } from './pages/teacher/TeacherAssignmentsPage';
import { TeacherQuizzesPage } from './pages/teacher/TeacherQuizzesPage';
import { TeacherStudentsPage } from './pages/teacher/TeacherStudentsPage';
import { TeacherAnalyticsPage } from './pages/teacher/TeacherAnalyticsPage';
import { BehaviorManagementPage } from './pages/teacher/BehaviorManagementPage';
import { AIBehaviorReportPage } from './pages/teacher/AIBehaviorReportPage';
import { AttendancePage } from './pages/teacher/AttendancePage';
import { MessagesPage } from './pages/teacher/MessagesPage';
import { TeacherProfilePage } from './pages/teacher/TeacherProfilePage';
import { StudentGamesPage } from './pages/student/StudentGamesPage';
import { TeacherGamesPage } from './pages/teacher/TeacherGamesPage';
import { TeacherGameGeneratorPage } from './pages/teacher/TeacherGameGeneratorPage';

import { GamePlayerPage } from './pages/student/GamePlayerPage';
import { ParentDashboard } from './pages/parent/ParentDashboard';

import { ParentChildrenPage } from './pages/parent/ParentChildrenPage';
import { ParentPerformancePage } from './pages/parent/ParentPerformancePage';
import { ParentAttendancePage } from './pages/parent/ParentAttendancePage';
import { ParentMessagesPage } from './pages/parent/ParentMessagesPage';
import { ParentProfilePage } from './pages/parent/ParentProfilePage';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="lectures/:id" element={<StudentLectureDetail />} />
            <Route path="notes" element={<StudentNotesPage />} />
            <Route path="notes/:noteId" element={<NoteViewerPage />} />
            <Route path="flashcards" element={<StudentFlashcardsPage />} />
            <Route path="flashcards/:setId/study" element={<FlashcardStudyPage />} />
            <Route path="quizzes" element={<StudentQuizzesPage />} />
            <Route path="quizzes/:quizId/take" element={<QuizTakePage />} />
            <Route path="assignments" element={<StudentAssignmentsPage />} />
            <Route path="attendance" element={<StudentAttendancePage />} />
            <Route path="leaderboard" element={<StudentLeaderboardPage />} />
            <Route path="behavior" element={<StudentBehaviorPage />} />
            <Route path="games" element={<StudentGamesPage />} />
            <Route path="messages" element={<StudentMessagesPage />} />
            <Route path="profile" element={<StudentProfilePage />} />
          </Route>

          {/* Full Screen Game Route */}
          <Route
            path="/student/games/:id/play"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <GamePlayerPage />
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="lectures" element={<TeacherLecturesPage />} />
            <Route path="lectures/:id" element={<TeacherLectureDetailPage />} />
            <Route path="ai-features" element={<AIFeaturesPage />} />
            <Route path="assignments" element={<TeacherAssignmentsPage />} />
            <Route path="quizzes" element={<TeacherQuizzesPage />} />
            <Route path="students" element={<TeacherStudentsPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="games" element={<TeacherGamesPage />} />
            <Route path="games/generate" element={<TeacherGameGeneratorPage />} />
            <Route path="behavior" element={<BehaviorManagementPage />} />
            <Route path="behavior/generate" element={<AIBehaviorReportPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="analytics" element={<TeacherAnalyticsPage />} />
            <Route path="profile" element={<TeacherProfilePage />} />
          </Route>

          {/* Parent Routes */}
          <Route
            path="/parent/*"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ParentDashboard />} />
            <Route path="children" element={<ParentChildrenPage />} />
            <Route path="performance" element={<ParentPerformancePage />} />
            <Route path="attendance" element={<ParentAttendancePage />} />
            <Route path="messages" element={<ParentMessagesPage />} />
            <Route path="profile" element={<ParentProfilePage />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">Unauthorized</h1>
                  <p className="text-slate-600">You don't have access to this page.</p>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
