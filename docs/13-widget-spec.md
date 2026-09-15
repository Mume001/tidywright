# Specifikacija: widget, prva verzija

Ovo je dokument iz kojeg Claude Code gradi. Sve što nije ovdje ne gradi se u fazi 1.
Odluke iza ovoga su u `decisions/0004`, `0005` i `0006`.

## Tri površine

1. **Embed i hostovani obrazac.** Script tag koji agencija zalijepi na svoj sajt, plus
   hostovana stranica za agencije bez pristupa CMS-u.
2. **Izvještaj.** Javna stranica s tokenom u URL-u, brendirana bojama i logom agencije.
3. **Nalog agencije.** Prijava, brendiranje, kod za ugradnju, lista leadova, lista audita.

## Tok

```
posjetilac unese URL + email + pristanak
      |
      v
POST /api/audit  (embed key, Turnstile token)
      |  validacija: limiti, URL, email, SSRF
      v
audits: status=queued  ->  vrati audit_id + report_url
      |
      v  (radnik uzima posao)
fetch stranice  ->  robots.txt  ->  HEAD na http i www varijante
      |
      v
parsiranje  ->  29 provjera  ->  ocjena  ->  izbor 3 nalaza za popravku
      |
      v
jedan poziv modelu (JSON)  ->  validacija  ->  status=done
      |
      v
email agenciji (lead) + webhook  |  email posjetiocu (link na izvještaj)
```

Izvještaj se otvara odmah i pokazuje stanje "u toku" dok radnik ne završi. Cilj: gotov
izvještaj za manje od 8 sekundi u 90 posto slučajeva.

## Model podataka

```
agencies        id, name, slug, plan (free|paid), created_at
users           Supabase auth; profile: user_id, agency_id, role
branding        agency_id, logo_url, primary_color, cta_text, cta_url,
                calendar_url, show_powered_by (bool, true na free)
embed_keys      id, agency_id, public_key, mode (inline|redirect), active
audits          id, agency_id, embed_key_id, url, normalized_url, email,
                status (queued|running|done|failed), score, group_scores jsonb,
                checks jsonb, fixes jsonb, page_meta jsonb, error, created_at,
                finished_at, duration_ms, model_cost_usd
leads           id, audit_id, agency_id, email, consent_at, notified_at,
                webhook_status, webhook_attempts
events          id, audit_id, type, created_at
                (audit_started, audit_done, report_viewed, fixes_expanded, cta_clicked)
usage_daily     agency_id, day, audits_count
```

Prava pristupa: agencija vidi samo svoje redove. Izvještaj je javan preko tokena, ne
preko prijave.

## Embed ugovor

```html
<script src="https://<neutralna-domena>/embed.js" data-key="pk_live_..." async></script>
<div id="sw-audit"></div>
```

- Skripta renderuje obrazac u div: URL, email, kvačica pristanka, dugme. Boje i tekst iz
  brendiranja agencije.
- `mode=inline`: rezultat se prikazuje u istom divu. `mode=redirect`: otvara se izvještaj.
- Skripta mora biti ispod 30 KB, bez zavisnosti, bez kolačića, bez čitanja stranice
  domaćina. Ne smije usporiti LCP sajta agencije: učitava se async i ne blokira render.
- Hostovani obrazac: `https://<neutralna-domena>/a/<slug>`, ista logika.
- Domena za posluživanje je neutralna i nikad ne sadrži naš brend. Vidi otvoreno pitanje
  6.

## Validacija zahtjeva

Redoslijed, i svaki korak odbija s jasnim kodom greške:

1. Turnstile token ispravan
2. Embed key aktivan, agencija ispod dnevnog limita (free 50, paid 500)
3. Email sintaksno ispravan, nije na listi privremenih domena
4. URL: samo http i https, normalizacija (mala slova host, uklanjanje fragmenta),
   maksimalna dužina 2048
5. **SSRF zaštita:** host se razrješava u javnu IP adresu, blokirani su privatni i
   lokalni opsezi (10/8, 172.16/12, 192.168/16, 127/8, 169.254/16, ::1, fc00::/7),
   i to se ponovo provjerava na svakom preusmjerenju
6. Isti host za isti embed key: najviše 1 audit dnevno na free, 5 na paid
7. Blokirana naša domena i domene agencija na listi izuzetaka
8. Pristanak za uslugu je označen. Marketinški pristanak se ne provjerava jer je
   neobavezan, ali se zapisuje i kad je `false`. Odluka `0011`, tačka 3

## Dohvat stranice

- GET s vlastitim User-Agentom koji ima ime i URL za kontakt
- Timeout 10 sekundi, najviše 5 preusmjerenja, zapisuje se cijeli lanac
- Najviše 2 MB tijela, samo text/html
- Paralelno: GET robots.txt, HEAD na http varijantu i na www ili bez www varijantu
- Bez izvršavanja JavaScripta u prvoj verziji
- Ako stranica vrati 4xx ili 5xx, izvještaj to kaže i staje

## Provjere

29 provjera iz `docs/05-checks.md`, odjeljak "Prva verzija". Svaka vraća:

```
{ code, group, severity (K|V|N), passed (bool), evidence (kratak string), fixable (A|R) }
```

## Ocjena

- Četiri grupe: Indeksiranje (A), Oznake stranice (B), Strukturirani podaci (C),
  Sadržaj i mediji (D, E i F zajedno)
- Težina nalaza: K = 3, V = 2, N = 1
- Ocjena grupe = 100 × (1 − zbir težina palih / zbir težina svih u grupi)
- Ukupna ocjena = prosjek četiri grupe, zaokruženo
- Boje: 0 do 49 crveno, 50 do 79 žuto, 80 do 100 zeleno

## Izbor tri popravke

Redoslijed prioriteta, uzimaju se prve tri čija je provjera pala:

1. M-TITLE (B1, B2, B3)
2. M-META (B4, B5)
3. M-SCHEMA (C1, C3)
4. M-H1 (B6)
5. M-OG (F1)
6. M-ALT (E1, E2), do tri slike

Ako je manje od tri palo, prikazuje se koliko ih ima, i to se u izvještaju kaže kao
pohvala, ne kao prazno mjesto.

## Ugovor s modelom

Jedan poziv po auditu. Ulaz:

```
{
  url, page_type_guess (home|service|product|article|contact|other),
  existing: { title, meta_description, h1: [], og_title, og_description },
  visible_text_excerpt (do 1500 znakova, bez navigacije i footera),
  business: { name_guess, address_guess, phone_guess, locality_guess },
  images_without_alt: [{ src, surrounding_text }] (do 3),
  requested_fixes: ["title", "meta", "schema"]
}
```

Izlaz, strogo JSON:

```
{
  title: { value, reasons: [..] },
  meta_description: { value, reasons: [..] },
  schema: { type (LocalBusiness|Organization), jsonld: {...}, reasons: [..] },
  h1?, og?, alts?
}
```

Pravila iz `docs/06-fixes.md` važe: model ne smije izmisliti činjenicu, koristi samo ono
što je u ulazu; ako podatak ne postoji, polje je null i popravka se ne nudi.

Validacija prije prikaza: title 15 do 60 znakova; meta 70 do 160; JSON-LD parsira se i
prolazi provjeru obaveznih polja za tip; bar jedan razlog po popravci. Ako validacija
padne, jedan ponovni poziv s porukom greške, pa odustajanje uz zapis.

Trošak: cilj ispod 0,01 USD po auditu na jeftinoj klasi modela. Zapisuje se po auditu.

## Izvještaj

Redoslijed odozgo:

1. Logo i boja agencije, URL koji je skeniran, datum
2. Ocjena u krugu, četiri podocjene u boji
3. **Tri popravke, svaka kao kartica:** naslov nalaza, "sada" i "prijedlog" jedno pored
   drugog na širini od 768 px naviše i jedno ispod drugog ispod toga, dugme za kopiranje,
   dva do tri razloga ispod. Vidi `decisions/0009` i `docs/15-frontend-spec.md` 2.1.
4. Ostali nalazi kao lista: naslov i ozbiljnost vidljivi, opis i popravka zamagljeni,
   preko svega jedan poziv: "Get the full fix pack from [Agencija]" s dugmetom na
   cta_url ili kalendar
5. "Powered by" u podnožju ako je agencija na free paketu
6. Nema našeg imena nigdje na plaćenom paketu, uključujući URL i naslov kartice

Izvještaj je javan preko tokena od 32 znaka, bez isteka u prvoj verziji, bez indeksiranja
(noindex).

## Nalog agencije

Minimalno:

- Prijava i registracija (Supabase auth, email i lozinka, magic link)
- Brendiranje: logo, boja, tekst i link poziva, link kalendara
- Kod za ugradnju s prekidačem inline ili redirect, i link na hostovani obrazac
- Leadovi: tabela s emailom, URL-om, ocjenom, datumom, linkom na izvještaj, izvoz CSV
- Auditi: ista tabela bez emaila, s trajanjem i statusom
- Webhook URL i test dugme
- Brojke za pilot: audita ove sedmice, leadova, pregleda izvještaja, klikova na poziv

## Emailovi

Resend, s naše domene za slanje, SPF, DKIM i DMARC podešeni prije prvog maila.

1. Agenciji, odmah po završetku: novi lead, email, URL, ocjena, link na izvještaj.
2. Posjetiocu: link na izvještaj, s imenom i logom agencije, bez našeg imena na
   plaćenom paketu.

## Zaštita i troškovi

- Turnstile na obrascu
- Dnevni limiti po agenciji i po ciljanom hostu, vidi validaciju
- Timeout i ograničenje veličine na dohvatu
- Cijena modela po auditu se zapisuje; ako prosjek za dan pređe 0,03 USD, upozorenje
- Leadovi i emailovi se brišu na zahtjev agencije (GDPR), izvještaj tada postaje 410

## Instrumentacija pilota

Ovo je razlog zašto prva verzija postoji. Svaki događaj u tabeli events, i sedmični
pregled po agenciji:

- audita
- leadova (email ostavljen)
- pregleda izvještaja
- otvaranja zamagljenog dijela
- klikova na poziv agenciji

Tri brojke koje se traže od pet pilot agencija: audita mjesečno, postotak leadova, i
klikova na poziv za izvještaje s gotovim popravkama nasuprot izvještaju samo s ocjenom.
Za treću brojku, polovina audita svake agencije nasumično dobija izvještaj bez gotovih
popravki (samo ocjena i lista), i to se zapisuje kao variant na auditu.

## Van opsega prve verzije

Stripe, crawl sajta, PageSpeed, WordPress, Search Console, uređivanje popravki, više
korisnika po agenciji, više jezika, render JavaScripta, PDF izvještaja.

## Miljokazi za Claude Code

| # | Šta | Gotovo kad |
|---|---|---|
| M1 | Repo, Supabase schema, auth, brendiranje, kod za ugradnju | agencija se prijavi i vidi svoj embed kod |
| M2 | Radnik: dohvat, 29 provjera, ocjena | `pnpm audit <url>` iz terminala ispiše nalaze i ocjenu za bilo koji URL |
| M3 | Popravke: ugovor s modelom, validacija, trošak | ista komanda ispiše tri gotove popravke |
| M4 | Izvještaj i embed skripta, hostovani obrazac | audit se pokrene s tuđeg sajta i izvještaj se otvori |
| M5 | Leadovi, emailovi, webhook, zaštita, instrumentacija | agencija dobije mail i vidi brojke |
| M6 | Doljerivanje, pet pilot agencija | tri brojke stižu sedmično |

Svaki miljokaz je zaseban PR. Ne kreće se na sljedeći dok prethodni nije prošao ručni
test iz kolone "gotovo kad".
