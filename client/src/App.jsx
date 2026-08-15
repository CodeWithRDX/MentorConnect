import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { CallProvider } from './context/CallContext';
import { Toaster } from './components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import PageLoader from './components/PageLoader';

import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// ── Lazy Loaded Route Components (Render Only When Needed) ───────────────────
const Home = lazy(() => import('./pages/Home'));
const RoleSelection = lazy(() => import('./pages/RoleSelection'));
const Login = lazy(() => import('./pages/Login'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Register = lazy(() => import('./pages/Register'));
const Mentors = lazy(() => import('./pages/Mentors'));
const MentorDetail = lazy(() => import('./pages/MentorDetail'));
const MentorDashboard = lazy(() => import('./pages/MentorDashboard'));
const MentorAnalytics = lazy(() => import('./pages/MentorAnalytics'));
const MentorMessages = lazy(() => import('./pages/MentorMessages'));
const MentorEarnings = lazy(() => import('./pages/MentorEarnings'));
const MenteeDashboard = lazy(() => import('./pages/MenteeDashboard'));
const MenteeMessages = lazy(() => import('./pages/MenteeMessages'));
const Resources = lazy(() => import('./pages/Resources'));
const TrackGoals = lazy(() => import('./pages/TrackGoals'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const DatabaseViewer = lazy(() => import('./pages/DatabaseViewer'));
const MentorApply = lazy(() => import('./pages/MentorApply'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ProfileEdit = lazy(() => import('./pages/ProfileEdit'));
const IssueReport = lazy(() => import('./pages/IssueReport'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const FAQ = lazy(() => import('./pages/FAQ'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Contact = lazy(() => import('./pages/Contact'));
const VideoCall = lazy(() => import('./pages/VideoCall'));
const Whiteboard = lazy(() => import('./pages/Whiteboard'));
const SharedNotes = lazy(() => import('./pages/SharedNotes'));

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SocketProvider>
          <Router>
            {/* CallProvider must be inside Router so it can use useNavigate */}
            <CallProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* ── Public Information Routes (Always Accessible) ────────── */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/mentors" element={<Mentors />} />
                  <Route path="/mentors/:id" element={<MentorDetail />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />

                  {/* ── Auth Routes (Redirects already logged-in users) ─────── */}
                  <Route path="/select-role" element={<PublicRoute><RoleSelection /></PublicRoute>} />
                  <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
                  <Route
                    path="/mentee/login"
                    element={
                      <PublicRoute>
                        <Login
                          title="Welcome Back, Mentee!"
                          subtitle="Log in to access your dashboard, view upcoming sessions, and continue your growth journey."
                        />
                      </PublicRoute>
                    }
                  />
                  <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                  <Route path="/verify-email/:token" element={<VerifyEmail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />

                  {/* ── Protected Mentor Routes ───────────────────────────────── */}
                  <Route path="/mentor/apply" element={<ProtectedRoute><MentorApply /></ProtectedRoute>} />
                  <Route path="/mentor/dashboard" element={<ProtectedRoute requiredRole="mentor"><MentorDashboard /></ProtectedRoute>} />
                  <Route path="/mentor/analytics" element={<ProtectedRoute requiredRole="mentor"><MentorAnalytics /></ProtectedRoute>} />
                  <Route path="/mentor/earnings" element={<ProtectedRoute requiredRole="mentor"><MentorEarnings /></ProtectedRoute>} />
                  <Route path="/mentor/messages" element={<ProtectedRoute requiredRole="mentor"><MentorMessages /></ProtectedRoute>} />

                  {/* ── Protected Mentee Routes ───────────────────────────────── */}
                  <Route path="/mentee/dashboard" element={<ProtectedRoute><MenteeDashboard /></ProtectedRoute>} />
                  <Route path="/mentee/messages" element={<ProtectedRoute><MenteeMessages /></ProtectedRoute>} />

                  {/* ── Shared Protected Routes ───────────────────────────────── */}
                  <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
                  <Route path="/goals" element={<ProtectedRoute><TrackGoals /></ProtectedRoute>} />
                  <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
                  <Route path="/issues/new" element={<ProtectedRoute><IssueReport /></ProtectedRoute>} />

                  {/* ── Video Calling + Collaboration ────────────────────────── */}
                  <Route path="/call/:roomId" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
                  <Route path="/whiteboard/:roomId" element={<ProtectedRoute><Whiteboard /></ProtectedRoute>} />
                  <Route path="/notes/:bookingId" element={<ProtectedRoute><SharedNotes /></ProtectedRoute>} />

                  {/* ── Admin Routes ──────────────────────────────────────────── */}
                  <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/database" element={<ProtectedRoute requiredRole="admin"><DatabaseViewer /></ProtectedRoute>} />
                </Routes>
              </Suspense>
              <Toaster />
              <Analytics />
            </CallProvider>
          </Router>
        </SocketProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;