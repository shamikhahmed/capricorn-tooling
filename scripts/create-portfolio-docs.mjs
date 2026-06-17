#!/usr/bin/env node
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const apps = [
  { dir: 'VaultOS', version: '4.1.0', sw: 'vaultos-v20', tag: 'Encrypted life OS' },
  { dir: 'FitnessOS', version: '4.5.1', sw: 'fos-v20', tag: 'Smart Coach fitness OS' },
  { dir: 'PrismOS', version: '4.0.0', sw: 'prismos-shell-v4', tag: '38 offline games' },
  { dir: 'DisciplineOS', version: '2.0.0', sw: 'discipline-v6', tag: 'Recovery OS' },
  { dir: 'StundsOS', version: '2.3.0', sw: 'stundsOS-v8', tag: 'Wealth OS' },
  { dir: 'DeePonyOS', version: '2.2.0', sw: 'deepony-v6', tag: 'MLP collection tracker' },
];

for (const a of apps) {
  const base = join(root, a.dir);
  mkdirSync(join(base, 'docs'), { recursive: true });
  writeFileSync(join(base, 'VERSION.json'), JSON.stringify({
    app: a.dir, version: a.version, swCache: a.sw, updated: '2026-06-10'
  }, null, 2) + '\n');

  writeFileSync(join(base, 'PRIVACY.md'), `# ${a.dir} — Privacy Policy

**Last updated:** June 10, 2026

${a.dir} is an offline-first Progressive Web App. **Your data stays on your device** unless you explicitly export it.

## What we collect
- **Nothing by default.** No accounts, analytics SDKs, or third-party trackers ship in this app.
- Optional features (e.g. VaultOS LLM import) send data only when you enable them and supply your own API key at runtime.

## Storage
- App state is stored in **localStorage** and/or **IndexedDB** in your browser.
- Uninstalling or clearing site data removes local copies.

## Network
- Live price or proxy features may call endpoints you configure (e.g. StundsOS PSX proxy).
- GitHub Pages serves static files only — no server-side access to your vault.

## Children
- DeePonyOS is child-friendly; still, parents should supervise device sharing and exports.

## Contact
Built by Shamikh Ahmed — issues via GitHub repository for ${a.dir}.
`);

  writeFileSync(join(base, 'CHANGELOG.md'), `# Changelog — ${a.dir}

## ${a.version} (2026-06-10)
- Portfolio CTO pass: PWA icons (192/512 maskable), service worker cache bump (\`${a.sw}\`)
- Truth sprint: docs aligned with shipped features
- ${a.dir === 'VaultOS' ? 'Optional LLM import (Settings), offline Tesseract OCR, Smart Parser default' : ''}${a.dir === 'FitnessOS' ? 'Smart Coach naming, 9 themes in settings, deck precache' : ''}${a.dir === 'PrismOS' ? 'Truth Bomb party game, 38-game daily challenges fixed' : ''}${a.dir === 'DisciplineOS' ? 'Journal trigger chips + TriggerEngine forecast' : ''}${a.dir === 'StundsOS' ? 'Holdings seed UI, Zakat docs, pitch expansion' : ''}${a.dir === 'DeePonyOS' ? 'IndexedDB photo store, legacy cleanup, pitch expansion' : ''}
`);

  const securityExtra = a.dir === 'VaultOS' ? `
## API keys
- LLM keys are **never** hardcoded. Paste in Settings → Import; stored in localStorage on your device only.
- Rotate any key that was exposed in chat or screenshots.

## Encryption
- Vault PIN protects local AES-encrypted storage. No cloud backup unless you export.
` : `
## Local-only data
- No server database. Protect device passcode and exported backup files.
`;

  writeFileSync(join(base, 'SECURITY.md'), `# ${a.dir} — Security Notes

${securityExtra}

## PWA / supply chain
- Static assets served from GitHub Pages; verify \`sw.js\` cache version when updating.
- Do not commit \`.env\` or API keys to the repository.

## Reporting
Open a private security issue on the ${a.dir} GitHub repo for vulnerabilities.
`);

  writeFileSync(join(base, 'docs/APP_STORE.md'), `# ${a.dir} — App Store / TestFlight Prep

## Current state
- **Shipped as PWA** on GitHub Pages (Add to Home Screen).
- **Capacitor scaffold (planned):** wrap static build in \`@capacitor/core\` iOS shell.

## Capacitor plan
1. \`npm init\` + \`@capacitor/cli\` in repo root (webDir: \`.\`)
2. \`npx cap add ios\` — copy \`index.html\` entry, icons from \`icon-512.png\`
3. Configure \`Info.plist\`: \`NSPhotoLibraryUsageDescription\` if photos (DeePonyOS)
4. Disable third-party cookies; keep localStorage/IndexedDB

## TestFlight checklist
- [ ] App icons 1024×1024 from \`icon-512.png\`
- [ ] Privacy nutrition labels: **Data Not Collected** (local-only)
- [ ] Screenshots: iPhone 6.7" + 6.1"
- [ ] Review notes: offline PWA, no account required
- [ ] Export compliance: no encryption beyond standard iOS APIs

## Disclaimers (${a.tag})
${a.dir === 'StundsOS' ? '- Not financial advice. Zakat figures are estimates — consult a scholar.' : ''}${a.dir === 'DisciplineOS' ? '- Not medical advice. SOS tools support recovery; seek professional help when needed.' : ''}${a.dir === 'FitnessOS' ? '- Smart Coach is rule-based guidance, not a licensed trainer.' : ''}${a.dir === 'VaultOS' ? '- Not a regulated financial institution. You are responsible for tax and compliance.' : ''}${a.dir === 'PrismOS' ? '- Offline party games for entertainment; supervise younger players.' : ''}${a.dir === 'DeePonyOS' ? '- Fan collection tool; not affiliated with Hasbro or MLP brand owners.' : ''}

## Version
See \`VERSION.json\` — current \`${a.version}\`.
`);
  console.log('docs:', a.dir);
}
