#!/usr/bin/env node

/**
 * Entrustory Anchor Cron — Blockchain Anchoring Service (Layer 4)
 *
 * This script is designed to run periodically (e.g. via cron) to:
 * 1. Fetch all versions that haven't yet been anchored to a blockchain
 * 2. Build a Merkle Super Root from their individual Merkle roots
 * 3. Simulate a blockchain transaction (replace with real chain integration)
 * 4. Save the anchor record and link all processed versions to it
 *
 * Environment Variables (required in .env):
 *   SUPABASE_URL          - Your Supabase project URL
 *   SUPABASE_SERVICE_KEY   - Service-role key with write access
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

// ─── Configuration ────────────────────────────────────────────

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('\n❌ Missing required environment variables.');
  console.error('   Please ensure .env contains: SUPABASE_URL, SUPABASE_SERVICE_KEY\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Build a deterministic Merkle Super Root from a sorted array of hash strings.
 * Uses the same algorithm as the web frontend to ensure cross-platform consistency.
 */
const buildSuperRoot = (hashes) => {
  if (hashes.length === 0) return null;
  if (hashes.length === 1) return hashes[0];

  let layer = [...hashes].sort(); // Lexicographic sort for determinism

  while (layer.length > 1) {
    const nextLayer = [];
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = layer[i + 1] || left; // Duplicate last if odd
      const combined = createHash('sha256').update(left + right).digest('hex');
      nextLayer.push(combined);
    }
    layer = nextLayer;
  }

  return layer[0];
};

/**
 * Simulate a blockchain transaction.
 * In production, replace this with an actual chain submission (e.g. Ethereum, Polygon).
 */
const simulateBlockchainTx = (superRoot) => {
  return {
    transactionHash: `0x${createHash('sha256').update(superRoot + Date.now().toString()).digest('hex')}`,
    blockNumber: Math.floor(Math.random() * 1_000_000) + 18_000_000,
    network: 'simulated-l1',
  };
};

// ─── Main Process ─────────────────────────────────────────────

const run = async () => {
  console.log('\n⚓ Entrustory Anchor Cron — Layer 4 Blockchain Anchoring');
  console.log('─'.repeat(50));
  console.log(`   Timestamp : ${new Date().toISOString()}`);

  // 1. Fetch unanchored versions
  const { data: pendingVersions, error: fetchError } = await supabase
    .from('versions')
    .select('id, merkle_root')
    .is('blockchain_anchor_id', null);

  if (fetchError) {
    console.error('❌ Failed to fetch pending versions:', fetchError.message);
    process.exit(1);
  }

  if (!pendingVersions || pendingVersions.length === 0) {
    console.log('   Status   : No pending versions to anchor. Exiting.\n');
    process.exit(0);
  }

  console.log(`   Pending  : ${pendingVersions.length} version(s) ready for anchoring`);

  // 2. Build Merkle Super Root
  const roots = pendingVersions.map((v) => v.merkle_root);
  const superRoot = buildSuperRoot(roots);

  if (!superRoot) {
    console.error('❌ Failed to build Super Root — no valid Merkle roots found.');
    process.exit(1);
  }

  console.log(`   S. Root  : ${superRoot}`);

  // 3. Simulate blockchain transaction
  const txResult = simulateBlockchainTx(superRoot);
  console.log(`   Tx Hash  : ${txResult.transactionHash}`);

  // 4. Save anchor record
  const { data: anchor, error: insertError } = await supabase
    .from('blockchain_anchors')
    .insert([{
      super_merkle_root: superRoot,
      transaction_hash: txResult.transactionHash,
    }])
    .select('id')
    .single();

  if (insertError || !anchor) {
    console.error('❌ Failed to save anchor record:', insertError?.message);
    process.exit(1);
  }

  console.log(`   Anchor ID: ${anchor.id}`);

  // 5. Link all processed versions to this anchor
  const versionIds = pendingVersions.map((v) => v.id);
  const { error: updateError } = await supabase
    .from('versions')
    .update({ blockchain_anchor_id: anchor.id })
    .in('id', versionIds);

  if (updateError) {
    console.error('❌ Failed to update versions:', updateError.message);
    process.exit(1);
  }

  console.log('─'.repeat(50));
  console.log(`✅ Successfully anchored ${pendingVersions.length} version(s) to Layer 4.`);
  console.log('');
};

run().catch((err) => {
  console.error('❌ Unexpected error:', err.message);
  process.exit(1);
});
