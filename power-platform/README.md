# Microsoft integration handoff

**Status: documented target design, not a Noordwerk solution export.** Do not zip these
files and call them an importable solution. The local API is fixed to loopback with
public demo identities; a cloud connector cannot safely use it as-is.

## Inventory and validation boundary — 29 October 2026

| Product | Existing evidence | Noordwerk local artifact | External prerequisite / acceptance |
|---|---|---|---|
| Power Automate | Related private Brevan lab: four unpacked flow definitions pass local structural checker | API idempotency/version contracts and build guide | Approved environment, entitled connection owner; run create/retry/decision/failure scenarios |
| Copilot Studio | Related lab source and recorded results; not re-run in tenant here | Published synthetic policies, source-filtered reference, model experiment | Real authenticated users, source ACL, individual tool permissions, actual agent evaluation |
| Power Apps | Related construction solution and applications | Functioning web UI demonstrates required behaviour | Rebuild native solution screens or approved code app; test employee/approver access |
| Dataverse | Related labs have unpacked tables and security definitions | Request schema and single-source-of-record design | Define ownership, alternate keys, row permissions and concurrency; prove cross-user denial |
| Teams | Related conceptual approval patterns | Human decision HTTP contract | Microsoft 365 entitlement, channel/app consent and actual card action authorisation |
| SharePoint | Policy/storage target only | Synthetic repository policy sources | Approved site/library ACL, retention, scanning and source deletion tests |
| Azure AI | No Noordwerk Azure endpoint configured | Provider protocol; local Ollama real inference is separate | Subscription/region/model access, budget, identity and reviewed data egress |
| Entra ID | No validation implemented in Hub | Server-derived fixture identities, explicitly simulated authentication | Validate issuer/audience/tenant/expiry/scopes; queue-specific authorisation tests |

`pac auth list` found one existing profile for a different development case. A stored
profile does not prove current service health, entitlement or permission to deploy a
new client solution. No profile was switched, no existing environment changed, and no
private tenant values were copied into this repository. No Noordwerk environment or
production access has been designated. Local checks do not establish a live connection.

## ALM sequence

1. Have the owner designate Dev and separate Test, supported licenses and connector policy.
   Choose API-backed Dataverse or Dataverse with API facade: one system of record.
2. Replace demo authentication and JSON persistence before exposing HTTPS ingress.
   Implement scoped delegated permissions, distinct Operations/Finance/IT approvers,
   protected audit and retention. Do not relax tenant-wide DLP to permit a demo.
3. Create unmanaged `NoordwerkAutomation` in Dev, publisher prefix `nw`. Add actual
   apps, flows, data tables, security roles, connection references and environment
   variable definitions. `deployment-settings.example.json` is an illustrative manifest
   only; actual logical names must be generated from the real solution.
4. Export the actual Dev solution for source review and a managed release for Test.
   Official CLI examples (run only after the correct environment is selected by its owner):

   ```bash
   pac solution export --name NoordwerkAutomation --path out/NoordwerkAutomation.zip --managed true
   pac solution create-settings --solution-zip out/NoordwerkAutomation.zip --settings-file out/Test.settings.json
   ```

5. Populate generated settings with approved target connections and environment values.
   Keep credentials out of Git; a connection reference is not a secret store. Review
   component dependencies and unpack actual exported sources with the installed CLI.
6. Import managed into Test using the owner's approved release process. Test table ACL,
   flow identities, retries, duplicate keys, 409 refresh, failed connections and citations.
   Record anonymised run IDs and artifact hashes; do not paste tenant tokens into evidence.
7. Release only after process-owner and IT acceptance. Test rollback without deleting
   tables or losing pending requests. Backups and solution rollback are different controls.

## Licensing and manual work

No price or entitlement is assumed. Confirm Power Apps/Power Automate premium connector
and Dataverse usage rights, Copilot Studio capacity and channel rights, environment
capacity, and Microsoft 365 requirements for Teams/SharePoint. Confirm unattended
connection ownership with the tenant admin; do not invent a service-principal login
method for a connector that does not support it. Consent, connection setup, environment
selection and acceptance by actual users require manual tenant work.

## Sources checked through Context7 on 29 October 2026

- [Deployment settings: environment variables and connection references](https://learn.microsoft.com/en-us/power-platform/alm/conn-ref-env-variables-build-tools)
- [Power Platform CLI solution commands](https://learn.microsoft.com/en-us/power-platform/developer/cli/reference/solution)
- [ALM overview](https://learn.microsoft.com/en-us/power-platform/alm/overview-alm)

The broader [build specification](../docs/power-platform-build-guide.md) covers flows,
forms and Copilot. Product availability and permissions must be checked in the chosen
tenant. No import, cloud deployment, applied DLP policy or licensing verification was
performed for Noordwerk in this run.
