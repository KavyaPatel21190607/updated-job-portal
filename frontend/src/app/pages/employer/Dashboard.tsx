import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Briefcase, Users, Eye, CheckCircle, TrendingUp, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import dashboardService from '@/services/dashboardService';

const COLORS = ['#9ca3af', '#fbbf24', '#a855f7', '#22c55e'];

export function EmployerDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getEmployerDashboard();
      setDashboardData(response);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const stats = dashboardData?.stats || {};
  const activeJobs = dashboardData?.activeJobs || 0;
  const totalApplications = dashboardData?.totalApplications || 0;
  const recentApplications = dashboardData?.recentApplications || [];
  const topJobs = dashboardData?.topJobs || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2 text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Track your hiring metrics and manage applications</p>
        </div>
        <Link to="/employer/jobs">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Job Postings</CardTitle>
            <Briefcase className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{activeJobs.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalApplications.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              All time applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">To Review</CardTitle>
            <Eye className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{(stats.pending || 0).toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              Pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Hired</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{(stats.hired || 0).toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              Successfully hired
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Application Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Application Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-500">{(stats.pending || 0).toLocaleString('en-IN')}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{(stats.viewed || 0).toLocaleString('en-IN')}</p>
              <p className="text-sm text-gray-600">Viewed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">{(stats.shortlisted || 0).toLocaleString('en-IN')}</p>
              <p className="text-sm text-gray-600">Shortlisted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">{(stats.interview || 0).toLocaleString('en-IN')}</p>
              <p className="text-sm text-gray-600">Interview</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{(stats.hired || 0).toLocaleString('en-IN')}</p>
              <p className="text-sm text-gray-600">Hired</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{(stats.rejected || 0).toLocaleString('en-IN')}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentApplications && recentApplications.length > 0 ? (
              recentApplications.map((app: any) => (
                <div key={app._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{app.jobSeeker.name}</p>
                    <p className="text-sm text-gray-500">{app.job.title}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">ATS Score</p>
                      <p className={`text-sm ${
                        app.atsScore >= 85 ? 'text-green-600' : app.atsScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {app.atsScore.toLocaleString('en-IN')}/100
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 w-24">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                    <Link to={`/employer/applicants?job=${app.job._id}`}>
                      <Button size="sm" variant="outline">Review</Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No recent applications</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
