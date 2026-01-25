import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Download, Plus, FileText, X, Loader2 } from 'lucide-react';
import authService from '@/services/authService';
import jsPDF from 'jspdf';

interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  degree: string;
  field: string;
  institution: string;
  year: string;
}

interface ResumeData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

export function ResumeBuilder() {
  const currentUser = authService.getStoredUser();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [resumeData, setResumeData] = useState<ResumeData>({
    firstName: currentUser?.name.split(' ')[0] || '',
    lastName: currentUser?.name.split(' ').slice(1).join(' ') || '',
    email: currentUser?.email || '',
    phone: '',
    summary: '',
    experience: [{ title: '', company: '', startDate: '', endDate: '', description: '' }],
    education: [{ degree: '', field: '', institution: '', year: '' }],
    skills: []
  });

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, { title: '', company: '', startDate: '', endDate: '', description: '' }]
    });
  };

  const removeExperience = (index: number) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter((_, i) => i !== index)
    });
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExperience = [...resumeData.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setResumeData({ ...resumeData, experience: newExperience });
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, { degree: '', field: '', institution: '', year: '' }]
    });
  };

  const removeEducation = (index: number) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter((_, i) => i !== index)
    });
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const newEducation = [...resumeData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setResumeData({ ...resumeData, education: newEducation });
  };

  const addSkill = () => {
    if (skillInput.trim() && !resumeData.skills.includes(skillInput.trim())) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter(s => s !== skill)
    });
  };

  const handleDownloadPDF = () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      let yPos = 20;

      // Header
      doc.setFontSize(24);
      doc.text(`${resumeData.firstName} ${resumeData.lastName}`, 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.text(`${resumeData.email} | ${resumeData.phone}`, 20, yPos);
      yPos += 15;

      // Summary
      if (resumeData.summary) {
        doc.setFontSize(14);
        doc.text('Professional Summary', 20, yPos);
        yPos += 7;
        doc.setFontSize(10);
        const summaryLines = doc.splitTextToSize(resumeData.summary, 170);
        doc.text(summaryLines, 20, yPos);
        yPos += summaryLines.length * 5 + 10;
      }

      // Experience
      if (resumeData.experience.some(exp => exp.title || exp.company)) {
        doc.setFontSize(14);
        doc.text('Work Experience', 20, yPos);
        yPos += 7;
        
        resumeData.experience.forEach(exp => {
          if (exp.title || exp.company) {
            doc.setFontSize(12);
            doc.text(`${exp.title} - ${exp.company}`, 20, yPos);
            yPos += 5;
            doc.setFontSize(9);
            doc.text(`${exp.startDate} - ${exp.endDate || 'Present'}`, 20, yPos);
            yPos += 5;
            if (exp.description) {
              doc.setFontSize(10);
              const descLines = doc.splitTextToSize(exp.description, 170);
              doc.text(descLines, 20, yPos);
              yPos += descLines.length * 5 + 5;
            }
            yPos += 3;
            
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
          }
        });
        yPos += 5;
      }

      // Education
      if (resumeData.education.some(edu => edu.degree || edu.institution)) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(14);
        doc.text('Education', 20, yPos);
        yPos += 7;
        
        resumeData.education.forEach(edu => {
          if (edu.degree || edu.institution) {
            doc.setFontSize(12);
            doc.text(`${edu.degree} in ${edu.field}`, 20, yPos);
            yPos += 5;
            doc.setFontSize(10);
            doc.text(`${edu.institution}, ${edu.year}`, 20, yPos);
            yPos += 8;
          }
        });
        yPos += 5;
      }

      // Skills
      if (resumeData.skills.length > 0) {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(14);
        doc.text('Skills', 20, yPos);
        yPos += 7;
        doc.setFontSize(10);
        const skillsText = resumeData.skills.join(', ');
        const skillsLines = doc.splitTextToSize(skillsText, 170);
        doc.text(skillsLines, 20, yPos);
      }

      doc.save(`${resumeData.firstName}_${resumeData.lastName}_Resume.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2 text-gray-900">Resume Builder</h1>
          <p className="text-gray-600">Create an ATS-friendly resume</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700" 
          onClick={handleDownloadPDF}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download Resume
            </>
          )}
        </Button>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input 
                id="firstName" 
                placeholder="John" 
                value={resumeData.firstName}
                onChange={(e) => setResumeData({ ...resumeData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input 
                id="lastName" 
                placeholder="Doe" 
                value={resumeData.lastName}
                onChange={(e) => setResumeData({ ...resumeData, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john@example.com" 
                value={resumeData.email}
                onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input 
                id="phone" 
                placeholder="Enter your phone number" 
                value={resumeData.phone}
                onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Professional Summary</Label>
            <Textarea 
              id="summary" 
              placeholder="Brief summary of your professional background..." 
              rows={4}
              value={resumeData.summary}
              onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Work Experience</CardTitle>
            <Button variant="outline" size="sm" onClick={addExperience}>
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {resumeData.experience.map((exp, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 space-y-4 relative">
              {resumeData.experience.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -right-2 -top-2"
                  onClick={() => removeExperience(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input 
                    placeholder="Senior Developer" 
                    value={exp.title}
                    onChange={(e) => updateExperience(index, 'title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input 
                    placeholder="Tech Corp" 
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="month" 
                    value={exp.startDate}
                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date (Leave empty if current)</Label>
                  <Input 
                    type="month" 
                    value={exp.endDate}
                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Describe your responsibilities and achievements..." 
                  rows={3}
                  value={exp.description}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Education</CardTitle>
            <Button variant="outline" size="sm" onClick={addEducation}>
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {resumeData.education.map((edu, index) => (
            <div key={index} className="border-l-4 border-green-500 pl-4 space-y-4 relative">
              {resumeData.education.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -right-2 -top-2"
                  onClick={() => removeEducation(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Degree</Label>
                  <Input 
                    
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Field of Study</Label>
                  <Input 
                    
                    value={edu.field}
                    onChange={(e) => updateEducation(index, 'field', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Institution</Label>
                  <Input 
                    placeholder="University Name" 
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Graduation Year</Label>
                  <Input 
                    type="number" 
                    
                    value={edu.year}
                    onChange={(e) => updateEducation(index, 'year', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Add a skill (e.g., React, TypeScript...)" 
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <Button type="button" onClick={addSkill}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill, idx) => (
              <div 
                key={idx} 
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {resumeData.skills.length === 0 && (
              <p className="text-gray-500 text-sm">No skills added yet. Add your skills above.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
