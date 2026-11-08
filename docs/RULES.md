# Vultr: Agent Rush — Rules Digest (verified 2026-11-08)

Sources (official, read verbatim):
- LabLab event page (mirror): https://lablab.build/ai-hackathons/vultr-hackathon
- Vultr Community event page: https://community.vultr.com/e/vultr-agent-rush-hackathon

## Deadline
- Event window listed as 2026-11-03 16:00 UTC → **2026-11-08 23:00 UTC** on the
  LabLab page (= **Beijing 2026-11-09 07:00**); the Vultr Community events widget
  lists the window ending 2026-11-09 03:00 UTC (= Beijing 11:00).
- **Working assumption: Beijing 2026-11-09 07:00 is the hard submission line.**
  Internal readiness target: 2026-11-08 24:00 Beijing.
- On-site finale 2026-11-08 in Salt Lake City is optional (approved teams only);
  online participation is complete without it. Travel not covered.

## Challenges (choose one)
1. **Blast Radius Zero** — web agent that does real work (code execution or
   browser use) inside isolated sandboxes on Vultr.
   - REQUIRES: Vultr VM backend + web app deployed on Vultr +
     **Vultr Serverless Inference for agent LLM calls** + isolated sandbox
     execution (Docker strongly recommended).
   - Video must show **at least one containment moment**.
   - Official example directions include "Research with Receipts" (Pattern B).
2. **Powering the Future of Work** — enterprise multi-step workflows.
   - Requires Vultr VM backend + web deployment; Serverless Inference optional.

"An agent that only chats is a demo; an agent that executes safely is a product."
Projects should show multi-step agentic workflows, real executed results,
verifiable output, production-style web app — all on Vultr infrastructure.

## Judging criteria
Application of Technology · Presentation · Business Value · Originality.

## Prizes
- 1st: $5,000 cash + $3,000 Vultr credits
- 2nd: $3,000 cash + $1,000 Vultr credits
- 3rd: $1,000 cash + $1,000 Vultr credits
- Every participant: $200 free Vultr credits. Prize distribution may take up to 90 days.

## Eligibility & participation requirements
- Everyone welcome, any experience level; teams of 1–6. No country restriction stated.
- **Register on lablab.ai AND join the LabLab Discord — both required.**
- Submissions must be original and MIT-compliant.
- **A Vultr account is required**: both challenges mandate a Vultr VM backend and
  the web app deployed on Vultr; Serverless Inference keys and the $200 hackathon
  credits also live in that account.
- Credit redemption: create the account with an email **not previously associated
  with a Vultr account** → verify email → Billing → hackathon promotion page →
  enter the gift code → balance shows $200.00.

## What to submit (on LabLab — the only official channel)
- Project title, short description, long description, technology & category tags
- Cover image, video presentation, slide presentation
- Public GitHub repository; demo application platform; application URL
- README must explain: Vultr services/infrastructure used, backend/deployment
  architecture, the agent's use case and how it executes real tasks
- Challenge 1: a containment moment demonstrated in the demo video
