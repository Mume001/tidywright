# Verifikacija bota: šta je urađeno i šta ostaje

Datum: 15.09.2026.
Status: **server je živ, ostaje poslati prijave**

Ovo je najduži štap u rasporedu. Odobrenje traje kvartal, a rok je prvi audit uživo,
dakle prije B2. Zato je i otišlo ispred F2.

Brojke koje opravdavaju sav ovaj trud su u `docs/36-fetch-reliability.md`: neverifikovan
bot dobije HTTP 200 u **33,3 posto** slučajeva, verifikovan u **73,0 posto**, a Cloudflare
stoji ispred četvrtine weba. Nijedno podešavanje HTTP klijenta ne proizvodi taj skok.

---

## Gdje smo, 15.09.2026.

**Živo na tidywright.com:**

| Šta | Provjereno |
|---|---|
| `https://tidywright.com/bot` | 200 |
| `https://tidywright.com/bot/ips.json` | obje adrese |
| `https://tidywright.com/.well-known/http-message-signatures-directory` | 200, `content-type: application/http-message-signatures-directory+json`, oba zaglavlja `signature` i `signature-input` |

**U kodu:**

| Šta | Gdje |
|---|---|
| Identitet bota na jednom mjestu | `packages/shared/src/bot-identity.ts`, 12 testova |
| Javna stranica `/bot` | `apps/web/app/bot/page.tsx` |
| Lista adresa `/bot/ips.json` | `apps/web/app/bot/ips.json/route.ts` |
| Potpisani direktorij ključeva | `apps/web/app/.well-known/http-message-signatures-directory/route.ts` |
| RFC 9421 potpisivanje i provjera | `apps/web/lib/bot-auth.ts`, 11 testova |
| Generator ključeva | `pnpm bot:keys` |
| Zaštita da tidywright.com ne pokaže ništa osim bot putanja prije F3 | `apps/web/proxy.ts`, `TW_MARKETING_LIVE` |

**Infrastruktura:** jedan Hetzner server, Caddy, systemd, bez Vercela. Kompletan popis
kako je postavljeno i šta nije urađeno je u **`docs/39-server-setup.md`**.

**Ostaje:** poslati dvije prijave (koraci 6 i 8) i napraviti `bot@tidywright.com`
(korak 5). Pola sata.

---

## Šta je već postavljeno, za slučaj da se ponavlja

Ovo više nije uputstvo nego zapis. Ako server ikad treba ponovo, detalji su u
`docs/39-server-setup.md`; ovdje je samo ono što dodiruje prijavu.

### Adrese

Dvije Hetzner Primary IP adrese u Falkensteinu, obje sa uključenom zaštitom od brisanja.
To je ono što čini da prijava preživi zamjenu servera: **adresa je imovina, ne server.**

| Adresa | Reverse DNS | Uloga |
|---|---|---|
| `49.13.83.98` | `web.tidywright.com` | aplikacija, `/bot`, direktorij ključeva |
| `188.245.170.86` | `crawler.tidywright.com` | izlaz radnika, rezervisana, prvi put u upotrebi u B2 |

**Obje idu u prijavu, iako druga još ništa ne radi.** Ono što objavljujemo i ono što
prijavljujemo mora biti ista lista. Adresa koju počnemo koristiti a nismo je prijavili je
tačno ono zbog čega se izbacuje iz programa.

Provjera u oba smjera, i to je ono što Cloudflare i Bing gledaju:

```bash
dig +short -x 49.13.83.98        # web.tidywright.com.
dig +short web.tidywright.com    # 49.13.83.98
dig +short -x 188.245.170.86     # crawler.tidywright.com.
dig +short crawler.tidywright.com # 188.245.170.86
```

**`crawler` A zapis mora zauvijek ostati sivi oblak u Cloudflareu** (DNS only). Ako se
proxira, forward provjera vraća Cloudflareovu adresu umjesto naše i verifikacija po
reverse DNS-u pada. Isto piše i u `docs/39-server-setup.md`, jer je to greška koju je
lako napraviti jednim klikom godinama kasnije.

### Ključ

Ed25519 par napravljen sa `pnpm bot:keys`. Privatni ključ je u `.env.local` na serveru,
kao `TW_BOT_SIGNING_KEY`, vlasnik `tw`, prava `600`. Nigdje drugo, nikad u repozitoriju.

**Key ID (JWK thumbprint, RFC 7638):**

```
2YUz85xnujZQsp0sGtAklW2vKsCI56PKo1ooakp_0oQ
```

To je `keyid` u svakom potpisu koji šaljemo. Izveden je iz javnog ključa, pa se mijenja
samo kad se ključ mijenja. Javni ključ se ne kopira nigdje ručno: direktorij ga izvodi iz
privatnog u trenutku odgovora, pa se ta dva ne mogu raziću.

### Objava

Bez Vercela. `apps/web` se gradi na samom serveru i servira ga Caddy preko systemd
servisa. Deploy je `sudo tw-deploy`. Detalji u `docs/39-server-setup.md`.

`TW_MARKETING_LIVE` **nije** postavljen, pa `tidywright.com` servira samo `/bot`,
`/bot/ips.json` i direktorij ključeva, a sve ostalo vraća 404. To je namjerno: bot
stranica mora biti živa mjesecima prije F3, a nedovršena naslovna na firminoj domeni je
gora od nikakve. Kad F3 dođe, postavi varijablu i sajt proradi cijeli.

---

## Korak 5: provjeri prije nego išta pošalješ

Sve tri su prošle 15.09.2026. Ponovi ih ako se bilo šta dirne prije prijave.

```bash
curl -si https://tidywright.com/.well-known/http-message-signatures-directory | head -20
curl -s  https://tidywright.com/bot/ips.json
curl -sI https://tidywright.com/bot
```

Direktorij mora dati, sve četiri stvari:

- `HTTP/2 200`
- `content-type: application/http-message-signatures-directory+json`
- zaglavlje `signature-input` koje sadrži `tag="http-message-signatures-directory"`
- tijelo oblika `{"keys":[{"kty":"OKP","crv":"Ed25519","x":"...","kid":"..."}]}`, gdje se
  `kid` poklapa sa key ID-om gore

### Jedna stvar koja fali prije prijave: mejl

`bot@tidywright.com` i `abuse@tidywright.com` stoje i na `/bot` stranici i u obrascu kao
kontakt. **Moraju primati poštu prije nego što se prijava pošalje.** Kontakt koji odbija
poštu je loš prvi utisak kod onoga ko pregleda prijavu, i gore od toga, vlasnik sajta
kojeg smo naljutili nema kome pisati.

Plan: **Cloudflare Email Routing** na `tidywright.com`, preusmjerenje oba na Mumetov lični
mail. Besplatno je, traži dva MX zapisa koje Cloudflare sam upiše, i gotovo je za pet
minuta. Kad Resend dođe u B5, ovo ostaje kako jeste: Resend šalje, Email Routing prima.

---

## Korak 6: Cloudflare, polje po polje

Dashboard, pa **Bot Submission Form**:
`https://dash.cloudflare.com/?to=/:account/configurations/verified-bots`

Cloudflareova dokumentacija ne objavljuje tačan popis polja obrasca, pa su imena niže onako
kako se pojavljuju u dashboardu i u njihovoj dokumentaciji. Ako se neko ime razlikuje,
značenje je isto i vrijednost se ne mijenja.

| Polje | Šta upisati |
|---|---|
| Lista | **Verified Bots** (ne Signed Agents; ta lista je za agente koji rade u ime korisnika u realnom vremenu, a mi smo SEO alat) |
| Bot name | `TidywrightBot` |
| Operator / Company | `Tidywright` |
| Website | `https://tidywright.com` |
| Public documentation URL | `https://tidywright.com/bot` |
| **Category** | **SEO** |
| Description | Tekst je niže, kopiraj ga doslovno |
| **Verification Method** | **Request Signature** |
| **Validation Instructions** | `https://tidywright.com/.well-known/http-message-signatures-directory` |
| User Agents | `Mozilla/5.0 (compatible; TidywrightBot/1.0; +https://tidywright.com/bot)` |
| User Agent match pattern | Ako traži obrazac a ne tačan string: `*TidywrightBot/*` |
| IP list URL | `https://tidywright.com/bot/ips.json` |
| IP ranges | `49.13.83.98/32` i `188.245.170.86/32`, obje |
| ASN | **ne navoditi.** AS24940 je Hetznerov, ne naš, i prijaviti ga značilo bi tvrditi da je svaka adresa u njemu naša |
| Key ID, ako ga traži | `2YUz85xnujZQsp0sGtAklW2vKsCI56PKo1ooakp_0oQ` |
| Contact email | `bot@tidywright.com` |
| Abuse contact | `abuse@tidywright.com` |
| Respects robots.txt | Da |
| Used for AI training | **Ne** |

**Obje adrese, i ona koja još ništa ne radi.** Ako se prijavi samo `web`, prvi audit koji
izađe sa `crawler` adrese dolazi sa neprijavljene adrese, a to je jedna od navedenih
stavki zbog kojih se servis izbacuje iz programa. Prijaviti obje sada ne košta ništa.

**Kategorija je SEO i nikad Agent ni Training.** Od 15.09.2026. Cloudflare po defaultu
blokira Training i Agent na novim domenama i na postojećim free zonama, a naša publika su
mali poslovni sajtovi, dakle free zone. SEO nije obuhvaćen tim blokom. Uz to, Cloudflare
zadržava pravo da promijeni kategoriju ako se javna dokumentacija i stvarno ponašanje ne
slažu, pa `/bot` stranica i ovo polje moraju govoriti isto.

### Tekst za polje Description, doslovno

> TidywrightBot fetches a single page on request, when a person asks for an SEO audit of
> that page through Tidywright. It is not a discovery crawler: there is no scheduled
> crawl and no queue of sites to visit. One audit fetches the page itself, robots.txt,
> sitemap.xml and at most two resources named in the page, for a hard maximum of 20
> requests to one site at no more than one request per second per host.
>
> It honours robots.txt, including a rule that names TidywrightBot specifically, which we
> obey without exception. It honours Crawl-delay up to 10 seconds and caches robots.txt
> for at most 24 hours.
>
> Page content is used to produce a technical SEO report for the owner of that site. It is
> not stored for model training, resold or republished.
>
> We publish our identity, our egress addresses and our policy at
> https://tidywright.com/bot, and we sign every request with Web Bot Auth (RFC 9421,
> Ed25519). We do not forge TLS or HTTP/2 fingerprints, do not use stealth automation
> patches, do not solve CAPTCHAs, do not use residential or rotating proxies, and do not
> change identity after being blocked.

### Šta očekivati poslije slanja

Cloudflare je 2026. automatizovao prvi prolaz: provjerava duplikate, koliko je User-Agent
specifičan, i da li metoda verifikacije stvarno radi. Zbog toga korak 5 postoji. Nema SLA
ni objavljenog roka; iskustva operatera govore o nekoliko sedmica do nekoliko mjeseci. Po
odobrenju se pojavimo u BotBase i u Cloudflare Radar direktoriju, što je usput i
marketinški korisno.

---

## Korak 7: Bing, u istom potezu

Bing nema obrazac, nego mehaniku: objavljena lista adresa plus reverse DNS koji se
forward-potvrđuje. To je već urađeno u koracima 1 i 2, pa nema dodatnog posla osim da se
zna da radi. Bing je sekundaran po volumenu ali napaja ChatGPT search i Copilot, pa raste.

Provjera je ista ona `dig` komanda iz koraka 2.

---

## Korak 8: Akamai, promjena u odnosu na istraživanje

**Ovo je ispravka.** `docs/36-fetch-reliability.md` je 14.09. pisao da Akamai ima program
ali okrenut enterprise partnerima i da ga treba preskočiti. Provjereno danas: Akamai je u
međuvremenu otvorio **Bot or AI agent registration**, javnu prijavu za **Akamai Bot
Directory**, i stoji na istoj mehanici kao Cloudflare: RFC 9421 HTTP Message Signatures i
JWKS direktorij na well-known putanji.

Za nas to znači da **ista infrastruktura pokriva i Akamai**, bez ijednog dodatnog reda
koda. Prijava je na `https://www.akamai.com/lp/bot-agent-registration`.

Šta traže, po onome što je javno: identitet agenta, User-Agent string i javni ključ.
Ostala polja (kategorija, opsezi adresa, kontakt, rok razmatranja) nisu objavljena, pa
popuni istim vrijednostima iz koraka 6 i javi mi ako obrazac traži nešto čega tamo nema.

Akamai je 0,7 posto tržišta reverse proxyja i rijedak na malim sajtovima, pa ovo nije
hitno kao Cloudflare. Ali pošto je trošak nula, radi se u istom danu.

---

## Korak 9: DataDome, i zašto tu nema šta da se radi

Traženo je i provjereno: **DataDome nema javni program prijave za operatere botova.**
Allowlisting kod njih radi **vlasnik svakog zaštićenog sajta**, u svom DataDome panelu, za
imenovanog bota. Ne postoji centralna lista u koju se mi možemo upisati.

Praktična posljedica za nas je jednostavna i već je u planu: kad DataDome blokira audit,
to je `failed:blocked`, ide u nalaz, i jedini put naprijed je verifikacija vlasništva pa
automatski generisano uputstvo vlasniku da nas propusti kroz svoj panel
(`docs/17-backend-spec.md`, kaskada dohvata, i `docs/36-fetch-reliability.md` 5.7).

Isto važi za HUMAN i Impervu. Zbirno su ispod 1 posto tržišta i rijetki na malim
poslovnim sajtovima, pa je cijena prihvatanja niska.

Mala ilustracija koliko je problem stvaran: DataDomeova vlastita stranica o propuštanju
dobrih botova vraća **HTTP 403** našem alatu dok sam pisao ovaj dokument.

---

## Šta ostaje da uradim ja

1. U B2, `safeFetch` počinje slati potpis na svakom zahtjevu (`apps/web/lib/bot-auth.ts`
   se seli u `packages/crawler`), sa `Signature-Agent` zaglavljem i `@authority` u
   pokrivenim komponentama.
2. Politika prema `robots.txt` u tri režima, koja je već opisana u
   `docs/17-backend-spec.md`.
3. U B2, vezati izlaz radnika na `188.245.170.86` i **zatvoriti IPv6 izlaz**. Danas bi
   radnik izašao sa IPv6 adrese koju nismo prijavili, što ruši cijelu poentu prijave.
   Zapisano i u `docs/39-server-setup.md` kao poznata rupa.

## Checklist

Urađeno:

- [x] Hetzner projekat, dvije Primary IP sa zaštitom od brisanja, server, ufw
- [x] A zapisi `@`, `www`, `web`, `crawler`, svi sivi oblak
- [x] Reverse DNS, `dig` prolazi u oba smjera za obje adrese
- [x] `pnpm bot:keys`, privatni ključ u `.env.local` na serveru kao `TW_BOT_SIGNING_KEY`
- [x] Caddy, systemd, `tw-deploy`, `TW_MARKETING_LIVE` nije postavljen
- [x] Tri `curl` provjere iz koraka 5 prolaze
- [x] Obje adrese upisane u `bot-identity.ts`, žive na `/bot` i u `/bot/ips.json`

Ostaje:

- [ ] **`bot@tidywright.com` i `abuse@tidywright.com` primaju poštu.** Cloudflare Email
      Routing, preusmjerenje na lični mail. **Prije prijave**, jer ih obrazac i stranica
      navode kao kontakt
- [ ] Cloudflare Bot Submission Form poslan, kategorija SEO, metoda Request Signature,
      **obje adrese**
- [ ] Akamai Bot Directory prijava poslana
- [ ] Datum prijave zapisan u `STATUS.md`, da se zna od kad se čeka

---

## Izvori

- [Cloudflare: Verified bots](https://developers.cloudflare.com/bots/concepts/bot/verified-bots/)
- [Cloudflare: Verified bots policy](https://developers.cloudflare.com/bots/concepts/bot/verified-bots/policy/)
- [Cloudflare: Web Bot Auth](https://developers.cloudflare.com/bots/reference/bot-verification/web-bot-auth/)
- [Cloudflare blog: Message Signatures are now part of our Verified Bots Program](https://blog.cloudflare.com/verified-bots-with-cryptography/)
- [Cloudflare blog: The age of agents, cryptographically recognizing agent traffic](https://blog.cloudflare.com/signed-agents/)
- [PPC Land: Cloudflare bot submissions grow 7 times since 2023 as review turns automatic](https://ppc.land/cloudflare-bot-submissions-grow-7-times-since-2023-as-review-turns-automatic/)
- [Akamai: Bot or AI agent registration](https://www.akamai.com/lp/bot-agent-registration)
- [Akamai: Redefine Trust with Web Bot Authentication](https://www.akamai.com/blog/security/redefine-trust-web-bot-authentication)
- [DataDome: How to allow good bots through bot protection](https://datadome.co/bot-management-protection/allow-good-bots-through-protection/)
- [RFC 9421: HTTP Message Signatures](https://www.rfc-editor.org/rfc/rfc9421.html)
- [RFC 7638: JSON Web Key Thumbprint](https://www.rfc-editor.org/rfc/rfc7638.html)
