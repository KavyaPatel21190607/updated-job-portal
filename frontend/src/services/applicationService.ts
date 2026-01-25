import api from './api';

export interface Application {
  _id: string;
  job?: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
    salaryRange: {
      min: number;
      max: number;
      currency: string;
    };
    jobType: string;
    workType: string;
    status: string;
  };
  jobSeeker: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    skills?: string[];
    experience?: any[];
    education?: any[];
    profilePicture?: string;
  };
  employer: {
    _id: string;
    name: string;
    email: string;
    companyName?: string;
  };
  status: 'pending' | 'viewed' | 'shortlisted' | 'interview' | 'hired' | 'rejected' | 'withdrawn';
  resume?: {
    filename: string;
    path: string;
    uploadedAt: Date;
  };
  coverLetter?: string;
  interview?: {
    scheduled: boolean;
    date?: Date;
    time?: string;
    mode?: 'video' | 'phone' | 'in-person';
    location?: string;
    meetingLink?: string;
    notes?: string;
  };
  atsScore: number;
  timeline: {
    status: string;
    timestamp: Date;
    note?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const applicationService = {
  /**
   * Apply for a job (Job Seeker only)
   */
  applyForJob: async (jobId: string, coverLetter?: string) => {
    const response = await api.post('/applications', {
      jobId,
      coverLetter,
    });
    return response.data.data;
  },

  /**
   * Get my applications (Job Seeker only)
   */
  getMyApplications: async (page = 1, limit = 10, status?: string) => {
    const response = await api.get('/applications/my-applications', {
      params: { page, limit, status },
    });
    return response.data;
  },

  /**
   * Get all applications for employer
   */
  getEmployerApplications: async (page = 1, limit = 100) => {
    const response = await api.get('/applications/employer/all', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get application by ID
   */
  getApplicationById: async (id: string): Promise<Application> => {
    const response = await api.get(`/applications/${id}`);
    return response.data.data;
  },

  /**
   * Update application status (Employer only)
   */
  updateApplicationStatus: async (id: string, status: string, note?: string) => {
    const response = await api.patch(`/applications/${id}/status`, {
      status,
      note,
    });
    return response.data.data;
  },

  /**
   * Withdraw application (Job Seeker only)
   */
  withdrawApplication: async (id: string) => {
    const response = await api.patch(`/applications/${id}/withdraw`);
    return response.data.data;
  },

  /**
   * Schedule interview (Employer only)
   */
  scheduleInterview: async (
    id: string,
    data: {
      date: string;
      time: string;
      mode: 'video' | 'phone' | 'in-person';
      location?: string;
      meetingLink?: string;
      notes?: string;
    }
  ) => {
    const response = await api.post(`/applications/${id}/schedule-interview`, data);
    return response.data.data;
  },

  /**
   * Get application statistics (Job Seeker only)
   */
  getApplicationStats: async () => {
    const response = await api.get('/applications/stats');
    return response.data.data;
  },
};

export default applicationService;
