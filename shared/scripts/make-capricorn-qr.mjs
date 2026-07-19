#!/usr/bin/env node
/**
 * Capricorn Systems — premium pitch QR
 * Quiet cream plate + gold frame + Capricorn logo in center (H ECC).
 *
 * Usage: node make-capricorn-qr.mjs <url> <out.png> [logo.svg]
 */
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
// shared may live under Cap-Apps/shared → capricorn-tooling/shared (symlink)
const caps = resolve(__dirname, '../../..');

const url = process.argv[2];
const out = resolve(process.argv[3] || '');
const logoSvg = resolve(
  process.argv[4] ||
    resolve(caps, 'shamikhahmed.github.io/assets/logo.svg')
);

if (!url || !out) {
  console.error('Usage: node make-capricorn-qr.mjs <url> <out.png> [logo.svg]');
  process.exit(1);
}
if (!fs.existsSync(logoSvg)) {
  console.error('Logo not found:', logoSvg);
  process.exit(1);
}

function loadQRCode() {
  const candidates = [
    resolve(caps, 'PrismCap/node_modules/qrcode'),
    resolve(caps, 'VaultCap/node_modules/qrcode'),
    resolve(caps, 'PulseCap/node_modules/qrcode'),
    'qrcode',
  ];
  for (const c of candidates) {
    try {
      return require(c);
    } catch {
      /* try next */
    }
  }
  console.error('Install qrcode in VaultCap: npm i qrcode');
  process.exit(1);
}

const QRCode = loadQRCode();
const tmp = fs.mkdtempSync(resolve(os.tmpdir(), 'cap-qr-'));
const tmpQr = resolve(tmp, 'qr.png');
const tmpLogo = resolve(tmp, 'logo.png');

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error('Failed:', cmd, args.join(' '));
    process.exit(r.status || 1);
  }
}

await QRCode.toFile(tmpQr, url, {
  width: 720,
  errorCorrectionLevel: 'H',
  margin: 3,
  color: { dark: '#0a0a0a', light: '#ffffff' },
});

run('rsvg-convert', ['-w', '128', '-h', '128', '-o', tmpLogo, logoSvg]);

const py = `
from PIL import Image, ImageDraw
import os

qr = Image.open(${JSON.stringify(tmpQr)}).convert('RGBA')
size = 720
qr = qr.resize((size, size), Image.Resampling.NEAREST)

logo = Image.open(${JSON.stringify(tmpLogo)}).convert('RGBA')
mark = 96
logo = logo.resize((mark, mark), Image.Resampling.LANCZOS)

plate = 128
cx = cy = size // 2
overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
d = ImageDraw.Draw(overlay)

x0, y0 = cx - plate // 2, cy - plate // 2
x1, y1 = cx + plate // 2, cy + plate // 2
d.rounded_rectangle([x0 - 4, y0 - 4, x1 + 4, y1 + 4], radius=24, fill=(255, 252, 247, 255))
d.rounded_rectangle([x0 - 4, y0 - 4, x1 + 4, y1 + 4], radius=24, outline=(201, 162, 39, 255), width=3)
d.rounded_rectangle([x0, y0, x1, y1], radius=20, fill=(255, 252, 247, 255))
d.rounded_rectangle([x0 + 3, y0 + 3, x1 - 3, y1 - 3], radius=17, outline=(201, 162, 39, 90), width=1)

out_img = Image.alpha_composite(qr, overlay)
lx = cx - mark // 2
ly = cy - mark // 2
out_img.paste(logo, (lx, ly), logo)

rgb = out_img.convert('RGB')
parent = os.path.dirname(${JSON.stringify(out)})
if parent:
  os.makedirs(parent, exist_ok=True)
rgb.save(${JSON.stringify(out)}, 'PNG', optimize=True)
print('wrote', ${JSON.stringify(out)}, rgb.size)
`;

const pyFile = resolve(tmp, 'compose.py');
fs.writeFileSync(pyFile, py);
run('python3', [pyFile]);
fs.rmSync(tmp, { recursive: true, force: true });
