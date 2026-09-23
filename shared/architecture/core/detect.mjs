/** Stack detection from filesystem — SPEC §3 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * @param {string} root
 * @returns {string[]}
 */
export function detectStacks(root) {
  const stacks = new Set();
  const has = function (rel) {
    return fs.existsSync(path.join(root, rel));
  };
  const walkHas = function (pred, maxFiles) {
    let count = 0;
    const stack = [root];
    while (stack.length && count < (maxFiles || 4000)) {
      const dir = stack.pop();
      let entries;
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const ent of entries) {
        if (
          ent.name === 'node_modules' ||
          ent.name === '.git' ||
          ent.name === 'dist' ||
          ent.name === 'build' ||
          ent.name === 'vendor' ||
          ent.name === 'tests' ||
          ent.name === 'e2e' ||
          ent.name === 'qa' ||
          ent.name === 'scripts' ||
          ent.name === 'test-results' ||
          ent.name === 'releases' ||
          ent.name === '_site' ||
          ent.name === 'out'
        ) {
          continue;
        }
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
          stack.push(full);
          continue;
        }
        count++;
        if (pred(full, ent.name)) return true;
      }
    }
    return false;
  };

  if (has('index.html') || walkHas(function (_f, n) { return n === 'index.html'; }, 200)) {
    stacks.add('html');
  }

  // Classic script apps (vanilla)
  if (
    walkHas(function (f, n) {
      return /\.(js|mjs)$/.test(n) && !f.includes('node_modules') && looksLikeClassicScript(f);
    }, 500)
  ) {
    stacks.add('vanilla-globals');
  }

  if (has('package.json')) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
      const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
      if (deps.react || deps['react-dom']) stacks.add('es-modules');
      if (deps['react-router'] || deps['react-router-dom']) stacks.add('routes-react');
      if (deps.next) {
        stacks.add('es-modules');
        stacks.add('routes-react');
      }
      if (deps.expo || deps['react-native']) {
        stacks.add('es-modules');
        stacks.add('routes-react');
      }
      if (deps.dexie || deps.idb) stacks.add('es-modules');
      if (deps['@nestjs/core'] || deps['@nestjs/common']) stacks.add('nest-prisma');
      if (deps.prisma || deps['@prisma/client']) stacks.add('nest-prisma');
    } catch {
      /* ignore */
    }
  }

  // Nested package.json (DeeFoodieApp/api, monorepo packages)
  for (const nested of ['api/package.json', 'server/package.json', 'backend/package.json']) {
    if (!has(nested)) continue;
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(root, nested), 'utf8'));
      const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
      if (deps['@nestjs/core'] || deps['@nestjs/common'] || deps.prisma || deps['@prisma/client']) {
        stacks.add('nest-prisma');
      }
    } catch {
      /* ignore */
    }
  }

  if (has('app') && (has('app/page.tsx') || has('app/page.jsx') || has('app/page.ts') || has('app/page.js'))) {
    stacks.add('es-modules');
    stacks.add('routes-react');
  }

  if (
    has('schema.prisma') ||
    has('prisma/schema.prisma') ||
    has('api/prisma/schema.prisma')
  ) {
    stacks.add('nest-prisma');
  }

  if (
    walkHas(function (_f, n) {
      return n === 'sw.js' || n === 'service-worker.js' || /\.worker\.(js|ts)$/.test(n);
    }, 300)
  ) {
    stacks.add('service-worker');
  }

  if (has('wrangler.toml') || has('worker')) {
    stacks.add('cloudflare-worker');
  }

  if (
    walkHas(function (_f, n) {
      return n.endsWith('.dart') || n === 'pubspec.yaml';
    }, 200)
  ) {
    stacks.add('dart-flutter');
  }

  // Always consider env/config when any env-like file exists
  if (
    walkHas(function (_f, n) {
      return n === '.env' || n.startsWith('.env.') || n === 'app.json' || n === 'app.config.js' || n === 'app.config.ts';
    }, 200)
  ) {
    stacks.add('env-config');
  } else {
    stacks.add('env-config'); // still scan process.env references in code
  }

  if (
    walkHas(function (f, n) {
      return /\.(tsx?|jsx?|mjs|cjs)$/.test(n) && hasImportExport(f);
    }, 400)
  ) {
    stacks.add('es-modules');
  }

  return Array.from(stacks).sort();
}

function looksLikeClassicScript(file) {
  try {
    const head = fs.readFileSync(file, 'utf8').slice(0, 2000);
    if (/^\s*import\s/m.test(head) || /^\s*export\s/m.test(head)) return false;
    return true;
  } catch {
    return false;
  }
}

function hasImportExport(file) {
  try {
    const head = fs.readFileSync(file, 'utf8').slice(0, 3000);
    return /^\s*import\s/m.test(head) || /^\s*export\s/m.test(head);
  } catch {
    return false;
  }
}
