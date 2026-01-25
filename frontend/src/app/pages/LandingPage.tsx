import { Link, useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Briefcase, Search, Users, TrendingUp, CheckCircle } from 'lucide-react';
import authService from '@/services/authService';
import { useEffect } from 'react';

export function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getStoredUser();
    if (user) {
      if (user.role === 'job_seeker') {
        navigate('/job-seeker/dashboard');
      } else if (user.role === 'employer') {
        navigate('/employer/dashboard');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center text-white mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
              <Briefcase className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl mb-6">
            Find Your Dream Job or Perfect Candidate
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            The ultimate platform connecting talented job seekers with innovative employers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Job Seeker Card */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl mb-4 text-gray-900">For Job Seekers</h2>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Smart job search with advanced filters</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">ATS-friendly resume builder</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Application tracking dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Direct messaging with employers</span>
              </li>
            </ul>
            <Link to="/signup">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Start Job Search
              </Button>
            </Link>
          </div>

          {/* Employer Card */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl mb-4 text-gray-900">For Employers</h2>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Post and manage job listings</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">AI-powered ATS scoring system</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Interview scheduling tools</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Hiring analytics dashboard</span>
              </li>
            </ul>
            <Link to="/signup">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Start Hiring
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-white">
          <div>
            <div className="text-5xl mb-2">10K+</div>
            <div className="text-xl text-white/90">Active Jobs</div>
          </div>
          <div>
            <div className="text-5xl mb-2">50K+</div>
            <div className="text-xl text-white/90">Job Seekers</div>
          </div>
          <div>
            <div className="text-5xl mb-2">2K+</div>
            <div className="text-xl text-white/90">Companies</div>
          </div>
        </div>
      </div>
    </div>
  );
}
