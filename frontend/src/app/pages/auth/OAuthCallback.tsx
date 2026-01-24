import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import authService from '@/services/authService';

export function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const refresh = searchParams.get('refresh');
        const role = searchParams.get('role');
        const error = searchParams.get('error');

        if (error) {
          navigate('/login?error=' + error);
          return;
        }

        if (!token || !refresh || !role) {
          navigate('/login?error=invalid_callback');
          return;
        }

        // Store tokens
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refresh);

        // Fetch user data
        const userData = await authService.getCurrentUser();
        localStorage.setItem('user', JSON.stringify(userData));

        // Redirect based on role
        if (role === 'employer') {
          navigate('/employer/dashboard');
        } else {
          navigate('/job-seeker/dashboard');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        navigate('/login?error=auth_failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Completing sign in...</h2>
        <p className="text-gray-600 mt-2">Please wait while we redirect you</p>
      </div>
    </div>
  );
}
