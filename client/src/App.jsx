import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/toaster';

import Home from './pages/Home';
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Mentors from './pages/Mentors';
import MentorDetail from './pages/MentorDetail';
import MentorDashboard from './pages/MentorDashboard';
import MenteeDashboard from './pages/MenteeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DatabaseViewer from './pages/DatabaseViewer';
import MentorApply from './pages/MentorApply';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProfileEdit from './pages/ProfileEdit';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/select-role" element={<RoleSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/mentors/:id" element={<MentorDetail />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          <Route
            path="/mentor/apply"
            element={
              <ProtectedRoute>
                <MentorApply />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/dashboard"
            element={
              <ProtectedRoute requiredRole="mentor">
                <MentorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentee/dashboard"
            element={
              <ProtectedRoute>
                <MenteeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/database"
            element={
              <ProtectedRoute requiredRole="admin">
                <DatabaseViewer />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}
export default App;