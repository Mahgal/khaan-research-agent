# Slide Deck — KHAAN Research Agent (7 slides)

**1 · Title**
KHAAN Research Agent — Research with Receipts
An agent that executes inside disposable sandboxes, and proves it.
Vultr: Agent Rush · Blast Radius Zero

**2 · The problem**
Chat-box agents: no execution trail, unverifiable citations, credentials sitting
next to untrusted web content. One prompt-injected page away from a breach.
Teams can't approve what they can't audit.

**3 · What it does**
Ask → plan → search → fetch & read sources → synthesise cited brief →
deterministic citation audit → answer + full execution trace ("receipts").

**4 · Containment architecture** (diagram from README)
Control layer on Vultr Cloud Compute · fetch sandboxes (egress-only,
secret-free, read-only, capped, destroyed per task) · compute sandbox
(network-less) for the audit · all LLM calls via Vultr Serverless Inference.

**5 · Proof, not promises**
Live probes: rm -rf blocked (read-only root), infinite loop killed by cap,
secret hunt finds nothing, prompt injection ingested as data. Host canary
survives every probe. Receipts: sandbox id, engine, caps, duration, destroyed.

**6 · Business value**
The agent-infrastructure shape compliance can approve: research, QA sweeps,
competitive intelligence — executed work with an audit trail. Research workflow
is the production pipeline behind khaan.si, re-platformed onto Vultr.

**7 · Roadmap / ask**
Throwaway Vultr instances per task via Vultr API · browser-use sandboxes with
screenshot receipts (Pattern B full) · team workspaces & audit export.
Built solo for Agent Rush — MIT licensed.
