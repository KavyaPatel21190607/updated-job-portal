import api from './api';

export interface Job {
  _id: string;
  title: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  skills?: string[];
  requiredSkills?: string[];
  benefits?: string[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  experienceYears?: {
    min: number;
    max: number;
  };
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  location: string;
  workType: 'remote' | 'onsite' | 'hybrid';
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  employer: {
    _id: string;
    name: string;
    email: string;
    companyName?: string;
    companyLogo?: string;
  };
  companyName: string;
  companyLogo?: string;
  status: 'draft' | 'open' | 'active' | 'closed' | 'paused';
  views: number;
  applicants?: string[];
  applicationsCount: number;
  closingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  workType?: string;
  jobType?: string;
  experienceLevel?: string;
  minSalary?: number;
  maxSalary?: number;
  skills?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const jobService = {
  /**
   * Get all jobs with filters
   */
  getAllJobs: async (filters: JobFilters = {}) => {
    const response = await api.get('/jobs', { params: filters });
    return response.data;
  },

  /**
   * Get job by ID
   */
  getJobById: async (id: string): Promise<Job> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data.data;
  },

  /**
   * Create new job (Employer only)
   */
  createJob: async (jobData: Partial<Job>) => {
    const response = await api.post('/jobs', jobData);
    return response.data.data;
  },

  /**
   * Update job (Employer only)
   */
  updateJob: async (id: string, jobData: Partial<Job>) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data.data;
  },

  /**
   * Delete job (Employer only)
   */
  deleteJob: async (id: string) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  /**
   * Update job status (Employer only)
   */
  updateJobStatus: async (id: string, status: string) => {
    const response = await api.patch(`/jobs/${id}/status`, { status });
    return response.data.data;
  },

  /**
   * Get my jobs (Employer only)
   */
  getMyJobs: async (page = 1, limit = 10, status?: string) => {
    const response = await api.get('/jobs/employer/my-jobs', {
      params: { page, limit, status },
    });
    return response.data;
  },

  /**
   * Get job applicants (Employer only)
   */
  getJobApplicants: async (jobId: string, page = 1, limit = 20, status?: string) => {
    const response = await api.get(`/jobs/${jobId}/applicants`, {
      params: { page, limit, status },
    });
    return response.data;
  },
};

export default jobService;
