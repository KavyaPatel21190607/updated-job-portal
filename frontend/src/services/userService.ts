import api from './api';
import type { User } from './authService';

const userService = {
  /**
   * Get user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>) => {
    const response = await api.put('/users/profile', data);
    
    // Update user in localStorage
    localStorage.setItem('user', JSON.stringify(response.data.data));
    
    return response.data.data;
  },

  /**
   * Upload profile picture
   */
  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await api.post('/users/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Update user in localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.profilePicture = response.data.data.profilePicture;
    localStorage.setItem('user', JSON.stringify(user));

    return response.data.data;
  },

  /**
   * Upload resume (Job Seeker only)
   */
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await api.post('/users/profile/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Update user in localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.resume = response.data.data.resume;
    localStorage.setItem('user', JSON.stringify(user));

    return response.data.data;
  },

  /**
   * Upload company logo (Employer only)
   */
  uploadCompanyLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('companyLogo', file);

    const response = await api.post('/users/profile/company-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Update user in localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.companyLogo = response.data.data.companyLogo;
    localStorage.setItem('user', JSON.stringify(user));

    return response.data.data;
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  /**
   * Deactivate account
   */
  deactivateAccount: async () => {
    const response = await api.delete('/users/account');
    return response.data;
  },
};

export default userService;
