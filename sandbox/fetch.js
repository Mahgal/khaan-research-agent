'use strict';
/**
 * Runs INSIDE a disposable fetch-sandbox container.
 * Input (argv): a URL. Output (stdout): one JSON line
 *   { ok, url, title, text, links? , error? }
 * The container has NO secrets, a read-only rootfs, memory/CPU caps and is
 * destroyed by the host after this process exits. This script never reads
 * environment variables beyond PATH — there is nothing to steal in here.
 */
const url = process.argv[2];
const allowedFixture = process.argv[3];
const MAX_BYTES = 2_000_000;
const MAX_TEXT = 12000;

function out(o) { process.stdout.write(JSON.stringify(o) + '\n'); }

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

(async () => {
  if (url && url.startsWith('file://')) {
    if (url !== allowedFixture) {
      out({ ok: false, url, error: 'fixture mode rejects a path outside the allowed fixture file' });
      return;
    }
    try {
      const fs = require('fs');
      const fp = new URL(url).pathname;
      const html = fs.readFileSync(fp, 'utf8').slice(0, MAX_BYTES);
      const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+/g, ' ').trim().slice(0, 200);
      out({ ok: true, status: 200, url, title, text: htmlToText(html).slice(0, MAX_TEXT) });
    } catch (e) {
      out({ ok: false, url, error: String(e && e.message || e).slice(0, 200) });
    }
    return;
  }

  if (!url || !/^https?:\/\//i.test(url)) { out({ ok: false, url: url || '', error: 'bad url' }); return; }
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 15000);
    const r = await fetch(url, {
      signal: ctl.signal, redirect: 'follow',
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; KhaanResearchBot/1.0; sandbox-fetch)' }
    });
    clearTimeout(t);
    const buf = Buffer.from(await r.arrayBuffer());
    const html = buf.subarray(0, MAX_BYTES).toString('utf8');
    const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+/g, ' ').trim().slice(0, 200);
    const result = { ok: r.ok, status: r.status, url: r.url || url, title, text: htmlToText(html).slice(0, MAX_TEXT) };
    // Search pages: also extract result links (DuckDuckGo HTML / Bing HTML shapes).
    if (/duckduckgo\.com\/html|bing\.com\/search/.test(url)) {
      const links = [];
      const re = /href="(https?:\/\/[^"]+)"/g; let m;
      while ((m = re.exec(html)) && links.length < 12) {
        let u = m[1];
        const ud = u.match(/[?&]uddg=([^&]+)/); if (ud) { try { u = decodeURIComponent(ud[1]); } catch {} }
        if (/duckduckgo\.com|bing\.com|microsoft\.com|go\.microsoft/.test(u)) continue;
        if (!links.includes(u)) links.push(u);
      }
      result.links = links;
    }
    out(result);
  } catch (e) { out({ ok: false, url, error: String(e && e.message || e).slice(0, 200) }); }
})();
