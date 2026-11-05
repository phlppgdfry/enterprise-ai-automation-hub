# Release-candidate baseline and execution plan — 30 October 2026

All work is restricted to the three Noordwerk repositories. Each started clean on
`portfolio/noordwerk-showcase`, with two outgoing commits and unchanged original main.
Remote history was fetched without reset or force. All three repositories are PUBLIC;
the owner explicitly confirmed authorization to publish branches/draft PRs to these
existing public repositories. Visibility will remain unchanged.

## Findings ranked before implementation

| Priority | Evidence / finding | Correction and acceptance |
|---|---|---|
| P1 | Hub deserialises structurally invalid but syntactically valid stores; no second-writer exclusion | Reject invalid record/event invariants and conflicting store writers; preserve original bytes |
| P1 | HTTP test startup can attach to an existing port; browser runner uses timing heuristic | Refuse occupied port before synthetic writes, prove isolated process lifecycle |
| P1 | Agent submit follows urllib redirects and trusts arbitrary JSON responses | Block redirects/proxies, validate exact local contract, no silent retry; failure tests |
| P1 | Real model release gate failed; all context was present in recorded misses | Preserve v1 reports; simplify evidence output to source-ID selection; freeze holdout/gates first |
| P1 | CI not hosted on feature branches, actions use mutable version tags | Pin action commits, run real branch/PR CI; fix only evidenced failures |
| P2 | Prior reports/interview guides copied verbatim across all three repos | Retain historical reports; new final dossier centred in playbook with concise cross-links |
| P2 | No scenario-labelled ramp cases or formal acceptance traceability | Preserve base economics; add explicit conservative/base/optimistic inputs and decision gates |
| P2 | BPMN lacks swimlanes and explicit local-vs-proposed boundary | Add role lanes and semantic/layout validator; do not invent deployed automation |
| P2 | Prior tests used globally available browser package path | Install lockfile in clean checkout; no undocumented machine-specific dependency |
| P3 | Uploads, real notifications, scheduler, cloud database | Not core release scope; secured-production designs only, no unsafe feature scaffolding |

No evidence of an exposed credential or existing unauthorized transition has been found
at baseline. Public fixtures are deliberate; this is not real login or tenant isolation.
Data-file administrators can alter history; startup validation is not protected audit.

## Ordered plan

1. Fail closed on invalid persistence; add port, transport and corruption/failed-write tests.
2. Freeze authored holdout and risk-specific gates before model changes. Compare same
   installed Qwen 8B model without replacing or rewriting the historical benchmark.
3. Improve offline contracts/BPMN/finance checks and code/debugging preparation.
4. Pin least-privilege CI, validate clean checkouts, inspect artifacts and scan all tracked
   text and historical Git objects before authorized push/draft PR creation.
5. Inspect actual hosted run logs and iterate on confirmed issues. No merge, visibility,
   release, package, paid service or cloud-resource operation is authorized.

Statuses in the new release dossier will be PASS / FAIL / BLOCKED / NOT EXECUTED.
Historical 29 October evidence remains historical rather than overwritten.
