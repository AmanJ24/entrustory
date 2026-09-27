/**
 * LegalPage — Privacy Policy / Terms of Service / Security, at /legal/:section.
 *
 * Entrustory is a personal project, not a company, so this is written as an
 * honest description of what actually happens with data and code, not
 * corporate boilerplate. Update CONTACT_EMAIL before shipping.
 */

import { useParams, Link, Navigate } from 'react-router-dom';
import { LogoIcon } from '../../components/Logo';

const CONTACT_EMAIL = 'work.amanjangir@gmail.com';

const SECTIONS: Record<string, { title: string; updated: string; body: React.ReactNode }> = {
  privacy: {
    title: 'Privacy Policy',
    updated: 'Last updated: September 2026',
    body: (
      <>
        <p>Entrustory is an independent, personal project — not a company. This page describes what actually happens with your data, plainly.</p>

        <h2>What's collected</h2>
        <ul>
          <li>Your email address, via Supabase Auth, to identify your account.</li>
          <li>Workspace and work-item metadata you create (project names, version tags, timestamps).</li>
          <li>SHA-256 hashes and Merkle roots of files you anchor. Anchoring is designed to work from just the hash — your raw file is only stored if you explicitly enable "Store in Vault" for that item.</li>
          <li>If Vault storage is enabled for a file, an AES-256-GCM encrypted copy of it, uploaded from your browser.</li>
          <li>Standard hosting/request logs from Vercel (frontend) and Supabase (database, auth, storage) — the same logs any hosted app generates.</li>
        </ul>

        <h2>Why it's collected</h2>
        <p>To run your account and workspace, and because public verification (<Link to="/verify">/verify</Link>) is a core feature — a version's hash, Merkle root, and signature are intentionally public so anyone can independently verify a proof, by design.</p>

        <h2>Where it lives</h2>
        <p>In Supabase (a third-party database/auth/storage provider) and served via Vercel. Neither is Entrustory-operated infrastructure — both are standard hosting providers with their own security practices.</p>

        <h2>The Live Demo</h2>
        <p>The <Link to="/app/dashboard">live demo</Link> doesn't touch any of the above — everything you do there runs against in-memory sample data in your browser tab and is discarded when you close it.</p>

        <h2>Retention & deletion</h2>
        <p>Data is kept until you ask for it to be removed. There's no automated retention/deletion policy yet — email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> to request account or data deletion.</p>
      </>
    ),
  },
  terms: {
    title: 'Terms of Service',
    updated: 'Last updated: September 2026',
    body: (
      <>
        <p>Entrustory is a personal project, provided as-is, with no warranty and no uptime guarantee. Use it accordingly — don't rely on it for anything where losing access or data would be a serious problem.</p>

        <h2>Your responsibility</h2>
        <ul>
          <li>You're responsible for what you anchor. Don't use this to hash, sign, or store illegal content.</li>
          <li>Encrypted Vault contents aren't inspected by design (that's the point of client-side encryption), but accounts found abusing the service may be disabled without notice.</li>
        </ul>

        <h2>No SLA</h2>
        <p>This runs on free-tier infrastructure. It may be slow, paused, modified, or discontinued at any time without notice — see the honest note on the <Link to="/status">status page</Link> about what's actually monitored.</p>

        <h2>Open source</h2>
        <p>The code is public at <a href="https://github.com/AmanJ24/entrustory" target="_blank" rel="noopener noreferrer">github.com/AmanJ24/entrustory</a>. You're welcome to read it, self-host it, or point out problems with it.</p>
      </>
    ),
  },
  security: {
    title: 'Security',
    updated: 'Last updated: September 2026',
    body: (
      <>
        <p>Entrustory's core design goal is that raw files never need to leave your device just to prove their integrity: hashing happens client-side, and only the hash, a Merkle root, and a server signature are required.</p>

        <h2>What's implemented</h2>
        <ul>
          <li>Client-side SHA-256 hashing and Merkle tree construction.</li>
          <li>Server-side Ed25519 signing via an isolated Supabase Edge Function — the private key never leaves that function, and it requires an authenticated session to call.</li>
          <li>Row-Level Security on every table, scoped to workspace membership.</li>
          <li>Append-only audit log — database triggers block UPDATE/DELETE on cryptographic records.</li>
          <li>Optional AES-256-GCM client-side encryption before any file is uploaded to storage.</li>
        </ul>

        <h2>What's not yet real</h2>
        <p>Layer 4 (public blockchain anchoring) is still rolling out — see the <a href="/#architecture">architecture section</a> for the current state. This page won't claim it's live before it is.</p>

        <h2>Reporting a vulnerability</h2>
        <p>This is an open-source solo project — if you find a real issue, please email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> before opening a public issue, so there's time to fix it first.</p>
      </>
    ),
  },
};

export const LegalPage = () => {
  const { section } = useParams<{ section: string }>();
  const entry = section ? SECTIONS[section] : undefined;

  if (!entry) return <Navigate to="/legal/privacy" replace />;

  return (
    <div className="min-h-screen bg-surface text-on-surface font-['Inter']">
      <header className="border-b border-surface-variant bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-tertiary/10 border border-tertiary/30 rounded flex items-center justify-center text-tertiary">
              <LogoIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Entrustory</h1>
          </Link>
          <nav className="flex gap-5 text-sm">
            {Object.entries(SECTIONS).map(([slug, s]) => (
              <Link
                key={slug}
                to={`/legal/${slug}`}
                className={slug === section ? 'text-tertiary font-medium' : 'text-on-surface-variant hover:text-white transition-colors'}
              >
                {s.title}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-1">{entry.title}</h1>
        <p className="text-sm text-on-surface-variant mb-10">{entry.updated}</p>
        <div className="prose prose-invert max-w-none space-y-4 text-on-surface-variant [&_h2]:text-white [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-8 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-tertiary [&_a]:hover:underline">
          {entry.body}
        </div>
      </main>

      <footer className="border-t border-surface-variant mt-20 py-8">
        <div className="max-w-3xl mx-auto px-6 flex justify-between items-center text-xs text-on-surface-variant">
          <p>© {new Date().getFullYear()} Entrustory</p>
          <Link to="/" className="hover:text-white transition-colors">Back to home</Link>
        </div>
      </footer>
    </div>
  );
};
