import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api, getAccessToken, clearTokens, type User } from './services/api';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import ResumePage from './pages/ResumePage';
import CareerRecommendationsPage from './pages/CareerRecommendationsPage';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  // On first load, if a token exists, verify it's still valid by
  // asking the backend "who am I" — rather than trusting it blindly.
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setChecking(false);
      return;
    }

    api
      .getMe()
      .then((me) => setUser(me))
      .catch(() => clearTokens())
      .finally(() => setChecking(false));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage onLoginSuccess={setUser} />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} checking={checking}>
              {user && <DashboardPage user={user} onLogout={() => setUser(null)} />}
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            checking ? (
              <div className="min-h-screen flex items-center justify-center text-[#4C5F70] bg-[#F7FBFA]">
                Loading…
              </div>
            ) : user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage />
            )
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user} checking={checking}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cv"
          element={
            <ProtectedRoute user={user} checking={checking}>
              <ResumePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/careers"
          element={
            <ProtectedRoute user={user} checking={checking}>
              <CareerRecommendationsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;