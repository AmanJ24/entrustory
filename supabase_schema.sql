-- =================================================================================
-- 🛡️ ENTRUSTORY OS - MASTER DATABASE INITIALIZATION SCRIPT
-- =================================================================================
-- Run this script in the Supabase SQL Editor on a fresh project.
-- It creates all Enums, Tables, Triggers, RLS Policies, RPC Functions, and Storage.
-- =================================================================================


-- ==========================================
-- 1. EXTENSIONS & CUSTOM TYPES (ENUMS)
-- ==========================================
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- Required for native HMAC-SHA256 generation

CREATE TYPE user_role AS ENUM ('owner', 'admin', 'viewer');
CREATE TYPE log_action AS ENUM (
  'workspace_created', 'member_added', 'workitem_created', 
  'version_created', 'file_hashed', 'signature_generated', 
  'verification_attempt', 'export_generated'
);


-- ==========================================
-- 2. CORE TABLES
-- ==========================================

-- A. Workspaces (Multi-tenant isolation)
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. Workspace Members (RBAC)
CREATE TABLE workspace_members (
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'viewer',
    public_key_fingerprint TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (workspace_id, user_id)
);

-- C. API Keys (Developer CLI Access)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_value TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. WorkItems (High-level project containers)
CREATE TABLE work_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT FALSE
);

-- E. Blockchain Anchors (Layer 4 Batching)
CREATE TABLE blockchain_anchors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    super_merkle_root TEXT NOT NULL,
    transaction_hash TEXT NOT NULL,
    network TEXT DEFAULT 'Ethereum Sepolia Testnet',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- F. Versions (The state of a WorkItem at a specific time)
CREATE TABLE versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_item_id UUID REFERENCES work_items(id) ON DELETE CASCADE,
    version_tag TEXT NOT NULL,
    merkle_root TEXT NOT NULL,
    server_signature TEXT,
    previous_version_id UUID REFERENCES versions(id),
    blockchain_anchor_id UUID REFERENCES blockchain_anchors(id), -- L4 Link
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- G. Evidence Hashes (The actual files belonging to a version)
CREATE TABLE evidence_hashes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID REFERENCES versions(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    sha256_hash TEXT NOT NULL,
    storage_path TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE, -- Zero-Knowledge Vault flag
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- H. Immutable Audit Log (The Timeline Engine)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id),
    action_type log_action NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================
-- 3. CRYPTOGRAPHIC IMMUTABILITY (TRIGGERS)
-- ==========================================

-- Standard Append-Only Blocker
CREATE OR REPLACE FUNCTION prevent_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Entrustory Integrity Protocol: Modification or deletion of cryptographic records is strictly prohibited.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_append_only_evidence
BEFORE UPDATE OR DELETE ON evidence_hashes
FOR EACH ROW EXECUTE FUNCTION prevent_tampering();

CREATE TRIGGER enforce_append_only_logs
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_tampering();

-- Smart Append-Only for Versions (Allows the L4 Cron Job to update the Anchor ID once)
CREATE OR REPLACE FUNCTION prevent_version_tampering()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Entrustory Integrity Protocol: Deletion of cryptographic records is strictly prohibited.';
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.blockchain_anchor_id IS NULL 
           AND NEW.blockchain_anchor_id IS NOT NULL
           AND OLD.id IS NOT DISTINCT FROM NEW.id
           AND OLD.work_item_id IS NOT DISTINCT FROM NEW.work_item_id
           AND OLD.version_tag IS NOT DISTINCT FROM NEW.version_tag
           AND OLD.merkle_root IS NOT DISTINCT FROM NEW.merkle_root
           AND OLD.server_signature IS NOT DISTINCT FROM NEW.server_signature
           AND OLD.previous_version_id IS NOT DISTINCT FROM NEW.previous_version_id
           AND OLD.created_by IS NOT DISTINCT FROM NEW.created_by
           AND OLD.created_at IS NOT DISTINCT FROM NEW.created_at
        THEN
            RETURN NEW; 
        END IF;
        
        RAISE EXCEPTION 'Entrustory Integrity Protocol: Modification of core cryptographic properties is strictly prohibited.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_append_only_versions
BEFORE UPDATE OR DELETE ON versions
FOR EACH ROW EXECUTE FUNCTION prevent_version_tampering();


-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Workspaces & Members
CREATE POLICY "Users can view their workspaces" ON workspaces FOR SELECT USING (id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can view their own memberships" ON workspace_members FOR SELECT USING (user_id = auth.uid());

-- API Keys
CREATE POLICY "Users can view own keys" ON api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own keys" ON api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own keys" ON api_keys FOR DELETE USING (auth.uid() = user_id);

-- WorkItems
CREATE POLICY "Users can view workspace items" ON work_items FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert work items" ON work_items FOR INSERT WITH CHECK (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

-- Cryptographic Records (Versions & Evidence)
CREATE POLICY "Users can view versions" ON versions FOR SELECT USING (true);
CREATE POLICY "Users can insert versions" ON versions FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can view evidence" ON evidence_hashes FOR SELECT USING (true);
CREATE POLICY "Users can insert evidence" ON evidence_hashes FOR INSERT WITH CHECK (true);

-- Blockchain Anchors (Public Verification)
CREATE POLICY "Anyone can view anchors" ON blockchain_anchors FOR SELECT USING (true);

-- Audit Logs
CREATE POLICY "Users can view their own audit logs" ON audit_logs FOR SELECT USING (actor_id = auth.uid());
CREATE POLICY "Users can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.uid() = actor_id);


-- ==========================================
-- 5. SAAS AUTOMATION (AUTO-CREATE WORKSPACE)
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  INSERT INTO public.workspaces (name) VALUES (NEW.email || '''s Workspace') RETURNING id INTO new_workspace_id;
  INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES (new_workspace_id, NEW.id, 'owner');
  INSERT INTO public.audit_logs (workspace_id, actor_id, action_type, details)
  VALUES (new_workspace_id, NEW.id, 'workspace_created', '{"message": "Workspace automatically initialized upon signup"}');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ==========================================
-- 6. SECURE API ENDPOINT (RPC FUNCTION)
-- ==========================================
CREATE OR REPLACE FUNCTION anchor_via_api(
  p_api_key TEXT,
  p_file_name TEXT,
  p_file_size BIGINT,
  p_sha256_hash TEXT
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_workspace_id UUID;
  v_work_item_id UUID;
  v_version_id UUID;
  v_timestamp TEXT := to_char(NOW() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"');
  v_message TEXT;
  v_signature TEXT;
  -- REPLACE 'your_secure_master_key_here' with a strong secret before deploying to production
  -- You can use `current_setting('app.settings.master_key')` to read from Postgres config securely instead.
  v_secret TEXT := 'your_secure_master_key_here';
BEGIN
  SELECT user_id, workspace_id INTO v_user_id, v_workspace_id FROM api_keys WHERE key_value = p_api_key;
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Unauthorized: Invalid API Key'; END IF;
  
  IF EXISTS (SELECT 1 FROM evidence_hashes WHERE sha256_hash = p_sha256_hash) THEN
    RAISE EXCEPTION 'Duplicate Detected: This exact file hash already exists on the ledger.';
  END IF;

  v_message := p_sha256_hash || '|' || v_timestamp;
  v_signature := 'hmac_sha256_' || encode(hmac(v_message, v_secret, 'sha256'), 'hex');

  INSERT INTO work_items (workspace_id, name, created_by) VALUES (v_workspace_id, '[API] ' || p_file_name, v_user_id) RETURNING id INTO v_work_item_id;
  INSERT INTO versions (work_item_id, version_tag, merkle_root, server_signature, created_at, created_by) VALUES (v_work_item_id, 'v1.0-api', p_sha256_hash, v_signature, v_timestamp::TIMESTAMPTZ, v_user_id) RETURNING id INTO v_version_id;
  INSERT INTO evidence_hashes (version_id, file_name, file_size, sha256_hash) VALUES (v_version_id, p_file_name, p_file_size, p_sha256_hash);
  INSERT INTO audit_logs (workspace_id, actor_id, action_type, resource_id, details) VALUES (v_workspace_id, v_user_id, 'workitem_created', v_work_item_id, '{"message": "Anchored via developer API"}');

  RETURN jsonb_build_object('status', 'success', 'work_item_id', v_work_item_id, 'timestamp', v_timestamp, 'signature', v_signature);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- 7. ZERO-KNOWLEDGE VAULT (STORAGE)
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('vault', 'vault', false);

CREATE POLICY "Authenticated users can upload to vault" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vault' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can download from vault" 
ON storage.objects FOR SELECT USING (bucket_id = 'vault' AND auth.role() = 'authenticated');

-- ================== END OF SCRIPT ==================
