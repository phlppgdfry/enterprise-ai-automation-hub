# Portfolio transformation report

Work date: 29 October 2026. All three target repositories were public, clean on `main`
and at their original single commits when inspected. Work is isolated on
`portfolio/noordwerk-showcase` in each repository. No default branch merge, visibility
change, paid deployment, tenant mutation or public site publication was performed.

## Executive result

The portfolio now presents one fictional client through three complementary stages:
**Decide** (investment and delivery decisions), **Deliver** (working request flow), and
**Govern** (source and authority boundaries with real model failure evidence).
The existing .NET API, deterministic agent, original financial formulas and Git
history are preserved. No new repository or fourth application was introduced.

The Hub adds a functioning responsive UI with employee submission, search/status,
separate human review, reasons, dashboard and history. The agent adds a provider
protocol, real local Ollama calls, bounded structured evidence validation, adversarial
cases and per-run trace/token/latency reports. The playbook adds a ten-page executive
PDF, risk/options brief, itemised cost model, adoption ramp and monthly sensitivities.
English READMEs, real screenshots, authored architecture SVGs, laid-out BPMN and
interview guides make the entry path clearer.

## Before / after reviewer assessment (0–10)

Scores are judgments against a credible portfolio reference, not enterprise certification.
High visual/documentation scores must not be mistaken for deployed capability. AI score
in the playbook assesses decision quality, not inference. After-scores reflect the local
work and its limitations, not an unexecuted production architecture.

| Dimension | Hub before → after | Agent before → after | Playbook before → after |
|---|---|---|---|
| Engineering | 6 → 7 | 5 → 7 | 6 → 7 |
| AI capability | 1 → 1 | 2 → 5 | 2 → 4 |
| Microsoft relevance | 5 → 6 | 5 → 5 | 5 → 6 |
| Enterprise readiness | 3 → 4 | 3 → 4 | 4 → 6 |
| Security | 4 → 5 | 3 → 5 | 5 → 5 |
| UX / visual communication | 1 → 8 | 2 → 6 | 2 → 8 |
| Documentation | 6 → 8 | 6 → 8 | 6 → 8 |
| Business value | 6 → 7 | 5 → 6 | 7 → 8 |
| Demonstrability | 4 → 8 | 5 → 7 | 4 → 8 |

The Hub AI score stays at 1 because its policy guide/routing do not invoke a model.
Agent AI rises for real inference and evaluation engineering, but supported-question
quality is poor: the better model is 2/4. Microsoft scores remain restrained because
no new Noordwerk tenant integration was deployed. Security remains limited by public
fixtures, public policy files and local storage rather than real enterprise identity.

## Significant implementation decisions

- Retain the existing .NET API and server authority. Authored same-origin JavaScript/CSS
  provides the workflow without a frontend runtime/build dependency. Optional locked
  Playwright is only for browser verification. CSP and static headers apply to UI assets.
- Retain owner-scoped idempotency, state transitions, version conflicts and atomic local
  persistence. They remain real tested behaviours, not decorative UI interactions.
- Keep model output out of approval authority. No action tool is exposed to the model.
  The separate submission tool still requires explicit confirmation and employee identity.
- Use curated published policy summaries in a small context. No vector database or MCP
  layer is justified. Exact-summary validation rejects fabricated citations/free text;
  relevance remains an independent quality problem.
- Retain both real model reports, including failed gates. Qwen 1.7B: 7/12 total, 0/4
  supported; Qwen 8B: 10/12 total, 2/4 supported. Each makes eight model calls; four
  other cases are pre-model gated. Do not present a total score as model safety.
- Preserve negative economics. Original year-one net is -4,860 EUR with immediate
  benefits. Ramp model is -7,695 EUR and month 25 payback. Cost allowances reconcile to
  the original 12,000 upfront / 350 monthly assumptions, not a Microsoft price quote.
- Reuse the existing portfolio's patterns and links; do not republish private tenant
  details or borrow unrelated projects' results as evidence for Noordwerk.

## Implemented files and visual artifacts

Hub: `src/wwwroot/`, `src/Program.cs`, project static-content copying, extended HTTP tests,
`seed_demo.py`, optional browser script/isolated runner/workflow and lockfile; API contract
retained. Real desktop, human-approval and mobile screenshots in `docs/assets/`.

Agent: `llm_agent.py`, model boundary tests, `eval/model-cases.json`, actual reports in
`eval/results/`, generated report/chart and model architecture/release decision.
The original `agent.py` and its deterministic dataset remain unchanged.

Playbook: `financial_model.py`, cost breakdown, cash-flow output and six added tests;
`engagement-decision.md`, process/provenance notes, ten-page executive PDF and its
ReportLab build source, source screenshot and cover preview. BPMN files retain model
semantics and include diagram coordinates. SVG files are authored diagrams, not
screenshots. PDF is selectable text but not tagged or an editable PPTX.

All repositories include audit, strategy, evidence matrix, verification and interview
material. The Hub's portfolio view links the three cases without another app.

## Verification

See each repository's `VERIFICATION.md` for executed commands, precise test counts,
initial failures, corrected UI defects, model failures and environment boundaries.
Deterministic checks and genuine model runs are reported separately. GitHub's existing
main CI result cannot establish success for local changes. New CI configurations are
not claimed as remotely executed before push.

## Remaining work and honest completion status

| Status | Work |
|---|---|
| Completed locally | Audit/strategy, Hub vertical slice, real browser journey, retained API safety checks, separate real model path, failure reports, reconciled ramp model, executive PDF, visuals, English entry docs and interview material |
| Partially completed | Model quality: real inference exists, supported-question release gate fails; dashboard has local operational metrics but no production telemetry |
| Not started | Secured uploads/extraction, delivered Teams/email notifications, calendar-aware scheduled escalation, independent model holdout, real user study |
| Blocked by unconfirmed Microsoft environment / credentials / licensing | Noordwerk Entra/Dataverse/Power Apps/Power Automate/Copilot Studio deployment; no designated target environment or verified entitlement/endpoint |
| Requires manual testing | Actual user tasks, screen readers, zoom/contrast audit, external BPMN editor, source-owner relevance review, tenant persona tests and recovery acceptance |
| Requires external deployment | Approved HTTPS ingress, cloud storage/audit, managed Test import, signed release, public hosting if desired |

Existing authentication was inventoried, not treated as permission to repurpose another
case's tenant. Production identity, queue-specific rights, transactional storage,
protected audit and backup/restore remain necessary. No true customer metrics, user
feedback, certifications, Microsoft screenshots or deployment URLs were invented.

## Precise continuation order

1. Independently author a policy holdout and have Finance/IT review expected sources;
   investigate missed access/escalation paraphrases before changing the frozen benchmark.
2. Have the owner designate a Noordwerk Dev/Test environment and confirm licensing,
   connection ownership and one system of record. Follow the Hub ALM handoff; replace
   known demo tokens before any network exposure.
3. Add real queue-level permissions, database concurrency and protected audit, then run
   tenant negative-access, timeout/retry, failed-connection and recovery acceptance.
4. Conduct observed employee tasks and accessibility review; capture actual time,
   adoption, rework and cost. Update the business case before rollout approval.
5. Review the local branches/commits, then obtain publication approval before pushing
   public changes or deploying. No automatic default-branch merge.

Interview pitches and timed walkthroughs for all three projects are in
`docs/interview-guide.md`. The client presentation is in the consulting repository.
