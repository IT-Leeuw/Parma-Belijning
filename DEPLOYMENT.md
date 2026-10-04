# Deployment naar cPanel

GitHub Actions bouwt de statische Astro-site met Node.js 22 en `npm ci`.
Na een geslaagde build wordt alleen de inhoud van `dist/` via gewone
FTP (zonder TLS, standaard poort 21) naar cPanel geupload.
Let op: de gebruikersnaam, het wachtwoord en de bestanden worden onversleuteld
verstuurd. Gebruik een apart FTP-account met toegang tot alleen deze site.
De pipeline draait bij een push naar `main` en via **Run workflow** in GitHub.
Ook bij een handmatige run wordt alleen vanaf `main` gedeployed.

## Eenmalig instellen

1. Maak in cPanel een FTP-account aan met toegang tot de webroot van deze site.
   Gebruik bij voorkeur een apart account dat alleen deze site mag wijzigen.
2. Maak in GitHub onder **Settings > Environments** een environment `production`.
   Beperk deployment branches tot `main`. Stel eventueel verplichte goedkeuring in
   als je GitHub-abonnement dat ondersteunt.
3. Voeg onder dit environment de volgende **secrets** toe:

| Secret | Waarde |
| --- | --- |
| `CPANEL_FTP_SERVER` | FTP-hostnaam van je provider, zonder `ftp://` of pad. |
| `CPANEL_FTP_USERNAME` | Volledige FTP-gebruikersnaam zoals getoond in cPanel. |
| `CPANEL_FTP_PASSWORD` | Wachtwoord van het FTP-account. |

4. Voeg indien nodig de volgende environment **variables** toe:

| Variable | Standaard | Betekenis |
| --- | --- | --- |
| `CPANEL_FTP_PORT` | `21` | Poort voor gewone FTP. |
| `CPANEL_FTP_DIRECTORY` | `public_html/` | Doelmap gezien vanaf de FTP-login, niet vanaf de cPanel-bestandsmanager. |

Als het FTP-account al rechtstreeks in `public_html` uitkomt, stel
`CPANEL_FTP_DIRECTORY` in op `/`. Voor een addon-domein gebruik je de
bijbehorende document root. Paden mogen geen spaties of `..`-segmenten bevatten.
Controleer de doelmap voordat je de eerste deployment start.

5. Push de configuratie naar GitHub en start de workflow
   **Build and deploy to cPanel** vanaf `main`.
6. Controleer na afloop de homepage, dienstpagina's en het offerteformulier
   op het echte domein.

## Gedrag en veiligheid

- TLS is uitgeschakeld voor de verbinding en bestandsoverdracht.
  Er is geen certificaatcontrole of bescherming tegen meelezen onderweg.
- Wachtwoorden staan uitsluitend in GitHub secrets en worden via een
  omgevingsvariabele aan de FTP-client doorgegeven. Dit versleutelt de verbinding niet.
- Uploads naar productie draaien niet tegelijkertijd. Een lopende upload
  wordt niet afgebroken door een volgende push.
- Bestaande bestanden worden overschreven als de build dezelfde paden bevat.
  Bestanden die alleen op de server staan worden niet verwijderd, waaronder
  `.htaccess`, mailmappen en eventuele andere applicaties.
- Verwijderde pagina's blijven daardoor op de server staan. Verwijder ze bewust
  en stel waar nodig een 301-redirect in via cPanel of `.htaccess`.
- FTP-upload is niet atomair: tijdens de upload kunnen oude en nieuwe bestanden
  kort naast elkaar bestaan. Maak voor de eerste deployment een hostingback-up.
- Het build-artifact blijft zeven dagen beschikbaar in GitHub Actions.
  Een oude commit kan via een revert op `main` opnieuw worden gebouwd en uitgerold.

## Hostingvoorwaarden

De provider moet gewone FTP zonder TLS, passieve FTP en verbindingen vanaf GitHub-hosted
runners toestaan. Bij een IP-allowlist is mogelijk een self-hosted runner met
een vast IP nodig. Deze pipeline gebruikt geen FTPS of SFTP; een server die TLS
verplicht stelt zal de upload weigeren.

De site blijft een statische Astro-site. cPanel hoeft geen Node.js te draaien.
Een formulierbackend wordt niet door deze pipeline ingericht; controleer dat
het bestaande formulierendpoint ook vanaf het productiedomein werkt.
De site-URL staat momenteel op `https://parma-belijning.nl` in de Astro-configuratie.