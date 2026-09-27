/**
 * src/utils/mockSupabase.ts
 *
 * A minimal stand-in for the Supabase JS client, used only in Demo Mode
 * (see utils/demoMode.ts). It implements just the chain shapes this app
 * actually calls — .from(table).select/eq/is/ilike/order/limit/single/
 * maybeSingle/insert/update/delete, plus storage upload/download and a
 * handful of auth methods — backed by the in-memory tables in mockData.ts.
 *
 * It is NOT a general PostgREST reimplementation: embeds (nested `select`
 * relations like `versions(version_tag)`) are resolved by a small explicit
 * map of the specific relations this app's pages actually request, not by
 * parsing arbitrary select strings.
 */

import { mockTables, DEMO_USER_ID, type MockTableName } from './mockData';

type Row = Record<string, any>;

function getPath(row: Row, col: string): unknown {
  if (col.includes('->>')) {
    const [field, key] = col.split('->>');
    return (row[field] as Record<string, unknown> | null)?.[key] ?? '';
  }
  return row[col];
}

/** Resolves the handful of embedded relations this app's pages actually select. */
function attachEmbeds(table: MockTableName, row: Row, selectStr: string): Row {
  const out: Row = { ...row };

  if (table === 'work_items' && selectStr.includes('versions')) {
    let versions = mockTables.versions.filter((v) => v.work_item_id === row.id);
    if (selectStr.includes('evidence_hashes')) {
      versions = versions.map((v) => ({
        ...v,
        evidence_hashes: mockTables.evidence_hashes.filter((e) => e.version_id === v.id),
      })) as typeof versions;
    } else if (!selectStr.includes('*')) {
      versions = versions.map((v) => ({ version_tag: v.version_tag })) as typeof versions;
    }
    out.versions = versions;
  }

  if (table === 'versions') {
    if (selectStr.includes('work_items')) {
      out.work_items = mockTables.work_items.find((w) => w.id === row.work_item_id) ?? null;
    }
    if (selectStr.includes('evidence_hashes')) {
      out.evidence_hashes = mockTables.evidence_hashes.filter((e) => e.version_id === row.id);
    }
  }

  if (table === 'evidence_hashes' && selectStr.includes('versions')) {
    out.versions = mockTables.versions.find((v) => v.id === row.version_id) ?? null;
  }

  if (table === 'workspace_members' && selectStr.includes('workspaces')) {
    out.workspaces = mockTables.workspaces.find((w) => w.id === row.workspace_id) ?? null;
  }

  return out;
}

class MockQueryBuilder<T = any> implements PromiseLike<{ data: T; error: null | { message: string }; count: number | null }> {
  private table: MockTableName;
  private filters: Array<(row: Row) => boolean> = [];
  private selectStr = '*';
  private countMode = false;
  private headOnly = false;
  private orderCol: string | null = null;
  private orderAsc = true;
  private limitN: number | null = null;
  private singleMode: 'single' | 'maybeSingle' | null = null;
  private op: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private payload: Row[] | Row | null = null;

  constructor(table: MockTableName) {
    this.table = table;
  }

  select(cols?: string, opts?: { count?: 'exact'; head?: boolean }) {
    this.selectStr = cols ?? '*';
    if (opts?.count === 'exact') this.countMode = true;
    if (opts?.head) this.headOnly = true;
    return this;
  }

  eq(col: string, val: unknown) {
    if (col.includes('.')) {
      // e.g. 'versions.created_by' — filter evidence_hashes by its related version's field.
      const [relTable, relCol] = col.split('.') as [MockTableName, string];
      this.filters.push((row) => {
        const fkField = `${relTable.slice(0, -1)}_id`;
        const related = (mockTables[relTable] as Row[]).find((r) => r.id === row[fkField]);
        return related ? related[relCol] === val : false;
      });
    } else {
      this.filters.push((row) => row[col] === val);
    }
    return this;
  }

  is(col: string, val: null | boolean) {
    this.filters.push((row) => row[col] === val);
    return this;
  }

  ilike(col: string, pattern: string) {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*');
    const regex = new RegExp(`^${escaped}$`, 'i');
    this.filters.push((row) => regex.test(String(getPath(row, col) ?? '')));
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    this.orderCol = col;
    this.orderAsc = opts?.ascending ?? true;
    return this;
  }

  limit(n: number) {
    this.limitN = n;
    return this;
  }

  single() {
    this.singleMode = 'single';
    return this;
  }

  maybeSingle() {
    this.singleMode = 'maybeSingle';
    return this;
  }

  insert(rows: Row[]) {
    this.op = 'insert';
    this.payload = rows;
    return this;
  }

  update(patch: Row) {
    this.op = 'update';
    this.payload = patch;
    return this;
  }

  delete() {
    this.op = 'delete';
    return this;
  }

  private execute() {
    const table = mockTables[this.table] as Row[];

    if (this.op === 'insert') {
      const rows = (this.payload as Row[]).map((row) => ({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...row,
      }));
      table.push(...rows);
      return { data: this.singleMode ? rows[0] : rows, error: null, count: null };
    }

    if (this.op === 'update') {
      const updated: Row[] = [];
      for (const row of table) {
        if (this.filters.every((f) => f(row))) {
          Object.assign(row, this.payload);
          updated.push(row);
        }
      }
      return { data: updated, error: null, count: null };
    }

    if (this.op === 'delete') {
      const remaining = table.filter((r) => !this.filters.every((f) => f(r)));
      const removed = table.length - remaining.length;
      (mockTables as any)[this.table] = remaining;
      return { data: null, error: null, count: removed };
    }

    // select
    let rows = table.filter((r) => this.filters.every((f) => f(r)));

    if (this.countMode && this.headOnly) {
      return { data: null, error: null, count: rows.length };
    }

    if (this.orderCol) {
      const col = this.orderCol;
      const dir = this.orderAsc ? 1 : -1;
      rows = [...rows].sort((a, b) => (a[col] > b[col] ? dir : a[col] < b[col] ? -dir : 0));
    }
    if (this.limitN != null) rows = rows.slice(0, this.limitN);

    rows = rows.map((r) => attachEmbeds(this.table, r, this.selectStr));

    if (this.singleMode === 'single') {
      return rows[0]
        ? { data: rows[0], error: null, count: null }
        : { data: null, error: { message: 'No rows found' }, count: null };
    }
    if (this.singleMode === 'maybeSingle') {
      return { data: rows[0] ?? null, error: null, count: null };
    }
    return { data: rows, error: null, count: rows.length };
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }
}

const DEMO_USER = {
  id: DEMO_USER_ID,
  email: 'demo@entrustory.app',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as any;

export const mockSupabaseClient = {
  from(table: string) {
    return new MockQueryBuilder(table as MockTableName);
  },
  storage: {
    from(_bucket: string) {
      return {
        upload: async (path: string) => ({ data: { path }, error: null }),
        download: async () => ({ data: new Blob(['demo file contents — nothing is stored for real in Demo Mode']), error: null }),
        listBuckets: async () => ({ data: [{ id: 'vault', name: 'vault' }], error: null }),
      };
    },
  },
  auth: {
    getSession: async () => ({ data: { session: { user: DEMO_USER, access_token: 'demo-token' } }, error: null }),
    getUser: async () => ({ data: { user: DEMO_USER }, error: null }),
    onAuthStateChange: (_cb: unknown) => ({ data: { subscription: { unsubscribe() {} } } }),
    signOut: async () => ({ error: null }),
    signInWithPassword: async () => ({
      data: { session: null, user: null },
      error: { message: 'Demo mode — sign in with a real account instead.' },
    }),
  },
};
