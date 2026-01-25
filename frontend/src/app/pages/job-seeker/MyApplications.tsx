import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { FileText, Calendar, MessageSquare, Loader2 } from 'lucide-react';
import applicationService, { type Application } from '@/services/applicationService';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  viewed: { label: 'Viewed', color: 'bg-blue-100 text-blue-800' },
  shortlisted: { label: 'Shortlisted', color: 'bg-yellow-100 text-yellow-800' },
  reviewed: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
  interview: { label: 'Interview', color: 'bg-purple-100 text-purple-800' },
  hired: { label: 'Hired', color: 'bg-green-100 text-green-800' },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-600' },
};

export function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getMyApplications();
      setApplications(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredApplications = (status?: string) => {
    if (!status) return applications;
    // Handle 'accepted' tab to show both 'accepted' and 'hired' statuses
    if (status === 'accepted') {
      return applications.filter(app => app.status === 'accepted' || app.status === 'hired');
    }
    return applications.filter(app => app.status === status);
  };

  const handleViewApplication = (application: Application) => {
    // Navigate to job details page or show application details
    navigate(`/job-seeker/jobs/${application.job._id}`);
  };

  const handleMessage = (application: Application) => {
    // Navigate to messages with the employer
    navigate(`/job-seeker/messages?user=${application.job.employer}`);
  };

  const ApplicationCard = ({ app }: { app: Application }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg mb-1">{app.job.title}</CardTitle>
            <p className="text-gray-600">{app.job.companyName}</p>
          </div>
          <Badge className={statusConfig[app.status as keyof typeof statusConfig].color}>
            {statusConfig[app.status as keyof typeof statusConfig].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Applied Date</p>
            <p className="font-medium">
              {new Date(app.appliedAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">ATS Score</p>
            <p className="font-medium">
              <span className={app.atsScore >= 80 ? 'text-green-600' : app.atsScore >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                {app.atsScore}/100
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewApplication(app)}
          >
            <FileText className="w-4 h-4 mr-2" />
            View Application
          </Button>
          {app.status === 'interview' && (
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleMessage(app)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2 text-gray-900">My Applications</h1>
        <p className="text-gray-600">Track all your job applications in one place</p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
            <TabsTrigger value="interview">Interview</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {getFilteredApplications().length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500 py-8">No applications yet</p>
                </CardContent>
              </Card>
            ) : (
              getFilteredApplications().map(app => (
                <ApplicationCard key={app._id} app={app} />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {getFilteredApplications('pending').map(app => (
              <ApplicationCard key={app._id} app={app} />
            ))}
          </TabsContent>

          <TabsContent value="reviewed" className="space-y-4 mt-6">
            {getFilteredApplications('reviewed').map(app => (
              <ApplicationCard key={app._id} app={app} />
            ))}
          </TabsContent>

          <TabsContent value="interview" className="space-y-4 mt-6">
            {getFilteredApplications('interview').map(app => (
              <ApplicationCard key={app._id} app={app} />
            ))}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4 mt-6">
            {getFilteredApplications('accepted').map(app => (
              <ApplicationCard key={app._id} app={app} />
            ))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-6">
            {getFilteredApplications('rejected').map(app => (
              <ApplicationCard key={app._id} app={app} />
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
