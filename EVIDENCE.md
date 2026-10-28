# Bewijsmatrix

Validatiedatum: 28 oktober 2026. Lokale referentie, synthetische testdata.

| Claim | Bewijs | Wat het niet bewijst |
|---|---|---|
| API compileert | `dotnet build src/AutomationHub.csproj --configuration Release` | Productiehosting |
| Proces en rechten werken | 11 tests in `tests/test_api.py`, echte HTTP tegen geïsoleerd .NET-proces | Entra-/tenantbeveiliging |
| Herhaalde acties zijn veilig | Gelijktijdige retries en idempotency-conflict getest | Meerdere serverreplica's |
| Beslissingen zijn consistent | Concurrente beslissing: één 200 en één 409 | Aparte Finance-/IT-goedkeurders |
| Status overleeft herstart | Herstarttest met tijdelijke persistente store | Disaster recovery |
| Microsoft-bouw is gespecificeerd | Bouwgids met datamodel, connector, apps, flows en acceptatie | Een bestaande Noordwerk-solution |
| Businessadvies sluit aan | Dezelfde regels en case als agent/playbook | Een echte klantopdracht |

`make verify` is de reproduceerbare check. CI voert dezelfde check op Linux uit.
Het volledige stackscenario staat in de agent-repo: `python3 scripts/verify_hub.py`.

Geen tenantdeployment, screenshots van Power Apps, video of echte klantmetingen
voor deze nieuwe case. Het bestaande Brevan-lab is afzonderlijk bewijsmateriaal.
