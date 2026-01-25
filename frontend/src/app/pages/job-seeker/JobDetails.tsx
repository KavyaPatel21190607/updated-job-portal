import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Clock, 
  Building, 
  Users, 
  Calendar,
  Loader2 
} from 'lucide-react';
import jobService, { type Job } from '@/services/jobService';
import applicationService from '@/services/applicationService';

export function JobDetails() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await jobService.getJobById(jobId!);
      setJob(response);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      await applicationService.applyForJob(jobId!);
      alert('Application submitted successfully!');
      navigate('/job-seeker/applications');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to apply for job');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    return `₹ ${(min / 100000).toFixed(1)} - ${(max / 100000).toFixed(1)} LPA`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const jobDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - jobDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted yesterday';
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    return `Posted on ${jobDate.toLocaleDateString()}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/job-seeker/jobs')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error || 'Job not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/job-seeker/jobs')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </Button>

      {/* Job Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
              <div className="flex items-center gap-2 text-xl text-gray-600 mb-4">
                <Building className="w-5 h-5" />
                <span className="font-medium">{job.companyName}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {job.jobType}
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {job.workType}
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {job.experienceLevel}
                </Badge>
              </div>
            </div>
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleApply}
              disabled={applying}
            >
              {applying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Apply Now
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="font-medium">{job.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-5 h-5" />
              <div>
                <p className="text-xs text-gray-500">Salary</p>
                <p className="font-medium">
                  {formatSalary(job.salaryRange.min, job.salaryRange.max, job.salaryRange.currency)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-5 h-5" />
              <div>
                <p className="text-xs text-gray-500">Experience</p>
                <p className="font-medium">{job.experienceLevel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <div>
                <p className="text-xs text-gray-500">Posted</p>
                <p className="font-medium">{formatDate(job.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{job.description}</p>
        </CardContent>
      </Card>

      {/* Requirements */}
      {(job.requirements || job.requiredSkills || job.skills) && (
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            {job.requirements && (
              <>
                {Array.isArray(job.requirements) ? (
                  <ul className="space-y-2 mb-4">
                    {job.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed mb-4">{job.requirements}</p>
                )}
              </>
            )}
            
            {(job.requiredSkills || job.skills) && (
              <>
                {job.requirements && <Separator className="my-4" />}
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(job.requiredSkills || job.skills || []).map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm py-1 px-3">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {job.benefits && job.benefits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {job.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Application Deadline */}
      {job.closingDate && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-700">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">
                Application Deadline: {new Date(job.closingDate).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apply Button (Bottom) */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Interested in this position?</h3>
              <p className="text-gray-600">Submit your application now</p>
            </div>
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleApply}
              disabled={applying}
            >
              {applying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Apply Now
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
