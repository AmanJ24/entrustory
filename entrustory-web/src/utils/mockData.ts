/**
 * src/utils/mockData.ts
 *
 * Seed data for Demo Mode (see utils/demoMode.ts, utils/mockSupabase.ts).
 * One fake workspace with a handful of work items — several with a real
 * multi-version history — plus evidence hashes, audit log entries, an API
 * key and a blockchain anchor, so every page renders something realistic
 * without a real account.
 *
 * IDs are generated with crypto.randomUUID() at module load (not literal
 * strings like "demo-wi-1") because the app derives the on-screen "Record
 * ID" from the first hyphen-segment of a row's id (see Workspace.tsx) — a
 * literal "demo-" prefix would visibly print "DEMO" on the page.
 *
 * `resetMockData()` restores this to its pristine state; called each time a
 * visitor freshly enters demo mode, so leftover writes from a previous demo
 * session don't leak into the next one.
 */

import type {
  Workspace,
  WorkspaceMember,
  WorkItem,
  Version,
  EvidenceHash,
  AuditLog,
  ApiKey,
  BlockchainAnchor,
} from '../types';

export const DEMO_USER_ID = crypto.randomUUID();
export const DEMO_WORKSPACE_ID = crypto.randomUUID();

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

const randomHex = (len: number): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(Math.ceil(len / 2)));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').slice(0, len);
};

// Stable per-session ids for the rows other tables need to reference.
const WI_BRAND = crypto.randomUUID();
const WI_CONTRACT = crypto.randomUUID();
const WI_RELEASE = crypto.randomUUID();
const WI_DECK = crypto.randomUUID();

const V_BRAND_1 = crypto.randomUUID();
const V_BRAND_2 = crypto.randomUUID();
const V_BRAND_3 = crypto.randomUUID();
const V_CONTRACT_1 = crypto.randomUUID();
const V_CONTRACT_2 = crypto.randomUUID();
const V_CONTRACT_3 = crypto.randomUUID();
const V_RELEASE_1 = crypto.randomUUID();
const V_RELEASE_2 = crypto.randomUUID();
const V_DECK_1 = crypto.randomUUID();

const ANCHOR_1 = crypto.randomUUID();

const freshWorkspaces = (): Workspace[] => [
  { id: DEMO_WORKSPACE_ID, name: 'Coastline Media', created_at: daysAgo(60) },
];

const freshMembers = (): WorkspaceMember[] => [
  {
    workspace_id: DEMO_WORKSPACE_ID,
    user_id: DEMO_USER_ID,
    email: 'morgan@coastlinemedia.co',
    role: 'owner',
    public_key_fingerprint: null,
    joined_at: daysAgo(60),
  },
];

const freshWorkItems = (): WorkItem[] => [
  { id: WI_BRAND, name: 'brand-guidelines.pdf', workspace_id: DEMO_WORKSPACE_ID, created_by: DEMO_USER_ID, created_at: daysAgo(26) },
  { id: WI_CONTRACT, name: 'master-services-agreement.docx', workspace_id: DEMO_WORKSPACE_ID, created_by: DEMO_USER_ID, created_at: daysAgo(15) },
  { id: WI_RELEASE, name: 'release-notes-2.3.0.zip', workspace_id: DEMO_WORKSPACE_ID, created_by: DEMO_USER_ID, created_at: daysAgo(4) },
  { id: WI_DECK, name: 'q3-partner-deck.pdf', workspace_id: DEMO_WORKSPACE_ID, created_by: DEMO_USER_ID, created_at: daysAgo(1) },
];

// A real version-control chain: brand-guidelines and the MSA each went through
// several real revisions before settling, not just one file.
const freshVersions = (): Version[] => [
  { id: V_BRAND_1, work_item_id: WI_BRAND, version_tag: 'v1.0', merkle_root: randomHex(64), server_signature: `ed25519:${randomHex(128)}`, blockchain_anchor_id: ANCHOR_1, created_at: daysAgo(26), created_by: DEMO_USER_ID },
  { id: V_BRAND_2, work_item_id: WI_BRAND, version_tag: 'v1.1', merkle_root: randomHex(64), server_signature: `ed25519:${randomHex(128)}`, blockchain_anchor_id: null, created_at: daysAgo(19), created_by: DEMO_USER_ID },
  { id: V_BRAND_3, work_item_id: WI_BRAND, version_tag: 'v2.0', merkle_root: randomHex(64), server_signature: `ed25519:${randomHex(128)}`, blockchain_anchor_id: null, created_at: daysAgo(9), created_by: DEMO_USER_ID },
  { id: V_CONTRACT_1, work_item_id: WI_CONTRACT, version_tag: 'v1.0', merkle_root: randomHex(64), server_signature: `ed25519:${randomHex(128)}`, blockchain_anchor_id: null, created_at: daysAgo(15), created_by: DEMO_USER_ID },
  { id: V_CONTRACT_2, work_item_id: WI_CONTRACT, version_tag: 'v1.1', merkle_root: randomHex(64), server_signature: `ed25519:${randomHex(128)}`, blockchain_anchor_id: null, created_at: daysAgo(11), created_by: DEMO_USER_ID },
  { id: V_CONTRACT_3, work_item_id: WI_CONTRACT, version_tag: 'v1.2', merkle_root: randomHex(64), server_signature: `ed25519:${randomHex(128)}`, blockchain_anchor_id: null, created_at: daysAgo(7), created_by: DEMO_USER_ID },
  { id: V_RELEASE_1, work_item_id: WI_RELEASE, version_tag: 'v1.0', merkle_root: randomHex(64), server_signature: `ed25519:${randomHex(128)}`, blockchain_anchor_id: null, created_at: daysAgo(4), created_by: DEMO_USER_ID },
  { id: V_RELEASE_2, work_item_id: WI_RELEASE, version_tag: 'v1.1', merkle_root: randomHex(64), server_signature: `ed25519:${randomHex(128)}`, blockchain_anchor_id: null, created_at: daysAgo(2), created_by: DEMO_USER_ID },
  { id: V_DECK_1, work_item_id: WI_DECK, version_tag: 'v1.0', merkle_root: randomHex(64), server_signature: `ed25519:${randomHex(128)}`, blockchain_anchor_id: null, created_at: daysAgo(1), created_by: DEMO_USER_ID },
];

const freshEvidence = (): EvidenceHash[] => [
  { id: crypto.randomUUID(), version_id: V_BRAND_1, file_name: 'brand-guidelines.pdf', file_size: 3_112_884, sha256_hash: randomHex(64), storage_path: null, is_encrypted: false, created_at: daysAgo(26) },
  { id: crypto.randomUUID(), version_id: V_BRAND_2, file_name: 'brand-guidelines.pdf', file_size: 3_244_010, sha256_hash: randomHex(64), storage_path: null, is_encrypted: false, created_at: daysAgo(19) },
  { id: crypto.randomUUID(), version_id: V_BRAND_3, file_name: 'brand-guidelines.pdf', file_size: 4_018_552, sha256_hash: randomHex(64), storage_path: null, is_encrypted: false, created_at: daysAgo(9) },
  { id: crypto.randomUUID(), version_id: V_CONTRACT_1, file_name: 'master-services-agreement.docx', file_size: 82_010, sha256_hash: randomHex(64), storage_path: null, is_encrypted: true, created_at: daysAgo(15) },
  { id: crypto.randomUUID(), version_id: V_CONTRACT_2, file_name: 'master-services-agreement.docx', file_size: 85_446, sha256_hash: randomHex(64), storage_path: null, is_encrypted: true, created_at: daysAgo(11) },
  { id: crypto.randomUUID(), version_id: V_CONTRACT_3, file_name: 'master-services-agreement.docx', file_size: 88_921, sha256_hash: randomHex(64), storage_path: null, is_encrypted: true, created_at: daysAgo(7) },
  { id: crypto.randomUUID(), version_id: V_RELEASE_1, file_name: 'release-notes-2.3.0.zip', file_size: 12_402_119, sha256_hash: randomHex(64), storage_path: null, is_encrypted: false, created_at: daysAgo(4) },
  { id: crypto.randomUUID(), version_id: V_RELEASE_2, file_name: 'release-notes-2.3.0.zip', file_size: 12_558_760, sha256_hash: randomHex(64), storage_path: null, is_encrypted: false, created_at: daysAgo(2) },
  { id: crypto.randomUUID(), version_id: V_DECK_1, file_name: 'q3-partner-deck.pdf', file_size: 2_209_441, sha256_hash: randomHex(64), storage_path: null, is_encrypted: false, created_at: daysAgo(1) },
];

const freshAuditLogs = (): AuditLog[] => [
  { id: crypto.randomUUID(), workspace_id: DEMO_WORKSPACE_ID, actor_id: DEMO_USER_ID, action_type: 'workitem_created', resource_id: WI_DECK, details: { message: 'q3-partner-deck.pdf anchored to the ledger' }, created_at: daysAgo(1) },
  { id: crypto.randomUUID(), workspace_id: DEMO_WORKSPACE_ID, actor_id: DEMO_USER_ID, action_type: 'version_created', resource_id: WI_RELEASE, details: { message: 'release-notes-2.3.0.zip — new version v1.1 published' }, created_at: daysAgo(2) },
  { id: crypto.randomUUID(), workspace_id: DEMO_WORKSPACE_ID, actor_id: DEMO_USER_ID, action_type: 'workitem_created', resource_id: WI_RELEASE, details: { message: 'release-notes-2.3.0.zip anchored to the ledger' }, created_at: daysAgo(4) },
  { id: crypto.randomUUID(), workspace_id: DEMO_WORKSPACE_ID, actor_id: DEMO_USER_ID, action_type: 'version_created', resource_id: WI_CONTRACT, details: { message: 'master-services-agreement.docx — new version v1.2 published' }, created_at: daysAgo(7) },
  { id: crypto.randomUUID(), workspace_id: DEMO_WORKSPACE_ID, actor_id: DEMO_USER_ID, action_type: 'version_created', resource_id: WI_CONTRACT, details: { message: 'master-services-agreement.docx — new version v1.1 published' }, created_at: daysAgo(11) },
  { id: crypto.randomUUID(), workspace_id: DEMO_WORKSPACE_ID, actor_id: DEMO_USER_ID, action_type: 'workitem_created', resource_id: WI_CONTRACT, details: { message: 'master-services-agreement.docx anchored to the ledger' }, created_at: daysAgo(15) },
  { id: crypto.randomUUID(), workspace_id: DEMO_WORKSPACE_ID, actor_id: DEMO_USER_ID, action_type: 'version_created', resource_id: WI_BRAND, details: { message: 'brand-guidelines.pdf — new version v2.0 published (major revision)' }, created_at: daysAgo(9) },
  { id: crypto.randomUUID(), workspace_id: DEMO_WORKSPACE_ID, actor_id: DEMO_USER_ID, action_type: 'version_created', resource_id: WI_BRAND, details: { message: 'brand-guidelines.pdf — new version v1.1 published' }, created_at: daysAgo(19) },
  { id: crypto.randomUUID(), workspace_id: DEMO_WORKSPACE_ID, actor_id: DEMO_USER_ID, action_type: 'workitem_created', resource_id: WI_BRAND, details: { message: 'brand-guidelines.pdf anchored to the ledger' }, created_at: daysAgo(26) },
];

const freshApiKeys = (): ApiKey[] => [
  { id: crypto.randomUUID(), name: 'CI Pipeline', key_value: `pk_live_${randomHex(32)}`, user_id: DEMO_USER_ID, workspace_id: DEMO_WORKSPACE_ID, created_at: daysAgo(20) },
];

const freshAnchors = (): BlockchainAnchor[] => [
  { id: ANCHOR_1, super_merkle_root: randomHex(64), transaction_hash: `0x${randomHex(64)}`, created_at: daysAgo(24) },
];

export const mockTables: {
  workspaces: Workspace[];
  workspace_members: WorkspaceMember[];
  work_items: WorkItem[];
  versions: Version[];
  evidence_hashes: EvidenceHash[];
  audit_logs: AuditLog[];
  api_keys: ApiKey[];
  blockchain_anchors: BlockchainAnchor[];
} = {
  workspaces: freshWorkspaces(),
  workspace_members: freshMembers(),
  work_items: freshWorkItems(),
  versions: freshVersions(),
  evidence_hashes: freshEvidence(),
  audit_logs: freshAuditLogs(),
  api_keys: freshApiKeys(),
  blockchain_anchors: freshAnchors(),
};

export type MockTableName = keyof typeof mockTables;

export function resetMockData() {
  mockTables.workspaces = freshWorkspaces();
  mockTables.workspace_members = freshMembers();
  mockTables.work_items = freshWorkItems();
  mockTables.versions = freshVersions();
  mockTables.evidence_hashes = freshEvidence();
  mockTables.audit_logs = freshAuditLogs();
  mockTables.api_keys = freshApiKeys();
  mockTables.blockchain_anchors = freshAnchors();
}
