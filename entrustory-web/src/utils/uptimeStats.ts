/**
 * src/utils/uptimeStats.ts
 *
 * Turns the raw uptime_checks history (logged every 30 min by
 * .github/workflows/keepalive.yml) into the numbers /status and the
 * homepage actually display: a 90-day daily chart and an uptime %.
 *
 * Tracking started from scratch when this shipped — there is no real
 * history before that, so days before the first logged check render as
 * "no-data" rather than a fabricated bar. The 90-day window fills in from
 * today backward as real days accumulate, and only becomes a genuine
 * rolling 90-day window once 90 real days exist.
 */

import { supabase } from './supabase';
import type { UptimeCheck } from '../types';

export type DayStatus = 'operational' | 'degraded' | 'down' | 'no-data';

export interface UptimeSummary {
  /** null until at least one check has ever been logged. */
  uptimePct: number | null;
  latestLatencyMs: number | null;
  /** Always 90 entries, oldest first, today last. */
  dailyBars: DayStatus[];
}

const WINDOW_DAYS = 90;
const dayKey = (iso: string) => iso.slice(0, 10); // YYYY-MM-DD (UTC)

const worstOf = (a: DayStatus, b: DayStatus): DayStatus => {
  const rank: Record<DayStatus, number> = { 'no-data': 0, operational: 1, degraded: 2, down: 3 };
  return rank[b] > rank[a] ? b : a;
};

export async function fetchUptimeSummary(): Promise<UptimeSummary> {
  // ~48 checks/day at a 30-minute interval; comfortably covers the 90-day window.
  const { data } = await supabase
    .from('uptime_checks')
    .select('checked_at, status, latency_ms')
    .order('checked_at', { ascending: false })
    .limit(5000);

  const checks = (data ?? []) as Pick<UptimeCheck, 'checked_at' | 'status' | 'latency_ms'>[];

  if (checks.length === 0) {
    return { uptimePct: null, latestLatencyMs: null, dailyBars: Array(WINDOW_DAYS).fill('no-data') };
  }

  const byDay = new Map<string, DayStatus>();
  for (const c of checks) {
    const key = dayKey(c.checked_at);
    byDay.set(key, worstOf(byDay.get(key) ?? 'no-data', c.status));
  }

  const today = new Date();
  const bars: DayStatus[] = [];
  for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    bars.push(byDay.get(dayKey(d.toISOString())) ?? 'no-data');
  }

  const upCount = checks.filter((c) => c.status !== 'down').length;
  const uptimePct = Math.round((upCount / checks.length) * 10000) / 100;

  return {
    uptimePct,
    latestLatencyMs: checks[0].latency_ms,
    dailyBars: bars,
  };
}
