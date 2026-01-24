import api from './api';

/**
 * API service for encryption key management
 */

const encryptionService = {
  /**
   * Update user's public key on the server
   */
  updatePublicKey: async (publicKey: string) => {
    const response = await api.put('/users/public-key', { publicKey });
    return response.data;
  },

  /**
   * Get another user's public key for encryption
   */
  getPublicKey: async (userId: string) => {
    const response = await api.get(`/users/${userId}/public-key`);
    return response.data;
  },
};

export default encryptionService;
