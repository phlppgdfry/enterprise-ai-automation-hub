# Capability evidence matrix

Last verified: **29 October 2026**. Environment: macOS, .NET 10, Python 3.14, Chromium;
synthetic isolated local store. These statuses do not certify production readiness.

| Capability / status | Implementation | Method / result | Evidence artifact | Limitation |
|---|---|---|---|---|
| Employee-to-approver flow — **Implemented and verified** | `src/Program.cs`, `src/wwwroot/` | Real browser submit → human decision → employee history; pass | `docs/assets/browser-report.json`, screenshots | Public fixture identities, Chromium only |
| Ownership / role boundary — **Implemented and verified** | Identity mapping, RequestStore | HTTP negative tests + Bob browser isolation; pass | `tests/test_api.py`, `VERIFICATION.md` | Known tokens are not actual authentication |
| Idempotency / concurrency / restart — **Implemented and verified** | RequestStore | Real concurrent HTTP and restart tests; pass | `tests/test_api.py` | Single process, no replicated database |
| Dashboard / audit — **Implemented and verified** | `src/wwwroot/app.js` | Rendered records and persisted event history inspected | `docs/assets/hub-overview.png`, approval image | Mean times are demo elapsed times, no business KPI claim |
| Mobile and outage states — **Implemented and verified** | Authored CSS/JS | 390×844 no page overflow, search-empty and aborted-fetch feedback; pass | `scripts/browser_verify.mjs`, mobile image | No full accessibility audit or screen-reader test |
| CSP / static assets — **Implemented and verified** | Middleware + published static files | Header tests with API still requiring identity | `tests/test_api.py` | Deployment hardening and Entra remain separate |
| Demo authentication — **Simulated** | Public demo bearer identities | Reproducible local personas | `SECURITY.md` | Never use real data or expose as production |
| Power Platform ALM — **Documented design** | Build guide, example deployment settings | Official Context7 documentation checked; JSON checked | `power-platform/README.md` | No generated Noordwerk solution/export/import |
| Tenant integrations — **Blocked by unconfirmed environment / licensing / credentials** | Contracts and handoff | Existing unrelated auth profile inventoried only | `power-platform/README.md` | No tenant health or entitlement validation for Noordwerk |
| Cloud authentication and persistence — **Planned** | Production architecture | No executed production acceptance | `docs/architecture.md` | Entra, Dataverse, backup and protected audit absent |
| Document upload / extraction / delivered notifications — **Planned** | Backlog | Not implemented | `PORTFOLIO_AUDIT.md` | No upload or notification claim |
| Connector API contract — **Implemented but not externally verified** | `contracts/openapi.json` | Existing local HTTP routes exercised | Contract and HTTP tests | Not imported into a cloud custom connector |
| Public hosting — **Planned** | Buildable local app | No deployment performed | `VERIFICATION.md` | There is no live deployment URL |

Executed commands, failures corrected, browser environments and remaining manual checks:
[verification report](VERIFICATION.md). Baseline/after scores and continuation:
[transformation report](TRANSFORMATION_REPORT.md).

## Release candidate delta — 30 October 2026

The prior matrix is historical. [Release verification](RELEASE_VERIFICATION.md) records current pass/fail and unexecuted boundaries. [Release notes](RELEASE_NOTES.md) identify new implementation and preserved limitations. Hosted CI is recorded only after execution.
