# Visual evidence and asset rights

All visual assets are authored for the fictional Noordwerk portfolio. No stock imagery,
Microsoft logos, fabricated Microsoft screenshots or private customer material is used.
Authored diagrams and screenshots are covered by this repository's MIT license.

- Architecture SVG: editable diagram source, not a product screenshot.
- Hub PNGs, where present: actual Chromium captures of the working local .NET app with
  synthetic requests and public demo personas. Capture environment is in VERIFICATION.md.
- Model evaluation SVG, where present: generated exclusively from recorded local model
  results; source and regenerate/check command are in scripts/report_model.py.
- Executive preview, where present: Poppler render of the authored consulting PDF.
  The PDF uses the companion Hub's own synthetic screenshot with attribution in the deck.

The browser uses system fonts; no proprietary font files are distributed. ReportLab is
an optional BSD-licensed PDF build dependency. Playwright is an optional Apache-2.0
browser-test dependency; model weights and browser distributions are not committed.
Microsoft documentation is linked as a source, not republished as an image or template.
