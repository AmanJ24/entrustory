#!/usr/bin/env node

/**
 * Entrustory CLI — Anchor local files to the Entrustory Ledger.
 *
 * Usage:
 *   node cli.js <file-path>        Hash a file and anchor it via the API
 *   node cli.js --help             Show usage information
 *
 * Environment Variables (required in .env):
 *   SUPABASE_URL          - Your Supabase project URL
 *   SUPABASE_ANON_KEY     - Your Supabase anonymous key
 *   ENTRUSTORY_API_KEY    - API key generated from the Entrustory dashboard
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { readFileSync, existsSync, statSync } from 'fs';

// ─── Configuration ────────────────────────────────────────────

const { SUPABASE_URL, SUPABASE_ANON_KEY, ENTRUSTORY_API_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !ENTRUSTORY_API_KEY) {
  console.error('\n❌ Missing required environment variables.');
  console.error('   Please ensure .env contains: SUPABASE_URL, SUPABASE_ANON_KEY, ENTRUSTORY_API_KEY\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Helpers ──────────────────────────────────────────────────

/** Format byte count to human-readable string */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/** Show usage information */
const showHelp = () => {
  console.log(`
  Entrustory CLI — Anchor local files to the Entrustory Ledger

  USAGE
    node cli.js <file-path>

  EXAMPLES
    node cli.js ./contract.pdf
    node cli.js ~/Documents/report.docx

  ENVIRONMENT VARIABLES (required in .env)
    SUPABASE_URL          Your Supabase project URL
    SUPABASE_ANON_KEY     Your Supabase anonymous key
    ENTRUSTORY_API_KEY    API key from Entrustory dashboard
  `);
};

// ─── Main ─────────────────────────────────────────────────────

const filePath = process.argv[2];

// Handle flags
if (!filePath || filePath === '--help' || filePath === '-h') {
  showHelp();
  process.exit(filePath ? 0 : 1);
}

// Validate file exists and is readable
if (!existsSync(filePath)) {
  console.error(`\n❌ File not found: ${filePath}`);
  console.error('   Please provide a valid file path.\n');
  process.exit(1);
}

const stats = statSync(filePath);
if (!stats.isFile()) {
  console.error(`\n❌ Not a file: ${filePath}`);
  console.error('   Directories are not supported. Please provide a file path.\n');
  process.exit(1);
}

// Hash the file locally
console.log('\n🔐 Entrustory CLI — File Anchoring');
console.log('─'.repeat(40));
console.log(`   File : ${filePath}`);
console.log(`   Size : ${formatBytes(stats.size)}`);

const fileBuffer = readFileSync(filePath);
const hash = createHash('sha256').update(fileBuffer).digest('hex');

console.log(`   Hash : ${hash}`);
console.log('─'.repeat(40));
console.log('\n⏳ Submitting to Entrustory Ledger...\n');

// Call the Supabase RPC function
const { data, error } = await supabase.rpc('anchor_via_api', {
  p_api_key: ENTRUSTORY_API_KEY,
  p_file_name: filePath.split('/').pop(),
  p_file_size: stats.size,
  p_sha256_hash: hash,
});

if (error) {
  console.error('❌ Anchoring failed:', error.message);
  if (error.message.includes('api_key')) {
    console.error('   Hint: Check that your ENTRUSTORY_API_KEY is valid and not revoked.');
  }
  process.exit(1);
}

console.log('✅ Successfully anchored to ledger!');
console.log('   Response:', JSON.stringify(data, null, 2));
console.log('');
