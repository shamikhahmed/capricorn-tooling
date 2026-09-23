/**
 * ARCH-06 offline tests — URL matrix + response classification (no network).
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PAGES_APPS,
  PAGES_HOSTS,
  MAP_ARTIFACTS,
  buildUnpublishedUrlMatrix,
  classifyUnpublishedResponse,
} from '../pages-unpublished.mjs';

test('ARCH-06 matrix includes SoulCap architecture/ and Cap docs/architecture', () => {
  const urls = buildUnpublishedUrlMatrix({ hosts: ['https://example.test'] }).map((u) => u.url);
  assert.ok(urls.includes('https://example.test/SoulCap/architecture/index.html'));
  assert.ok(urls.includes('https://example.test/PulseCap/docs/architecture/index.html'));
  assert.ok(urls.includes('https://example.test/docs/architecture/index.html'));
  assert.ok(urls.includes('https://example.test/VaultCap/docs/architecture/architecture-data.json'));
  assert.ok(!urls.some((u) => /SoulCap\/docs\/architecture/.test(u)));
});

test('ARCH-06 matrix covers fleet apps × hosts × artifacts', () => {
  const matrix = buildUnpublishedUrlMatrix();
  const expected =
    PAGES_HOSTS.length * PAGES_APPS.length * MAP_ARTIFACTS.length;
  assert.equal(matrix.length, expected);
  assert.ok(PAGES_APPS.some((a) => a.slug === 'SoulCap' && a.mapDir === 'architecture'));
  assert.ok(PAGES_APPS.some((a) => a.slug === null && a.mapDir === 'docs/architecture'));
});

test('classifyUnpublishedResponse accepts 404/410 only', () => {
  assert.equal(classifyUnpublishedResponse({ status: 404 }).ok, true);
  assert.equal(classifyUnpublishedResponse({ status: 410 }).ok, true);
  assert.equal(classifyUnpublishedResponse({ status: 200 }).ok, false);
  assert.equal(classifyUnpublishedResponse({ status: 301 }).ok, false);
  assert.equal(classifyUnpublishedResponse({ status: 0 }).ok, false);
  assert.equal(
    classifyUnpublishedResponse({
      status: 200,
      bodySnippet: 'window.ARCH_DATA = { analyzerVersion: "1.3.0" }',
    }).reason,
    'http_200_architecture_payload'
  );
});
