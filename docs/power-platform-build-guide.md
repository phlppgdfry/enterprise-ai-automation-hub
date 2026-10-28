# Microsoft-bouwgids en acceptatie

Dit is een uitvoerbare bouwspecificatie voor een maker, **geen solution-export**.
Er is in deze repo nog geen Power Apps-app of Power Automate-flow gedeployed.
Een bestaande afzonderlijke labimplementatie staat in
[conxion-power-platform-lab](https://github.com/phlppgdfry/conxion-power-platform-lab).
Die behandelt onkosten bij Brevan; haar resultaten bewijzen deze Noordwerk-case niet.

## Randvoorwaarden

Een door de eigenaar aangewezen developer environment met Dataverse, passende
Copilot Studio/Power Automate/Power Apps-rechten en een goedgekeurde DLP-policy.
SharePoint en Teams vragen daarnaast passende Microsoft 365-toegang. Controleer
licenties en verbruik in de eigen tenant; deze case bevat geen actuele prijsclaim.
Wijzig geen organisatiebrede policy om een demo werkend te krijgen.

## 1. Solution en data

Maak unmanaged solution `NoordwerkAutomation`, publisher-prefix `nw`. Gebruik
connection references en environment variables voor API-base-URL,
SharePoint-site, Operations-/Finance-/IT-groepen en de grens `250`.
Maak tabel `nw_request` met RequestId (GUID/alternate key), Owner, Title
(160), Category (choice), Amount (currency EUR), Status (choice), Queue (choice),
Version (integer), CorrelationId en SubmittedAt. Gebruik een aparte tabel voor
AuditEvent met requestrelatie, actor, timestamp, actie en reden.

Kies vóór de bouw één system of record: de API met Dataverse als opslag óf
Dataverse met een API-facade. Schrijf nooit in een flow onafhankelijk naar beide.
De lokale JSON-store is uitsluitend een demo-adapter.

## 2. API-connector

De lokale API luistert uitsluitend op loopback en accepteert vaste demotokens.
De Power Platform-cloud kan deze niet rechtstreeks bereiken. Implementeer eerst
de productie-authenticatie uit `architecture.md`, host via een door IT goedgekeurd
HTTPS-endpoint en pas de server in `contracts/openapi.json` aan. Importeer de
OpenAPI-specificatie als uitgangspunt voor een custom connector; configureer
Microsoft Entra ID OAuth met gedelegeerde gebruikersrechten in de connector.
Het lokale bearer-demo-schema is geen kant-en-klare OAuth-connectorconfiguratie.

Maak voor de agent alleen `ListRequests`, `GetRequest` en `CreateRequest`
beschikbaar. Houd `DecideRequest` exclusief voor de goedkeuringsapp/flow met een
echte goedkeurderidentiteit. Gebruik geen maker-account om gebruikersrechten te
omzeilen. Zie [Microsoft: maker credentials](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-no-maker-authentication).

## 3. Power Apps

Maak een medewerkerformulier met Title, Category en Amount, een lijst met eigen
aanvragen en een detailscherm met status en historie. Bewaar na eerste Submit een
GUID als idempotency key; hergebruik hem bij netwerkfouten. Maak pas na expliciet
"Nieuwe aanvraag" een nieuwe key. Toon servervalidatie; vertrouw niet alleen op
validatie in het formulier.

Voor een **Dataverse-adapter** zijn onderstaande Power Fx-fragmenten
ontwerpvoorbeelden (tabel-/kolomnamen worden bepaald door de maker). Ze zijn
geen geteste, importeerbare canvas-app:

```powerfx
// OnSelect "Nieuwe aanvraag":
Set(varRequestKey, Text(GUID()));
// Beschikbaar bedrag; server herhaalt deze validatie:
IsNumeric(txtAmount.Text) && Value(txtAmount.Text) >= 0
```

Maak een aparte goedkeurdersapp: huidige versie tonen, verplichte reden vragen,
beslissing uitvoeren via API, bij 409 herladen en opnieuw laten beoordelen.
Geen toegang tot medewerkersrecords via alleen een client-side filter.

## 4. Power Automate

Flow A: expliciet bevestigde invoer → connector CreateRequest met stabiele key →
status teruggeven. Flow B: aanvraag pending → menselijke approval → alleen bij
echte approveridentiteit DecideRequest met versie. Bouw Try/Catch-scopes,
correlation IDs en een operationele foutwachtrij. Retry uitsluitend transient
429/5xx/timeouts met begrensde backoff; niet 400/401/403 of versieconflict 409.
Een time-out na Create is een onbekende uitkomst: herhaal met dezelfde key.
Flow C (optioneel): dagelijks open werk ouder dan twee werkdagen aan eigenaar
melden. Weekenden en bedrijfskalender expliciet meenemen; lokaal niet gebouwd.

Bewaar documenten in een goedgekeurde SharePoint-bibliotheek met beperkte
rechten, alleen de documentreferentie in Dataverse. Voeg bestandscontrole,
retentie en malwarebeleid toe; de lokale demo verwerkt geen uploads.

## 5. Copilot Studio

Voeg uitsluitend gepubliceerde documenten uit de agent-repo toe. Stel
authenticatie verplicht; koppel de individuele gebruiker aan toolcredentials.
Vraag expliciete bevestiging vóór CreateRequest. Laat de agent bij onbekende
antwoorden afzien en naar de proceseigenaar verwijzen. Geef hem geen besluittool.
De [REST-toolroute](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-extend-action-rest-api)
is volgens de geraadpleegde documentatie preview; controleer tenantbeschikbaarheid.
Gebruik anders een ondersteunde custom connector/agent flow.

## 6. Verificatie en export

Herhaal de API-scenario's met twee medewerkers en een goedkeurder. Bewaar
geanonimiseerde flow-run IDs, screenshots van eigen-recordisolatie, foutpad,
beslissing en agentcitaten. Voer de evalset uit de agent-repo opnieuw uit in de
echte agent: deterministische lokale scores gelden daar niet als resultaat.
Maak een managed export voor Test en importeer die in een aparte omgeving;
controleer dependencies, connection references, security roles en smoke tests.
Bewaar de solution-export en uitgepakte bronnen pas nadat deze stappen slagen.
[Microsoft solution-overdracht](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-solutions-import-export).

Rollback: stop triggers, sluit nieuwe indieningen, herstel vorige managed versie
volgens het geteste releaseplan en reconcileer lopende aanvragen. Een solution
verwijderen is geen veilig dataherstel. Verwijder geen tenant of credentials.
