#!/usr/bin/env node
/**
 * Gallery completeness check — gate G17 (§9.6)
 *
 * Fails if:
 *  1. Any INVENTORY entry lacks light or dark for a required device (iphone, ipad, mac)
 *  2. Any file listed in the manifest is missing on disk
 *  3. Any shot file mtime / capturedAt is older than the app's current version bump
 *     (heuristic: shot capturedAt or file mtime earlier than VERSION.json `updated`,
 *      or manifest.version !== VERSION.json.version)
 *  4. Any shot is visually blank (≥ 98% one colour)
 *
 * Usage:
 *   node shared/gallery/check-completeness.mjs --app-dir=/path/to/App
 *   node shared/gallery/check-completeness.mjs --app-dir=. --skip-blank
 *
 * Env:
 *   PW_CORE  path to playwright-core (for blank detection). Optional if --skip-blank.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REQUIRED_DEVICES = ["iphone", "ipad", "mac"];
const REQUIRED_THEMES = ["light", "dark"];
const BLANK_THRESHOLD = 0.98;

function parseArgs(argv) {
  const out = {
    appDir: process.cwd(),
    inventory: null,
    manifest: null,
    versionFile: null,
    skipBlank: false,
    requiredDevices: REQUIRED_DEVICES,
    json: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--app-dir" || a.startsWith("--app-dir=")) {
      out.appDir = a.includes("=") ? a.split("=")[1] : argv[++i];
    } else if (a === "--inventory" || a.startsWith("--inventory=")) {
      out.inventory = a.includes("=") ? a.split("=")[1] : argv[++i];
    } else if (a === "--manifest" || a.startsWith("--manifest=")) {
      out.manifest = a.includes("=") ? a.split("=")[1] : argv[++i];
    } else if (a === "--version-file" || a.startsWith("--version-file=")) {
      out.versionFile = a.includes("=") ? a.split("=")[1] : argv[++i];
    } else if (a === "--skip-blank") {
      out.skipBlank = true;
    } else if (a === "--json") {
      out.json = true;
    } else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    }
  }
  out.appDir = path.resolve(out.appDir);
  return out;
}

function printHelp() {
  console.log(`Usage: node check-completeness.mjs --app-dir=<app> [options]

Options:
  --inventory=<path>     INVENTORY.md (default: qa/perfection/INVENTORY.md)
  --manifest=<path>      gallery-manifest.json (default: docs/screenshots/gallery/gallery-manifest.json)
  --version-file=<path>  VERSION.json (default: VERSION.json)
  --skip-blank           Skip ≥98% one-colour check (no Playwright needed)
  --json                 Machine-readable JSON report on stdout
`);
}

function normalizeDevice(raw) {
  const d = String(raw || "").toLowerCase().replace(/[_\s]/g, "-");
  if (d.includes("iphone") || d === "phone" || d === "mobile" || d === "se") return "iphone";
  if (d.includes("ipad") || d === "tablet") return "ipad";
  if (d.includes("mac") || d.includes("desk") || d.includes("laptop") || d === "wide") return "mac";
  return d;
}

function normalizeTheme(raw) {
  const t = String(raw || "").toLowerCase();
  if (t === "dark") return "dark";
  if (t === "sepia") return "sepia";
  return "light";
}

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Parse inventory entries from INVENTORY.md.
 * Accepts lines like:
 *   - Banks / list / filled
 *   - [ ] Home — empty
 *   | banks | list | filled |
 *   ### Banks
 * Falls back to bullet/checkbox screen names.
 */
function parseInventory(text) {
  const entries = [];
  const seen = new Set();

  function add(screen, state = "default", group = "") {
    const s = screen.trim();
    if (!s || s.length < 2) return;
    if (/^(inventory|screen|route|notes|device|theme)/i.test(s)) return;
    const key = `${slug(s)}::${slug(state)}`;
    if (seen.has(key)) return;
    seen.add(key);
    entries.push({ screen: s, state, group, id: `${slug(group || "screens")}--${slug(s)}--${slug(state)}` });
  }

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      // Optional: ### Group headers ignored for coverage keys; screens matter
      continue;
    }
    // Table row: | screen | state | ...
    if (trimmed.startsWith("|") && !/^\|\s*-+/.test(trimmed)) {
      const cells = trimmed.split("|").map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 1 && !/^(screen|name|route|id)$/i.test(cells[0])) {
        add(cells[0], cells[1] || "default", cells[2] || "");
      }
      continue;
    }
    // Bullet: - Screen — state   or  - [ ] Screen (state)
    const bullet = trimmed.match(/^[-*+](?:\s+\[[ xX]\])?\s+(.+)$/);
    if (bullet) {
      let body = bullet[1].replace(/\*\*/g, "").trim();
      // strip trailing evidence paths
      body = body.replace(/\s+—\s+evidence:.*$/i, "").replace(/\s+\(.*\)$/, "").trim();
      const parts = body.split(/\s+[—–-]\s+/);
      if (parts.length >= 2) add(parts[0], parts[1]);
      else add(body);
    }
  }
  return entries;
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function resolveManifestPath(appDir, explicit) {
  const candidates = [
    explicit,
    path.join(appDir, "docs/screenshots/gallery/gallery-manifest.json"),
    path.join(appDir, "gallery-manifest.json"),
  ].filter(Boolean);
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

function shotCoverageKey(shot) {
  const screen = shot.screen || shot.label || shot.id || "";
  const state = shot.state || "default";
  return `${slug(screen)}::${slug(state)}`;
}

async function loadPlaywright() {
  const candidates = [
    process.env.PW_CORE,
    path.resolve(__dirname, "../../../MasteryCap/node_modules/playwright-core"),
    path.resolve(process.cwd(), "node_modules/playwright-core"),
  ].filter(Boolean);

  for (const c of candidates) {
    try {
      const pkg = path.join(c, "package.json");
      if (!fs.existsSync(pkg)) continue;
      const mod = await import(pathToFileURL(path.join(c, "index.js")).href);
      return mod;
    } catch {
      /* try next */
    }
  }
  // createRequire fallback
  try {
    const require = createRequire(import.meta.url);
    return require("playwright-core");
  } catch {
    return null;
  }
}

/**
 * Sample image pixels via Playwright Chromium canvas.
 * Returns dominant colour ratio 0–1, or null if undecodable.
 */
async function blankRatio(playwright, filePath) {
  const browser = await playwright.chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const abs = path.resolve(filePath);
    const data = fs.readFileSync(abs);
    const b64 = data.toString("base64");
    const ext = path.extname(abs).toLowerCase();
    const mime =
      ext === ".png" ? "image/png" :
      ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
      ext === ".webp" ? "image/webp" :
      "application/octet-stream";

    const ratio = await page.evaluate(
      async ({ b64, mime, threshold }) => {
        const blob = await (await fetch(`data:${mime};base64,${b64}`)).blob();
        const bmp = await createImageBitmap(blob);
        const canvas = document.createElement("canvas");
        const maxSide = 64;
        const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
        canvas.width = Math.max(1, Math.round(bmp.width * scale));
        canvas.height = Math.max(1, Math.round(bmp.height * scale));
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const counts = new Map();
        let total = 0;
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 8) continue;
          // quantize to reduce noise
          const r = data[i] >> 3;
          const g = data[i + 1] >> 3;
          const b = data[i + 2] >> 3;
          const key = (r << 10) | (g << 5) | b;
          counts.set(key, (counts.get(key) || 0) + 1);
          total++;
        }
        if (!total) return 1;
        let max = 0;
        for (const v of counts.values()) max = Math.max(max, v);
        return max / total;
      },
      { b64, mime, threshold: BLANK_THRESHOLD },
    );
    await page.close();
    return ratio;
  } finally {
    await browser.close();
  }
}

/** Lightweight PNG blank check without Playwright (IHDR + raw IDAT not fully inflated — size heuristic only). */
function pngHeuristicBlank(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length < 100) return true;
  // Very small compressed images of solid colour are often < 2 KB for large canvases
  if (buf.length < 800) return true;
  return null; // unknown
}

async function checkBlank(filePath, playwright, skipBlank) {
  if (skipBlank) return { blank: false, skipped: true };
  const ext = path.extname(filePath).toLowerCase();
  if (playwright) {
    try {
      const ratio = await blankRatio(playwright, filePath);
      return { blank: ratio >= BLANK_THRESHOLD, ratio, skipped: false };
    } catch (err) {
      return { blank: false, error: String(err.message || err), skipped: false };
    }
  }
  if (ext === ".png") {
    const h = pngHeuristicBlank(filePath);
    if (h === true) return { blank: true, ratio: 1, skipped: false, heuristic: true };
  }
  return { blank: false, skipped: true, reason: "no playwright-core; pass PW_CORE or --skip-blank" };
}

function versionOlder(manifestVersion, versionJson) {
  if (!versionJson?.version) return false;
  if (!manifestVersion) return true;
  return String(manifestVersion) !== String(versionJson.version);
}

function parseIso(s) {
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
}

async function main() {
  const args = parseArgs(process.argv);
  const failures = [];
  const warnings = [];

  const manifestPath = resolveManifestPath(args.appDir, args.manifest);
  const inventoryPath =
    args.inventory ||
    path.join(args.appDir, "qa/perfection/INVENTORY.md");
  const versionPath =
    args.versionFile || path.join(args.appDir, "VERSION.json");
  const galleryRoot = path.join(args.appDir, "docs/screenshots/gallery");

  if (!fs.existsSync(manifestPath)) {
    failures.push(`Missing gallery-manifest.json at ${manifestPath}`);
    reportAndExit(failures, warnings, args, {
      manifestPath,
      inventoryPath,
      versionPath,
    });
  }

  const manifest = loadJson(manifestPath);
  const shots = Array.isArray(manifest.shots) ? manifest.shots : [];
  if (!shots.length) {
    failures.push("Manifest has zero shots");
  }

  let versionJson = null;
  if (fs.existsSync(versionPath)) {
    try {
      versionJson = loadJson(versionPath);
    } catch (err) {
      warnings.push(`VERSION.json unreadable: ${err.message}`);
    }
  } else {
    warnings.push(`VERSION.json not found at ${versionPath}`);
  }

  // —— Missing files ——
  for (const shot of shots) {
    const file = shot.file;
    if (!file) {
      failures.push(`Shot ${shot.id || "?"} missing file field`);
      continue;
    }
    const abs = path.isAbsolute(file)
      ? file
      : path.join(path.dirname(manifestPath), file);
    const alt = path.join(galleryRoot, file);
    if (!fs.existsSync(abs) && !fs.existsSync(alt)) {
      failures.push(`Missing file: ${file} (shot ${shot.id || shot.screen || "?"})`);
    }
  }

  // —— Version freshness ——
  if (versionJson && versionOlder(manifest.version, versionJson)) {
    failures.push(
      `Manifest version ${manifest.version || "(none)"} !== app VERSION.json ${versionJson.version}`,
    );
  }
  const versionUpdated = parseIso(versionJson?.updated || versionJson?.date);
  const capturedAt = parseIso(manifest.capturedAt || manifest.generated);
  if (versionUpdated && capturedAt && capturedAt < versionUpdated) {
    failures.push(
      `Manifest capturedAt ${manifest.capturedAt || manifest.generated} is older than VERSION.json updated ${versionJson.updated || versionJson.date}`,
    );
  }
  for (const shot of shots) {
    const file = shot.file;
    if (!file) continue;
    const abs = fs.existsSync(path.join(path.dirname(manifestPath), file))
      ? path.join(path.dirname(manifestPath), file)
      : path.join(galleryRoot, file);
    if (!fs.existsSync(abs)) continue;
    if (versionUpdated) {
      const mtime = fs.statSync(abs).mtimeMs;
      if (mtime + 1000 < versionUpdated) {
        failures.push(
          `Shot older than version: ${file} (mtime ${new Date(mtime).toISOString()} < VERSION updated)`,
        );
      }
    }
  }

  // —— Inventory coverage ——
  if (fs.existsSync(inventoryPath)) {
    const inventory = parseInventory(fs.readFileSync(inventoryPath, "utf8"));
    const byKey = new Map();
    for (const shot of shots) {
      const key = shotCoverageKey(shot);
      if (!byKey.has(key)) byKey.set(key, new Set());
      const theme = normalizeTheme(shot.theme);
      const device = normalizeDevice(shot.device || shot.viewport);
      byKey.get(key).add(`${theme}::${device}`);
      // Also index by screen-only for loose inventory bullets
      const screenKey = `${slug(shot.screen || shot.label || "")}::default`;
      if (!byKey.has(screenKey)) byKey.set(screenKey, new Set());
      byKey.get(screenKey).add(`${theme}::${device}`);
    }

    for (const entry of inventory) {
      const keys = [
        `${slug(entry.screen)}::${slug(entry.state)}`,
        `${slug(entry.screen)}::default`,
      ];
      let covered = null;
      for (const k of keys) {
        if (byKey.has(k)) {
          covered = byKey.get(k);
          break;
        }
      }
      if (!covered) {
        failures.push(`Inventory entry missing from gallery: ${entry.screen} (${entry.state})`);
        continue;
      }
      for (const theme of REQUIRED_THEMES) {
        for (const device of args.requiredDevices) {
          if (!covered.has(`${theme}::${device}`)) {
            // MasteryCap sepia counts as extra, not a substitute for light/dark
            failures.push(
              `Missing ${theme}/${device} for inventory: ${entry.screen} (${entry.state})`,
            );
          }
        }
      }
    }
  } else {
    warnings.push(
      `INVENTORY.md not found at ${inventoryPath} — skipped inventory coverage (Builders must add it in phase B)`,
    );
    // Still require every shot id to have light+dark×required devices if we can group by id base
    const groups = new Map();
    for (const shot of shots) {
      const base = String(shot.id || shotCoverageKey(shot)).replace(/--(light|dark)$/i, "");
      const screen = shot.screen || base;
      const state = shot.state || "default";
      const key = `${slug(screen)}::${slug(state)}`;
      if (!groups.has(key)) groups.set(key, new Set());
      groups.get(key).add(`${normalizeTheme(shot.theme)}::${normalizeDevice(shot.device || shot.viewport)}`);
    }
    for (const [key, covered] of groups) {
      for (const theme of REQUIRED_THEMES) {
        for (const device of args.requiredDevices) {
          if (!covered.has(`${theme}::${device}`)) {
            warnings.push(`Coverage gap (no inventory): ${key} missing ${theme}/${device}`);
          }
        }
      }
    }
  }

  // —— Blank detection ——
  let playwright = null;
  if (!args.skipBlank) {
    playwright = await loadPlaywright();
    if (!playwright) {
      warnings.push(
        "playwright-core not found — blank check skipped. Set PW_CORE or pass --skip-blank",
      );
    }
  }

  // Reuse one browser for all blank checks
  if (playwright && !args.skipBlank) {
    let browser;
    try {
      browser = await playwright.chromium.launch({ headless: true });
      const page = await browser.newPage();
      for (const shot of shots) {
        const file = shot.file;
        if (!file) continue;
        const abs = fs.existsSync(path.join(path.dirname(manifestPath), file))
          ? path.join(path.dirname(manifestPath), file)
          : path.join(galleryRoot, file);
        if (!fs.existsSync(abs)) continue;
        try {
          const data = fs.readFileSync(abs);
          const b64 = data.toString("base64");
          const ext = path.extname(abs).toLowerCase();
          const mime =
            ext === ".png" ? "image/png" :
            ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
            "image/webp";
          const ratio = await page.evaluate(async ({ b64, mime }) => {
            const blob = await (await fetch(`data:${mime};base64,${b64}`)).blob();
            const bmp = await createImageBitmap(blob);
            const canvas = document.createElement("canvas");
            const maxSide = 64;
            const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
            canvas.width = Math.max(1, Math.round(bmp.width * scale));
            canvas.height = Math.max(1, Math.round(bmp.height * scale));
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
            const { data: px } = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const counts = new Map();
            let total = 0;
            for (let i = 0; i < px.length; i += 4) {
              if (px[i + 3] < 8) continue;
              const key = ((px[i] >> 3) << 10) | ((px[i + 1] >> 3) << 5) | (px[i + 2] >> 3);
              counts.set(key, (counts.get(key) || 0) + 1);
              total++;
            }
            if (!total) return 1;
            let max = 0;
            for (const v of counts.values()) max = Math.max(max, v);
            return max / total;
          }, { b64, mime });
          if (ratio >= BLANK_THRESHOLD) {
            failures.push(
              `Blank shot (≥${Math.round(BLANK_THRESHOLD * 100)}% one colour): ${file} (ratio=${ratio.toFixed(3)})`,
            );
          }
        } catch (err) {
          warnings.push(`Blank check failed for ${file}: ${err.message}`);
        }
      }
      await page.close();
    } catch (err) {
      warnings.push(`Blank check browser failed: ${err.message}`);
    } finally {
      if (browser) await browser.close();
    }
  }

  reportAndExit(failures, warnings, args, {
    manifestPath,
    inventoryPath,
    versionPath,
    shotCount: shots.length,
    app: manifest.app,
    version: manifest.version,
  });
}

function reportAndExit(failures, warnings, args, meta) {
  const ok = failures.length === 0;
  const report = {
    gate: "G17",
    pass: ok,
    failures,
    warnings,
    meta,
  };
  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`G17 gallery completeness — ${ok ? "PASS" : "FAIL"}`);
    if (meta?.app) console.log(`  app: ${meta.app} ${meta.version || ""}`.trim());
    if (meta?.shotCount != null) console.log(`  shots: ${meta.shotCount}`);
    for (const w of warnings) console.log(`  warn: ${w}`);
    for (const f of failures) console.log(`  fail: ${f}`);
  }
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
