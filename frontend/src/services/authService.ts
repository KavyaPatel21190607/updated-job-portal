import api from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'job_seeker' | 'employer';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'job_seeker' | 'employer' | 'admin';
  profilePicture?: string;
  phone?: string;
  
  // Job Seeker Specific Fields
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: any[];
  education?: any[];
  resume?: {
    filename: string;
    path: string;
    uploadedAt: Date;
  };
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
  };
  preferences?: {
    desiredRole?: string;
    expectedSalary?: string;
    preferredLocations?: string[];
    jobTypes?: string[];
    workTypes?: string[];
  };
  
  // Employer Specific Fields
  companyName?: string;
  companyLogo?: string;
  companyDescription?: string;
  companyWebsite?: string;
  companyLocation?: string;
  companyDetails?: {
    industry?: string;
    companySize?: string;
    website?: string;
    founded?: number;
    description?: string;
    headquarters?: string;
    otherLocations?: string[];
  };
  
  profileCompletion?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    
    // Store tokens and user in localStorage
    const { accessToken, refreshToken, user } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data.data;
  },

  /**
   * Login user
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    
    // Store tokens and user in localStorage
    const { accessToken, refreshToken, user } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      // Clear local storage but KEEP encryption keys so old messages remain accessible
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Note: e2ee_private_key and e2ee_public_key are intentionally NOT cleared
      // to maintain access to previously encrypted messages
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    
    // Update user in localStorage
    localStorage.setItem('user', JSON.stringify(response.data.data));
    
    return response.data.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<{ accessToken: string; refreshToken: string }> => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/refresh', { refreshToken });
    
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    
    return response.data.data;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!token && !!user;
  },

  /**
   * Get user from localStorage
   */
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Handle Google OAuth callback
   */
  handleGoogleCallback: (token: string, refresh: string, user: User) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('user', JSON.stringify(user));
  },
};

export default authService;
