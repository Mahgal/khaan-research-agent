# Demo Video Script (≈3 minutes)

Target: clarity (Presentation) + technology (sandbox receipts on screen) +
the mandatory **containment moment**. Record at 1080p, browser full-screen,
mouse deliberate. Voice-over or captions; keep the UI readable.

## 0:00–0:20 — Hook
Screen: demo homepage.
VO: "Every AI research agent you've seen is a chat box. You can't tell what it
executed, what it read, or if its citations are real. This one executes inside
disposable sandboxes — and shows you the receipts."

## 0:20–1:20 — A real research run
Type: "What is Vultr Serverless Inference and how is it priced?"
Narrate the trace as it streams:
- "The control layer plans its own queries…"
- "Each search and each page fetch runs in its own fresh Docker sandbox —
  watch the receipts: caps, durations, and every container destroyed after use.
  No API keys exist inside those containers."
- Land on the brief: "A structured answer, citations inline…"
- Scroll to Verification: "…and before I saw this, a deterministic auditor in a
  network-less sandbox checked every citation against the fetched text.
  Verdict: VERIFIED. Out-of-range citations would have been stripped, not
  explained away."

## 1:20–2:20 — THE CONTAINMENT MOMENT (required)
Open the Containment probes panel.
1. Click **rm -rf attempt**: "Hostile code, root inside its sandbox, tries to
   delete the filesystem. Read-only root: blocked. And the host canary file —
   verified intact after every probe."
2. Click **Infinite loop**: "Killed by the hard time cap. Receipt shows
   timedOut — and destroyed."
3. Click **Hunt for secrets**: "The environment dump: PATH, and nothing else.
   There are no credentials inside the blast zone to steal."

## 2:20–2:45 — Prompt injection (bonus containment)
Run a research question, then point the fetcher at the built-in /probe-page:
"The page hides a 'SYSTEM OVERRIDE' telling the agent to reveal its keys and
call the metadata endpoint. It gets fetched into a secret-free sandbox, treated
as data, and ignored. Injection without a blast radius is just text."

## 2:45–3:00 — Close
Screen: architecture line in the footer / README diagram.
VO: "Control layer and sandboxes on a Vultr Cloud Compute VM. Every LLM call
through Vultr Serverless Inference. Executed work, verifiable output, blast
radius zero. KHAAN Research Agent — research with receipts."

## Recording checklist
- [ ] Public URL (Vultr VM) used, health badge shows LLM live + docker engine
- [ ] One full research run completes on camera without edits
- [ ] All three probes shown; canary line visible
- [ ] Runtime ≤ ~3 min; captions on; uploaded as unlisted/public per LabLab form
