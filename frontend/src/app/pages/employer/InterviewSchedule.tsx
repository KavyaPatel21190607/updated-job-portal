import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Calendar, Clock, Video, MapPin, Plus, Loader2, Phone, Users } from 'lucide-react';
import applicationService, { type Application } from '@/services/applicationService';
import { ScheduleInterviewDialog } from './ScheduleInterviewDialog';

export function InterviewSchedule() {
  const [searchParams] = useSearchParams();
  const applicantId = searchParams.get('applicant');
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    // If there's an applicant ID in the URL, find that application and open dialog
    if (applicantId && applications.length > 0) {
      const app = applications.find(a => a._id === applicantId);
      if (app) {
        setSelectedApplication(app);
        setDialogOpen(true);
      }
    }
  }, [applicantId, applications]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getEmployerApplications();
      
      // If there's an applicant ID, we need ALL applications to find it
      // Otherwise, filter to show only interviews
      if (applicantId) {
        setApplications(response.data);
      } else {
        const interviewApplications = response.data.filter((app: Application) => 
          app.status === 'interview' || app.interview?.scheduled
        );
        setApplications(interviewApplications);
      }
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleNew = () => {
    setSelectedApplication(null);
    setDialogOpen(true);
  };

  const getTodaysInterviews = () => {
    const today = new Date().toDateString();
    return applications.filter(app => 
      app.interview?.date && new Date(app.interview.date).toDateString() === today
    );
  };

  const getUpcomingInterviews = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return applications.filter(app => 
      app.interview?.date && new Date(app.interview.date) > today
    ).sort((a, b) => 
      new Date(a.interview!.date!).getTime() - new Date(b.interview!.date!).getTime()
    );
  };

  const getPastInterviews = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return applications.filter(app => 
      app.interview?.date && new Date(app.interview.date) < today
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2 text-gray-900">Interview Schedule</h1>
          <p className="text-gray-600">Manage upcoming and past interviews</p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
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
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Interviews ({getTodaysInterviews().length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {getTodaysInterviews().length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No interviews scheduled for today</p>
                ) : (
                  getTodaysInterviews().map((application) => (
                    <div key={application._id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{application.jobSeeker.name}</p>
                          <p className="text-sm text-gray-600">{application.job.title}</p>
                        </div>
                        <Badge className={
                          application.interview?.mode === 'video' ? 'bg-blue-100 text-blue-700' : 
                          application.interview?.mode === 'in-person' ? 'bg-purple-100 text-purple-700' : 
                          'bg-green-100 text-green-700'
                        }>
                          {application.interview?.mode}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {application.interview?.time}
                        </div>
                        {application.interview?.mode === 'video' && (
                          <div className="flex items-center gap-1">
                            <Video className="w-4 h-4" />
                            Video Call
                          </div>
                        )}
                        {application.interview?.mode === 'in-person' && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {application.interview?.location || 'Office'}
                          </div>
                        )}
                        {application.interview?.mode === 'phone' && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            Phone Call
                          </div>
                        )}
                      </div>
                      {application.interview?.notes && (
                        <p className="text-sm text-gray-600 mb-3 italic">{application.interview.notes}</p>
                      )}
                      <div className="flex gap-2">
                        {application.interview?.meetingLink && (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => window.open(application.interview?.meetingLink, '_blank')}
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Join Meeting
                          </Button>
                        )}
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Interviews ({getUpcomingInterviews().length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {getUpcomingInterviews().length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No upcoming interviews</p>
                ) : (
                  getUpcomingInterviews().slice(0, 5).map((application) => (
                    <div key={application._id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{application.jobSeeker.name}</p>
                          <p className="text-sm text-gray-600">{application.job.title}</p>
                        </div>
                        <Badge className={
                          application.interview?.mode === 'video' ? 'bg-blue-100 text-blue-700' : 
                          application.interview?.mode === 'in-person' ? 'bg-purple-100 text-purple-700' : 
                          'bg-green-100 text-green-700'
                        }>
                          {application.interview?.mode}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(application.interview!.date!).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {application.interview?.time}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Past Interviews ({getPastInterviews().length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getPastInterviews().length === 0 ? (
                <p className="text-center text-gray-500 py-8">No past interviews</p>
              ) : (
                getPastInterviews().slice(0, 5).map((application) => (
                  <div key={application._id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{application.jobSeeker.name}</p>
                        <p className="text-sm text-gray-600">{application.job.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(application.interview!.date!).toLocaleDateString()}
                        </p>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}

      {(selectedApplication || (applicantId && applications.length > 0)) && (
        <ScheduleInterviewDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          applicationId={selectedApplication?._id || applicantId || ''}
          candidateName={selectedApplication?.jobSeeker.name || 'Candidate'}
          onSuccess={() => {
            fetchInterviews();
            setDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
