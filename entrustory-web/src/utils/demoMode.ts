/**
 * src/utils/demoMode.ts
 *
 * A single in-memory flag that decides whether `supabase` (utils/supabase.ts)
 * talks to the real project or to the in-memory mock client (utils/mockSupabase.ts).
 *
 * Turned on by ProtectedRoute (components/layout/AuthGuards.tsx) whenever a
 * visitor reaches /app/* without a real session, so they can click through the
 * whole authenticated app without ever touching real Supabase data or quota.
 */

let active = false;

export const isDemoMode = () => active;

export const setDemoMode = (value: boolean) => {
  active = value;
};
