# Server: kako je postavljen i šta na njemu nije urađeno

Datum: 15.09.2026.
Status: živo, `tidywright.com` odgovara

Zapis postavke, da je iko može ponoviti ili preuzeti. Nije uputstvo za idealan server nego
opis stvarnog, sa svim što na njemu fali. Drugi dio dokumenta je popis rupa i on je
jednako važan kao prvi.

Razlog zašto server postoji prije nego što ga plan gradnje traži: prijava u Cloudflare
Verified Bots ne može se poslati bez žive javne stranice i stalne adrese, a odobrenje
traje kvartal. Vidi `docs/38-bot-verification.md`.

---

## Odnos prema odluci 0008

`decisions/0008`, tačka 1, kaže da aplikacija u fazi 1 ide na Vercel. **Ova postavka to ne
mijenja i ne poništava.** Ovdje je jedan mali server koji servira `/bot` i direktorij
ključeva mjesecima prije nego što aplikacija uopšte bude imala korisnike, jer je to bilo
potrebno za prijavu i jer server za radnika ionako dolazi u B2.

Gdje `app.tidywright.com` živi u B4 je i dalje otvoreno i i dalje se odlučuje po 0008.
Ako se ispostavi da je ovaj server dovoljan i za to, mijenja se odluka, ne usput.

---

## Hetzner

| | |
|---|---|
| Projekat | `tidywright` |
| Server | `tw-app-1` |
| Tip | CPX12 |
| Slika | Ubuntu 26.04 |
| Lokacija | Falkenstein (fsn1) |

Ista lokacija za sve kasnije servere, jer je privatna mreža besplatna samo unutar lokacije
(`docs/20-infrastructure.md`).

### Adrese

Dvije **Primary IP**, obje sa **uključenom zaštitom od brisanja**, obje sa postavljenim
reverse DNS-om.

| Adresa | Reverse DNS | Uloga |
|---|---|---|
| `49.13.83.98` | `web.tidywright.com` | aplikacija, `/bot`, direktorij ključeva |
| `188.245.170.86` | `crawler.tidywright.com` | izlaz radnika, rezervisana, prvi put u B2 |

**Zašto Primary IP a ne obična:** adresa preživljava brisanje servera. Prijavljena je
Cloudflareu i Akamaiju, a ponovna prijava zbog zamjene servera bi značila još jedan
kvartal čekanja. Server je potrošna roba, adresa nije.

Obje su u `packages/shared/src/bot-identity.ts` i objavljene na `/bot/ips.json`, uključujući
onu koja još ništa ne radi. Razlog je u `docs/38`, korak 6.

---

## DNS, na Cloudflareu

Četiri A zapisa, **svi DNS only, sivi oblak**:

| Zapis | Adresa |
|---|---|
| `@` | `49.13.83.98` |
| `www` | `49.13.83.98` |
| `web` | `49.13.83.98` |
| `crawler` | `188.245.170.86` |

**`crawler` mora ostati sivi oblak zauvijek.** Ako se proksira kroz Cloudflare, forward
provjera reverse DNS-a vraća Cloudflareovu adresu umjesto naše, verifikacija u oba smjera
pada, i ispadamo iz programa verifikovanih botova. To je greška koja se pravi jednim
klikom, godinama kasnije, od nekoga ko ne zna zašto je zapis siv. Zato piše i ovdje i u
`docs/38`.

Ostala tri su siva iz praktičnog razloga: dok Cloudflare proxy nije podešen (rate limiting,
WAF pravila, keš zaglavlja iz `docs/17`), narančasti oblak samo dodaje sloj koji niko nije
konfigurisao. Uključuje se kad za to dođe red, u B4.

---

## Sistem

- **ufw**: otvoreni samo 22, 80 i 443. Sve ostalo zatvoreno.
- **unattended-upgrades**: uključen.
- **Swap**: 2 GB. CPX12 ima malo RAM-a, a `next build` je najgladniji trenutak u cijelom
  ciklusu.
- **Korisnik `tw`**: aplikacija ne radi kao root. Kod je u `/srv/tidywright`.

## Alati

- **Node 22**, iz NodeSource repozitorija.
- **pnpm**, preko `corepack`, verzija iz `packageManager` polja u `package.json`.
- **Caddy**, iz njihovog repozitorija.

## Kod i tajne

- Repozitorij u `/srv/tidywright`, vlasnik `tw`.
- **Deploy ključ na GitHubu je read-only i zaseban** od Mumetovog ličnog ključa. Server
  može čitati, ne može pisati, i kompromitovan server ne znači kompromitovan repozitorij.
- `apps/web/.env.local`, vlasnik `tw`, prava **600**. Unutra je `TW_BOT_SIGNING_KEY`.
  Privatni ključ nije nigdje drugo i nikad nije bio u repozitoriju.
- **`TW_MARKETING_LIVE` nije postavljen.** Zbog toga `proxy.ts` servira samo `/bot`,
  `/bot/ips.json` i direktorij ključeva, a sve ostalo na `tidywright.com` vraća 404.
  Namjerno: bot stranica mora biti živa mjesecima prije F3, a nedovršena naslovna na
  firminoj domeni je gora od nikakve.

## Servis i proxy

- **systemd servis `tidywright`** pokreće `next start` na `127.0.0.1:3000`. Aplikacija ne
  sluša na javnom interfejsu; jedini put do nje je kroz Caddy.
- **Caddy** sluša 80 i 443, proxy na 3000, sertifikat sam obnavlja, i `www` trajno
  preusmjerava na apex.

## Deploy

```bash
sudo tw-deploy
```

`/usr/local/bin/tw-deploy` radi, redom: `git pull`, `pnpm install`, `pnpm build`, `chown`
na `tw`, pa `systemctl restart tidywright`.

Ručno, bez skripte, izgleda isto i to je namjerno: skripta nije apstrakcija nego
podsjetnik da se ne zaboravi `chown`.

---

## Šta NIJE urađeno

Ovo nije produkcijski server i ne pretvara se da jeste. Popis je ovdje da se ne otkriva
pojedinačno, u najgorem trenutku.

| Šta fali | Posljedica | Kad se rješava |
|---|---|---|
| **Nema backupa.** Ni snapshota, ni `restic`, ničega | Ako disk umre, gubimo konfiguraciju. Kod je u gitu, ključ nije | Prije nego što na serveru bude ijedan tuđi podatak, dakle prije B1 |
| **Nema monitoringa.** Ni uptime provjere, ni alerta | Ako servis padne, saznaje se kad neko slučajno otvori stranicu. Za bot stranicu koja mora biti živa dok traje prijava, to je stvaran rizik | `docs/25-observability-and-ops.md`, B4. Do tada je dovoljan besplatan Better Stack monitor na `/bot` |
| **Nema staging okruženja.** Jedan server, jedna grana | Svaka izmjena ide pravo u ono što Cloudflare pregleda | B4, kad deploy dobije `deploy-staging.yml` |
| **`crawler` adresa nije ni na čemu zakačena** | Prijavljena je i objavljena, ali ništa ne izlazi kroz nju | B2, kad radnik postoji |
| **IPv6 izlaz nije ograničen** | Vidi niže. Najozbiljnija stavka na listi | **B2, obavezno** |
| Nema `fail2ban` | SSH je na 22 sa ključem, pa je rizik mali, ali logovi će biti bučni | Kad zasmeta |
| Nema odvojenog korisnika za deploy skriptu | `tw-deploy` traži `sudo` | Kad staging dođe |

### IPv6, i zašto je to ozbiljno

Server ima IPv6 adresu koju nismo prijavili ni objavili. Kad radnik u B2 počne dohvatati
tuđe sajtove, Node će za svaki host koji ima AAAA zapis **radije izaći preko IPv6**, sa
adrese koje nema ni u `/bot/ips.json` ni u Cloudflare prijavi.

Posljedica je tačno ono zbog čega se ispada iz programa: saobraćaj sa neprijavljene
adrese. Gore, tiho je: prijava prolazi, verifikacija po IP listi pada samo za dio
zahtjeva, i to izgleda kao nasumična nepouzdanost umjesto kao greška konfiguracije.

Tri načina da se riješi, redom po tome koliko su dobri:

1. **Prijaviti i IPv6 adresu** i objaviti je u `ips.json`, sa reverse DNS-om kao i za IPv4.
   Najčistije, jer ne odustaje od IPv6.
2. Vezati izlazni socket radnika na `188.245.170.86` i isključiti IPv6 za taj proces.
3. Isključiti IPv6 na serveru. Najgrublje, i pogađa i sve ostalo.

Odluka pripada B2. Ovdje je zapisano da se ne otkrije kao "čudno ponašanje" poslije mjesec
dana.

---

## Kad server treba zamijeniti

Adrese su Primary IP sa zaštitom od brisanja, pa se odvajaju od starog servera i kače na
novi. **Prijava se ne radi ponovo**, reverse DNS se ne mijenja, i `bot-identity.ts` se ne
dira. To je cijeli razlog zašto su Primary a ne obične.

Redoslijed: novi server u istoj lokaciji, odvoji Primary IP sa starog, zakači na novi,
`tw-deploy`, provjeri tri `curl` komande iz `docs/38` korak 5, pa obriši stari.
