import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // You might want to render a spinner here, or just null
    // rendering null avoids flash of content or redirect while loading
    return null; 
  }

  if (user) {
    // Redirect to the appropriate dashboard based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'mentor') {
      return <Navigate to="/mentor/dashboard" replace />;
    } else {
      return <Navigate to="/mentee/dashboard" replace />;
    }
  }

  // If not logged in, render the child component (the public page)
  return children;
};

export default PublicRoute;
