# Verifikacija bota: šta je urađeno i šta ti ostaje

Datum: 15.09.2026.
Status: čeka Mumetove naloge, sve ostalo je gotovo

Ovo je najduži štap u rasporedu. Odobrenje traje kvartal, a rok je prvi audit uživo,
dakle prije B2. Zato ide ispred F2, ne paralelno s njim.

Brojke koje opravdavaju sav ovaj trud su u `docs/36-fetch-reliability.md`: neverifikovan
bot dobije HTTP 200 u **33,3 posto** slučajeva, verifikovan u **73,0 posto**, a Cloudflare
stoji ispred četvrtine weba. Nijedno podešavanje HTTP klijenta ne proizvodi taj skok.

---

## Gdje smo

**Gotovo (u kodu, radi lokalno, provjereno curl-om):**

| Šta | Gdje |
|---|---|
| Identitet bota na jednom mjestu | `packages/shared/src/bot-identity.ts` |
| Javna stranica `/bot` | `apps/web/app/bot/page.tsx` |
| Lista izlaznih adresa `/bot/ips.json` | `apps/web/app/bot/ips.json/route.ts` |
| Potpisani direktorij ključeva | `apps/web/app/.well-known/http-message-signatures-directory/route.ts` |
| RFC 9421 potpisivanje i provjera | `apps/web/lib/bot-auth.ts`, 11 testova |
| Generator ključeva | `pnpm bot:keys` |
| Zaštita da tidywright.com ne pokaže ništa osim `/bot` prije F3 | `apps/web/proxy.ts` |

**Ostaje tebi, i ništa od toga ja ne mogu:** Hetzner nalog i kartica, DNS zapisi,
Cloudflare nalog, i pritisak na dugme u Vercelu. Koraci su niže, redom.

Procjena tvog vremena: **oko 45 minuta**, plus čekanje.

---

## Korak 1: server sa stalnom adresom

Cloudflare i Akamai gledaju adresu s koje dolazimo. Treba nam adresa koja je **naša,
ekskluzivna i nepromjenljiva**, jer je dodavanje adrese koja nije prijavljena pri
onboardingu razlog za izbacivanje iz programa.

**Ključna stvar koju treba uraditi kako treba iz prvog puta: adresa je imovina, ne
server.** U Hetzneru napravi **Primary IP** sa opcijom da preživi brisanje servera, pa je
zakači na server. Tada možeš mijenjati, gasiti i povećavati server koliko hoćeš, a
prijavljena adresa ostaje ista i prijava se ne radi ponovo.

1. Hetzner Cloud projekat `tidywright-prod`, lokacija **Nürnberg (nbg1)** ili
   **Falkenstein (fsn1)**. Ista lokacija za sve kasnije servere, jer je privatna mreža
   besplatna samo unutar lokacije (`docs/20-infrastructure.md`).
2. Napravi Primary IPv4, uključi **"Auto-delete: off"** (ili "Keep after server delete"),
   nazovi ga `tw-fetch-1`.
3. Napravi server i zakači taj Primary IP:
   - **CX33** (4 vCPU, 8 GB, 80 GB), 8,49 € mjesečno. To je tačno server iz stepenice A
     koji ti ionako treba za radnika u B2, pa nema druge selidbe.
   - Jeftinija međuvarijanta ako hoćeš odgoditi trošak: **CX22**, oko 3,79 €. Pošto je
     adresa odvojena, kasnija zamjena na CX33 ne dira prijavu. Ovo je jedina stvar koju
     smiješ mijenjati kasnije bez posljedica.
   - Slika: Ubuntu 24.04. SSH ključ dodaj pri kreiranju, root lozinku ne koristi.
4. Hetzner Cloud Firewall na tom serveru: ulaz samo 22 s tvoje adrese. Radniku ne trebaju
   ni 80 ni 443 na ulazu, samo odlazni promet (`docs/20-infrastructure.md`).

Zapiši adresu. Zovem je dalje `<IZLAZNA_IP>`.

---

## Korak 2: DNS i reverse DNS, oba smjera

Verifikacija u oba smjera (forward-confirmed reverse DNS) je ono što Google i Bing traže
od svojih crawlera i ono što Cloudflare prihvata kao jednu od tri metode. Bez oba smjera
ne vrijedi ništa.

1. U DNS-u za `tidywright.com` dodaj A zapis:

   ```
   fetch1.tidywright.com.   A   <IZLAZNA_IP>
   ```

2. U Hetzner Cloud konzoli, na tom Primary IP-u, postavi **reverse DNS**:

   ```
   <IZLAZNA_IP>   ->   fetch1.tidywright.com
   ```

3. Provjeri oba smjera, i ne nastavljaj dok oba ne prolaze:

   ```bash
   dig +short -x <IZLAZNA_IP>          # mora vratiti fetch1.tidywright.com.
   dig +short fetch1.tidywright.com    # mora vratiti <IZLAZNA_IP>
   ```

4. Javi mi adresu. Upisujem je u `BOT.egressIps` u
   `packages/shared/src/bot-identity.ts`, čime se pojavi i na `/bot` i u
   `/bot/ips.json`. **To mora biti u istom danu kad je prijavljuješ Cloudflareu**, jer
   neprijavljena adresa na listi i prijavljena adresa koje nema na listi su oba problem.

---

## Korak 3: ključevi

```bash
pnpm bot:keys
```

Ispisuje tri stvari i **ne upisuje nijedan fajl**, namjerno: privatni ključ koji se upiše
u fajl završi u backupu, na snimku ekrana ili u commitu.

- **Privatni ključ** ide u `TW_BOT_SIGNING_KEY`, u Vercel env (Production) i kasnije u env
  radnika. Nigdje drugo. Ista klasa tajne kao KEK iz `docs/22-security.md`.
- **Javni ključ** ne moraš nigdje kopirati. Direktorij ga izvodi iz privatnog u trenutku
  odgovora, pa se ta dva ne mogu raziću.
- **Key ID** (JWK thumbprint) zapiši. To je `keyid` u svakom potpisu i njime te programi
  prepoznaju.

Poslije ispisa očisti scrollback terminala.

---

## Korak 4: objavi `/bot` i direktorij

Prijava neće biti pogledana ako javna dokumentacija bota vraća 404.

**Preporuka: Vercel**, jer je već odlučen za fazu 1 (`decisions/0008`) i jer je ovo jedan
deploy umjesto postavljanja web servera.

1. Vercel projekat iz repozitorija, `main` grana, Production.
2. Env varijable: `TW_BOT_SIGNING_KEY` (iz koraka 3). **`TW_MARKETING_LIVE` ne postavljaj.**
3. Domena `tidywright.com` na taj projekat.

Dok `TW_MARKETING_LIVE` nije postavljen, `tidywright.com` servira **samo** `/bot`,
`/bot/ips.json` i direktorij ključeva. Sve ostalo vraća 404. To je namjerno: bot stranica
mora biti živa mjesecima prije F3, a nedovršena naslovna na firminoj domeni je gora od
nikakve. Kad F3 dođe, postavi `TW_MARKETING_LIVE=1` i sajt proradi cijeli.

**Alternativa ako ne želiš Vercel sada:** Caddy na istom Hetzner serveru koji servira te
tri putanje. Više posla i drugo mjesto za održavanje, ali radi.

---

## Korak 5: provjeri prije nego išta prijaviš

```bash
curl -si https://tidywright.com/.well-known/http-message-signatures-directory
```

Mora dati, sve četiri stvari:

- `HTTP/2 200`
- `content-type: application/http-message-signatures-directory+json`
- zaglavlje `signature-input` koje sadrži `tag="http-message-signatures-directory"`
- tijelo oblika `{"keys":[{"kty":"OKP","crv":"Ed25519","x":"...","kid":"..."}]}`

Pa još dvije:

```bash
curl -s https://tidywright.com/bot/ips.json     # mora sadržati <IZLAZNA_IP>
curl -sI https://tidywright.com/bot             # 200
```

Ako bilo šta od ovoga ne prolazi, prijava se odbija i čekaš ponovo od nule. Ovo je
najskuplji trenutak za nestrpljenje u cijelom dokumentu.

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
| IP ranges / ASN | `<IZLAZNA_IP>/32`. ASN ne navodi, jer je Hetznerov a ne naš |
| Contact email | `bot@tidywright.com` |
| Abuse contact | `abuse@tidywright.com` |
| Respects robots.txt | Da |
| Used for AI training | **Ne** |

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

## Šta ostaje da uradim ja, kad javiš adresu

1. `BOT.egressIps` dobija `<IZLAZNA_IP>`, jedan commit, pa se pojavi na `/bot` i u
   `/bot/ips.json`.
2. U B2, `safeFetch` počinje slati potpis na svakom zahtjevu (`apps/web/lib/bot-auth.ts`
   se seli u `packages/crawler`), sa `Signature-Agent` zaglavljem i `@authority` u
   pokrivenim komponentama.
3. Politika prema `robots.txt` u tri režima, koja je već opisana u
   `docs/17-backend-spec.md`.

## Checklist

- [ ] Hetzner projekat, Primary IP koji preživljava server, server, firewall
- [ ] A zapis `fetch1.tidywright.com`
- [ ] Reverse DNS, i `dig` prolazi u oba smjera
- [ ] `pnpm bot:keys`, privatni ključ u Vercel env kao `TW_BOT_SIGNING_KEY`
- [ ] Vercel projekat, domena `tidywright.com`, `TW_MARKETING_LIVE` nije postavljen
- [ ] Tri `curl` provjere iz koraka 5 prolaze
- [ ] Adresa javljena meni, upisana u `bot-identity.ts`, deployano
- [ ] Cloudflare Bot Submission Form poslan, kategorija SEO, metoda Request Signature
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
