'use strict';
/**
 * OpenAI-compatible LLM client.
 * Production target: Vultr Serverless Inference (https://api.vultrinference.com/v1).
 * When no API key is configured the client reports mode "mock" and callers
 * fall back to deterministic, clearly-labelled extractive behaviour so the
 * full agent pipeline (planning -> sandbox fetch -> verify) still runs
 * end-to-end for local development. Set LLM_API_KEY + LLM_MODEL to go live.
 */
const BASE = (process.env.LLM_BASE_URL || 'https://api.vultrinference.com/v1').replace(/\/$/, '');
const KEY = process.env.LLM_API_KEY || '';
const MODEL = process.env.LLM_MODEL || '';

function mode() { return KEY ? 'live' : 'mock'; }

async function chat(messages, { temperature = 0.3, maxTokens = 1200, timeoutMs = 60000 } = {}) {
  if (!KEY) throw new Error('LLM_API_KEY not set (mock mode)');
  if (!MODEL) throw new Error('LLM_MODEL not set — list models via GET /v1/models and set one');
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(BASE + '/chat/completions', {
      method: 'POST',
      signal: ctl.signal,
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + KEY },
      body: JSON.stringify({ model: MODEL, messages, temperature, max_tokens: maxTokens })
    });
    if (!r.ok) throw new Error('LLM HTTP ' + r.status + ': ' + (await r.text()).slice(0, 300));
    const j = await r.json();
    return { text: j.choices?.[0]?.message?.content || '', usage: j.usage || null, model: j.model || MODEL };
  } finally { clearTimeout(t); }
}

module.exports = { chat, mode, BASE, MODEL };
