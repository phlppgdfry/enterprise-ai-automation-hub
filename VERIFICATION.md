# Verification record — 29 October 2026

Environment: macOS, .NET 10, Python 3.14, Playwright 1.63.0 Chromium. Synthetic isolated
store; no tenant connection or public deployment. Browser plugin unavailable; existing
local Playwright library used. No browser dependency is required to run the app.

## Commands and observations

| Executed command / check | Result |
|---|---|
| Initial `make verify` in sandbox | Build passed, HTTP startup blocked; no HTTP pass claimed |
| `make verify` outside sandbox before changes | Build and 11 original real HTTP tests passed |
| `make verify` after static UI added | Build and original 11 tests passed |
| Final `make verify` outside sandbox | Build: 0 warnings/errors; 12/12 real HTTP tests and docs passed |
| `PLAYWRIGHT_MODULE=... python3 scripts/run_browser.py` | Isolated seed + complete browser suite passed, including reduced-motion and keyboard table region |
| `npm install --package-lock-only --ignore-scripts` / `npm audit --omit=dev` | Lock created for optional Playwright 1.63.0; 0 reported vulnerabilities; no production npm dependencies |
| XML/BPMN reference and layout check | AS-IS/TO-BE IDs, edges and diagram coordinates valid |
| Limited credential-pattern scan | 0 findings in 41 text files at scan time; not a comprehensive secret guarantee |
| `python3 scripts/verify_hub.py` in agent repository | Real confirmed submit, same-ID retry, Bob 404 and Maria decision passed |
| `node --check src/wwwroot/app.js` | Passed on original authored JS |
| `node scripts/browser_verify.mjs` with existing Playwright | Complete real journey passed; report and screenshots committed |
| `python3 scripts/seed_demo.py` | Eight fixture requests created via actual API; repeated without deleting data |
| `python3 scripts/check_solution.py` in related private lab | Four flow definitions checked locally; no tenant run |
| `pac auth list` | Existing profile found for a separate case; unchanged, no live health/entitlement claim |
| GitHub existing main CI | Success for 09a98a4 only; does not cover this local branch |

Browser identity, meaningful render, console health before outage, interaction, screenshot,
mobile overflow and error feedback were checked. Tested flow: localhost → Alice €320
expense → Maria reasoned approval → Alice saved history → Bob isolation. Desktop
1512×1050 and mobile 390×844. Search-empty, access amount zero and injected fetch
failure passed. The report contains one expected `ERR_FAILED` from fault injection;
no unexplained runtime error was accepted.

Issues discovered and fixed: category accessible-label matching; async detail response
race on identity changes; mobile grid minimum-width overflow; an unclosed reduced-motion
CSS block discovered by formatting. Final reduced-motion mobile and keyboard-table checks passed.

## Limits

No full WCAG/screen-reader/user study, Firefox/WebKit, production load test, Entra,
Dataverse, real connector, backup acceptance, cloud deployment or live Microsoft screenshot.
The new browser workflow is configured but has not run on GitHub while changes are local.
