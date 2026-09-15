import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
require('../local-lock.js');
const CapLocalLock = globalThis.CapLocalLock;

async function run() {
  assert.equal(CapLocalLock.available(), true);
  assert.equal(CapLocalLock.delayForAttempt(10), 30000);
  assert.equal(CapLocalLock.delayForAttempt(11), 60000);

  const { meta, dataKey } = await CapLocalLock.enable('123456');
  assert.equal(meta.enabled, true);
  assert.equal(meta.iterations, 600000);
  assert.ok(meta.salt && meta.wrappedKey && meta.wrapIv);

  const sealed = await CapLocalLock.encryptJson(dataKey, { journal: [{ t: 1, body: 'secret' }] });
  assert.equal((await CapLocalLock.decryptJson(dataKey, sealed)).journal[0].body, 'secret');

  const ok = await CapLocalLock.unlock(meta, '123456');
  assert.equal(ok.meta.failedAttempts, 0);

  let failedMeta = meta;
  for (let i = 0; i < 10; i++) {
    try {
      await CapLocalLock.unlock(failedMeta, '000000');
      assert.fail('should reject');
    } catch (e) {
      assert.equal(e.code, 'WRONG_PASSCODE');
      failedMeta = e.meta;
    }
  }
  assert.equal(failedMeta.failedAttempts, 10);
  try {
    await CapLocalLock.unlock(failedMeta, '123456');
    assert.fail('should lock out');
  } catch (e) {
    assert.equal(e.code, 'LOCKED_OUT');
  }

  failedMeta.lockUntil = Date.now() - 1;
  const recovered = await CapLocalLock.unlock(failedMeta, '123456');
  assert.equal(recovered.meta.failedAttempts, 0);
  console.log('local-lock unit tests: ok');
}
run().catch((e) => { console.error(e); process.exit(1); });
