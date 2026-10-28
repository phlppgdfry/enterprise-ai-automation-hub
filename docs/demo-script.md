# Demo in vijf minuten

## Voorbereiden

Python 3.11+ en .NET 10 SDK. Geen cloudaccount nodig. Voer eerst `make verify` uit.
Start in terminal 1 `dotnet run --project src --configuration Release --no-build`.
Voer in terminal 2 `python3 scripts/demo.py` uit.

## Verhaal

1. **Probleem (30 s):** aanvragen zitten in e-mail, onduidelijk wie beslist.
2. **Indienen (60 s):** medewerker Alice vraagt materiaal voor 320 EUR. De API
   maakt een ID, status pending en wachtrij Finance. Geen AI-goedkeuring.
3. **Foutpad (45 s):** dezelfde indiening opnieuw versturen. Hetzelfde ID verschijnt,
   er is geen dubbele aanvraag. Een medewerker kan andermans records niet lezen.
4. **Menselijke beslissing (60 s):** Maria beslist met reden en versie. Auditlog
   bevat Alice als indiener en Maria als goedkeurder. Een stale versie geeft 409.
5. **Agent (45 s):** toon in de agent-repo `python3 agent.py ask 'Wat is het onkostenbeleid?'`.
   Toon vervolgens de weigering van een salarisvraag en de bevestigingsstap.
6. **Consulting (60 s):** toon de berekende ROI uit de playbook-repo. De eerste
   twaalf maanden zijn onder deze aannames negatief; adviseer een begrensde pilot.

Vertel dat dit een lokale referentie-implementatie is. Open de Microsoft-bouwgids
voor de tenantimplementatie en het bestaande Brevan-lab voor afzonderlijk eerder
vastgelegd Microsoft-bewijs. Er is voor Noordwerk nog geen opgenomen demo-video.
