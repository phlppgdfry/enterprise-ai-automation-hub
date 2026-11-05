# Interview and client walkthroughs

Every walkthrough concerns the fictional Noordwerk case. Distinguish executed local
checks from design, simulation and external dependencies. Never describe authored
workshops or model results as customer validation.

## Automation Hub

### 30 seconds

“I built a request-to-decision workflow on a .NET API. Employees submit materials,
expenses or access requests; rules route them and a separate reviewer records a reason.
The UI is real, with persistence and tested retry/concurrency behaviour. Microsoft
Power Platform is a mapped deployment target, not a claimed live integration.”

### Three minutes

Spend 30 seconds on email handoff problems and process ownership. Demonstrate Alice
submitting €320, Maria reviewing and deciding with a reason, and Alice seeing history.
Switch to Bob to show record isolation. Explain owner-scoped retry keys, pending-to-final
state and version conflicts. Close with the production gaps: public fixtures, JSON
storage, queue-specific permissions, protected audit and tenant acceptance.

### Fifteen minutes

- 0–2: fictional client, business constraints, category/amount rules and human control.
- 2–6: browser flow, empty/search states, separate persona and history.
- 6–9: `src/Program.cs`, identity mapping, validation, atomic commit and state machine.
- 9–12: HTTP tests for concurrent retries, decisions, restart and denied ownership.
- 12–15: Entra/Dataverse/Power Automate target, ALM, failure recovery and explicit limits.

### Client-facing explanation

“The pilot makes ownership and status visible. It can reduce handoff work, but it does
not eliminate human review. We will measure time and rework before claiming a saving.
Your administrators must confirm identity, licensing, data storage and support before
using actual company information.”

## Agent Governance

### 30 seconds

“I preserved a deterministic policy reference and added a real local-model experiment.
It filters permitted published excerpts before inference and validates the returned
source and exact text. The model has no action authority. I kept failed evaluations:
the better model passes 10/12 cases but only 2/4 supported questions, so it is not released.”

### Three minutes

Explain why deterministic routing stays outside AI. Show the protocol, Ollama adapter,
filtered context and exact-excerpt validator. Run a supported question, then a human
approval handoff. Open the real evaluation report and distinguish eight model calls
from four safety-gated cases. Explain that a valid citation does not prove relevance,
that CLI persona is not login, and why an independent holdout comes before extra tools.

### Fifteen minutes

- 0–3: four policy documents, published/role filters, data minimisation and trusted sources.
- 3–6: provider protocol, bounded JSON response, fixed destination, timeout and token trace.
- 6–9: validate source IDs and complete curated excerpts; reject action fields and malformed output.
- 9–12: compare deterministic tests, adversarial fixtures and genuine local-model reports.
- 12–15: failure analysis, poor supported-question quality, tenant auth, remote source risks,
  and why no vector store, orchestration framework or MCP server is justified yet.

### Client-facing explanation

“The assistant may point to an approved policy, but it cannot approve spending or grant
access. We can verify where its answer came from; we still need to test whether it chose
the right policy. Its current relevance results are insufficient for a business pilot.”

## Consulting Playbook

### 30 seconds

“I framed the same project as an investment decision: discovery, hard use-case gates,
process redesign, a reproducible cost model and adoption plan. Including the ramp gives
negative €7,695 in year one and month 25 payback under fictional assumptions. I recommend
measuring a smaller pilot rather than manufacturing attractive AI returns.”

### Three minutes

Describe the stakeholder tension: employees want simplicity, Finance needs evidence,
IT needs controlled identities and support. Show rules-first prioritisation and the
blocked HR cases. Walk through cost drivers, released capacity versus realised value,
and ramp cash flow. Use the PDF to ask for a discovery decision, owner and spending cap.
Explain how pilot observations update the model and can justify simplifying or stopping.

### Fifteen minutes

- 0–3: case brief, workshop questions, missing baseline and stakeholder decisions.
- 3–6: AS-IS/TO-BE BPMN, bottlenecks, routing, exceptions and accountable owner.
- 6–9: hard gates, build/buy/email options and risk register.
- 9–12: `playbook.py`, `financial_model.py`, reconciled costs, timing and sensitivity tests.
- 12–15: staged roadmap, RACI, adoption measurement, operational handover and stop criteria.

### Client-facing presentation

Use the ten-page executive PDF: problem → working reference → process → options →
architecture → economics → sensitivity → governance → roadmap → requested decision.
Ask for approval of discovery and a bounded learning budget, not for blind acceptance
of a full AI programme. Bring the input JSON and monthly calculation to answer questions.
