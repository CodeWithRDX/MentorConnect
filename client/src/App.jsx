import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CallProvider } from './context/CallContext';
import { Toaster } from './components/ui/toaster';
import Loader from './components/Loader';
import { AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';

import Home from './pages/Home';
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Mentors from './pages/Mentors';
import MentorDetail from './pages/MentorDetail';
import MentorDashboard from './pages/MentorDashboard';
import MentorAnalytics from './pages/MentorAnalytics';
import MentorMessages from './pages/MentorMessages';
import MentorEarnings from './pages/MentorEarnings';
import MenteeDashboard from './pages/MenteeDashboard';
import MenteeMessages from './pages/MenteeMessages';
import Resources from './pages/Resources';
import TrackGoals from './pages/TrackGoals';
import AdminDashboard from './pages/AdminDashboard';
import DatabaseViewer from './pages/DatabaseViewer';
import MentorApply from './pages/MentorApply';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProfileEdit from './pages/ProfileEdit';
import IssueReport from './pages/IssueReport';
import AboutUs from './pages/AboutUs';
import FAQ from './pages/FAQ';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Contact from './pages/Contact';
import VideoCall from './pages/VideoCall';
import Whiteboard from './pages/Whiteboard';
import SharedNotes from './pages/SharedNotes';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <SocketProvider>
        <AnimatePresence>
          {isLoading && <Loader isLoading={isLoading} />}
        </AnimatePresence>
        <Router>
          {/* CallProvider must be inside Router so it can use useNavigate */}
          <CallProvider>
            <Routes>
              {/* ── Public Routes ─────────────────────────────────────────── */}
              <Route path="/"           element={<PublicRoute><Home /></PublicRoute>} />
              <Route path="/select-role" element={<PublicRoute><RoleSelection /></PublicRoute>} />
              <Route path="/login"       element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
              <Route path="/mentee/login" element={<PublicRoute><Login title="Welcome Back, Mentee!" subtitle="Log in to access your dashboard, view upcoming sessions, and continue your growth journey." /></PublicRoute>} />
              <Route path="/register"    element={<PublicRoute><Register /></PublicRoute>} />

              <Route path="/mentors"     element={<Mentors />} />
              <Route path="/mentors/:id" element={<MentorDetail />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/forgot-password"     element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/about"   element={<AboutUs />} />
              <Route path="/faq"     element={<FAQ />} />
              <Route path="/terms"   element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/contact" element={<Contact />} />

              {/* ── Protected Mentor Routes ───────────────────────────────── */}
              <Route path="/mentor/apply"     element={<ProtectedRoute><MentorApply /></ProtectedRoute>} />
              <Route path="/mentor/dashboard" element={<ProtectedRoute requiredRole="mentor"><MentorDashboard /></ProtectedRoute>} />
              <Route path="/mentor/analytics" element={<ProtectedRoute requiredRole="mentor"><MentorAnalytics /></ProtectedRoute>} />
              <Route path="/mentor/earnings"  element={<ProtectedRoute requiredRole="mentor"><MentorEarnings /></ProtectedRoute>} />
              <Route path="/mentor/messages"  element={<ProtectedRoute requiredRole="mentor"><MentorMessages /></ProtectedRoute>} />

              {/* ── Protected Mentee Routes ───────────────────────────────── */}
              <Route path="/mentee/dashboard" element={<ProtectedRoute><MenteeDashboard /></ProtectedRoute>} />
              <Route path="/mentee/messages"  element={<ProtectedRoute><MenteeMessages /></ProtectedRoute>} />

              {/* ── Shared Protected Routes ───────────────────────────────── */}
              <Route path="/resources"  element={<ProtectedRoute><Resources /></ProtectedRoute>} />
              <Route path="/goals"      element={<ProtectedRoute><TrackGoals /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
              <Route path="/issues/new"   element={<ProtectedRoute><IssueReport /></ProtectedRoute>} />

              {/* ── Video Calling + Collaboration ────────────────────────── */}
              <Route path="/call/:roomId"          element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
              <Route path="/whiteboard/:roomId"    element={<ProtectedRoute><Whiteboard /></ProtectedRoute>} />
              <Route path="/notes/:bookingId"      element={<ProtectedRoute><SharedNotes /></ProtectedRoute>} />

              {/* ── Admin Routes ──────────────────────────────────────────── */}
              <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/database"        element={<ProtectedRoute requiredRole="admin"><DatabaseViewer /></ProtectedRoute>} />
            </Routes>
            <Toaster />
            <Analytics />
          </CallProvider>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;