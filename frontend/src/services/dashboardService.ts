import api from './api';

export interface DashboardData {
  stats?: any;
  recentApplications?: any[];
  unreadMessages?: number;
  profileCompletion?: number;
  recommendedJobs?: any[];
  totalJobs?: number;
  activeJobs?: number;
  totalApplications?: number;
  topJobs?: any[];
  scheduledInterviews?: number;
}

const dashboardService = {
  /**
   * Get job seeker dashboard data
   */
  getJobSeekerDashboard: async (): Promise<DashboardData> => {
    const response = await api.get('/dashboard/job-seeker');
    return response.data.data;
  },

  /**
   * Get employer dashboard data
   */
  getEmployerDashboard: async (): Promise<DashboardData> => {
    const response = await api.get('/dashboard/employer');
    return response.data.data;
  },
};

export default dashboardService;
