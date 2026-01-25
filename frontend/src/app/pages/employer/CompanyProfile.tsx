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

export function CompanyProfile() {
  const user = authService.getStoredUser();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  // Ref for file input
  const companyLogoInputRef = useRef<HTMLInputElement>(null);

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
        name: formData.get('companyName'),
        companyDetails: {
          companyName: formData.get('companyName') as string,
          industry: formData.get('industry') as string,
          companySize: formData.get('companySize') as string,
          website: formData.get('website') as string,
          founded: parseInt(formData.get('founded') as string),
          description: formData.get('description') as string,
          headquarters: formData.get('headquarters') as string,
          otherLocations: (formData.get('otherLocations') as string).split(',').map(l => l.trim()),
        },
        socialLinks: {
          linkedin: formData.get('linkedin') as string,
          twitter: formData.get('twitter') as string,
        },
      };
      
      await userService.updateProfile(updates);
      
      if (companyLogoFile) {
        await userService.uploadCompanyLogo(companyLogoFile);
      }
      
      alert('Company profile updated successfully!');
      fetchProfile();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCompanyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCompanyLogoFile(e.target.files[0]);
    }
  };

  const handleCompanyLogoUpload = () => {
    companyLogoInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2 text-gray-900">Company Profile</h1>
        <p className="text-gray-600">Manage your company information</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              {profile?.companyLogo ? (
                <img src={profile.companyLogo} alt="Company Logo" className="w-full h-full object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-purple-100 text-purple-600 text-2xl">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <Button type="button" variant="outline" onClick={handleCompanyLogoUpload}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
              <input
                ref={companyLogoInputRef}
                type="file"
                accept="image/*"
                onChange={handleCompanyLogoChange}
                className="hidden"
              />
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG or GIF. Max size 5MB
              </p>
              {companyLogoFile && (
                <p className="text-sm text-green-600 mt-1">
                  Selected: {companyLogoFile.name}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input 
                id="companyName" 
                name="companyName"
                defaultValue={profile?.companyDetails?.companyName || user?.name} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input 
                id="industry" 
                name="industry"
                defaultValue={profile?.companyDetails?.industry}
                placeholder="Technology" 
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companySize">Company Size</Label>
              <Input 
                id="companySize" 
                name="companySize"
                defaultValue={profile?.companyDetails?.companySize}
                placeholder="50-200 employees" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="founded">Founded Year</Label>
              <Input 
                id="founded" 
                name="founded"
                type="number" 
                defaultValue={profile?.companyDetails?.founded}
                placeholder="2015" 
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input 
                id="website" 
                name="website"
                defaultValue={profile?.companyDetails?.website}
                placeholder="https://company.com" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                defaultValue={user?.email} 
                disabled
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Company Description</Label>
            <Textarea 
              id="description" 
              name="description"
              defaultValue={profile?.companyDetails?.description}
              placeholder="Tell candidates about your company..." 
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Office Locations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="headquarters">Headquarters</Label>
            <Input 
              id="headquarters" 
              name="headquarters"
              defaultValue={profile?.companyDetails?.headquarters}
              placeholder="San Francisco, CA" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="otherLocations">Other Locations</Label>
            <Input 
              id="otherLocations" 
              name="otherLocations"
              defaultValue={profile?.companyDetails?.otherLocations?.join(', ')}
              placeholder="New York, NY; Austin, TX" 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input 
              id="linkedin" 
              name="linkedin"
              defaultValue={profile?.socialLinks?.linkedin}
              placeholder="https://linkedin.com/company/yourcompany" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input 
              id="twitter" 
              name="twitter"
              defaultValue={profile?.socialLinks?.twitter}
              placeholder="https://twitter.com/yourcompany" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input 
              id="facebook" 
              name="facebook"
              defaultValue={profile?.socialLinks?.facebook}
              placeholder="https://facebook.com/yourcompany" 
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={saving}>
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
