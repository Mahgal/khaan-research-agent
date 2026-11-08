# LabLab Submission — Pre-filled Draft

Status: **DRAFT — do not submit until the parent agent confirms.**
Placeholders in ‹angle brackets› get filled after the Vultr deployment exists.

---

**Project title**
KHAAN Research Agent — Research with Receipts

**Short description** (one-liner for the gallery)
A research agent that plans, fetches and fact-checks inside disposable Docker
sandboxes on Vultr — every claim citation-audited by code, every execution
leaving a receipt.

**Long description**
Research agents today are chat boxes: you can't see what they executed, what
they read, or whether their citations are real. KHAAN Research Agent is built
containment-first, Blast-Radius-Zero style.

Ask a question and the control layer (a zero-dependency Node service on a Vultr
Cloud Compute VM) plans its own search queries, then dispatches every unit of
work into fresh, one-shot Docker sandboxes: search and page fetching run in
egress-only, secret-free, read-only containers (256 MB / 0.5 CPU / PID caps,
hard timeouts, destroyed after each task). All LLM calls — planning and
synthesis — go through Vultr Serverless Inference. Before you see the answer, a
deterministic citation auditor runs in a network-less sandbox: out-of-range
citations are stripped, weakly supported sentences flagged, verdict attached.

The UI shows the full execution trace live — sandbox IDs, resource caps,
durations, destruction confirmations — and a containment panel lets anyone fire
hostile probes (rm -rf attempt, infinite loop, secret hunt) at the sandbox and
watch the host canary survive. A built-in hostile page demonstrates prompt
injection being ingested as data inside a sandbox that holds no secrets.

Business value: this is the shape of agent infrastructure a compliance-minded
team can actually approve — executed work, verifiable output, zero blast radius.
The research workflow is the competition build of the pipeline behind
khaan.si's production AI search, re-platformed onto Vultr for this hackathon.

**Technology tags**
AI Agents · Docker · Sandboxing · Vultr Cloud Compute · Vultr Serverless
Inference · Node.js · Web Research · Citation Verification · Security

**Category tags**
Blast Radius Zero · Pattern B (sandboxed browser/web use) · Research with Receipts

**Cover image**
public/cover.svg (hand-authored SVG in repo — convert to PNG after the VM
exec channel is restored, or upload the SVG if the form accepts it)

**Video presentation**
‹YouTube/Vimeo URL — record per docs/VIDEO-SCRIPT.md›

**Slide presentation**
‹URL or upload — content in docs/SLIDES.md›

**Public GitHub repository**
‹https://github.com/‹account›/vultr-agent-rush-2026 — push pending GitHub auth›

**Demo application platform**
Vultr Cloud Compute (Ubuntu 24.04, Docker sandboxes)

**Application URL**
‹http://‹vultr-vm-ip›:8080/ or domain after deploy›

**How we used Vultr** (mirrors README section)
Vultr Cloud Compute VM = control layer + sandbox host (central orchestration).
Vultr Serverless Inference = all agent LLM calls (OpenAI-compatible endpoint).
Docker on the VM = the containment boundary (two sandbox classes: fetch =
egress-only/secret-free; compute = network-less).

---

## Checklist before Submit
- [ ] Vultr account created by user (fresh email), $200 gift code redeemed
- [ ] lablab.ai account + event enrollment + Discord joined (user)
- [ ] VM deployed via deploy.sh; /api/health shows llmMode=live, engine=docker
- [ ] LLM_MODEL set from GET /v1/models on the user's inference key
- [ ] Live end-to-end research run verified on the public URL
- [ ] All three probes verified on the public URL (canary intact)
- [ ] GitHub repo pushed public (MIT LICENSE at root)
- [ ] Cover image attached; demo video recorded & uploaded (containment moment in)
- [ ] Slides uploaded
- [ ] **Parent agent confirms → press Submit on LabLab before Beijing 11-09 07:00**
