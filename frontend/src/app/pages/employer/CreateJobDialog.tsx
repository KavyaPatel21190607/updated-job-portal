import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Loader2 } from 'lucide-react';
import jobService, { type Job } from '@/services/jobService';

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editJob?: Job | null;
}

export function CreateJobDialog({ open, onOpenChange, onSuccess, editJob }: CreateJobDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      const jobData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        requirements: (formData.get('requirements') as string).split('\n').filter(r => r.trim()),
        responsibilities: (formData.get('responsibilities') as string).split('\n').filter(r => r.trim()),
        requiredSkills: (formData.get('skills') as string).split(',').map(s => s.trim()).filter(s => s),
        location: formData.get('location') as string,
        jobType: formData.get('jobType') as 'full-time' | 'part-time' | 'contract' | 'internship',
        workType: formData.get('workType') as 'onsite' | 'remote' | 'hybrid',
        experienceLevel: formData.get('experienceLevel') as 'entry' | 'mid' | 'senior' | 'lead',
        salaryRange: {
          min: parseInt(formData.get('salaryMin') as string),
          max: parseInt(formData.get('salaryMax') as string),
          currency: 'INR'
        },
        benefits: (formData.get('benefits') as string).split(',').map(b => b.trim()).filter(b => b),
      };

      if (editJob) {
        await jobService.updateJob(editJob._id, jobData);
        alert('Job updated successfully!');
      } else {
        await jobService.createJob(jobData);
        alert('Job created successfully!');
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editJob ? 'Edit Job' : 'Create New Job'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input 
              id="title" 
              name="title" 
              defaultValue={editJob?.title}
              placeholder="e.g. Senior React Developer" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea 
              id="description" 
              name="description"
              defaultValue={editJob?.description}
              placeholder="Describe the role and what you're looking for..." 
              rows={4}
              required 
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input 
                id="location" 
                name="location"
                defaultValue={editJob?.location}
                
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type *</Label>
              <Select name="jobType" defaultValue={editJob?.jobType || 'full-time'} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workType">Work Type *</Label>
              <Select name="workType" defaultValue={editJob?.workType || 'onsite'} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onsite">On-site</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level *</Label>
              <Select name="experienceLevel" defaultValue={editJob?.experienceLevel || 'mid'} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Min Salary*</Label>
              <Input 
                id="salaryMin" 
                name="salaryMin"
                type="number"
                defaultValue={editJob?.salaryRange?.min}
                placeholder="80000" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryMax">Max Salary*</Label>
              <Input 
                id="salaryMax" 
                name="salaryMax"
                type="number"
                defaultValue={editJob?.salaryRange?.max}
                placeholder="120000" 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Required Skills (comma-separated) *</Label>
            <Input 
              id="skills" 
              name="skills"
              defaultValue={editJob?.skills?.join(', ')}
              placeholder="React, TypeScript, Node.js" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements (one per line) *</Label>
            <Textarea 
              id="requirements" 
              name="requirements"
              defaultValue={editJob?.requirements?.join('\n')}
              placeholder="5+ years of experience&#10;Bachelor's degree in CS&#10;Strong problem-solving skills" 
              rows={4}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsibilities">Responsibilities (one per line) *</Label>
            <Textarea 
              id="responsibilities" 
              name="responsibilities"
              defaultValue={editJob?.responsibilities?.join('\n')}
              placeholder="Build scalable web applications&#10;Collaborate with design team&#10;Code reviews" 
              rows={4}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits (comma-separated)</Label>
            <Input 
              id="benefits" 
              name="benefits"
              defaultValue={editJob?.benefits?.join(', ')}
              placeholder="Health Insurance, 401k, Remote Work" 
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editJob ? 'Update Job' : 'Create Job'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
