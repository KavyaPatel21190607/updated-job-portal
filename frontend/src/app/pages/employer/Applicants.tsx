import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Search, Download, MessageSquare, CheckCircle, XCircle, Loader2, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import applicationService, { type Application } from '@/services/applicationService';
import jobService, { type Job } from '@/services/jobService';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  viewed: { label: 'Viewed', color: 'bg-blue-100 text-blue-800' },
  shortlisted: { label: 'Shortlisted', color: 'bg-yellow-100 text-yellow-800' },
  interview: { label: 'Interview', color: 'bg-purple-100 text-purple-800' },
  hired: { label: 'Hired', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-600' },
};

export function Applicants() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get('job');
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(jobId || 'all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchApplications();
    }
  }, [selectedJobId]);

  const fetchJobs = async () => {
    try {
      const response = await jobService.getMyJobs();
      setJobs(response.data);
      if (!jobId && response.data.length > 0) {
        setSelectedJobId('all');
      }
    } catch (err: any) {
      setError('Failed to load jobs');
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      if (selectedJobId === 'all') {
        const response = await applicationService.getEmployerApplications();
        setApplications(response.data);
      } else {
        const response = await jobService.getJobApplicants(selectedJobId);
        setApplications(response.data);
      }
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, status: string) => {
    try {
      setUpdatingId(applicationId);
      await applicationService.updateApplicationStatus(applicationId, status);
      await fetchApplications();
      alert(`Application ${status} successfully!`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMessage = (application: Application) => {
    navigate(`/employer/messages?user=${application.jobSeeker._id}`);
  };

  const handleDownloadResume = (resume: any) => {
    if (resume?.path) {
      // Check if it's already a full URL (Supabase URL)
      if (resume.path.startsWith('http')) {
        window.open(resume.path, '_blank');
      } else {
        // Legacy local path
        window.open(`http://localhost:5000${resume.path}`, '_blank');
      }
    } else {
      alert('No resume available');
    }
  };

  const filteredApplications = applications.filter(app =>
    app.jobSeeker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jobSeeker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2 text-gray-900">Applicants</h1>
        <p className="text-gray-600">Review and manage job applications</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search applicants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job._id} value={job._id}>
                    {job.title} ({job.applicants?.length || 0} applicants)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
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
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500 py-8">
                  No applications yet for this job.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <Card key={application._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        {application.jobSeeker.profilePicture ? (
                          <img src={application.jobSeeker.profilePicture} alt={application.jobSeeker.name} />
                        ) : (
                          <AvatarFallback className="bg-purple-100 text-purple-600 text-lg">
                            {application.jobSeeker.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg mb-1">{application.jobSeeker.name}</CardTitle>
                        <p className="text-sm text-gray-600">{application.jobSeeker.email}</p>
                        {application.jobSeeker.phone && (
                          <p className="text-sm text-gray-500">{application.jobSeeker.phone}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={statusConfig[application.status].color}>
                      {statusConfig[application.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Position</p>
                      <p className="font-medium">{application.job.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Applied Date</p>
                      <p className="font-medium">{new Date(application.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ATS Score</p>
                      <p className={`font-medium ${application.atsScore >= 85 ? 'text-green-600' : application.atsScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {application.atsScore}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium">{application.jobSeeker.experience?.length || 0} years</p>
                    </div>
                  </div>

                  {application.jobSeeker.skills && application.jobSeeker.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {application.jobSeeker.skills.slice(0, 5).map((skill, idx) => (
                          <Badge key={idx} variant="outline">{skill}</Badge>
                        ))}
                        {application.jobSeeker.skills.length > 5 && (
                          <Badge variant="outline">+{application.jobSeeker.skills.length - 5} more</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {application.coverLetter && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Cover Letter</p>
                      <p className="text-sm line-clamp-2">{application.coverLetter}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {application.resume && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadResume(application.resume)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMessage(application)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    
                    {application.status !== 'hired' && application.status !== 'rejected' && (
                      <>
                        {application.status !== 'shortlisted' && (
                          <Button 
                            size="sm" 
                            className="bg-yellow-600 hover:bg-yellow-700"
                            onClick={() => handleStatusUpdate(application._id, 'shortlisted')}
                            disabled={updatingId === application._id}
                          >
                            {updatingId === application._id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <FileText className="w-4 h-4 mr-2" />
                            )}
                            Shortlist
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleStatusUpdate(application._id, 'hired')}
                          disabled={updatingId === application._id}
                        >
                          {updatingId === application._id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Accept
                        </Button>
                      </>
                    )}
                    
                    {application.status !== 'rejected' && application.status !== 'withdrawn' && (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleStatusUpdate(application._id, 'rejected')}
                        disabled={updatingId === application._id}
                      >
                        {updatingId === application._id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
