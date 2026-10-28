# Enterprise AI & Automation Hub

**Een aanvraag van medewerker tot menselijke goedkeuring, met een werkende .NET-API en een Power Platform-bouwspecificatie.**

Fictieve consultancy-case voor Noordwerk. Geen klantopdracht of samenwerking met
ConXioN. Alle volumes en baten zijn aannames. De API draait lokaal; Power Apps,
Power Automate en Copilot Studio zijn in deze repo nog niet gedeployed.

## In drie minuten

Vereist: .NET 10 SDK, Python 3.11+ en Make. Geen NuGet-packages buiten het SDK-framework.

```bash
make verify
dotnet run --project src --configuration Release --no-build
# In een tweede terminal, vanuit deze repo:
python3 scripts/demo.py
```

Je ziet een aanvraag voor 320 EUR naar Finance gaan, een retry hetzelfde ID
opleveren en een afzonderlijke goedkeurder met reden beslissen. Data blijft bij
herstart bewaard in `data/requests.json`. `HUB_DATA` kiest een ander bestand.
De server luistert vast op `http://127.0.0.1:5088`; gebruik één proces.

## Wat deze case aantoont

| Onderdeel | Controleerbaar bewijs |
|---|---|
| Procesanalyse | [As-is en to-be](docs/process.md), BPMN 2.0-bestanden |
| Integratie | [API-contract](contracts/openapi.json), .NET-bron en echte HTTP-tests |
| Betrouwbaarheid | Idempotency, versieconflicten, gelijktijdige retries, herstarttest |
| Security | Eigenaarsfilter op server, gescheiden rollen, verplichte beslisreden |
| Microsoft-implementatie | [Bouwgids](docs/power-platform-build-guide.md), expliciete tenantacceptatie |
| Klantcommunicatie | [Demo in vijf minuten](docs/demo-script.md), [architectuur](docs/architecture.md) |

## API

Elke route behalve `/health` vraagt `Authorization: Bearer <demo-token>`.
`demo-alice` en `demo-bob` zijn medewerkers; `demo-manager` is de goedkeurder.
Dit zijn publiek bekende fixtures, geen veilige productieauthenticatie.

| Methode | Route | Regel |
|---|---|---|
| GET | `/health` | Status en expliciete simulatiemodus |
| GET | `/requests` | Eigen records; approver ziet alle records |
| GET | `/requests/{id}` | Zelfde eigenaarcontrole |
| POST | `/requests` | Medewerker, `Idempotency-Key`, title/category/amount |
| POST | `/requests/{id}/decision` | Approver, outcome/reason/version |

Categorieën: `materials`, `expense`, `access`. Bedrag in EUR, maximaal twee
decimalen. Access heeft bedrag nul. Tot en met 250 EUR naar Operations,
daarboven Finance; access naar IT. Elke aanvraag wacht op een mens. De lokale
goedkeurder heeft toegang tot alle wachtrijen; productie vraagt gescheiden rollen.

## De drie portfolio-cases

1. **Deze Hub:** uitvoeren en integreren.
2. [Enterprise AI Agent & Governance](https://github.com/phlppgdfry/enterprise-ai-agent-governance): brongebonden antwoorden, veiligheidsevaluatie en bevestigde API-actie.
3. [AI Transformation Consulting Playbook](https://github.com/phlppgdfry/ai-transformation-consulting-playbook): discovery, prioritering, businesscase en adoptie.

## Grenzen

Geen productiehosting, Entra-login, echte Power Platform-export, documentuploads,
automatische betaling, time-based escalatie, gemeten klantwinst of demo-video.
De JSON-audit is aanpasbaar door de bestandsbeheerder. De afzonderlijke
[Brevan-labrepo](https://github.com/phlppgdfry/conxion-power-platform-lab) bevat
bestaand Microsoft-bewijs; dat is geen bewijs van een Noordwerk-deployment.

[Bewijs en verificatie](EVIDENCE.md) · [MIT-licentie](LICENSE)
