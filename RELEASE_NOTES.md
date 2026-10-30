# Noordwerk portfolio release candidate — 30 October 2026

Status: local engineering complete within the reference-demo scope; hosted checks are
reported separately after actual execution. This is not a production release.

- Preserves the real .NET request-to-human-decision workflow and synthetic identity boundary.
- Adds restored-state validation, exclusive local store lease, failed-write recovery and occupied-port rejection.
- Tests owner/status/role spoofing, absent cancellation, corruption, interrupted temporary data and conflicting writers.
- Adds reproducible BPMN/SVG lanes, offline API/ALM checks, stable Python startup and immutable CI action pins.
- Uploads, real notifications and scheduling remain outside core scope. Single-process JSON is not production persistence.

Review: `make verify`; read `RELEASE_VERIFICATION.md`, inspect the full diff against
`origin/main`, then follow the central integrated demonstration in the consulting repo.
All new content is synthetic or authored. Visibility remains PUBLIC as independently
verified and explicitly authorized by the owner. Only feature-branch pushes and draft
PRs are authorized; no merge, main push, visibility change, release or deployment.
