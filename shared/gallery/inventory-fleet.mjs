#!/usr/bin/env node
/**
 * Fleet gallery gap inventory — runs G17 check-completeness per app (§9.6).
 *
 * Usage (from fleet root Cap-Apps):
 *   node capricorn-tooling/shared/gallery/inventory-fleet.mjs
 *   node capricorn-tooling/shared/gallery/inventory-fleet.mjs --json
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHECK = path.join(__dirname, "check-completeness.mjs");

const DEFAULT_APPS = [
  "VaultCap",
  "PulseCap",
  "PrismCap",
  "SteadyCap",
  "LedgerCap",
  "DeePonyCap",
  "ScentCap",
  "SoulCap",
  "TravelCap",
  "AuraCap",
  "MasteryCap",
  "IdeaCap",
  "CarCap",
  "CookCap",
];

function parseArgs(argv) {
  const out = { fleetRoot: null, json: false, skipBlank: true, apps: DEFAULT_APPS };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") out.json = true;
    else if (a === "--fleet-root" || a.startsWith("--fleet-root=")) {
      out.fleetRoot = a.includes("=") ? a.split("=")[1] : argv[++i];
    } else if (a === "--with-blank") out.skipBlank = false;
    else if (a === "--help" || a === "-h") {
      console.log(`Usage: inventory-fleet.mjs [--fleet-root=Cap-Apps] [--json] [--with-blank]`);
      process.exit(0);
    }
  }
  out.fleetRoot =
    out.fleetRoot ||
    process.env.CAP_APPS_ROOT ||
    path.resolve(__dirname, "../../..");
  return out;
}

function runCheck(appDir, skipBlank) {
  const args = ["--app-dir", appDir, "--json"];
  if (skipBlank) args.push("--skip-blank");
  const r = spawnSync(process.execPath, [CHECK, ...args], { encoding: "utf8" });
  if (!r.stdout?.trim()) {
    return {
      app: path.basename(appDir),
      pass: false,
      shotCount: 0,
      failures: [`check exited ${r.status}: ${(r.stderr || "").slice(0, 200)}`],
      warnings: [],
    };
  }
  try {
    const j = JSON.parse(r.stdout);
    return {
      app: j.meta?.app || path.basename(appDir),
      pass: j.pass,
      shotCount: j.meta?.shotCount ?? 0,
      failures: j.failures || [],
      warnings: j.warnings || [],
      manifestPath: j.meta?.manifestPath,
    };
  } catch (err) {
    return {
      app: path.basename(appDir),
      pass: false,
      shotCount: 0,
      failures: [`JSON parse: ${err.message}`],
      warnings: [],
    };
  }
}

function main() {
  const args = parseArgs(process.argv);
  const rows = [];

  for (const name of args.apps) {
    const appDir = path.join(args.fleetRoot, name);
    if (!fs.existsSync(appDir)) {
      rows.push({ app: name, pass: false, shotCount: 0, failures: ["repo missing"], warnings: [] });
      continue;
    }
    const manifest = path.join(appDir, "docs/screenshots/gallery/gallery-manifest.json");
    if (!fs.existsSync(manifest)) {
      rows.push({
        app: name,
        pass: false,
        shotCount: 0,
        failures: ["no gallery-manifest.json"],
        warnings: [],
      });
      continue;
    }
    rows.push(runCheck(appDir, args.skipBlank));
  }

  const complete = rows.filter((r) => r.pass).map((r) => r.app);
  const gapped = rows.filter((r) => !r.pass).map((r) => ({
    app: r.app,
    shots: r.shotCount,
    topFailures: r.failures.slice(0, 3),
    failureCount: r.failures.length,
  }));

  const summary = {
    checkedAt: new Date().toISOString(),
    fleetRoot: args.fleetRoot,
    complete,
    gapped,
    rows,
  };

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(`Gallery fleet inventory — ${complete.length} complete, ${gapped.length} gapped`);
    for (const app of complete) console.log(`  ✅ ${app}`);
    for (const g of gapped) {
      console.log(`  ⛳ ${g.app} (${g.shots} shots, ${g.failureCount} fails)`);
      for (const f of g.topFailures) console.log(`      · ${f}`);
    }
  }
  process.exit(gapped.length ? 1 : 0);
}

main();
