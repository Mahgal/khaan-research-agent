'use strict';
/**
 * Runs INSIDE a disposable compute-sandbox container with NO network.
 * Input (stdin): JSON { answer, sources: [{n, title, url, text}] }
 * Output (stdout): JSON verification report.
 * Deterministic citation audit (this is the "receipts" checker):
 *  - every [n] citation in the answer must map to a fetched source;
 *  - each cited sentence is checked for term overlap with its source text —
 *    sentences whose key terms barely appear in the cited source are flagged;
 *  - out-of-range citations are stripped from the cleaned answer.
 * No LLM in here: verification is code, so its verdict is reproducible.
 */
let input = '';
process.stdin.on('data', d => { input += d; });
process.stdin.on('end', () => {
  let parsed;
  try { parsed = JSON.parse(input); } catch { process.stdout.write(JSON.stringify({ ok: false, error: 'bad input' }) + '\n'); return; }
  const { answer = '', sources = [] } = parsed;
  const byN = new Map(sources.map(s => [s.n, s]));
  const stop = new Set('the a an and or of to in is are was were be been for on with as by at from that this it its their our your his her they we you not no do does did will would can could should may might than then so such into about over under more most other some any all each per via et al'.split(' '));
  const terms = s => new Set((s.toLowerCase().match(/[a-z0-9][a-z0-9\-]{2,}/g) || []).filter(w => !stop.has(w)));

  const used = new Set();
  const findings = [];
  const sentences = answer.split(/(?<=[.!?。！？])\s+/);
  for (const sent of sentences) {
    const cites = [...sent.matchAll(/\[(\d+)\]/g)].map(m => Number(m[1]));
    for (const n of cites) {
      if (!byN.has(n)) { findings.push({ type: 'out_of_range', citation: n, sentence: sent.slice(0, 120) }); continue; }
      used.add(n);
      const st = terms(sent.replace(/\[\d+\]/g, ' '));
      const src = terms(byN.get(n).text || '');
      if (st.size >= 4) {
        let hit = 0; for (const w of st) if (src.has(w)) hit++;
        const overlap = hit / st.size;
        if (overlap < 0.18) findings.push({ type: 'weak_support', citation: n, overlap: Number(overlap.toFixed(2)), sentence: sent.slice(0, 120) });
      }
    }
  }
  const cleaned = answer.replace(/\[(\d+)\]/g, (m, n) => byN.has(Number(n)) ? m : '');
  const report = {
    ok: true,
    sourcesFetched: sources.length,
    citationsUsed: [...used].sort((a, b) => a - b),
    outOfRange: findings.filter(f => f.type === 'out_of_range').length,
    weakSupport: findings.filter(f => f.type === 'weak_support').length,
    findings: findings.slice(0, 20),
    verdict: findings.some(f => f.type === 'out_of_range') ? 'CORRECTED' : (findings.length ? 'FLAGGED' : 'VERIFIED'),
    cleanedAnswer: cleaned
  };
  process.stdout.write(JSON.stringify(report) + '\n');
});
