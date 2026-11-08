# KHAAN Research Agent — Research with Receipts

**An AI research agent that does real work inside disposable sandboxes — and proves it.**

Ask a question. The agent plans its own searches, fetches and reads the sources,
writes a cited brief, and then has every citation **audited by deterministic code**
before you see the answer. Every unit of work runs in a fresh, capped, secret-free
sandbox that is destroyed when the task ends — and every run leaves a **receipt**.

Built for the **Vultr: Agent Rush Hackathon — Challenge 1: Blast Radius Zero**.

---

## Why this exists

Most "research agents" are a chat box with a search API. You cannot tell what they
executed, what they read, or whether their citations are real. This one is built
containment-first, like a product you could hand to a compliance team:

- **It executes, it doesn't just chat.** Multi-step workflow: query planning →
  live web search → full-page fetching/extraction → synthesis → citation audit.
- **Every execution is contained.** Fetching and verification never run in the app
  process. They run in one-shot Docker sandboxes with a read-only root filesystem,
  256 MB RAM / 0.5 CPU / 64 PID caps, hard timeouts, `no-new-privileges`, all
  capabilities dropped — destroyed after each task.
- **No secrets in the blast zone.** Sandbox environments contain no API keys at
  all (the secrets probe in the demo dumps the environment: only `PATH` exists).
  A prompt-injected web page can shout instructions all day; there is nothing
  inside its sandbox worth stealing, and the page text is treated as data, never
  as instructions.
- **Receipts, not vibes.** Each answer ships with the full execution trace:
  sandbox IDs, engine, resource caps, durations, and the audit verdict.
- **Verification is code.** The citation checker is a deterministic program that
  runs in a *network-less* sandbox: out-of-range citations are stripped,
  weakly-supported sentences are flagged, and the verdict is reproducible.

## Architecture

```
Browser ──► Control layer (this app, on a Vultr Cloud Compute VM)
              │  plans queries, orchestrates, rate-limits, assembles receipts
              ├──► Fetch sandboxes (Docker, egress-only, secret-free, read-only)
              │      search-result pages + source pages → extracted text
              ├──► LLM calls → Vultr Serverless Inference (OpenAI-compatible)
              └──► Compute sandbox (Docker, --network none)
                     deterministic citation audit → VERIFIED / FLAGGED / CORRECTED
```

Two sandbox classes, deliberately different network postures:

| Class   | Network      | Secrets | Used for                                  |
|---------|--------------|---------|-------------------------------------------|
| fetch   | egress-only  | none    | search + page fetching/extraction         |
| compute | **none**     | none    | citation audit, hostile-code probes       |

## How Vultr powers this

- **Vultr Cloud Compute VM** — hosts the control layer (this Node app) and the
  Docker daemon that spawns one disposable sandbox container per task. Vultr is
  the central system of control and orchestration, not static hosting.
- **Vultr Serverless Inference** (`https://api.vultrinference.com/v1`,
  OpenAI-compatible) — **all** agent LLM calls (query planning + brief synthesis)
  go through it. Configure via `LLM_API_KEY` / `LLM_MODEL`.
- **Docker sandboxing on the VM** — the containment boundary described above.
  (Scaling path: swap `docker run` for throwaway Vultr instances via the Vultr
  API, one per task — the runner interface already isolates that decision.)

## Quick start

```bash
# On a Vultr Cloud Compute VM (Ubuntu 22.04/24.04), as root:
git clone <this repo> && cd vultr-agent-rush-2026
cp .env.example .env   # fill in LLM_API_KEY + LLM_MODEL (Vultr Serverless Inference)
bash deploy.sh         # installs Node 22 + Docker, builds the sandbox image, starts systemd service
curl http://127.0.0.1:8080/api/health
```

Local development (no Docker): `node server.js` — the sandbox runner falls back
to Linux namespaces for the compute class and labels receipts
`namespace-fallback (dev)`. That fallback is a development convenience, **not**
the production containment boundary; production receipts come from Docker.

Without an LLM key the app runs in a clearly-labelled extractive dev mode: the
full pipeline (search → sandboxed fetch → audit) still executes for real; only
the narrative synthesis is extractive instead of model-written.

## API

- `GET  /api/health` — `{ ok, llmMode, llmBase, sandboxEngine }`
- `POST /api/research` `{ "question": "..." }` — NDJSON stream of step events
  (each with its sandbox receipt), ending with the brief, sources, verification
  report and all receipts.
- `POST /api/probe` `{ "mode": "rm" | "loop" | "secrets" }` — runs a hostile
  probe inside a fresh compute sandbox and reports the outcome plus whether the
  host canary file survived.
- `GET  /probe-page` — a deliberately hostile page (prompt injection) used in
  the demo to show injected instructions being captured as data.

## The containment moment (in the demo video)

1. **rm -rf probe** — hostile code tries to delete the filesystem from inside a
   compute sandbox: read-only root blocks it; the host canary file is verified
   intact afterwards.
2. **Infinite loop** — killed by the hard time cap; receipt shows `timedOut`.
3. **Secret hunt** — the sandbox environment contains no credentials to find.
4. **Prompt-injection page** — fetched into a secret-free sandbox; its
   "SYSTEM OVERRIDE" text is ingested as data and quoted in the trace, and the
   brief ignores it.

## Repo layout

```
server.js            control layer (zero-dependency Node)
lib/llm.js           OpenAI-compatible client (Vultr Serverless Inference)
lib/sandbox.js       disposable sandbox runner + receipts
lib/research.js      plan → fetch → synthesise → audit pipeline
sandbox/fetch.js     in-sandbox page fetcher/extractor
sandbox/verify.js    in-sandbox deterministic citation auditor
sandbox/probe.js     in-sandbox hostile probes
public/index.html    demo UI with live execution trace
Dockerfile.sandbox   sandbox image (node:22-alpine + worker scripts)
deploy.sh            one-command deployment on a Vultr VM
docs/                rules digest, submission draft, video script, slides
```

## Lineage

The research workflow (multi-source retrieval, full-text reading, citation
checking) is the competition build of the production pipeline behind
[khaan.si](https://khaan.si)'s AI search, re-platformed onto Vultr with the
sandbox execution layer built for this hackathon.

## License

MIT — see `LICENSE`.
