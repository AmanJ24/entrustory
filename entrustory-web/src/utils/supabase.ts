import { createClient } from '@supabase/supabase-js';
import { isDemoMode } from './demoMode';
import { mockSupabaseClient } from './mockSupabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

const realClient = createClient(supabaseUrl, supabaseAnonKey);

// Demo Mode (see components/layout/AuthGuards.tsx) transparently swaps every
// call here onto an in-memory mock client instead of the real project, so a
// visitor exploring /app/* without an account can click through the whole
// app live without ever touching real data, storage or quota.
export const supabase = new Proxy(realClient, {
  get(target, prop) {
    const client: any = isDemoMode() ? mockSupabaseClient : target;
    const value = Reflect.get(client, prop, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
}) as typeof realClient;
