# Portfolio audit — 29 October 2026

Scope: three public repositories, clean `main` at inspection; one initial commit each
(09a98a4 / 9452be6 / 87fceff). Related repositories inspected read-only. Scores are
reviewer judgments of the initial state, not certifications or measured maturity.

## Evidence-based baseline (0–10)

| Dimension | Automation Hub | Agent Governance | Consulting Playbook |
|---|---:|---:|---:|
| Engineering | 6 | 5 | 6 |
| AI capability | 1 | 2 | 2 |
| Microsoft relevance | 5 | 5 | 5 |
| Enterprise readiness | 3 | 3 | 4 |
| Security | 4 | 3 | 5 |
| UX / visual presentation | 1 | 2 | 2 |
| Documentation | 6 | 6 | 6 |
| Business value | 6 | 5 | 7 |
| Demonstrability | 4 | 5 | 4 |

AI capability in the playbook means coverage of AI decisions, not an inference engine.
Security scores assess implemented boundaries and honest limitations, not tenant compliance.

## Concrete findings

### Automation Hub

- `src/Program.cs`: working .NET 10 minimal API. Server derives owner/role from fixed
  demo identities; clients cannot supply a role field. Known public bearer tokens are
  fixtures, not genuine authentication. One approver can see every queue.
- Lock + atomic JSON replacement preserves consistency within one process. Tests cover
  concurrent retries, decision conflicts and restart. No database transactions across
  replicas, backups, tamper-resistant audit, pagination or production deployment.
- `tests/test_api.py`: 11 real HTTP scenarios. Initial build succeeded; sandbox HTTP
  startup failed and requires an unsandboxed rerun. Final results belong in VERIFICATION.md.
- `contracts/openapi.json`: useful API contract; no generated drift check. Request
  response exposes internal idempotency/fingerprint fields. Small body limit is appropriate.
- No frontend, screenshots, loading/error states, document support, notifications or
  operational dashboard. Highest portfolio impact is an interface on this API.
- `docs/power-platform-build-guide.md`: careful target design; no Noordwerk solution
  export, tenant deployment, Entra validation, Teams or SharePoint integration.

### Agent Governance

- `agent.py`: deterministic rules, keyword retrieval and confirmed local submission.
  Preserves a useful reference baseline. No model inference, embeddings or model traces.
- ACL and publication filters run before matching. Role parameter is a CLI fixture,
  not authenticated identity. Public repository files are not confidential documents.
- `eval/cases.json`: 30 authored regression cases; 30/30 initial run. Nine unit tests
  pass. Same keywords appear in implementation and fixtures; this is not an independent
  holdout or a real LLM evaluation. No latency/token/cost report.
- Injection regex is illustrative and bypassable. No decision tool is a stronger
  boundary. Fixed loopback tool destination prevents model-selected outbound URLs.
- No need for a vector database for four short policy documents. A separate bounded
  model answer path, strict source validation and adversarial evaluation add more value.

### Consulting Playbook

- `playbook.py`: finite-number validation, explicit realisation versus capacity value,
  gated prioritisation, honest negative first-year value. Nine tests and report check pass.
- `data/business-case.json`: €350 aggregate recurring allowance hides licensing, AI,
  hosting and maintenance drivers. No ramp-up or deployment-delay sensitivity.
- Discovery, roadmap, RACI and adoption materials exist. Presentation is ten Markdown
  sections, not a finished executive artifact. No visual business case or process diagram.
- All repos use Dutch prose; a concise English entry narrative improves recruiter access.

## Related projects and consolidation

- Private `conxion-power-platform-lab`: inspected README, solution checker and recorded
  test/manual-step reports. Unpacked solution and flow checks exist. README says flows
  off while later report says active: historical documents disagree. Do not copy private
  tenant values, screenshots or report results into public Noordwerk material. Reuse
  patterns (Try/Catch, environment variables, connection references), not tenant assets.
- Public `construction-digital-transformation`: working site, BPMN generation, tests and
  Power Platform solution artifacts are present locally. Its recorded cloud results are
  separate evidence, not revalidated here. Reuse process/ALM thinking, preserve provenance.
- Public `sme-copilot-agent-automation-case`: existing static site and deterministic agent
  overlap with the policy demo. Link as a separate earlier case; avoid another simulator.
- `pionira-compliance-connector-poc`: dispatcher/retry reference and Blazor dashboard;
  connectors explicitly simulated. Do not import regulatory claims or retries blindly.
- No repository merge or fourth standalone application is justified. Embed the three-case
  portfolio navigation in the Hub; keep independent runtimes and ownership.

## Prioritised backlog and architecture plan

| Priority | Improvement | Value / acceptance |
|---|---|---|
| P0 | Browser UI on existing Hub API | Submit → review → reasoned human decision → persisted history |
| P0 | Preserve and rerun safety regressions | Ownership, conflict and retry checks stay green |
| P0 | Evidence matrix and truthful English README | Every major claim has a path, method, status and limitation |
| P1 | Separate real local LLM provider | Structured source selection, ACL before context, bounded output, fail closed |
| P1 | Adversarial model evaluation | Separate fixture/model reports; token counts, latency, disclosure failures |
| P1 | Executive visual deliverable and cost breakdown | Reproducible PDF, negative economics visible, pilot decision |
| P1 | ALM handoff and acceptance checklist | Official current guidance, no fake solution export |
| P2 | Tenant integration | Owner-approved environment, Entra, premium entitlement and cloud ingress required |
| P2 | Production data/security layer | Database, queue-specific RBAC, protected audit, backup/restore |
| P2 | Secure document storage | Malware scanning, ACL, retention; do not bolt uploads onto JSON store |

## Dependencies, licensing and architecture decisions

Existing code is MIT in all three targets. Hub uses only ASP.NET Core shared framework;
agent and playbook use Python standard library. There are no application package trees
to consolidate. CI actions are external build dependencies. SDK and Python installation
are prerequisites. Authored CSS/JS/SVG avoids stock asset licensing. Browser automation
can use an existing local Playwright installation; do not add runtime frontend packages
for this small application. Any local model remains subject to its own model license;
do not redistribute model weights. Microsoft services and premium connectors require
separate licensing and tenant consent; no price quote or entitlement is inferred.

Retain .NET and Python. Use same-origin static UI with server-authorised API requests,
no browser role as a security boundary. Keep model and process-rule execution separate.
Model output must never trigger approval. Do not add MCP: one fixed local tool gains
no discovery or multi-client benefit sufficient to justify another protocol boundary.

## Portfolio client and delivery strategy

**Noordwerk is fictional.** A 140-person technical services company: field operations,
Finance, IT, HR and a small management team. Employees request materials, reimbursement
and application access; Operations owns routing, Finance owns expense policy, IT owns
identity and release. Synthetic scenario volume: 600 requests/month. Proposed landscape:
Microsoft 365, SharePoint policy library, Teams communication, Dataverse request storage,
Power Apps and Power Automate. Current local implementation is .NET + JSON, not that tenant.
Assumed €12,000 implementation ceiling and €350 monthly operating allowance require
validation. No salary/medical records. Separate approvers, least privilege and human
approval are required; adoption and actual cash realisation govern the investment.

Three stages: **Decide** (consulting playbook), **Deliver** (automation hub), **Govern**
(agent governance). Links connect them; each keeps its own evidence. The business case
must be able to recommend no rollout. Final implementation state and score changes
are recorded in TRANSFORMATION_REPORT.md after verification, not assumed by this audit.
