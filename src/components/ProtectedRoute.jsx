// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!currentUser) {
    // User not logged in
    return <Navigate to="/login" />;
  }

  if (requireAdmin && userRole !== 'admin') {
    // User not admin but route requires admin
    return <Navigate to="/dashboard" />;
  }

  if (!requireAdmin && userRole === 'admin') {
    // Admin trying to access member area
    return <Navigate to="/dashboard" />;
  }

  return children;
}