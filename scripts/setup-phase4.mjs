#!/usr/bin/env node
/** Phase 4: hub icons, enterprise HTML on user site, Capacitor scaffold per app */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const hubDir = join(root, 'shamikhahmed.github.io');

const APPS = {
  VaultOS: { appId: 'com.shamikhahmed.vaultos', appName: 'VaultOS', photos: false },
  FitnessOS: { appId: 'com.shamikhahmed.fitnessos', appName: 'FitnessOS', photos: false },
  PrismOS: { appId: 'com.shamikhahmed.prismos', appName: 'PrismOS', photos: false },
  DisciplineOS: { appId: 'com.shamikhahmed.disciplineos', appName: 'DisciplineOS', photos: false },
  StundsOS: { appId: 'com.shamikhahmed.stundsos', appName: 'StundsOS', photos: false },
  DeePonyOS: { appId: 'com.shamikhahmed.deeponyos', appName: 'DeePonyOS', photos: true },
};

// --- hub icons (reuse generate-icons logic) ---
execSync(`node "${join(root, 'scripts/generate-icons.mjs')}"`, { stdio: 'inherit' });

// Portfolio hub icons — letter "6"
import zlib from 'zlib';
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([type, data])));
  return Buffer.concat([len, type, data, crc]);
}
function png(size, bg, fg) {
  const cx = size / 2, cy = size / 2, r = size * 0.32;
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = [0];
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy;
      const inCircle = dx * dx + dy * dy <= r * r;
      row.push(...(inCircle ? fg : bg));
    }
    rows.push(Buffer.from(row));
  }
  const raw = Buffer.concat(rows);
  const compressed = zlib.deflateSync(raw);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk(Buffer.from('IHDR'), ihdr),
    chunk(Buffer.from('IDAT'), compressed),
    chunk(Buffer.from('IEND'), Buffer.alloc(0)),
  ]);
}
for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['icon-1024.png', 1024]]) {
  writeFileSync(join(hubDir, name), png(size, [10, 10, 15], [123, 95, 255]));
  console.log('hub icon:', name);
}

// --- enterprise.html on hub ---
function mdToHtml(md) {
  return md
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/gs, m => `<ul>${m}</ul>`)
    .replace(/^\|(.+)\|$/gm, '')
    .replace(/^(?!<[hula])(.+)$/gm, m => m.trim() ? `<p>${m}</p>` : '');
}
const entMd = readFileSync(join(root, 'docs/ENTERPRISE.md'), 'utf8');
writeFileSync(join(hubDir, 'enterprise.html'), `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#7b5fff"><title>Enterprise Demo — OS Portfolio</title>
<style>body{font-family:-apple-system,system-ui,sans-serif;background:#0a0a0f;color:#e8e8f0;line-height:1.65;padding:24px;max-width:720px;margin:0 auto}
a{color:#7b5fff}nav{margin-bottom:24px;font-size:14px}nav a{margin-right:12px;color:#888}
h1{font-size:1.6rem;margin:20px 0 12px}h2{font-size:1.1rem;margin:18px 0 8px;color:#7b5fff}
p,li{font-size:15px;color:#aaa;margin-bottom:8px}code{background:#1a1a24;padding:2px 6px;border-radius:4px}</style></head>
<body><nav><a href="index.html">← Portfolio</a></nav>${mdToHtml(entMd)}</body></html>`);
console.log('hub enterprise.html');

writeFileSync(join(hubDir, 'README.md'), `# shamikhahmed.github.io

Mobile-first portfolio hub for the OS family (VaultOS, FitnessOS, PrismOS, DisciplineOS, StundsOS, DeePonyOS).

**Live:** https://shamikhahmed.github.io/

Built by Shamikh Ahmed · 2026
`);

// --- Capacitor per app ---
const capConfig = (appId, appName) => JSON.stringify({
  appId, appName, webDir: '.',
  server: { androidScheme: 'https' },
  ios: { contentInset: 'automatic', scrollEnabled: true },
}, null, 2);

const appStoreAppend = `

## Phase 4 scaffold (June 2026)

- [x] \`capacitor.config.json\` — appId configured
- [x] \`package.json\` — \`@capacitor/core\`, \`@capacitor/ios\`, \`@capacitor/cli\`
- [x] Scripts: \`npm run cap:sync\`, \`npm run cap:ios\`
- [x] \`icon-1024.png\` for App Store Connect (from \`icon-512.png\` upscale or generate-icons)
- [ ] \`npx cap add ios\` — run after Xcode installed (\`npm run cap:init\`)
- [ ] TestFlight upload — requires Apple Developer account

### Xcode setup (when ready)

\`\`\`bash
npm install
npm run cap:init    # cap add ios + sync (first time)
npm run cap:ios     # open Xcode
\`\`\`

**You do NOT need Swift Playgrounds** — use **Xcode.app** from the Mac App Store for Capacitor iOS builds.

### Privacy policy URL
Use hosted: \`https://shamikhahmed.github.io/<AppName>/privacy.html\`
`;

for (const [dir, meta] of Object.entries(APPS)) {
  const appRoot = join(root, dir);
  writeFileSync(join(appRoot, 'capacitor.config.json'), capConfig(meta.appId, meta.appName));

  const pkgPath = join(appRoot, 'package.json');
  let pkg = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, 'utf8')) : { name: dir.toLowerCase(), private: true, version: '1.0.0' };
  pkg.scripts = {
    ...pkg.scripts,
    serve: pkg.scripts?.serve || `python3 -m http.server ${8765 + Object.keys(APPS).indexOf(dir)}`,
    'cap:init': 'npx cap add ios 2>/dev/null || true && npx cap sync ios',
    'cap:sync': 'npx cap sync ios',
    'cap:ios': 'npx cap open ios',
    'test:e2e': pkg.scripts?.['test:e2e'] || 'playwright test',
  };
  pkg.devDependencies = {
    ...pkg.devDependencies,
    '@capacitor/cli': '^7.2.0',
  };
  pkg.dependencies = {
    ...pkg.dependencies,
    '@capacitor/core': '^7.2.0',
    '@capacitor/ios': '^7.2.0',
  };
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  const plistNote = join(appRoot, 'docs', 'IOS_INFO_PLIST.md');
  mkdirSync(join(appRoot, 'docs'), { recursive: true });
  writeFileSync(plistNote, `# ${meta.appName} — iOS Info.plist notes

After \`npm run cap:init\`, edit \`ios/App/App/Info.plist\`:

- \`CFBundleDisplayName\`: ${meta.appName}
- \`NSPhotoLibraryUsageDescription\`: ${meta.photos ? 'Add photos to your collection.' : 'Not required for this app.'}
- \`ITSAppUsesNonExemptEncryption\`: false (standard HTTPS only)

Privacy policy URL: https://shamikhahmed.github.io/${dir}/privacy.html
`);

  const appStorePath = join(appRoot, 'docs', 'APP_STORE.md');
  if (existsSync(appStorePath)) {
    const cur = readFileSync(appStorePath, 'utf8');
    if (!cur.includes('Phase 4 scaffold')) {
      writeFileSync(appStorePath, cur.trimEnd() + appStoreAppend);
    }
  }

  console.log('capacitor scaffold:', dir);
}

console.log('\nPhase 4 scaffold complete. Run hub push separately.');
