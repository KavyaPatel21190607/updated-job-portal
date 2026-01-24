import { Navigate } from 'react-router';
import authService from '@/services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'job_seeker' | 'employer' | 'admin';
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const user = authService.getStoredUser();

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but wrong role - redirect to their own dashboard or logout
  if (user.role !== allowedRole) {
    authService.logout();
    return <Navigate to="/login" replace />;
  }

  // Authenticated with correct role
  return <>{children}</>;
}
