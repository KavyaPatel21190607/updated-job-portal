import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Briefcase, Send, Eye, CheckCircle, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dashboardService from '@/services/dashboardService';

export function JobSeekerDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getJobSeekerDashboard();
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
  const recentApplications = dashboardData?.recentApplications || [];
  const activityData = dashboardData?.activityData || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2 text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your job search overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Applications</CardTitle>
            <Send className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{(stats.total || 0).toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              All applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">In Review</CardTitle>
            <Eye className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{((stats.viewed || 0) + (stats.shortlisted || 0)).toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              Being reviewed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Interviews</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{(stats.interview || 0).toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Offers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{(stats.hired || 0).toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              {(stats.hired || 0) > 0 ? 'Congratulations!' : 'Keep going!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      {activityData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Application Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions & Recent Applications */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/job-seeker/jobs">
              <Button className="w-full justify-start" variant="outline">
                <Briefcase className="w-4 h-4 mr-2" />
                Browse New Jobs
              </Button>
            </Link>
            <Link to="/job-seeker/resume">
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Update Resume
              </Button>
            </Link>
            <Link to="/job-seeker/applications">
              <Button className="w-full justify-start" variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View All Applications
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications && recentApplications.filter(app => app.job).length > 0 ? (
                recentApplications.filter(app => app.job).map((app: any) => {
                  const statusColors: Record<string, string> = {
                    pending: 'bg-gray-100 text-gray-800',
                    viewed: 'bg-blue-100 text-blue-800',
                    shortlisted: 'bg-yellow-100 text-yellow-800',
                    interview: 'bg-purple-100 text-purple-800',
                    hired: 'bg-green-100 text-green-800',
                    rejected: 'bg-red-100 text-red-800',
                  };
                  return (
                    <div key={app._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{app.job.title}</p>
                        <p className="text-xs text-gray-500">{app.job.companyName}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${statusColors[app.status] || 'bg-gray-100 text-gray-800'}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 py-8">No recent applications</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
