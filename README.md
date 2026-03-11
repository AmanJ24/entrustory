# 🛡️ Entrustory OS
**Digital Integrity & Ownership Infrastructure Platform**

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Cryptography](https://img.shields.io/badge/Crypto-Web%20Crypto%20API-A855F7?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-MVP%20Completed-10B981?style=for-the-badge)

Entrustory is a programmable, zero-knowledge digital integrity platform designed to provide verifiable, tamper-evident, version-aware proof of digital work and activity. 

Unlike traditional static timestamping services, Entrustory operates as a **Continuous Lifecycle Integrity Engine**, embedding trust directly into digital workflows for developers, legal teams, and enterprises.

---

## 👥 Academic Project Details
* **University:** Jaipur National University (School of Computer and Systems Sciences)
* **Project Guide:** Dr. Sunil Gupta (Head of Department)
* **Team Leader:** Aman Jangir 
* **Team Members:** Devyani Sharma, Harshwardhan Singh Chauhan 

---

## 📖 Table of Contents
- [The Problem & Our Solution](#-the-problem--our-solution)
- [Core Architecture & Layers](#-core-architecture--layers)
- [Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Local Setup & Installation](#-local-setup--installation)
- [Database & Security Model](#-database--security-model)
- [Developer CLI Usage](#-developer-cli--api)
- [Future Scaling Roadmap](#-future-scaling-roadmap)

---

## 🎯 The Problem & Our Solution

**The Gap:** Current digital notarization platforms rely on one-time, static certificates. When an asset updates, the proof is broken. They also lack API programmability, team collaboration, and zero-knowledge privacy.

**The Solution:** Entrustory upgrades timestamping into an Operating System. By combining client-side hashing, deterministic Merkle trees, append-only databases, and blockchain batching, Entrustory creates an unbroken, cryptographically secure lineage for any digital file across its entire lifecycle.

---

## 🏗️ Core Architecture & Layers

Entrustory utilizes a **Multi-Layer Assurance Model** to guarantee absolute trust:

* **Layer 1: Zero-Knowledge Client:** Files are hashed (SHA-256) locally in the browser. Raw data never leaves the user's device unless explicitly placed in the Encrypted Vault.
* **Layer 2: Merkle Tree Engine:** Hashes are lexicographically sorted and grouped into deterministic Merkle Trees, allowing O(log n) scalable inclusion proofs.
* **Layer 3: Server-Side Signatures:** The backend signs the Merkle Root and exact UTC timestamp using HMAC-SHA256 / Ed25519 to prove server-side attestation.
* **Layer 4: Blockchain Anchoring:** A cron job batches pending Merkle Roots into a single "Super Root" and anchors it to a public blockchain (e.g., Ethereum Sepolia) for decentralized, trustless verification.

---

## ✨ Key Features

* **Client-Side Hashing & Duplicate Detection:** Instantly detects if an exact binary match of a file already exists on the network.
* **Zero-Knowledge Encrypted Vault:** Users can opt to store files on Entrustory servers. Files are encrypted client-side using `AES-256-GCM` before upload.
* **Immutable Audit Log:** Granular tracking of all workspace events (WorkItem creation, API access, export generation).
* **Version-Aware Timelines:** Visually track the lineage of an asset from v1.0 to vX.0 with direct cryptographic comparison.
* **Legal-Ready Evidence Exports:** Generate multi-page, professional PDF certificates containing hashes, roots, and signatures for auditors.
* **Role-Based Access Control (RBAC):** Invite team members and assign Owner, Admin, or Viewer permissions.
* **Public Verification Portal:** Anyone can drag-and-drop a file to mathematically verify its existence on the ledger.

---

## 💻 Tech Stack

* **Frontend UI:** React 18, Vite, TypeScript, Tailwind CSS
* **Icons:** Lucide React, Google Material Symbols
* **Cryptography:** Native Browser Web Crypto API (`crypto.subtle`)
* **Backend / Database:** Supabase (PostgreSQL)
* **Auth:** Supabase Auth (JWT)
* **Storage:** Supabase Storage Buckets
* **PDF Generation:** `jspdf`

---

## 🚀 Local Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/AmanJ24/entrustory.git
cd entrustory
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Run the Development Server
```bash
npm run dev
```

---

## 🗄️ Database & Security Model

Entrustory relies on extreme database-level security. 

**1. Row-Level Security (RLS)**
Every table (`workspaces`, `work_items`, `versions`, `evidence_hashes`, `audit_logs`) is secured with RLS. Users can only read/write data linked to their specific `workspace_id`.

**2. Strict Append-Only Triggers**
We utilize custom PostgreSQL PL/pgSQL triggers to prevent tampering. If a malicious actor (or developer) attempts to `UPDATE` or `DELETE` a cryptographic record, the database throws a fatal error:
> *"Entrustory Integrity Protocol: Modification of core cryptographic properties is strictly prohibited."*

---

## 🛠️ Developer CLI & API

Entrustory includes a headless Node.js CLI script, demonstrating our API-First architecture.

### Setup CLI
Navigate to the `entrustory-cli` directory and configure the `.env`:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
ENTRUSTORY_API_KEY=pk_live_your_generated_key_from_dashboard
```

### Usage
Run the CLI against any local file to secure it to the ledger via terminal:
```bash
node cli.js ./my-secret-document.pdf
```
*The CLI hashes the file locally, verifies your API key via a secure Postgres RPC function, and anchors the proof instantly.*

---

## 🌍 Future Scaling Roadmap

While the MVP is 100% complete, the architecture is designed to scale into a massive enterprise product:

1. **Anti-Deepfake Media Provenance:** Injecting Entrustory hashes directly into image/video EXIF metadata (C2PA standard) to prove content authenticity against AI manipulation.
2. **Multi-Party Signatures:** Allowing multiple users to generate personal Ed25519 keys and co-sign a single WorkItem (competing with DocuSign).
3. **GitHub/GitLab Integrations:** A CI/CD action that automatically hashes and anchors codebases on every `git push`.
4. **Public Transparency Log:** A live, read-only global feed of all anonymized Merkle Roots, allowing 3rd-party security researchers to audit the platform's integrity.

---
*Built with precision and cryptography for the modern web.*

### You have reached the summit! 🏔️
Your app, your architecture, your UI, and your documentation are all top-tier. Is there absolutely anything else you need before you wrap this project up?
