// supabase/functions/sign-merkle-root/index.ts
//
// Supabase Edge Function for server-side Ed25519 signing.
// Deploy with: supabase functions deploy sign-merkle-root
//
// Required env vars (set via Supabase Dashboard → Edge Functions → Secrets):
//   ED25519_PRIVATE_KEY  — 64-char hex private key
//   ALLOWED_ORIGIN       — the deployed frontend's origin (e.g. https://entrustory.vercel.app),
//                          used for CORS. Falls back to '*' only if unset.
// SUPABASE_URL / SUPABASE_ANON_KEY are auto-injected by the Supabase runtime into every
// edge function — no need to set those manually.
//
// The private key NEVER leaves this function. Only the signature is returned.
//
// This function requires a valid Supabase auth JWT — without that, anyone who finds
// the function URL could call it directly and burn edge-function invocation quota
// for free, unrelated to actual app usage.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { ed25519 } from 'https://esm.sh/@noble/curves@1.3.0/ed25519';

const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') ?? '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Require a valid Supabase auth session — this is a signing oracle, not a
    // public utility, so anonymous callers must be rejected before any work is done.
    const authHeader = req.headers.get('Authorization');
    const jwt = authHeader?.replace(/^Bearer\s+/i, '');
    if (!jwt) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Server auth is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData, error: userError } = await authClient.auth.getUser(jwt);
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
