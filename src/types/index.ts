/**
 * src/types/index.ts
 * Shared TypeScript interfaces for the Entrustory platform.
 * These mirror the Supabase database schema and provide type safety across all components.
 */

// ─── Core Domain Models ───────────────────────────────────────

export interface Workspace {
  id: string;
  name: string;
  created_at: string;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  email?: string;
  role: string;
  public_key_fingerprint: string | null;
  joined_at: string;
}

export interface WorkItem {
  id: string;
  name: string;
  workspace_id: string;
  created_by: string;
  created_at: string;
  versions?: Version[];
}

export interface Version {
  id: string;
  work_item_id: string;
  version_tag: string;
  merkle_root: string;
  server_signature: string;
  blockchain_anchor_id: string | null;
  created_at: string;
  created_by: string;
  evidence_hashes?: EvidenceHash[];
}

export interface EvidenceHash {
  id: string;
  version_id: string;
  file_name: string;
  file_size: number;
  sha256_hash: string;
  storage_path: string | null;
  is_encrypted: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  workspace_id: string;
  actor_id: string;
  action_type: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_value: string;
  user_id: string;
  workspace_id: string;
  created_at: string;
}

export interface BlockchainAnchor {
  id: string;
  super_merkle_root: string;
  transaction_hash: string;
  created_at: string;
}

// ─── Derived / View Models ────────────────────────────────────

/** Flattened view used by the Export Center page. */
export interface ExportItem {
  id: string;
  work_item_name: string;
  version_tag: string;
  created_at: string;
  merkle_root: string;
  server_signature: string;
  file_name: string;
  file_size: number;
  sha256_hash: string;
}

/** Workspace summary shown in the app header. */
export interface WorkspaceData {
  name: string;
  role: string;
}

// ─── Dashboard-specific models ────────────────────────────────

/** Simplified WorkItem used on the Dashboard page (with nested version tags). */
export interface DashboardWorkItem {
  id: string;
  name: string;
  created_at: string;
  versions: { version_tag: string }[];
}
