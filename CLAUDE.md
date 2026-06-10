# CLAUDE.md — [Klantnaam] Website (GEO/AI-optimized)

## Projectdoel
Marketing/conversie-website voor [klantnaam, branche, regio]. Primair doel:
maximale zichtbaarheid en converteerbaarheid via AI-systemen (ChatGPT, Claude,
Perplexity, Copilot/Bing) náást klassieke SEO. AI-agents moeten de site kunnen
lezen, citeren en er acties op kunnen uitvoeren (contact/offerte).

## Stack
- Framework: Astro (SSG, zero-JS by default) — GEEN client-side SPA
- Styling: Tailwind CSS
- Content: Markdown/MDX met frontmatter in `src/content/`
- Hosting: Vercel
- Forms: native HTML POST naar [endpoint, bijv. Vercel function / Formspark]

## Harde GEO-regels (MUST — geldt voor elke pagina en elke wijziging)

### Rendering
- MUST: alle content aanwezig in de initiële server-rendered HTML.
  Test: `curl -s -A "GPTBot" <url> | grep "<kerncontent>"` moet matchen.
- MUST NOT: content die pas na client-side JavaScript zichtbaar wordt
  (geen lazy-loaded tekst, geen JS-only tabs/accordions voor kerncontent).
- Interactiviteit alleen als progressive enhancement.

### Structured data
- MUST: elke pagina heeft passende JSON-LD (schema.org):
  - Sitebreed: `Organization` + `LocalBusiness` (NAP-gegevens, openingstijden, geo)
  - Dienstpagina's: `Service` met `areaServed` en `offers`
  - FAQ-secties: `FAQPage`
  - Blog/kennisbank: `Article` met `author` en `datePublished`
- MUST: JSON-LD valideren vóór commit (zie Verificatie).

### Semantische HTML
- MUST: één `<h1>` per pagina, logische heading-hiërarchie, landmark-elementen
  (`<main>`, `<nav>`, `<article>`, `<section>`).
- MUST: formulieren als native `<form>` met `<label>` per veld, beschrijvende
  `name`-attributen (geen generieke `field1`), submit als echte `<button type="submit">`.
- MUST: prijzen, diensten, contactgegevens als platte tekst in de HTML —
  nooit uitsluitend in afbeeldingen of PDF's.
- MUST NOT: CAPTCHA op het contact-/offerteformulier (spamfilter server-side
  oplossen, bijv. honeypot + rate limiting).

### Content-structuur
- Elke dienstpagina volgt: direct antwoord eerst (wat, voor wie, prijsindicatie),
  daarna detail. AI-engines citeren beknopte, feitelijke antwoorden.
- Elke dienstpagina bevat een FAQ-sectie met letterlijke klantvragen
  ("Wat kost X?", "Leveren jullie in [regio]?") en concrete antwoorden.
- Schrijf entiteit-expliciet: noem bedrijfsnaam, dienst en regio voluit in
  plaats van "wij" en "het" — AI-modellen mappen op entiteiten.

### AI-crawler configuratie
- `public/robots.txt`:
  - Allow: OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User,
    Claude-SearchBot, Claude-User, BingBot (search/retrieval + user-fetchers)
  - Trainingcrawlers (GPTBot, ClaudeBot, Google-Extended, CCBot): Allow,
    tenzij klant anders beslist — keuze documenteren in dit bestand.
  - Sitemap-verwijzing verplicht.
- `public/llms.txt`: GEGENEREERD, niet handmatig. Build-script
  (`scripts/generate-llms.ts`) leest frontmatter van alle content en bouwt:
  korte bedrijfsbeschrijving, kerndiensten met URL's, FAQ-samenvatting,
  contactgegevens. Draait in de build-pipeline (prebuild hook).
- `sitemap.xml` automatisch via Astro-integratie.

### Performance
- Lighthouse Performance en SEO ≥ 95 op alle templates.
- Core Web Vitals binnen "good"-grenzen: LCP < 2,5s, INP < 200ms, CLS < 0,1.
- Geen render-blocking third-party scripts. Analytics alleen als deferred/partytown.

## Harde SEO-regels (MUST — klassieke zoekmachines)

### Meta & head
- MUST: elke pagina heeft een unieke `<title>` (± 50–60 tekens, format:
  `[Onderwerp] | [Klantnaam]`) en unieke `<meta name="description">`
  (± 150–160 tekens, met concrete propositie en regio).
- MUST: `<link rel="canonical">` op elke pagina (absolute URL, zelf-refererend
  tenzij bewust anders).
- MUST: Open Graph (`og:title`, `og:description`, `og:image`, `og:url`,
  `og:type`) en Twitter Card tags op elke pagina. Eén sitebreed
  `og:image`-fallback (1200×630) + per pagina overschrijfbaar via frontmatter.
- MUST: `<html lang="nl">`. Bij meertaligheid: `hreflang`-annotaties.
- Centraliseer dit in één `<SEO />`-component/layout die props uit
  frontmatter leest — nooit losse meta tags per pagina hardcoden.

### URL-structuur
- Korte, beschrijvende, kleine-letters URL's met koppeltekens:
  `/diensten/microsoft-365-beheer` — geen query-parameters voor content,
  geen datums in URL's, geen stopwoorden.
- Consistente trailing-slash-keuze (Astro default volgen) en afdwingen
  via redirects.
- MUST: 301-redirects voor elke URL die wijzigt of vervalt
  (bijhouden in `vercel.json` / redirects-config). Geen redirect-ketens.
- Nette 404-pagina met navigatie naar hoofdsecties.

### Interne linkstructuur
- Elke pagina bereikbaar binnen max. 3 klikken vanaf de homepage.
- Beschrijvende ankerteksten ("Microsoft 365 beheer voor MKB"),
  nooit "klik hier" of "lees meer" als enige ankertekst.
- Dienstpagina's linken onderling waar relevant; blogartikelen linken
  naar de bijbehorende dienstpagina (topical clustering).
- MUST: `BreadcrumbList` JSON-LD + zichtbare breadcrumbs op alle
  pagina's behalve de homepage.

### Afbeeldingen & media
- MUST: beschrijvend `alt`-attribuut op elke informatieve afbeelding
  (leeg `alt=""` alleen bij puur decoratief).
- Beschrijvende bestandsnamen (`kantoor-alphen-aan-den-rijn.webp`,
  niet `IMG_2041.jpg`).
- Moderne formaten (WebP/AVIF), `width`/`height` altijd gezet (CLS),
  lazy loading behalve above-the-fold/LCP-afbeelding.

### Indexering
- `<meta name="robots" content="noindex">` op bedank-/formulier-succespagina's
  en eventuele interne zoekresultaten — verder nergens.
- Sitemap bevat alleen indexeerbare canonical-URL's.
- Na livegang: site aanmelden bij Google Search Console en Bing Webmaster
  Tools (Bing voedt ook Copilot), sitemap indienen. Opnemen in de
  oplevercheckliste.

## Verificatie (uitvoeren na elke betekenisvolle wijziging)
1. `npm run build && npm run preview`
2. Bot-rendertest: `curl -s -A "GPTBot" http://localhost:4321/<pagina>` —
   controleer dat kerncontent, JSON-LD en formulier in de output staan.
3. JSON-LD validatie: extraheer alle `application/ld+json` blokken en parse ze
   (script: `scripts/validate-schema.ts`); structuur checken tegen schema.org-types.
4. SEO head-check per gewijzigde pagina: unieke title + description aanwezig,
   canonical correct, OG-tags compleet (script: `scripts/validate-seo.ts` —
   parse de gebouwde HTML in `dist/` en faal bij ontbrekende of dubbele tags).
5. Controleer dat `llms.txt` is geregenereerd en de nieuwe/gewijzigde content bevat.
6. Controleer dat nieuwe pagina's in `sitemap.xml` staan en interne links
   geen 404's geven (`scripts/check-links.ts` over `dist/`).
7. `npx astro check` + lint zonder errors.

## Conversiepaden
- Primair: offerteformulier op /offerte (naam, e-mail, telefoon, omschrijving —
  maximaal 4 verplichte velden).
- Secundair: tel-link (`tel:`) en mail-link (`mailto:`) prominent in header/footer.
- Elke dienstpagina eindigt met een duidelijke CTA naar /offerte met context
  in de URL (`?dienst=...`) zodat een agent het juiste pad kan volgen.

## Wat NIET doen
- Geen cookiewalls of interstitials die content blokkeren vóór consent
  (cookie-banner mag, maar content moet zonder interactie leesbaar zijn).
- Geen tekst in afbeeldingen voor kernfeiten (prijzen, USP's, contactinfo).
- Geen client-side routing voor contentpagina's.
- Geen marketing-jargon zonder feitelijke onderbouwing — AI-modellen
  prefereren verifieerbare, concrete claims.
