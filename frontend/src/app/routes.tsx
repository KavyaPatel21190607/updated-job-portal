import { createBrowserRouter, Navigate } from 'react-router';
import { LandingPage } from '@/app/pages/LandingPage';
import { LoginPage } from '@/app/pages/auth/LoginPage';
import { SignupPage } from '@/app/pages/auth/SignupPage';
import { OAuthCallback } from '@/app/pages/auth/OAuthCallback';

// Job Seeker Pages
import { JobSeekerDashboard } from '@/app/pages/job-seeker/Dashboard';
import { JobSearch } from '@/app/pages/job-seeker/JobSearch';
import { MyApplications } from '@/app/pages/job-seeker/MyApplications';
import { ResumeBuilder } from '@/app/pages/job-seeker/ResumeBuilder';
import { JobSeekerMessages } from '@/app/pages/job-seeker/Messages';
import { JobSeekerProfile } from '@/app/pages/job-seeker/Profile';

// Employer Pages
import { EmployerDashboard } from '@/app/pages/employer/Dashboard';
import { JobPostings } from '@/app/pages/employer/JobPostings';
import { Applicants } from '@/app/pages/employer/Applicants';
import { EmployerMessages } from '@/app/pages/employer/Messages';
import { CompanyProfile } from '@/app/pages/employer/CompanyProfile';

// Layout Components
import { JobSeekerLayout } from '@/app/layouts/JobSeekerLayout';
import { EmployerLayout } from '@/app/layouts/EmployerLayout';

// Protected Route Wrapper
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { NotFound } from '@/app/pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LandingPage,
  },
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/signup',
    Component: SignupPage,
  },
  {
    path: '/auth/callback',
    Component: OAuthCallback,
  },
  // Job Seeker Routes - Completely separate
  {
    path: '/job-seeker',
    element: <ProtectedRoute allowedRole="job_seeker"><JobSeekerLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/job-seeker/dashboard" replace /> },
      { path: 'dashboard', Component: JobSeekerDashboard },
      { path: 'jobs', Component: JobSearch },
      { path: 'applications', Component: MyApplications },
      { path: 'resume', Component: ResumeBuilder },
      { path: 'messages', Component: JobSeekerMessages },
      { path: 'profile', Component: JobSeekerProfile },
    ],
  },
  // Employer Routes - Completely separate
  {
    path: '/employer',
    element: <ProtectedRoute allowedRole="employer"><EmployerLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/employer/dashboard" replace /> },
      { path: 'dashboard', Component: EmployerDashboard },
      { path: 'jobs', Component: JobPostings },
      { path: 'applicants', Component: Applicants },
      { path: 'messages', Component: EmployerMessages },
      { path: 'company', Component: CompanyProfile },
    ],
  },
  {
    path: '*',
    Component: NotFound,
  },
]);
