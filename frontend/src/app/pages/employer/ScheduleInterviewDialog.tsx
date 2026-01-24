import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Loader2 } from 'lucide-react';
import applicationService from '@/services/applicationService';

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  candidateName: string;
  onSuccess: () => void;
}

export function ScheduleInterviewDialog({ 
  open, 
  onOpenChange, 
  applicationId, 
  candidateName,
  onSuccess 
}: ScheduleInterviewDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      const interviewData = {
        date: formData.get('date') as string,
        time: formData.get('time') as string,
        mode: formData.get('mode') as 'video' | 'phone' | 'in-person',
        location: formData.get('location') as string,
        meetingLink: formData.get('meetingLink') as string,
        notes: formData.get('notes') as string,
      };

      await applicationService.scheduleInterview(applicationId, interviewData);
      alert('Interview scheduled successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Interview with {candidateName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date">Interview Date *</Label>
            <Input 
              id="date" 
              name="date" 
              type="date"
              required 
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time *</Label>
            <Input 
              id="time" 
              name="time" 
              type="time"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode">Interview Mode *</Label>
            <Select name="mode" defaultValue="video" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video Call</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="in-person">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingLink">Meeting Link</Label>
            <Input 
              id="meetingLink" 
              name="meetingLink" 
              type="url"
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              name="location" 
              placeholder="Office address or phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              placeholder="Any additional information for the candidate..."
              rows={3}
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
                  Scheduling...
                </>
              ) : (
                'Schedule Interview'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
