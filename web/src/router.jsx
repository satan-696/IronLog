// web/src/router.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import Layout from './components/Layout.jsx';

import LoginPage    from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage     from './pages/HomePage.jsx';
import SchedulePage from './pages/SchedulePage.jsx';
import ExercisePage from './pages/ExercisePage.jsx';
import TrackerPage  from './pages/TrackerPage.jsx';
import ReportPage   from './pages/ReportPage.jsx';
import MealPage     from './pages/MealPage.jsx';
import ProfilePage  from './pages/ProfilePage.jsx';
import WeightPage   from './pages/WeightPage.jsx';

// ── Guards ─────────────────────────────────────────────
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="font-display text-2xl logo-text tracking-widest">IRONLOG</span>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function RedirectIfAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/home" replace />;
  return children;
}

// ── Router ─────────────────────────────────────────────
export const router = createBrowserRouter([
  // Auth routes
  { path: '/login',    element: <RedirectIfAuth><LoginPage /></RedirectIfAuth> },
  { path: '/register', element: <RedirectIfAuth><RegisterPage /></RedirectIfAuth> },

  // Protected routes
  { path: '/home',      element: <RequireAuth><HomePage /></RequireAuth> },
  { path: '/schedule',  element: <RequireAuth><SchedulePage /></RequireAuth> },
  { path: '/exercises', element: <RequireAuth><ExercisePage /></RequireAuth> },
  { path: '/track',     element: <RequireAuth><TrackerPage /></RequireAuth> },
  { path: '/reports',   element: <RequireAuth><ReportPage /></RequireAuth> },
  { path: '/meals',     element: <RequireAuth><MealPage /></RequireAuth> },
  { path: '/weight',    element: <RequireAuth><WeightPage /></RequireAuth> },
  { path: '/profile',   element: <RequireAuth><ProfilePage /></RequireAuth> },

  // Fallback
  { path: '/', element: <Navigate to="/home" replace /> },
  { path: '*', element: <Navigate to="/home" replace /> },
]);
