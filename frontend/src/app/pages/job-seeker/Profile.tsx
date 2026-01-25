import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Save, Upload, Loader2 } from 'lucide-react';
import userService from '@/services/userService';
import authService, { type User } from '@/services/authService';

export function JobSeekerProfile() {
  const user = authService.getStoredUser();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  // Refs for file inputs
  const profilePictureInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profileData = await userService.getProfile();
      setProfile(profileData);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData(e.currentTarget);
      const updates: any = {
        name: formData.get('fullName'),
        phone: formData.get('phone'),
        location: formData.get('location'),
        bio: formData.get('bio'),
        socialLinks: {
          linkedin: formData.get('linkedin') as string,
          github: formData.get('github') as string,
          portfolio: formData.get('portfolio') as string,
        },
        preferences: {
          desiredRole: formData.get('desiredRole') as string,
          expectedSalary: formData.get('expectedSalary') as string,
          preferredLocations: (formData.get('preferredLocations') as string).split(',').map(l => l.trim()),
        },
      };
      
      await userService.updateProfile(updates);
      
      if (profilePictureFile) {
        await userService.uploadProfilePicture(profilePictureFile);
      }
      
      if (resumeFile) {
        await userService.uploadResume(resumeFile);
      }
      
      alert('Profile updated successfully!');
      fetchProfile();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePictureFile(e.target.files[0]);
    }
  };

  const handleProfilePictureUpload = () => {
    profilePictureInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2 text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture & Resume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-6">
            <Avatar className="w-24 h-24">
              {profile?.profilePicture ? (
                <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <Button type="button" variant="outline" onClick={handleProfilePictureUpload}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
              <input
                ref={profilePictureInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG or GIF. Max size 5MB
              </p>
              {profilePictureFile && (
                <p className="text-sm text-green-600 mt-1">
                  Selected: {profilePictureFile.name}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="resume">Resume/CV</Label>
            <Input 
              id="resume" 
              name="resume"
              type="file" 
              accept=".pdf,.doc,.docx"
              onChange={handleResumeChange}
            />
            <p className="text-sm text-gray-500">
              PDF, DOC, or DOCX. Max size 5MB
            </p>
            {profile?.resume && (
              <p className="text-sm text-green-600">
                Current resume: {profile.resume.filename || profile.resume.path?.split('/').pop()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" defaultValue={profile?.name || user?.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={user?.email} disabled />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" defaultValue={profile?.phone} placeholder="Your Phone number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={profile?.location} placeholder="Your Location" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio" 
              name="bio"
              defaultValue={profile?.bio}
              placeholder="Tell us about yourself..." 
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Professional Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input 
              id="linkedin" 
              name="linkedin"
              defaultValue={profile?.socialLinks?.linkedin}
              placeholder="https://linkedin.com/in/yourprofile" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
            <Input 
              id="github" 
              name="github"
              defaultValue={profile?.socialLinks?.github}
              placeholder="https://github.com/yourusername" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio Website</Label>
            <Input 
              id="portfolio" 
              name="portfolio"
              defaultValue={profile?.socialLinks?.portfolio}
              placeholder="https://yourwebsite.com" 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="desiredRole">Desired Role</Label>
              <Input 
                id="desiredRole" 
                name="desiredRole"
                defaultValue={profile?.preferences?.desiredRole}
                placeholder="Frontend Developer" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedSalary">Expected Salary</Label>
              <Input 
                id="expectedSalary" 
                name="expectedSalary"
                defaultValue={profile?.preferences?.expectedSalary}
                placeholder="Enter Your Expected Salary" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredLocations">Preferred Locations</Label>
            <Input 
              id="preferredLocations" 
              name="preferredLocations"
              defaultValue={profile?.preferences?.preferredLocations?.join(', ')}
              placeholder="Enter Preferred Locations" 
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
      </form>
    </div>
  );
}
