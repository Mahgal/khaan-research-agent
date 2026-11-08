'use strict';
/**
 * Disposable sandbox runner — the containment core of the system.
 *
 * Every unit of agent work (page fetch, citation audit, hostile-probe) runs
 * in a FRESH environment that is destroyed when the task ends:
 *  - fetch class   : network allowed, but NO secrets in env, read-only root,
 *                    256 MB RAM / 0.5 CPU / 64 pids caps, hard timeout.
 *  - compute class : network fully OFF (--network none), same caps.
 * Production engine: Docker (image bakes /app/sandbox scripts).
 * Dev fallback (no Docker on host): Linux user+net namespaces via unshare,
 * scrubbed environment, tmp cwd — receipts honestly label the engine used.
 * WARNING: the fallback isolates network and environment only — it is NOT a
 * filesystem containment boundary and must never be presented as one. It
 * exists so the pipeline can be developed without Docker. All destructive
 * probes and all production runs require the Docker engine (read-only root).
 * A receipt is returned for every run; receipts are the product's audit trail.
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const IMAGE = process.env.SANDBOX_IMAGE || 'khaan/sandbox:1';
let dockerOk = null;

function hasDocker() {
  if (dockerOk !== null) return dockerOk;
  try { require('child_process').execSync('docker info >/dev/null 2>&1', { timeout: 4000 }); dockerOk = true; }
  catch { dockerOk = false; }
  return dockerOk;
}

let seq = 0;
function runSandbox({ cls, script, args = [], stdin = '', timeoutMs = 30000 }) {
  return new Promise(resolve => {
    const id = 'sbx-' + Date.now().toString(36) + '-' + (++seq);
    const started = Date.now();
    const useDocker = hasDocker();
    let cmd, cmdArgs, env;
    const caps = { memory: '256m', cpus: '0.5', pids: 64, timeoutMs, network: cls === 'compute' ? 'none' : 'egress-only' };
    if (useDocker) {
      cmd = 'docker';
      cmdArgs = ['run', '--rm', '-i', '--name', id,
        '--memory', caps.memory, '--cpus', caps.cpus, '--pids-limit', String(caps.pids),
        '--read-only', '--tmpfs', '/tmp:size=64m', '--security-opt', 'no-new-privileges', '--cap-drop', 'ALL'];
      if (cls === 'compute') cmdArgs.push('--network', 'none');
      cmdArgs.push(IMAGE, 'node', '/app/sandbox/' + script, ...args);
      env = { PATH: process.env.PATH }; // host env is NOT passed into the container
    } else {
      // Dev fallback: namespaces. compute => net namespace (no network at all).
      // fetch => plain subprocess, scrubbed env. Both: tmp cwd, no secrets.
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), id + '-'));
      const nodeArgs = [path.join(ROOT, 'sandbox', script), ...args];
      if (cls === 'compute') { cmd = 'unshare'; cmdArgs = ['-rn', 'node', ...nodeArgs]; }
      else { cmd = 'node'; cmdArgs = nodeArgs; }
      env = { PATH: process.env.PATH, HOME: tmp, TMPDIR: tmp };
      var cwdTmp = tmp;
    }
    let out = '', err = '', timedOut = false, settled = false;
    const child = spawn(cmd, cmdArgs, { env, cwd: cwdTmp || ROOT });
    const killer = setTimeout(() => { timedOut = true; try { child.kill('SIGKILL'); } catch {} if (useDocker) { try { require('child_process').execSync('docker rm -f ' + id + ' >/dev/null 2>&1'); } catch {} } }, timeoutMs);
    child.stdout.on('data', d => { out += d; if (out.length > 4_000_000) child.kill('SIGKILL'); });
    child.stderr.on('data', d => { err += d; });
    child.on('error', e => { if (!settled) { settled = true; clearTimeout(killer); resolve({ receipt: mkReceipt(), stdout: out, stderr: String(e), exitCode: -1 }); } });
    child.on('close', code => {
      if (settled) return; settled = true; clearTimeout(killer);
      resolve({ receipt: mkReceipt(), stdout: out, stderr: err.slice(-2000), exitCode: timedOut ? -9 : code });
    });
    if (stdin) { child.stdin.write(stdin); }
    child.stdin.end();

    function mkReceipt() {
      return {
        id, class: cls, engine: useDocker ? 'docker' : 'namespace-fallback',
        image: useDocker ? IMAGE : 'host-node (dev)',
        caps, durationMs: Date.now() - started,
        timedOut, destroyed: true, secretsInside: false
      };
    }
  });
}

module.exports = { runSandbox, hasDocker };
