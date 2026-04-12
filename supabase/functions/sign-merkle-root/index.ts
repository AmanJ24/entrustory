// supabase/functions/sign-merkle-root/index.ts
//
// Supabase Edge Function for server-side Ed25519 signing.
// Deploy with: supabase functions deploy sign-merkle-root
//
// Required env vars (set via Supabase Dashboard → Edge Functions → Secrets):
//   ED25519_PRIVATE_KEY  — 64-char hex private key
//
// The private key NEVER leaves this function. Only the signature is returned.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { ed25519 } from 'https://esm.sh/@noble/curves@1.3.0/ed25519';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const privateKeyHex = Deno.env.get('ED25519_PRIVATE_KEY');
    if (!privateKeyHex) {
      return new Response(
        JSON.stringify({ error: 'Server signing key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { merkle_root, timestamp } = await req.json();

    if (!merkle_root || !timestamp) {
      return new Response(
        JSON.stringify({ error: 'Missing merkle_root or timestamp' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sign the message: "merkle_root:timestamp"
    const message = new TextEncoder().encode(`${merkle_root}:${timestamp}`);
    const privateKey = hexToBytes(privateKeyHex);
    const signature = ed25519.sign(message, privateKey);
    const signatureHex = bytesToHex(signature);

    return new Response(
      JSON.stringify({
        signature: signatureHex,
        public_key: bytesToHex(ed25519.getPublicKey(privateKey)),
        algorithm: 'ed25519',
        signed_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Signing failed', details: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
