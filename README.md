Assets
------

- Add the new vector logo at `assets/webspind-logo.svg`. Suggested SVG is a simple, clean wordmark mark with a geometric web icon.

# Webspind App Store v1

**Helt statiske værktøjer** klar til GitHub → Netlify. Ingen server, ingen backend. Alt kører i browseren.

## Struktur
- `/appstore/index.html` — indgang til alle værktøjer (med søgning)
- `/tools/pdf-merge/` — sammenflet PDF
- `/tools/pdf-split/` — split/udtræk sider
- `/tools/pdf-pages/` — reorder/rotate/delete sider
- `/tools/text-tools/` — tekstværktøjer (word count, case, slug, sort/dedupe, URL/Base64, JSON)
- `/privacy.html` — privatlivstekst

## Engangs-opsætning
1. **DONATION_LINK**: Find & erstat denne streng i alle filer med dit Ko-fi/Stripe/BuyMeACoffee-link.
2. Upload mappen til dit GitHub-repo (bevar stierne), commit og push.
3. Din App Store er nu live på `https://webspind.com/appstore/` (og værktøjerne under `/tools/...`).

## Noter
- PDF-håndteringen uses [pdf-lib] via CDN. Alt sker i browseren, men meget store filer kan være tunge for maskinen.
- Design: enkel 2026-modern UX via Tailwind CDN.
- Du kan frit omdøbe eller tilføje flere værktøjer med samme layout.

© 2025 Webspind
