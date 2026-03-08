// src/utils/serverSignature.ts

// Simulated Server Private Key (In production, this lives in a secure backend .env)
const SERVER_SECRET = "entrustory_super_secret_master_key_2026";

// Helper to convert buffer to hex string
const bufferToHex = (buffer: ArrayBuffer) => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Simulates a backend endpoint that signs the data with the Server's Private Key.
 */
export const generateServerSignature = async (merkleRoot: string) => {
  const timestamp = new Date().toISOString();
  const message = `${merkleRoot}|${timestamp}`;
  const encoder = new TextEncoder();
  
  // Import the secret key for HMAC
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SERVER_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Sign the message
  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  
  return {
    signature: `hmac_sha256_${bufferToHex(signatureBuffer)}`,
    timestamp
  };
};

/**
 * Mathematical verification of the signature (Used on the Verifier Page)
 */
export const verifyServerSignature = async (merkleRoot: string, timestamp: string, signature: string) => {
  try {
    const message = `${merkleRoot}|${timestamp}`;
    const encoder = new TextEncoder();
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SERVER_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Extract the raw hex from our formatted string (remove "hmac_sha256_")
    const rawSignatureHex = signature.replace('hmac_sha256_', '');
    
    // Convert hex back to Uint8Array
    const signatureBytes = new Uint8Array(rawSignatureHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    // Verify
    const isValid = await crypto.subtle.verify("HMAC", cryptoKey, signatureBytes, encoder.encode(message));
    return isValid;
  } catch (e) {
    return false;
  }
};
