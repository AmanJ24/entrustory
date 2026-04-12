/**
 * src/utils/crypto.ts
 * Core cryptographic functions for Entrustory Client-Side Hashing Engine.
 */

export const calculateFileHash = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Track reading progress (useful for larger files)
    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        onProgress(percentage);
      }
    };

    reader.onerror = (err) => reject(err);

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        
        // Use the native Web Crypto API for SHA-256
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        
        // Convert the raw buffer to a hex string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        resolve(hashHex);
      } catch (err) {
        reject(err);
      }
    };

    // Read the file as an ArrayBuffer
    reader.readAsArrayBuffer(file);
  });
};

// --- AES-256-GCM ZERO-KNOWLEDGE ENCRYPTION ---

const PBKDF2_ITERATIONS = 100000;
const SALT_SIZE = 16;
const IV_SIZE = 12;

// Helper to derive a strong AES key from a string password
const deriveKey = async (password: string, salt: Uint8Array, keyUsage: KeyUsage[]) => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as any, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    keyUsage
  );
};

export const encryptFile = async (file: File, password: string): Promise<Blob> => {
  // 1. Generate random Salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_SIZE));
  const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE));
  
  // 2. Derive Key & Read File
  const key = await deriveKey(password, salt, ["encrypt"]);
  const fileBuffer = await file.arrayBuffer();
  
  // 3. Encrypt the file data
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    fileBuffer
  );
  
  // 4. Pack Salt + IV + Ciphertext into a single Blob
  const payload = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
  payload.set(salt, 0);
  payload.set(iv, salt.length);
  payload.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);
  
  return new Blob([payload], { type: 'application/octet-stream' });
};

export const decryptFile = async (encryptedBlob: Blob, password: string): Promise<Blob> => {
  const payloadBuffer = await encryptedBlob.arrayBuffer();
  
  // 1. Extract Salt, IV, and Ciphertext from the packed blob
  const salt = new Uint8Array(payloadBuffer.slice(0, SALT_SIZE));
  const iv = new Uint8Array(payloadBuffer.slice(SALT_SIZE, SALT_SIZE + IV_SIZE));
  const ciphertext = payloadBuffer.slice(SALT_SIZE + IV_SIZE);
  
  // 2. Derive Key
  const key = await deriveKey(password, salt, ["decrypt"]);
  
  // 3. Decrypt (Will throw an error if password is wrong)
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  
  return new Blob([decryptedBuffer]);
};
