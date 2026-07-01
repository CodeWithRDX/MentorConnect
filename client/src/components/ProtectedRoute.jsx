import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — guards routes by auth status and role.
 *
 * Props:
 *  - requiredRole: single role string (e.g. 'admin') or array (e.g. ['admin', 'sub_admin'])
 *    If omitted, any authenticated user can access.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  // Wait for auth state to resolve, but don't block if we already have a user
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    // Allow sub_admin wherever admin is required (for admin dashboard access)
    const effectiveAllowed = allowed.includes('admin')
      ? [...allowed, 'sub_admin']
      : allowed;

    if (!effectiveAllowed.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
