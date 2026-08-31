# MedInv — Produktseite

Statische Homepage zur Präsentation von MedInv, zwei Sprachseiten. Kein
Build-Schritt, keine Abhängigkeiten — reines HTML/CSS/JS.

```
index.html                DE (kanonische Root-URL)
en/index.html             EN (eigenständiges statisches Pendant)
robots.txt
sitemap.xml
site.webmanifest
favicon.ico                Root, da viele Crawler/Browser diesen Pfad hart-codiert erwarten
design/og-template.html    Nur Bau-Hilfsmittel für die Social-Preview-Bilder, nie verlinkt
assets/
  css/style.css
  js/main.js                Mobiles Menü, Copy-Button, Scroll-Reveal
  img/                       Logo, Favicons, Social-Preview-Bilder, Screenshots der App
```

## Lokal ansehen

```bash
cd /opt/MedInv/homepage
python3 -m http.server 4500
# -> http://localhost:4500  (DE)
# -> http://localhost:4500/en/  (EN)
```

## Deployment

Rein statische Dateien — auf jedem Webserver oder Static-Host lauffähig, z. B.:

```bash
# nginx: docroot direkt auf dieses Verzeichnis zeigen lassen, oder
docker run -d --name medinv-homepage -p 8090:80 \
  -v /opt/MedInv/homepage:/usr/share/nginx/html:ro \
  nginx:alpine
```

Wichtig: `/` muss auf `index.html` und `/en/` auf `en/index.html` auflösen
(Standardverhalten jedes Webservers für Verzeichnis-Requests — nginx/Apache/
S3+CloudFront tun das ohne Zusatzkonfiguration). Einzige externe Abhängigkeit:
Google Fonts (Fraunces, Public Sans, IBM Plex Mono), eingebunden per `<link>`
in beiden `index.html`-Dateien.

## Zwei statische Sprachseiten pflegen

`index.html` (DE) und `en/index.html` (EN) sind zwei vollständig unabhängige,
statische Dateien — es gibt **kein** gemeinsames Textwörterbuch mehr (das
frühere `assets/js/i18n.js`-System wurde zugunsten echter, für Suchmaschinen
crawlbarer URLs abgelöst, siehe „SEO“ unten). Das bedeutet:

- Jede Textänderung muss **manuell in beiden Dateien** nachgezogen werden.
  Es gibt keine einzige Quelle der Wahrheit für Inhalte mehr — das ist der
  bewusst in Kauf genommene Mehraufwand für echte, indexierbare
  Sprachversionen statt clientseitigem Textaustausch.
- Neue/geänderte Abschnitte müssen auf beiden Seiten dieselben `id`-Attribute
  behalten (`#funktionen`, `#einblicke`, `#quickstart`), da Navigation,
  Footer-Links und die `hreflang`-Verknüpfung im `<head>` sich darauf
  verlassen.
- Der Copy-Button im Terminal-Block liest sein „Kopiert“-Label aus
  `data-copied-label` am `<button>` selbst — pro Seite fest im Markup, kein
  JS-Wörterbuch nötig.

## SEO

Beide Seiten haben vollständige Auszeichnung: `<meta name="robots">`,
`<link rel="canonical">`, wechselseitige `hreflang`-Verknüpfung (inkl.
`x-default` → deutsche Root-Seite), Open-Graph- und Twitter-Card-Tags mit
eigenem 1200×630-Social-Preview-Bild je Sprache, JSON-LD
(`schema.org/SoftwareApplication`), `theme-color` (hell/dunkel), sowie
`robots.txt`/`sitemap.xml` (mit `xhtml:link`-hreflang-Einträgen je URL).

**Bewusst kein clientseitiger Sprach-Redirect** nach Browsersprache — das
gilt als Anti-Pattern (bricht Crawling/Direktzugriff, siehe Google Search
Central). Der sichtbare Umschalter (`DE`/`EN` oben rechts) und `hreflang`
reichen aus.

### Domain

Die Domain steht fest: **`https://medinv.de`** — überall dort hinterlegt, wo
zuvor der Platzhalter `medinv.example` stand (Canonical, hreflang, Open
Graph/Twitter-Bilder, JSON-LD `url`/`image` in `index.html`/`en/index.html`,
die `Sitemap:`-Zeile in `robots.txt`, sowie `<loc>`/`<xhtml:link>` in
`sitemap.xml`). Sollte sich die Domain noch einmal ändern, findet
```bash
grep -rn "medinv.de" /opt/MedInv/homepage
```
zuverlässig jede Fundstelle.

## Favicons & Social-Preview-Bilder neu erzeugen

Beide werden aus `assets/img/logo.svg` bzw. `design/og-template.html`
erzeugt, per ImageMagick (`magick`) bzw. playwright-core (siehe
`design/og-template.html`s eigenen `?lang=de|en`-Query-Parameter-Mechanismus
für die zwei Tagline-Varianten). Nur nötig, wenn sich Logo oder Markendesign
ändern:

```bash
cd /opt/MedInv/homepage
magick -background none assets/img/logo.svg -resize 16x16 /tmp/favicon-16.png
magick -background none assets/img/logo.svg -resize 32x32 /tmp/favicon-32.png
magick -background none assets/img/logo.svg -resize 48x48 /tmp/favicon-48.png
magick /tmp/favicon-16.png /tmp/favicon-32.png /tmp/favicon-48.png favicon.ico

magick -background "#faf8f3" assets/img/logo.svg -resize 180x180 \
  -gravity center -extent 180x180 assets/img/apple-touch-icon.png
magick -background none assets/img/logo.svg -resize 192x192 assets/img/icon-192.png
magick -background none assets/img/logo.svg -resize 512x512 assets/img/icon-512.png
```

## Screenshots aktualisieren

Die App-Screenshots in `assets/img/` stammen aus der laufenden App (Login als
Admin, Bibliotheken „Sample Library – …“ aus dem Seeder). Neu erzeugen:

1. Backend (`php artisan serve`) und Frontend (`npm run dev`) lokal starten.
2. Gewünschte Seite im Browser öffnen, Screenshot bei ca. 1600×1000 (oder via
   Kamera-Icon-Tools/Playwright) erstellen.
3. Mit z. B. `convert screenshot.png -resize 1800x -strip -define png:compression-level=9 assets/img/screenshot-<name>.png`
   verkleinern und in `assets/img/` ablegen, dann im `<img src>` **beider**
   Sprachseiten referenzieren.
