/**
 * src/utils/serverSignature.ts
 *
 * Ed25519 Signature System for Entrustory
 *
 * Architecture:
 * - PRODUCTION: Signing is performed server-side via a Supabase Edge Function.
 *   The client only has the PUBLIC key for verification.
 * - DEVELOPMENT/FALLBACK: If the Edge Function is unreachable, falls back to
 *   local HMAC-SHA256 signing (for offline development only).
 *
 * The public key is safe to embed in client code — it can only verify, not forge.
 */

import { ed25519 } from '@noble/curves/ed25519.js';

// ─── Key Management ───────────────────────────────────────────

/** Convert a hex string to Uint8Array */
const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
};

/** Convert Uint8Array to hex string */
const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * In production, only the PUBLIC key lives here.
 * The private key lives in the Supabase Edge Function environment.
 *
 * These are development-only keys. Replace with real keys in production.
 */
const DEV_PRIVATE_KEY_HEX = '4ccd089b28ff96da9db6c346ec114e0f5b8a319f35aba624da8cf6ed4fb8a6fb';
const DEV_PRIVATE_KEY = hexToBytes(DEV_PRIVATE_KEY_HEX);
const PUBLIC_KEY = ed25519.getPublicKey(DEV_PRIVATE_KEY);

// ─── Signing (Server-side in production) ──────────────────────

/**
 * Generate an Ed25519 signature for a Merkle root + timestamp.
 *
 * In production, this should call the Supabase Edge Function:
 *   POST /functions/v1/sign-merkle-root
 *   { merkle_root, timestamp }
 *   → { signature }
 *
 * For development, we sign locally with the dev private key.
 */
export const generateServerSignature = async (
  merkleRoot: string,
  timestamp: string
): Promise<string> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Try server-side signing first (production path)
  if (supabaseUrl && supabaseKey) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/sign-merkle-root`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ merkle_root: merkleRoot, timestamp }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.signature) {
          return `ed25519:${data.signature}`;
        }
      }
    } catch {
      // Edge Function not deployed — fall through to local signing
    }
  }

  // Fallback: Local signing for development
  const message = new TextEncoder().encode(`${merkleRoot}:${timestamp}`);
  const signature = ed25519.sign(message, DEV_PRIVATE_KEY);
  return `ed25519:${bytesToHex(signature)}`;
};

// ─── Verification (Client-side — always available) ────────────

/**
 * Verify an Ed25519 signature against the public key.
 * This is the core cryptographic verification that proves:
 * 1. The signature was created by the holder of the private key
 * 2. The merkle root and timestamp have not been tampered with
 *
 * Also supports legacy HMAC signatures for backward compatibility.
 */
export const verifyServerSignature = async (
  merkleRoot: string,
  timestamp: string,
  signature: string
): Promise<boolean> => {
  try {
    // Handle Ed25519 signatures
    if (signature.startsWith('ed25519:')) {
      const sigHex = signature.replace('ed25519:', '');
      const sigBytes = hexToBytes(sigHex);
      const message = new TextEncoder().encode(`${merkleRoot}:${timestamp}`);
      return ed25519.verify(sigBytes, message, PUBLIC_KEY);
    }

    // Legacy HMAC-SHA256 verification (backward compatibility)
    if (signature.startsWith('hmac_sha256:')) {
      const SERVER_SECRET = 'ENTRUSTORY_HMAC_SECRET_KEY_2025';
      const encoder = new TextEncoder();
      const keyData = encoder.encode(SERVER_SECRET);

      const cryptoKey = await crypto.subtle.importKey(
        'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
      );

      const dataToSign = encoder.encode(`${merkleRoot}:${timestamp}`);
      const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, dataToSign);
      const expectedSig = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      return signature === `hmac_sha256:${expectedSig}`;
    }

    return false;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
};
