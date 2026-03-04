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
