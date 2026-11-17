import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
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
import { AdminChallengePage } from './pages/AdminChallengePage';
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

const AppShell: React.FC = () => {
  const location = useLocation();
  const isWorkspaceRoute =
    location.pathname.startsWith('/challenge/') ||
    (location.pathname.startsWith('/challenges/') && location.pathname !== '/challenges') ||
    location.pathname.startsWith('/interviews/');

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900">
      {!location.pathname.startsWith('/interviews/') && <Navbar />}
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
                <DashboardPage />
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

          {/* Admin Route */}
          <Route
            path="/admin/challenges"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminChallengePage />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isWorkspaceRoute && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
