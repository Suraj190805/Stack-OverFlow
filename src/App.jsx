import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { PointsProvider } from './contexts/PointsContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Layout/Navbar';
import LeftSidebar from './components/Layout/LeftSidebar';
import RightSidebar from './components/Layout/RightSidebar';
import Footer from './components/Layout/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AskQuestion from './pages/AskQuestion';
import Subscription from './pages/Subscription';
import SocialFeed from './pages/SocialFeed';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Tags from './pages/Tags';
import Rewards from './pages/Rewards';
import Saves from './pages/Saves';
import Collectives from './pages/Collectives';
import Challenges from './pages/Challenges';
import Home from './pages/Home';
import Users from './pages/Users';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import AIAssist from './pages/AIAssist';

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  return children;
}

function GuestRoute({ children }) {
  const { currentUser } = useAuth();
  if (currentUser) return <Navigate to="/home" />;
  return children;
}

function AppRoutes() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const isDashboard = location.pathname === '/dashboard';
  const { currentUser } = useAuth();

  return (
    <>
      <Navbar />
      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        </Routes>
      ) : (
        <div className="so-layout">
          {currentUser && <LeftSidebar />}
          <main className="so-main">
            <Routes>
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/ask" element={<ProtectedRoute><AskQuestion /></ProtectedRoute>} />
              <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
              <Route path="/social" element={<ProtectedRoute><SocialFeed /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/tags" element={<ProtectedRoute><Tags /></ProtectedRoute>} />
              <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
              <Route path="/saves" element={<ProtectedRoute><Saves /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
              <Route path="/companies/:slug" element={<ProtectedRoute><CompanyDetail /></ProtectedRoute>} />
              <Route path="/collectives" element={<ProtectedRoute><Collectives /></ProtectedRoute>} />
              <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
              <Route path="/ai-assist" element={<ProtectedRoute><AIAssist /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </main>
          {currentUser && isDashboard && <RightSidebar />}
        </div>
      )}
      {!isAuthPage && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <PointsProvider>
              <ToastProvider>
                <AppRoutes />
              </ToastProvider>
            </PointsProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
