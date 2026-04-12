<p align="center">
  <img src="https://img.shields.io/badge/Entrustory-Digital%20Integrity%20OS-0B1120?style=for-the-badge&labelColor=0B1120" alt="Entrustory" />
</p>

<h1 align="center">🛡️ Entrustory</h1>
<p align="center"><strong>Programmable, Zero-Knowledge Digital Integrity Infrastructure</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite_7-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Ed25519-A855F7?style=flat-square&logo=letsencrypt&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
</p>

<p align="center">
  <em>Tamper-evident, version-aware proof of digital work — anchored to cryptographic truth.</em>
</p>

---

## What is Entrustory?

Entrustory is a **Continuous Lifecycle Integrity Engine** — not just a timestamp service. It embeds cryptographic proof directly into digital workflows, creating an unbroken chain of trust for every version of every file across its entire lifecycle.

```
📄 File → SHA-256 Hash → Merkle Tree → Ed25519 Signature → Blockchain Anchor
         (client-side)     (O(log n))    (server-side)       (batch cron)
```

**The Problem:** Existing digital notarization platforms produce static, one-time certificates. When a file updates, the proof is broken. They lack programmability, team collaboration, and privacy.

**Our Solution:** A four-layer assurance model that guarantees integrity from the browser to the blockchain — with zero knowledge of the original content.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 4  │  Blockchain Anchoring                               │
│           │  Batch Merkle Roots → Super Root → Public Chain     │
├───────────┼─────────────────────────────────────────────────────┤
│  LAYER 3  │  Server Signatures                                  │
│           │  Ed25519 asymmetric signing via Supabase Edge Fn    │
├───────────┼─────────────────────────────────────────────────────┤
│  LAYER 2  │  Merkle Tree Engine                                 │
│           │  Deterministic, lexicographically sorted trees       │
├───────────┼─────────────────────────────────────────────────────┤
│  LAYER 1  │  Zero-Knowledge Client                              │
│           │  SHA-256 hashing in-browser · No data leaves device │
└───────────┴─────────────────────────────────────────────────────┘
```

| Layer | What it guarantees | How |
|-------|-------------------|-----|
| **L1** | Content privacy | Files are hashed locally via Web Crypto API. Raw data never touches the server. |
| **L2** | Scalable proof | Hashes form a Merkle Tree with O(log n) inclusion proofs. |
| **L3** | Server attestation | The Merkle root is signed with Ed25519 (via `@noble/curves`) with an exact UTC timestamp. |
| **L4** | Decentralized trust | A cron job batches pending roots into a Super Root and anchors it on-chain. *(Testnet integration in progress — see Roadmap)* |

---

## Features

| Feature | Description |
|---------|-------------|
| 🔐 **Client-Side Hashing** | SHA-256 computed entirely in-browser. Instant duplicate detection across the ledger. |
| 🗄️ **Encrypted Vault** | Optional AES-256-GCM encrypted storage. Files encrypted client-side before upload. |
| 📜 **Immutable Audit Log** | Every workspace event tracked — creation, access, export, API calls. |
| 🔄 **Version Timelines** | Visual lineage from v1.0 → vN.0 with per-version cryptographic proofs. |
| 📄 **PDF Certificates** | Legal-grade evidence exports with hashes, Merkle paths, signatures, and QR codes. |
| 👥 **RBAC & Teams** | Invite members with Owner / Admin / Viewer roles per workspace. |
| 🌐 **Public Verification** | Anyone can verify a file at `/verify/:hash` — no account needed. Shareable proof URLs. |
| ⌨️ **Command Palette** | `Cmd+K` to navigate anywhere — fuzzy search, keyboard shortcuts. |
| 📊 **System Status** | Public `/status` page with real-time latency checks and 90-day uptime chart. |
| 🔔 **Toast Notifications** | Polished feedback for every action via `react-hot-toast`. |
| 🤖 **GitHub Action** | CI/CD template to anchor every build artifact to the ledger automatically. |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite 7, Tailwind CSS |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| **Cryptography** | Web Crypto API (SHA-256, AES-256-GCM), `@noble/curves` (Ed25519) |
| **PDF/QR** | jsPDF, qrcode |
| **CLI** | Node.js (ES Modules) |
| **CI/CD** | GitHub Actions |

---

## Project Structure

```
entrustory/
├── entrustory-web/          # React SPA
│   ├── src/
│   │   ├── components/      # CommandPalette, Skeleton, Modals, Layout
│   │   ├── hooks/           # useAuth, useCountUp
│   │   ├── pages/           # Dashboard, Workspace, Verify, Status, Settings
│   │   ├── types/           # Shared TypeScript interfaces
│   │   └── utils/           # crypto, merkle, serverSignature, format
│   └── index.html
├── entrustory-cli/          # Headless Node.js CLI
│   ├── cli.js               # Hash & anchor any file from terminal
│   └── anchor-cron.js       # Batch blockchain anchoring script
├── supabase/
│   └── functions/
│       └── sign-merkle-root/ # Edge Function for server-side Ed25519 signing
├── supabase_schema.sql      # Full database schema with RLS & immutability triggers
└── .github/
    └── workflows/
        └── entrustory-anchor.yml  # CI/CD anchor action
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/AmanJ24/entrustory.git
cd entrustory

# Web app
cd entrustory-web
npm install

# CLI (optional)
cd ../entrustory-cli
npm install
```

### 2. Configure Environment

Create `entrustory-web/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

For the CLI, create `entrustory-cli/.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
ENTRUSTORY_API_KEY=pk_live_your_generated_key_from_dashboard
```

### 3. Set Up the Database

Import the schema into your Supabase project:

```bash
# Via Supabase Dashboard → SQL Editor → paste contents of:
cat supabase_schema.sql
```

### 4. Run

```bash
cd entrustory-web
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 5. CLI Usage

```bash
cd entrustory-cli
node cli.js ./my-document.pdf
```

The CLI hashes the file locally, verifies your API key via a secure Postgres RPC function, and anchors the proof to the ledger.

---

## Database Security

Entrustory employs extreme database-level security:

- **Row-Level Security (RLS):** Every table is locked to the user's `workspace_id`. Cross-workspace reads are cryptographically impossible.
- **Append-Only Triggers:** Custom PL/pgSQL triggers block any `UPDATE` or `DELETE` on cryptographic records:

  > *"Entrustory Integrity Protocol: Modification of core cryptographic properties is strictly prohibited."*

- **Zero-Knowledge:** The server stores hashes, never plaintext files. Vault files are AES-256-GCM encrypted client-side — the server cannot read them.

---

## Roadmap

- [ ] **Live Testnet Anchoring** — Anchor Super Roots to Polygon Amoy / Ethereum Sepolia
- [ ] **Batch File Upload** — Drag-and-drop multiple files in a single anchoring operation
- [ ] **C2PA Media Provenance** — Inject Entrustory proofs into image/video EXIF metadata for anti-deepfake verification
- [ ] **Multi-Party Signatures** — Multiple users co-sign a WorkItem with personal Ed25519 keys
- [ ] **Public Transparency Log** — Live read-only feed of anonymized Merkle Roots for third-party auditing
- [ ] **Official SDK** — `@entrustory/sdk` npm package for programmatic integration

---

## License

This project is licensed under the [GNU AGPL v3](LICENSE) © Aman Jangir.
Commercial use requires prior written permission from the author.

---

<p align="center">
  <sub>Built with cryptography and caffeine for the modern web.</sub>
</p>
