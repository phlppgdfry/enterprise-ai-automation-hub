# Local demonstration runbook

This runbook covers synthetic local use only. Public fixtures must not process real data.

## Start and demonstrate

Run `make verify` while no other Hub process occupies port 5088, then start the server
and run `python3 scripts/seed_demo.py`. Open the UI. Demo Alice → submit €320 expense →
Maria → inspect, reason, decide → Alice → saved history → Bob → record absent.
The optional browser verifier adds records and decisions to the selected store; use
an isolated `HUB_DATA` when generating evidence. Its injected network failure affects
only its browser context, not the API process. Screenshots contain synthetic records.

## Failures and recovery

| Symptom | Action | What to verify |
|---|---|---|
| API unavailable | Check process log and fixed port 5088, restart with the same store | UI recovery message; requests reappear |
| Submission timeout | Preserve the same key and unchanged payload; inspect existing records | Exactly one ID; no blind new-key retry |
| 409 on a decision | Refresh, re-read history and decide only if still pending | Another reviewer may already have decided |
| Store corruption | Stop writes, preserve file, restore a known-good isolated copy | Do not erase or silently reseed; reconcile pending requests |
| Public fixture used with real data | Stop server, restrict access, involve owner/privacy contact | Treat storage and screenshots as potentially exposed |
| Policy or model unavailable | Use published guide and process owner; request flow still works | No model-dependent approval or silent decision |

Back up an isolated demonstration store only while the process is stopped. Copy it
to a separate path and launch using `HUB_DATA`; verify a known request and history.
A production backup/restore drill, RPO/RTO and tamper-resistant audit are not implemented.
Logs from ASP.NET Core help local diagnostics; no remote telemetry or alerting is configured.

## Browser and accessibility review

Desktop 1512×1050 and mobile 390×844 are recorded. Mobile tables scroll inside a named,
keyboard-focusable region. The native dialog traps focus and Escape closes it; labels,
required input and visible focus support keyboard use. Full screen-reader review,
contrast tooling, zoom testing and Firefox/WebKit remain manual acceptance work.
