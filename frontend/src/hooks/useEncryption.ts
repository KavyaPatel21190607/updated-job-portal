import { useEffect, useState } from 'react';
import {
  initializeEncryption,
  getPublicKey,
  clearKeys,
} from '@/lib/encryption';
import encryptionService from '@/services/encryptionService';

/**
 * Hook to initialize and manage end-to-end encryption for the current user
 */
export function useEncryption() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Check if keys already exist
        let publicKey = getPublicKey();

        if (!publicKey) {
          console.log('No encryption keys found, generating new ones...');
          // Generate new keys
          const keys = await initializeEncryption();
          publicKey = keys.publicKey;
        } else {
          console.log('Existing encryption keys found');
        }

        // Always upload public key to server to ensure it's synced
        console.log('Uploading public key to server...');
        await encryptionService.updatePublicKey(publicKey);
        console.log('Public key uploaded successfully');

        setIsInitialized(true);
      } catch (err: any) {
        console.error('Encryption initialization error:', err);
        setError(err.message || 'Failed to initialize encryption');
        setIsInitialized(true); // Still mark as initialized to not block UI
      }
    };

    init();
  }, []);

  const reinitialize = async () => {
    try {
      // Clear existing keys
      clearKeys();
      
      // Generate new keys
      const keys = await initializeEncryption();
      
      // Upload public key to server
      await encryptionService.updatePublicKey(keys.publicKey);
      
      setIsInitialized(true);
      setError(null);
    } catch (err: any) {
      console.error('Encryption reinitialization error:', err);
      setError(err.message || 'Failed to reinitialize encryption');
    }
  };

  return { isInitialized, error, reinitialize };
}
