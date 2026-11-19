import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ChallengeLibraryPage } from './pages/ChallengeLibraryPage';
import { CodingWorkspacePage } from './pages/CodingWorkspacePage';
import { DashboardPage } from './pages/DashboardPage';
import { SkillProfilePage } from './pages/SkillProfilePage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ReadinessReportPage } from './pages/ReadinessReportPage';
import { PublicSharedReportPage } from './pages/PublicSharedReportPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { EducatorPanelPage } from './pages/EducatorPanelPage';
import { LiveInterviewPage } from './pages/LiveInterviewPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RoleDashboardEntry: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'educator') return <Navigate to="/educator" replace />;
  return <DashboardPage />;
};

const AppShell: React.FC = () => {
  const location = useLocation();
  const isDashboardPanelRoute =
    location.pathname.startsWith('/admin') || location.pathname.startsWith('/educator');
  const isWorkspaceRoute =
    location.pathname.startsWith('/challenge/') ||
    (location.pathname.startsWith('/challenges/') && location.pathname !== '/challenges') ||
    location.pathname.startsWith('/interviews/');

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8fc] text-slate-900">
      {!location.pathname.startsWith('/interviews/') && !isDashboardPanelRoute && <Navbar />}
      <main className="flex-1 flex flex-col min-h-0">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/challenges" element={<ChallengeLibraryPage />} />
          <Route path="/challenge/:slug" element={<CodingWorkspacePage />} />
          <Route path="/challenges/:slug" element={<CodingWorkspacePage />} />
          <Route path="/interviews/:sessionCode" element={<LiveInterviewPage />} />
          <Route path="/report/shared/:token" element={<PublicSharedReportPage />} />

          {/* Authenticated Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleDashboardEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/skills"
            element={
              <ProtectedRoute>
                <SkillProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <RecommendationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReadinessReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Educator Panel Routes */}
          <Route
            path="/educator/*"
            element={
              <ProtectedRoute allowedRoles={['educator', 'admin']}>
                <EducatorPanelPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Panel Routes (includes /admin/challenges inside Admin Console) */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPanelPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isWorkspaceRoute && !isDashboardPanelRoute && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </MotionConfig>
  );
};

export default App;
