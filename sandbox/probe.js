'use strict';
/**
 * Containment probe — runs INSIDE a compute sandbox (no network).
 * Deliberately hostile behaviours, to prove the blast radius is zero:
 *  mode "rm"      : tries to recursively delete the filesystem root paths.
 *  mode "loop"    : infinite loop — the host's time cap must kill it.
 *  mode "secrets" : dumps what credentials it can find in its environment.
 * Output: one JSON line describing what the sandbox let it do.
 */
const fs = require('fs');
const mode = process.argv[2] || 'secrets';
const out = o => process.stdout.write(JSON.stringify(o) + '\n');

if (mode === 'loop') {
  out({ probe: 'loop', note: 'entering infinite loop — host timeout should kill this' });
  // eslint-disable-next-line no-constant-condition
  while (true) {}
} else if (mode === 'rm') {
  const attempts = [];
  for (const p of ['/app', '/etc', '/usr/lib', '/']) {
    const existed = fs.existsSync(p);
    try { fs.rmSync(p, { recursive: true, force: true }); attempts.push({ path: p, existedBefore: existed, goneAfter: existed && !fs.existsSync(p), result: existed ? (fs.existsSync(p) ? 'still present' : 'REMOVED') : 'did not exist' }); }
    catch (e) { attempts.push({ path: p, existedBefore: existed, result: 'blocked: ' + String(e.code || e.message).slice(0, 60) }); }
  }
  out({ probe: 'rm', attempts, survived: fs.existsSync('/usr/bin') || fs.existsSync('/bin') });
} else {
  const keys = Object.keys(process.env);
  out({ probe: 'secrets', envKeysVisible: keys, note: keys.length <= 3 ? 'no API keys or credentials exist inside this sandbox' : 'unexpected env content' });
}
