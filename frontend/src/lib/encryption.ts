/**
 * End-to-End Encryption utilities using Web Crypto API
 * Messages are encrypted with recipient's public key and can only be decrypted with their private key
 */

const ALGORITHM = {
  name: 'RSA-OAEP',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
};

/**
 * Generate a new RSA key pair for a user
 */
export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  const keyPair = await window.crypto.subtle.generateKey(
    ALGORITHM,
    true,
    ['encrypt', 'decrypt']
  );

  const publicKey = await exportKey(keyPair.publicKey);
  const privateKey = await exportKey(keyPair.privateKey);

  return { publicKey, privateKey };
}

/**
 * Export a CryptoKey to base64 string
 */
async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey(
    key.type === 'public' ? 'spki' : 'pkcs8',
    key
  );
  const exportedAsString = String.fromCharCode(...new Uint8Array(exported));
  return btoa(exportedAsString);
}

/**
 * Import a base64 key string to CryptoKey
 */
async function importKey(keyString: string, type: 'public' | 'private'): Promise<CryptoKey> {
  const binaryString = atob(keyString);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return await window.crypto.subtle.importKey(
    type === 'public' ? 'spki' : 'pkcs8',
    bytes,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    type === 'public' ? ['encrypt'] : ['decrypt']
  );
}

/**
 * Encrypt a message with recipient's public key
 */
export async function encryptMessage(message: string, publicKeyString: string): Promise<string> {
  try {
    console.log('Encrypting message, length:', message.length);
    console.log('Public key (first 50 chars):', publicKeyString.substring(0, 50));
    const publicKey = await importKey(publicKeyString, 'public');
    const encoded = new TextEncoder().encode(message);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      encoded
    );
    
    const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    console.log('Encryption successful, encrypted length:', encryptedBase64.length);
    return encryptedBase64;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * Decrypt a message with own private key
 */
export async function decryptMessage(encryptedMessage: string, privateKeyString: string): Promise<string> {
  try {
    console.log('Decrypting message, encrypted length:', encryptedMessage.length);
    console.log('Private key (first 50 chars):', privateKeyString.substring(0, 50));
    const privateKey = await importKey(privateKeyString, 'private');
    const encryptedBytes = new Uint8Array(
      atob(encryptedMessage).split('').map(c => c.charCodeAt(0))
    );
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      encryptedBytes
    );
    
    const decryptedText = new TextDecoder().decode(decrypted);
    console.log('Decryption successful, message:', decryptedText);
    return decryptedText;
  } catch (error) {
    console.error('Decryption error details:', error);
    console.error('Encrypted message (first 100 chars):', encryptedMessage.substring(0, 100));
    return '[Encrypted message - unable to decrypt]';
  }
}

/**
 * Store private key in browser's localStorage (secure storage)
 */
export function storePrivateKey(privateKey: string): void {
  localStorage.setItem('e2ee_private_key', privateKey);
}

/**
 * Retrieve private key from localStorage
 */
export function getPrivateKey(): string | null {
  return localStorage.getItem('e2ee_private_key');
}

/**
 * Store public key in localStorage for quick access
 */
export function storePublicKey(publicKey: string): void {
  localStorage.setItem('e2ee_public_key', publicKey);
}

/**
 * Retrieve public key from localStorage
 */
export function getPublicKey(): string | null {
  return localStorage.getItem('e2ee_public_key');
}

/**
 * Clear encryption keys (on logout)
 */
export function clearKeys(): void {
  localStorage.removeItem('e2ee_private_key');
  localStorage.removeItem('e2ee_public_key');
}

/**
 * Initialize encryption for a user (generate keys if not exists)
 */
export async function initializeEncryption(): Promise<{ publicKey: string; privateKey: string }> {
  let publicKey = getPublicKey();
  let privateKey = getPrivateKey();

  if (!publicKey || !privateKey) {
    const keys = await generateKeyPair();
    storePublicKey(keys.publicKey);
    storePrivateKey(keys.privateKey);
    return keys;
  }

  return { publicKey, privateKey };
}
