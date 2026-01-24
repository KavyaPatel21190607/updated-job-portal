import { Link } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="text-center text-white">
        <h1 className="text-9xl mb-4">404</h1>
        <h2 className="text-4xl mb-4">Page Not Found</h2>
        <p className="text-xl mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/">
          <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
