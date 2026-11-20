import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ScrollProgressBar } from './components/ScrollProgressBar';

// Eagerly load primary entry page for instant First Contentful Paint
import { LandingPage } from './pages/LandingPage';

// Lazy-load secondary & heavy routes (Monaco Editor, Admin/Educator portals, Live Interview)
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ChallengeLibraryPage = lazy(() =>
  import('./pages/ChallengeLibraryPage').then((m) => ({ default: m.ChallengeLibraryPage }))
);
const CodingWorkspacePage = lazy(() =>
  import('./pages/CodingWorkspacePage').then((m) => ({ default: m.CodingWorkspacePage }))
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const SkillProfilePage = lazy(() =>
  import('./pages/SkillProfilePage').then((m) => ({ default: m.SkillProfilePage }))
);
const RecommendationsPage = lazy(() =>
  import('./pages/RecommendationsPage').then((m) => ({ default: m.RecommendationsPage }))
);
const ReadinessReportPage = lazy(() =>
  import('./pages/ReadinessReportPage').then((m) => ({ default: m.ReadinessReportPage }))
);
const PublicSharedReportPage = lazy(() =>
  import('./pages/PublicSharedReportPage').then((m) => ({ default: m.PublicSharedReportPage }))
);
const AdminPanelPage = lazy(() =>
  import('./pages/AdminPanelPage').then((m) => ({ default: m.AdminPanelPage }))
);
const EducatorPanelPage = lazy(() =>
  import('./pages/EducatorPanelPage').then((m) => ({ default: m.EducatorPanelPage }))
);
const LiveInterviewPage = lazy(() =>
  import('./pages/LiveInterviewPage').then((m) => ({ default: m.LiveInterviewPage }))
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteLoadingFallback: React.FC = () => (
  <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-[#f8fafc]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
      <span className="text-xs font-medium text-slate-500">Loading workspace…</span>
    </div>
  </div>
);

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
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900">
      {!isWorkspaceRoute && !isDashboardPanelRoute && <ScrollProgressBar />}
      {!location.pathname.startsWith('/interviews/') && !isDashboardPanelRoute && <Navbar />}
      <main className="flex-1 flex flex-col min-h-0">
        <Suspense fallback={<RouteLoadingFallback />}>
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

            {/* Admin Panel Routes */}
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
        </Suspense>
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
