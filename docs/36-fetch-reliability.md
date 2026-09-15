# 36. Pouzdanost dohvata: zašto audit pada i kako da pada rjeđe

Status: istraživački dokument
Datum: 14. septembar 2026.
Kontekst: Tidywright worker dohvata proizvoljan javni URL, parsira HTML, izvodi 176 provjera i renderuje izvještaj. Trenutno postoje dva stanja kvara: `failed:fetch` i `failed:blocked`.

---

## Kratak odgovor

Najveći pojedinačni uzrok neuspjeha nije mrežni kvar nego namjerno odbijanje: prema Cloudflare Radar podacima za 28 dana do 19. jula 2026. samo 45,9% zahtjeva crawlera dobije HTTP 200, a 20,6% dobije 403, pri čemu neverifikovani ne-AI botovi prolaze u samo 33,3% slučajeva dok verifikovani AI botovi prolaze u 73,0%. Pošto Cloudflare stoji ispred 25,7% svih sajtova na svijetu i drži 85% tržišta reverse proxyja, naša stopa uspjeha je praktično funkcija toga kako nas Cloudflare klasifikuje, a ne toga koliko je naš HTTP klijent dobar. Od 15. septembra 2026. Cloudflare po defaultu blokira kategorije Training i Agent na novim domenama i postojećim free zonama, dok kategorije SEO, Monitoring i Ads Verification ostaju dozvoljene, što znači da je najvažnija tehnička odluka koju ćemo donijeti u kojoj kategoriji se deklarišemo. Realan plan nije da se skrivamo nego da se predstavimo pošteno, prijavimo se u Cloudflare Verified Bots sa Web Bot Auth potpisom po RFC 9421, poštujemo robots.txt za treća lica, i izgradimo kaskadu dohvata koja nakon običnog GET-a probava headless render pa onda izvore koji uopšte ne traže naš HTML (PSI, CrUX, Wayback, DNS, TLS, zaglavlja). Procjena je da danas oko 12 do 20 odsto proizvoljnih malih poslovnih sajtova neće dati upotrebljiv HTML iz prvog pokušaja, a da se to uz punu kaskadu i verifikovani status može spustiti na 4 do 7 odsto, uz to da dio slučajeva ostaje trajno nerješiv i mora se pretvoriti u koristan djelimičan izvještaj umjesto u poruku o grešci.

---

## 1. Zašto je trenutna taksonomija prekruta

`failed:fetch` i `failed:blocked` su dvije kante u koje stane dvadesetak bitno različitih situacija. Problem je praktičan, ne estetski: od klase kvara zavisi da li ponavljamo, koliko čekamo, da li prelazimo na headless, koji fallback koristimo i koju rečenicu pokazujemo posjetiocu.

Predložena taksonomija (svaki status nosi `retryable`, `escalate_to`, `user_message_key`):

| Status | Značenje | Primjer |
|---|---|---|
| `failed:dns` | Ime se ne razrješava | NXDOMAIN, SERVFAIL, nema A ni AAAA |
| `failed:connect` | TCP se ne uspostavlja | connection refused, reset, filtriran port |
| `failed:tls` | TCP radi, TLS ne | istekao cert, hostname mismatch, protokol mismatch |
| `failed:timeout` | Server prihvata ali ne odgovara | TTFB preko budžeta, viseći socket |
| `failed:http_client` | 4xx koji nije bot odbrana | 404 na homepage, 410, 451 |
| `failed:http_server` | 5xx uključujući Cloudflare 52x | 500, 502, 503, 521, 522 |
| `failed:ratelimit` | 429 ili 503 sa Retry-After | rate limit origina ili WAF-a |
| `failed:challenge` | Interaktivna prepreka | `cf-mitigated: challenge`, Turnstile, reCAPTCHA |
| `failed:blocked` | Trvdi blok bez prepreke | 403 sa WAF potpisom, Cloudflare 1020, geo blok |
| `failed:robots` | Sami smo odustali po pravilu | Disallow za našeg agenta |
| `failed:content` | Dohvatili smo nešto neupotrebljivo | prazan SPA shell, PDF, ne-HTML |
| `partial:*` | Uspjeli smo djelimično | HTML nedostupan, ali DNS/TLS/CrUX jesu |

Ključno: `failed:challenge` i `failed:blocked` nisu isto. Prvi se često rješava headless renderom, drugi skoro nikad.

---

## 2. Koliko je problem velik, sa brojevima

**Ko stoji ispred sajtova** (W3Techs, 14.09.2026.):

| Servis | Udio svih sajtova | Udio tržišta reverse proxyja |
|---|---|---|
| Bez reverse proxyja | 69,8% | |
| Cloudflare | 25,7% | 85,0% |
| Amazon CloudFront | 1,7% | 5,5% |
| Fastly | 0,9% | 3,0% |
| DDoS-Guard | 0,7% | 2,4% |
| Akamai | 0,7% | 2,2% |
| Sucuri | 0,2% | 0,8% |
| Imperva | 0,1% | 0,3% |

Praktična posljedica: jedan dobavljač određuje sudbinu četvrtine svih naših audita. Sve ostalo je zbirno manje od 5%.

**Kako prolaze automatski klijenti** (Cloudflare Radar, 28 dana do 19.07.2026., analiza SEOmator):

| Tip klijenta | Udio 200 | Udio 403 |
|---|---|---|
| Verifikovani AI botovi | 73,0% | 13,5% |
| Botovi mješovite namjene | 73,4% | 5,2% |
| Ljudski saobraćaj | 54,5% | 12,9% |
| Neverifikovani ne-AI botovi | 33,3% | 29,2% |

Zbirno preko svih klijenata: 200 = 45,9%, 4xx = 35,7% (403 = 20,6%, 404 = 7,8%), 3xx = 14,3%, 429 = 6,3%, 5xx = 2,2%.

Ovo je najvažniji broj u cijelom dokumentu. Razlika između neverifikovanog i verifikovanog bota je 33% naspram 73% uspješnih dohvata. Nijedna tehnička optimizacija HTTP klijenta ne može proizvesti taj skok. Verifikacija može.

**Šta se mijenja 15. septembra 2026.** Cloudflare mijenja podrazumijevanu politiku. Kategorije `Training` i `Agent` se blokiraju po defaultu na novim domenama, novim sajtovima postojećih kupaca i postojećim free zonama. Kategorija `Search` ostaje dozvoljena. Kategorije `SEO`, `Ads Verification` i `Monitoring & Operations` nisu obuhvaćene defaultnim blokom. Crawleri mješovite namjene nasljeđuju tretman svoje najrestriktivnije funkcije.

Za Tidywright to znači jednu stvar, doslovno sutra: ako se ikad deklarišemo kao `Agent`, blokiraće nas po defaultu na svakoj novoj free zoni. Moramo se deklarisati kao `SEO`, i naše ponašanje mora tome odgovarati.

**Šta hostuje te sajtove** (W3Techs, septembar 2026.):

| CMS | Udio svih sajtova |
|---|---|
| WordPress | 40,3% |
| Shopify | 5,4% |
| Wix | 4,2% |
| Squarespace | 2,4% |
| Joomla | 1,1% |
| Webflow | 0,8% |
| Drupal | 0,6% |
| Bez prepoznatog CMS-a | 31,5% |

---

## 3. Katalog uzroka

Legenda za kolonu učestalosti, izraženo kao gruba procjena udjela proizvoljnih malih poslovnih sajtova kod kojih se pojavi:

- **Vrlo često** = preko 5%
- **Često** = 1 do 5%
- **Povremeno** = 0,2 do 1%
- **Rijetko** = 0,02 do 0,2%
- **Vrlo rijetko** = ispod 0,02%

Kolona "Rješivo" znači: da li mi, kao mali SaaS koji igra pošteno, možemo taj slučaj pretvoriti u upotrebljiv izvještaj.

### 3.1 Mreža i DNS

| Uzrok | Kako se manifestuje | Koliko često | Mitigacija | Rješivo |
|---|---|---|---|---|
| NXDOMAIN | Razrješavanje vraća NXDOMAIN odmah | Vrlo često na korisnički unesenim URL-ovima (tipfeleri) | Normalizuj unos prije dohvata: skini razmake, dodaj shemu, probaj i apex i `www`, ponudi "jeste li mislili" preko Levenshtein poređenja sa popularnim TLD-ovima. Provjeri RDAP da razlikuješ neregistrovan domen od domena bez zone | Da |
| Domen registrovan ali bez A/AAAA zapisa | Razrješavanje uspije za NS, ali A upit vraća prazan NOERROR | Često | Probaj `www.` varijantu, pa CNAME lanac. Ako nema ničega, to je sam po sebi nalaz visokog prioriteta ("domen nije spojen na hosting") | Da, kao nalaz |
| Apex radi, `www` ne (ili obrnuto) | Jedna varijanta 200, druga NXDOMAIN ili timeout | Vrlo često | Uvijek probaj obje varijante paralelno, uzmi onu koja odgovori, zabilježi asimetriju kao SEO nalaz (nedostaje kanonizacija hostova) | Da |
| Samo AAAA zapis, nema A | Naš worker bez IPv6 izlaza ne može da se spoji | Rijetko, ali raste | Obezbijedi dual stack na workeru. Na AWS-u to znači dualstack subnet i egress-only IGW. Ako nije moguće, koristi DNS64/NAT64 rezolver | Da |
| Samo A zapis, ali provjere očekuju IPv6 | Nije kvar dohvata nego nalaz | Vrlo često | Prijavi kao nalaz, ne kao grešku | Da |
| DNS timeout ili SERVFAIL | Upit istekne, autoritativni serveri ne odgovaraju | Često | Koristi dva nezavisna rekurzivna rezolvera (npr. 1.1.1.1 i 8.8.8.8) plus lokalni keš, timeout 2s po pokušaju, 2 pokušaja. Pazi: po Google pravilima DNS kvar se tretira kao serverska greška za robots.txt | Djelimično |
| Pogrešno konfigurisan DNSSEC | SERVFAIL samo na validirajućim rezolverima | Rijetko | Ponovi upit sa CD (checking disabled) bitom. Ako tada uspije, to je nalaz: sajt je nevidljiv za sve validirajuće rezolvere | Da, kao nalaz |
| Wildcard DNS koji hvata sve | Svaki poddomen vraća isti sadržaj, soft 404 svuda | Povremeno | Detektuj testom sa nasumičnim poddomenom. Ako `a8f3k2.primjer.ba` vraća isti sadržaj kao apex, označi wildcard | Da |
| Connection refused na 80 i 443 | TCP RST odmah | Često | Ne ponavljaj odmah. Probaj drugu IP adresu iz A seta, pa `www` varijantu, pa HTTP umjesto HTTPS | Djelimično |
| Connection reset usred odgovora | Socket pukne nakon dijela tijela | Povremeno | Tretiraj kao ponovljiv. Ako se ponovi tri puta na istom bajt offsetu, sumnjaj na DPI ili middlebox koji reaguje na naš User-Agent i probaj sa drugačijim (ali još uvijek poštenim) zaglavljem | Djelimično |
| Filtriran port, paketi nestaju | TCP SYN bez odgovora do timeouta | Povremeno | Kratak connect timeout (5s), pa pređi na fallback izvore | Ne, za HTML |
| Server prihvata konekciju i visi | TCP otvoren, nikad nema bajta odgovora | Povremeno | Poseban `headers_timeout` (10s) odvojen od ukupnog timeouta. Bez toga jedan sajt drži worker slot minutama | Ne, ali kontrolisano |
| Vrlo spor TTFB | Odgovor stigne za 15 do 60s | Često na jeftinom shared hostingu | Ukupni budžet 25s u sinhronoj putanji, pa premjesti u asinhroni red sa budžetom 60s i pošalji izvještaj mejlom | Da, asinhrono |
| MTU / PMTU black hole | Handshake prođe, veliki paketi nestaju | Vrlo rijetko | Smanji MSS na izlaznom interfejsu, ili se osloni na TCP MSS clamping | Djelimično |
| Anycast ruta koja nas vodi u blokirani PoP | Radi iz jedne regije, ne iz druge | Rijetko | Drži izlazne IP-ove u dvije regije (npr. EU i US) i probaj drugu prije nego što odustaneš | Djelimično |
| Domen istekao, parking stranica | 200 OK, ali sadržaj je oglas registrara | Često | Detektuj potpise parkiranja (poznati parking IP opsezi, `sedoparking`, `afternic`, `parkingcrew`), plus RDAP status `clientHold` ili `pendingDelete` | Da |

### 3.2 TLS

| Uzrok | Kako se manifestuje | Koliko često | Mitigacija | Rješivo |
|---|---|---|---|---|
| Istekao sertifikat | Greška validacije pri handshakeu | Često (procjena 1 do 3% u datom trenutku) | Dohvati sa isključenom validacijom SAMO za čitanje metapodataka certa, pa prijavi kao nalaz najvišeg prioriteta. Za sam HTML: dohvati preko HTTP ako je dostupan, inače djelimičan izvještaj. Nikad ne renderuj sadržaj sa nevalidnog TLS-a bez jasne oznake | Djelimično |
| Self signed sertifikat | `UNABLE_TO_VERIFY_LEAF_SIGNATURE` ili slično | Povremeno | Isto kao gore. Uz to je vrlo jak signal da je sajt u razvoju ili loše održavan | Djelimično |
| Hostname mismatch (SAN ne pokriva `www`) | `ERR_CERT_COMMON_NAME_INVALID` | Često | Vrlo čest obrazac: cert pokriva apex ali ne `www`. Probaj obje varijante, zabilježi koja pukne. Ovo je nalaz koji se lako popravi i odlična je prodajna tačka | Da |
| Nepotpun lanac (nedostaje intermediate) | Radi u Chromeu (AIA fetching), pada u Pythonu, Go-u, curl-u | Često. Otprilike trećina sajtova ima suboptimalnu TLS konfiguraciju | Uključi AIA chasing u klijentu ili koristi sistemski trust store sa dopunjenim intermediatima. Ovo je najpodmuklija klasa jer izgleda kao "radi u browseru, ne radi kod nas" | Da |
| Server podržava samo TLS 1.0/1.1 | Handshake pada na modernim klijentima | Rijetko i pada | Imaj "legacy" profil klijenta kao drugi pokušaj: `minVersion: TLSv1`, prošireni cipher set, `SECLEVEL=0` na OpenSSL-u. Nikad kao prvi pokušaj | Da |
| Neusklađeni cipher setovi | `no shared cipher` | Rijetko | Isto kao gore | Da |
| SNI se ne šalje ili se ignoriše | Vraća se cert pogrešnog hosta | Rijetko | Uvijek šalji SNI. Ako cert ne odgovara, probaj bez SNI kao dijagnostiku | Djelimično |
| HSTS sa preload, a mi probavamo HTTP | Naš HTTP pokušaj biva odbijen ili je besmislen | Vrlo često (HSTS je široko rasprostranjen) | Poštuj HSTS: drži preload listu lokalno i ne gubi round trip na HTTP. Ali zabilježi postojanje HSTS-a kao pozitivan nalaz | Da |
| Cloudflare 525 (SSL handshake failed origin) | 525 od edge-a | Povremeno | Nije naša greška i ne rješava se ponavljanjem. Prijavi kao nalaz o infrastrukturi | Ne, kao nalaz da |
| Cloudflare 526 (nevalidan cert origina) | 526 od edge-a | Povremeno | Isto | Ne, kao nalaz da |
| Klijentski sertifikat obavezan (mTLS) | Handshake traži klijentski cert | Vrlo rijetko | Odustani, klasifikuj kao `failed:blocked` sa objašnjenjem | Ne |
| Post-quantum key exchange nekompatibilnost | Handshake pada na starijim klijentskim stackovima | Vrlo rijetko, ali raste kako PQ prelazi 60% Cloudflare saobraćaja | Drži klijentski TLS stack aktuelnim. Ne isključuj hybrid key exchange | Da |

### 3.3 HTTP nivo

| Uzrok | Kako se manifestuje | Koliko često | Mitigacija | Rješivo |
|---|---|---|---|---|
| Lanac redirekcija duži od očekivanog | 3xx, 3xx, 3xx... | Vrlo često. 14,3% svih odgovora su 3xx | Prati do 10 skokova, snimi cijeli lanac kao nalaz (svaki suvišan skok je gubitak). Za robots.txt konkretno: RFC 9309 kaže da crawler SHOULD prati najmanje pet uzastopnih redirekcija, i MAY smatrati fajl nedostupnim preko toga. Google prati pet pa tretira kao 404 | Da |
| Petlja redirekcija | Isti URL se ponavlja u lancu | Često (najčešće `http -> https -> http`, ili `apex <-> www`) | Detektuj ponavljanje normalizovanog URL-a u setu. Prekini i prijavi kao kritičan nalaz. Ovo je klasičan simptom pogrešno postavljenog Cloudflare Flexible SSL moda | Da, kao nalaz |
| Redirekcija na drugi host | `primjer.ba -> primjer.com` | Vrlo često | Prati, ali jasno prijavi korisniku da je audit rađen na krajnjem URL-u. Provjeri da li je krajnji host u istoj registrabilnoj domeni (eTLD+1) prije nego što nastaviš dublje | Da |
| Redirekcija na potpuno nevezan domen | Landing page agregatora, parkiranje, hijacked domen | Povremeno | Zaustavi se, pitaj korisnika da potvrdi. Ne troši 176 provjera na tuđi sajt | Da |
| Meta refresh ili JS redirekcija umjesto 3xx | HTML 200 sa `<meta http-equiv="refresh">` ili `location.href` | Često | Parsiraj meta refresh u plain fetch sloju. JS redirekcije hvataj tek u headless sloju | Da |
| 401 Unauthorized | WWW-Authenticate zaglavlje | Povremeno (staging sajtovi, .htpasswd) | Ne ponavljaj. Ponudi tok verifikacije vlasništva ili polje za basic auth kredencijale koje čuvamo samo za trajanje posla | Djelimično |
| 403 Forbidden bez WAF potpisa | Čist 403, kratko tijelo | Vrlo često. 20,6% svih odgovora crawlerima | Razlikuj od WAF 403 po zaglavljima (`cf-ray`, `cf-mitigated`, `server`, `x-datadome`, `set-cookie` sa `_abck` ili `incap_ses`). Za origin 403: probaj `www` varijantu, probaj `/index.html`, probaj sa `Accept-Language` | Djelimično |
| 404 na samoj početnoj stranici | 404 na `/` | Povremeno | Probaj `www` varijantu, pa `/index.php`, pa sitemap.xml za bilo koji URL sajta i auditiraj njega uz jasnu oznaku | Djelimično |
| 405 Method Not Allowed na HEAD | HEAD pada, GET radi | Često | Nikad ne oslanjaj logiku na HEAD. Koristi GET sa `Range: bytes=0-0` ako ti treba jeftina provjera, pa i to samo kao optimizaciju | Da |
| 406 Not Acceptable | Server odbija naš Accept | Rijetko | Šalji realističan `Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8` | Da |
| 410 Gone | Trajno uklonjeno | Rijetko | Ne ponavljaj | Ne |
| 429 Too Many Requests | 429, često sa `Retry-After` | Vrlo često. 6,3% svih odgovora | Poštuj `Retry-After` doslovno. Ako je vrijednost ispod 120s, čekaj u asinhronom redu. Preko toga, zakaži za kasnije i pošalji mejlom. Drži per-host token bucket od najviše 1 zahtjeva u sekundi i per-ASN ograničenje | Da, asinhrono |
| 451 Unavailable For Legal Reasons | 451 | Vrlo rijetko | Ne ponavljaj, objasni korisniku | Ne |
| 500, 502, 503, 504 | Standardne serverske greške | Često. 5xx je 2,2% ukupno, 503 sam 1,3% | Ponavljaj sa eksponencijalnim backoffom i punim jitterom. 503 sa `Retry-After` poštuj. Tri pokušaja sinhrono, pa asinhrono | Da |
| Cloudflare 520 (nepoznata greška origina) | 520 od edge-a | Povremeno | Origin je vratio nešto što Cloudflare ne razumije (prazan odgovor, prevelika zaglavlja, resetovana konekcija). Ponavljanje ponekad pomogne. Prijavi kao nalaz o stabilnosti | Djelimično |
| Cloudflare 521 (origin down) | 521 | Povremeno | Origin odbija konekcije od Cloudflare edge-a. Ponavljanje rijetko pomaže | Ne |
| Cloudflare 522 (connection timed out) | 522 | Povremeno | Origin ne završava TCP handshake. Ponavljaj sa dužim razmacima | Djelimično |
| Cloudflare 523 (origin unreachable) | 523 | Rijetko | DNS origina pogrešan ili ruta ne postoji | Ne |
| Cloudflare 524 (timeout occurred) | 524 nakon 100s | Povremeno | Origin prihvata ali ne završava u roku. Ponavljanje u drugo doba dana ponekad uspije. Jak nalaz o performansama | Djelimično |
| Cloudflare 530 | 530, uz prateći 1xxx kod | Rijetko | Zavisi od 1xxx koda u tijelu, parsiraj ga | Djelimično |
| Cloudflare 1020 (Access denied) | Stranica sa "Error 1020" i Ray ID | Često | Vlasnik sajta ima WAF pravilo koje nas blokira. Ponavljanje ne pomaže nikad. Jedini put naprijed: verifikacija vlasništva pa uputstvo vlasniku da nas propusti | Ne bez vlasnika |
| Soft 404 | 200 OK sa sadržajem "stranica nije pronađena" | Često | Uporedi odgovor za `/` sa odgovorom za nasumičan nepostojeći put. Ako su slični po dužini i strukturi (npr. Jaccard sličnost tokena preko 0,9), označi soft 404 | Da |
| Geo blokiranje na nivou države | 403 ili 451 samo iz nekih regija | Često na sajtovima iz SAD-a koji blokiraju EU, i obrnuto | Drži izlazne IP-ove u najmanje dvije regije (EU i SAD) i probaj drugu. Ovo je legitimno, ne zaobilazi zaštitu nego bira tačku posmatranja | Djelimično |
| GDPR geo-zid | EU posjetioci dobiju stranicu "nije dostupno u vašoj regiji" | Povremeno | Isto kao gore, plus detekcija potpisa takvih stranica | Djelimično |
| Blokiranje po reputaciji IP-a | 403 svima iz našeg ASN-a | Vrlo često ako smo na AWS, Hetzner, DigitalOcean, OVH | Ovo je najveći sistemski problem. Vidi sekciju 5.1. Hetzner i OVH imaju posebno lošu reputaciju. AWS i GCP su bolji ali i dalje "datacenter" | Djelimično |
| Blokiranje cijelog cloud ASN-a | Isto kao gore, na nivou ASN-a u WAF pravilu | Često | Isto | Djelimično |
| HTTP/2 ili HTTP/3 pregovaranje pada | ALPN pregovori ne uspiju ili se stream resetuje | Rijetko | Imaj fallback na HTTP/1.1. Neki stariji middleboxovi lome h2 | Da |
| Prevelika zaglavlja odgovora | Klijent puca na limitu | Vrlo rijetko | Podigni limit na 64 KB | Da |
| Chunked encoding koji se ne zatvara | Odgovor nikad ne završi | Rijetko | Ukupni timeout tijela odvojen od timeouta zaglavlja | Da |
| Brotli ili Zstd koji klijent ne podržava | Nečitljivo tijelo | Rijetko | Oglasi samo ono što stvarno umiješ dekodirati u `Accept-Encoding` | Da |

### 3.4 Bot odbrane

| Uzrok | Kako se manifestuje | Koliko često | Mitigacija | Rješivo |
|---|---|---|---|---|
| Cloudflare Bot Fight Mode | Interstitial sa CPU-intenzivnim izazovom, tijelo `text/html`, `cf-mitigated: challenge` | Vrlo često na free planovima | Ovo je najgori pojedinačni slučaj za nas. Cloudflare dokumentacija eksplicitno kaže da BFM ne može biti prilagođen ni isključen WAF custom pravilima i da ne pravi izuzetke po kategorijama na način na koji to radi Super Bot Fight Mode. Headless render sa pravim Chrome binarom ponekad prođe izazov. Verifikovani status pomaže, ali ne garantuje | Djelimično |
| Cloudflare Managed Challenge | Isto, blaži, često se rješava sam u pravom browseru | Vrlo često | Headless render sa pravim Chromeom prolazi u većini slučajeva. Čuvaj `cf_clearance` kolačić po hostu dok traje | Djelimično |
| Cloudflare JS Challenge | Stranica sa JS koji mora da se izvrši | Često | Headless render | Uglavnom da |
| Cloudflare Interactive Challenge / Turnstile | Traži ljudsku interakciju | Povremeno | Ne rješavamo. Nikad ne koristimo CAPTCHA farme. Prelazimo na `failed:challenge` i fallback izvore | Ne |
| Cloudflare Under Attack Mode | Svi posjetioci, uključujući verifikovane botove, dobiju interstitial od nekoliko sekundi | Povremeno, u epizodama | Privremeno stanje. Zakaži ponovni pokušaj za 6 do 24 sata. Ovo je najbolji argument za asinhroni red | Da, sa odgodom |
| Akamai Bot Manager | `_abck` i `bm_sz` kolačići, 403 ili prazna stranica, ponekad `reese84` | Rijetko na malim sajtovima (Akamai je 0,7% tržišta) | Praktično nerješivo bez sofisticiranog spoofinga. Ne idemo tamo | Ne |
| DataDome | `datadome` kolačić, 403 sa JSON tijelom ili interstitial | Rijetko na malim sajtovima | Isto | Ne |
| HUMAN (bivši PerimeterX) | `_px`, `_pxvid` kolačići, "Please verify you are a human" | Rijetko | Isto | Ne |
| Imperva / Incapsula | `incap_ses_*`, `visid_incap_*`, "Request unsuccessful" | Rijetko | Isto | Ne |
| AWS WAF Bot Control | 403 sa `x-amzn-waf-action`, ili challenge/CAPTCHA akcija | Povremeno | Poštena identifikacija i nizak rate pomažu jer AWS Bot Control ima kategoriju za verifikovane kategorije botova | Djelimično |
| reCAPTCHA zid pred cijelim sajtom | Google reCAPTCHA iframe umjesto sadržaja | Rijetko | Ne rješavamo | Ne |
| Blokiranje po User-Agent stringu | 403 samo za određene UA obrasce | Vrlo često | Ovo je i rizik i prilika. Naš UA mora biti jasan i nepromjenljiv da bismo se mogli verifikovati i allowlistovati. Ako nas neko blokira po imenu, to je njihov izbor i mi ga poštujemo | Djelimično |
| Blokiranje praznog ili generičkog UA | 403 za `python-requests/2.x`, `curl/8.x`, `Go-http-client` | Vrlo često | Nikad ne šalji default UA biblioteke. Šalji naš imenovani UA sa URL-om politike | Da |
| TLS otisak (JA3 / JA4) | 403 bez ikakvog objašnjenja, čak i sa savršenim zaglavljima | Vrlo često na Cloudflare i sličnim sistemima | JA3 uzima pet polja iz TLS Client Hello i heširanje MD5. JA4 sortira ekstenzije po heksadecimalnoj vrijednosti prije heširanja (otporno na Chrome randomizaciju), koristi SHA-256, uključuje ALPN i podržava QUIC. Python `requests`, `httpx`, `aiohttp`, Go `net/http` i Node imaju otiske koje anti-bot sistemi prepoznaju odmah. Naše rješenje: koristi pravi Chrome (headless) čiji je otisak autentičan, umjesto da falsifikujemo otisak HTTP klijenta. Vidi 5.6 za etičku granicu | Djelimično |
| HTTP/2 otisak | Isto, blok bez objašnjenja | Često | Redoslijed SETTINGS okvira, vrijednosti prozora, redoslijed pseudo-zaglavlja i prioriteti streamova formiraju potpis. Pravi Chrome ima pravi potpis. Isto rješenje kao gore | Djelimično |
| Otisak po redoslijedu zaglavlja | Isto | Često | Pravi browser šalje zaglavlja u stabilnom redoslijedu koji se razlikuje od HTTP biblioteka. Pravi Chrome ga daje besplatno | Djelimično |
| Nedostatak `Sec-Fetch-*` i `sec-ch-ua` zaglavlja | Blok ili challenge | Često | Ako radiš plain fetch, pošalji konzistentan set klijentskih hintova koji odgovara UA koji si deklarisao. Nemoj tvrditi da si Chrome ako nisi | Djelimično |
| Nedostatak `Referer` ili `Accept-Language` | Blaži signal, doprinosi bot skoru | Često | Šalji razuman `Accept-Language` | Da |
| Honeypot linkovi | Sajt nas označi nakon što posjetimo skriveni link | Povremeno | Poštuj `rel="nofollow"`, `display:none`, `visibility:hidden` i `Disallow` rute. Naš audit ionako ne treba dubok crawl | Da |
| Rate limit po ponašanju | Prvih par zahtjeva prođe, onda 429 ili 403 | Često | Maksimalno 1 zahtjev u sekundi po hostu, serijski a ne paralelno, sa razmakom. Audit jednog sajta ne treba hiljadu zahtjeva | Da |
| Cloudflare AI Labyrinth / tarpit | 200 OK sa beskonačno generisanim besmislenim sadržajem | Rijetko, ali raste | Ograniči veličinu odgovora na 10 MB i vrijeme na 30s. Detektuj sumnjivo visok odnos linkova prema tekstu i nisku semantičku koherentnost | Djelimično |

### 3.5 robots.txt i politika

| Uzrok | Kako se manifestuje | Koliko često | Mitigacija | Rješivo |
|---|---|---|---|---|
| `Disallow: /` za `*` | robots.txt zabranjuje sve | Često (staging, novi sajtovi, greške) | Za audit koji je pokrenuo vlasnik nakon verifikacije: nastavljamo, jer nismo crawler nego agent koji radi po nalogu vlasnika. Za audit koji je pokrenulo treće lice: ne dohvatamo stranice, ali izvještavamo o samom robots.txt-u kao o nalazu prvog reda (sajt je nevidljiv pretraživačima). Vidi 5.2 | Da, kroz politiku |
| `Disallow` za naš specifičan UA | Samo nas blokiraju | Rijetko | Poštujemo bez izuzetka, uvijek, čak i za vlasnika. Ovo je eksplicitna poruka baš nama | Ne, namjerno |
| robots.txt vraća 5xx | Ne možemo ga pročitati | Povremeno | RFC 9309, sekcija 2.3.1.4: "If the robots.txt file is unreachable due to server or network errors, this means the robots.txt file is undefined and the crawler MUST assume complete disallow." Google je blaži: prvih 12 sati staje sa crawlanjem, narednih 30 dana koristi posljednju dobru verziju, poslije 30 dana ako je sajt inače dostupan ponaša se kao da robots.txt ne postoji. Naša politika: za treća lica poštuj RFC (potpuna zabrana), za verifikovanog vlasnika nastavi uz jasnu oznaku u izvještaju | Da, kroz politiku |
| robots.txt vraća 4xx | Fajl ne postoji | Vrlo često | RFC 9309, sekcija 2.3.1.3: "the crawler MAY access any resources on the server." Google isto, osim za 429. Nastavljamo | Da |
| robots.txt vraća 429 | Rate limit i na robots.txt | Rijetko | Google ovo NE tretira kao 4xx nego kao razlog da stane. Tretiraj kao 5xx | Da |
| robots.txt je HTML stranica (soft 404) | 200 OK, ali sadržaj je `<!DOCTYPE html>` | Često | Provjeri `content-type` i prva dva bajta. Ako počinje sa `<`, tretiraj kao da ne postoji | Da |
| robots.txt veći od 500 KiB | Ogroman fajl | Vrlo rijetko | RFC 9309, sekcija 2.5: limit parsiranja MUST biti najmanje 500 KiB. Google ignoriše sve preko toga | Da |
| `Crawl-delay` direktiva | Nije dio RFC 9309, ali Bing i drugi je poštuju | Često | Poštuj je ako postoji, do razumnog maksimuma (npr. 10s). Cloudflare Verified Bots politika navodi nepoštovanje crawl-delay direktive kao razlog za izbacivanje iz programa | Da |
| `X-Robots-Tag: noindex` | Zaglavlje odgovora | Često | Ne sprečava nas u dohvatu. To je direktiva za indeksiranje, ne za crawlanje. Ali je vrlo važan nalaz: sajt je namjerno ili nenamjerno isključen iz pretrage | Da, kao nalaz |
| `<meta name="robots" content="noindex">` | U HTML-u | Često | Isto | Da, kao nalaz |
| `Content-Signal` direktive u robots.txt | Cloudflare Content Signals Policy, npr. `Content-Signal: ai-train=no` | Raste od 2025. | Deklarišemo se kao SEO alat, ne kao training crawler. Naše ponašanje je u skladu: ne skladištimo sadržaj za treniranje. Moramo to i eksplicitno napisati na našoj stranici politike | Da |
| Paywall | Prvi dio članka, pa zid | Rijetko na malim poslovnim sajtovima | Auditiraj šta je vidljivo, jasno označi | Djelimično |
| Login zid pred cijelim sajtom | Redirekcija na `/login` | Povremeno | Nema audita bez kredencijala. Ponudi tok verifikacije vlasništva | Djelimično |
| Age gate | Interstitial sa pitanjem o godinama | Rijetko | Headless render sa kolačićem koji postavlja sam gate ponekad prođe, ali to je granično. Bolje: prijavi kao nalaz da gate blokira i pretraživače | Djelimično |
| Cookie / consent interstitial koji ZAMJENJUJE stranicu | HTML sadrži samo consent widget, pravi sadržaj se učitava tek nakon pristanka | Često na evropskim sajtovima | Ovo je čest i podcijenjen slučaj. Headless render pa detekcija poznatih CMP potpisa (OneTrust, Cookiebot, Usercentrics, Quantcast, CookieYes, Complianz). Prijavi kao nalaz: ako CMP blokira renderovanje sadržaja, blokira ga i Googlebotu | Djelimično |
| Consent overlay koji samo prekriva sadržaj | HTML je pun, overlay je kozmetički | Vrlo često | Nije problem za nas jer parsiramo HTML, ne piksele. Bitno samo za screenshot | Da |

### 3.6 Oblik sadržaja

| Uzrok | Kako se manifestuje | Koliko često | Mitigacija | Rješivo |
|---|---|---|---|---|
| SPA sa praznim HTML-om | 200 OK, `<div id="root"></div>` i jedan script tag | Često. Naročito React, Vue i Angular bez SSR-a | Detektuj po odnosu teksta prema HTML-u (npr. manje od 500 karaktera vidljivog teksta uz preko 3 script taga) pa eskaliraj na headless render sa `waitUntil: networkidle` ili čekanjem na konkretan selektor. Ovo je najčešći razlog za skup sloj 2 | Da, skupo |
| Lijena hidracija | Osnovni HTML postoji, ali ključni sadržaj dolazi kasnije | Često | Headless sa `waitForLoadState('networkidle')` plus fiksni dodatni prozor od 1 do 2s | Da |
| Sadržaj iza klijentskog `fetch` poziva | Prazan container, podaci iz XHR-a | Često | Headless | Da |
| Beskonačno skrolovanje | Prva stranica ima dio sadržaja | Povremeno | Za SEO audit prva stranica je i dovoljna. Ne skroluj. Ali prijavi kao nalaz (paginacija bez linkova je problem za crawlanje) | Da |
| Frameset ili `<iframe>` kao cijeli sajt | HTML nema sadržaj, samo frame | Rijetko, ali postoji na starim sajtovima | Detektuj `<frameset>` i `<iframe>` koji zauzima cijeli viewport, pa auditiraj i unutrašnji dokument uz jasnu oznaku. Ovo je samo po sebi ozbiljan nalaz | Da |
| Odgovor nije HTML | `application/pdf`, `image/jpeg`, `application/json` | Povremeno | Provjeri `content-type` prije parsiranja. Za PDF: izvuci naslov i tekst i uradi podskup provjera. Za sliku: reci korisniku da je URL slika | Djelimično |
| Sajt je jedna velika slika | HTML ima `<img>` i ništa više | Povremeno kod starih ili "dizajnerskih" sajtova | Ovo je nalaz najvišeg prioriteta, ne greška. Prijavi 0 indeksabilnog teksta | Da, kao nalaz |
| Pogrešan charset | Ćirilica ili naša slova kao mojibake | Često na starim sajtovima | Redoslijed: `content-type` charset, pa BOM, pa `<meta charset>`, pa detekcija (chardet). Pogrešan charset je i sam nalaz | Da |
| Deklarisan UTF-8, sadržaj je Windows-1250 | Isto | Povremeno | Ako dekodiranje kao UTF-8 daje zamjenske karaktere iznad praga, probaj detekciju | Da |
| Ogromna stranica | 20 MB HTML-a | Rijetko | Tvrd limit od 10 MB na tijelo, sa jasnim nalazom "stranica je prevelika". Bez limita jedan sajt obori worker | Da |
| Neispravan HTML | Nezatvoreni tagovi, ugniježdeni `<html>` | Vrlo često | Koristi tolerantan parser (lxml u recovery modu, ili parse5 koji implementira HTML5 spec). Nikad ne koristi strogi XML parser | Da |
| Sadržaj u Shadow DOM-u | Nevidljiv običnom parseru | Povremeno kod web komponenti | Headless sa `page.content()` ne hvata shadow DOM. Treba eksplicitan obilazak preko `shadowRoot` | Djelimično |
| Cloaking, drugačiji sadržaj botovima | HTML koji dobijemo se razlikuje od onoga što vidi posjetilac | Povremeno | Ovo je za nas dvostruki problem. Ako sajt servira poseban HTML botovima, naš rezultat ne odražava stvarnost. Mitigacija: uradi dva dohvata, jedan sa našim imenovanim UA, jedan sa Chrome UA (uz jasnu oznaku da smo isti klijent), pa uporedi. Značajna razlika je sama po sebi ozbiljan nalaz jer je cloaking kršenje Google smjernica | Da, kao nalaz |
| Prerender servis za botove | Sajt koristi Prerender.io ili sličan servis | Povremeno | Dobićemo renderovan HTML, što je za nas dobro. Ali skor koji izračunamo neće odgovarati onome što vidi korisnik. Označi ako detektuješ `x-prerender` zaglavlja | Da |
| Odgovor zavisi od `Accept-Language` | Dobijemo pogrešnu jezičku verziju | Često na višejezičnim sajtovima | Šalji `Accept-Language` koji odgovara očekivanoj publici, i prijavi hreflang strukturu kao nalaz | Da |

---

## 4. Šta u tabelu nije stalo

### 4.1 Razlika između challenge-a i bloka je tehnički mjerljiva

Cloudflare dokumentuje da svaka challenge stranica, bez obzira na tip, nosi zaglavlje `cf-mitigated: challenge` i `content-type: text/html`. To je jedini pouzdan način da razlikujemo "moraš da dokažeš da si browser" od "ne želimo te". Prvi slučaj vodi u headless sloj, drugi u fallback izvore. Bez te distinkcije trošimo skupe headless sekunde na slučajeve koji nikad neće proći.

Slično važi i za druge sisteme, po kolačićima i zaglavljima: Akamai postavlja `_abck` i `bm_sz`, DataDome postavlja `datadome`, HUMAN postavlja `_px` i `_pxvid`, Imperva postavlja `incap_ses_*` i `visid_incap_*`, AWS WAF vraća `x-amzn-waf-action`. Preporuka: napravi tabelu potpisa i klasifikuj svaki neuspjeh prije nego što odlučiš šta dalje.

### 4.2 Datacenter IP je sistemski hendikep

Naš worker gotovo sigurno radi iz cloud ASN-a. Većina komercijalnih anti-bot sistema tretira ASN kao prvorazredni signal. To znači da čak i besprijekoran HTTP klijent sa savršenim zaglavljima počinje sa negativnim skorom. Hetzner i OVH imaju posebno lošu reputaciju jer su istorijski bili omiljeni kod zloupotreba. AWS, GCP i Azure su bolji, ali i dalje jasno označeni kao datacenter.

Ovo se ne rješava mijenjanjem provajdera. Rješava se time što prestanemo biti anoniman datacenter IP i postanemo poznat, verifikovan, imenovan servis sa objavljenom IP listom.

---

## 5. Mitigacije

### 5.1 Pošteno predstavljanje i verifikacija

**Šta znači predstaviti se pošteno**

Minimalni set:

```
User-Agent: Mozilla/5.0 (compatible; TidywrightBot/1.0; +https://tidywright.com/bot)
From: bot@tidywright.com
```

Na `https://tidywright.com/bot` mora stajati:

- šta bot radi i zašto
- da se pokreće isključivo na zahtjev korisnika, jedan URL po zahtjevu
- da ne radi dubok crawl (navedi maksimalan broj zahtjeva po sajtu i rate)
- da ne čuva sadržaj za treniranje modela
- kako da vlasnik sajta zabrani pristup (robots.txt sekcija za `TidywrightBot`)
- kako da vlasnik sajta zatraži dozvolu ili prijavi zloupotrebu
- objavljena i stabilna lista izlaznih IP adresa ili opsega, na stalnom URL-u u JSON formatu
- reverse DNS za svaku izlaznu IP koji se razrješava na `*.tidywright.com` i forward-confirms nazad

Reverse DNS potvrda u oba smjera je ono što Google i Bing traže od onih koji žele da verifikuju njihove crawlere, i to je ista mehanika koju Cloudflare prihvata.

**Cloudflare Verified Bots: da li je realno**

Da, i to je vjerovatno najvažnija investicija iz cijelog dokumenta.

Zvanični uslovi po Cloudflare politici su dva:

1. Pošteno samopredstavljanje, kroz jedan od tri načina: kriptografski Web Bot Auth potpis, objavljena IP lista sa stabilnim User-Agentom, ili reverse DNS validacija.
2. Neabuzivno ponašanje: poštovanje robots.txt i crawl direktiva, razumna stopa zahtjeva, bez izbjegavanja izraženih preferencija sajta.

Kategorije koje program prepoznaje uključuju Search, Agent, Training, Transact, Data Collection, Security Testing, **SEO**, Ads Verification, Social/Link Preview, Feed Fetching i Monitoring & Operations. Mi se prijavljujemo kao **SEO**. To nije kozmetika. Od 15. septembra 2026. Cloudflare po defaultu blokira Training i Agent, a SEO ne.

Ono što dokumentacija eksplicitno ne navodi: minimalni volumen saobraćaja, obavezan broj korisnika, ni garantovan rok razmatranja. Prijava ide kroz Bot Submission Form u Cloudflare dashboardu, a po odobrenju bot se pojavljuje u BotBase i u Cloudflare Radar direktorijumu. Iskustva operatera govore o razmacima od nekoliko sedmica do nekoliko mjeseci, bez SLA. Planirajte to kao proces koji traje kvartal, ne sedmicu.

Razlozi za izbacivanje iz programa su takođe navedeni: korišćenje IP-ova koji nisu ekskluzivno namijenjeni servisu, nezakrpljene bezbjednosne ranjivosti, IP blokovi koji nisu prijavljeni pri onboardingu, neslaganje između deklarisane svrhe i stvarnog obrasca saobraćaja. Prva stavka je bitna: ne možemo dijeliti izlazne IP-ove sa ostatkom naše aplikacije. Treba nam poseban NAT gateway ili poseban Elastic IP set samo za fetch worker.

**Web Bot Auth: moderna i tehnički najčistija ruta**

Cloudflare podržava Web Bot Auth, koji stoji na RFC 9421 (HTTP Message Signatures) plus dva IETF drafta: `draft-meunier-http-message-signatures-directory-03` i `draft-meunier-web-bot-auth-architecture-02`.

Mehanika:

1. Generišemo Ed25519 par ključeva. Cloudflare podržava Ed25519.
2. Javni ključ konvertujemo u JWK i objavljujemo JWKS na `https://tidywright.com/.well-known/http-message-signatures-directory`. Sam odgovor tog direktorijuma mora biti potpisan, sa `tag` parametrom `http-message-signatures-directory`.
3. Svaki zahtjev nosi tri zaglavlja:
   - `Signature-Input` sa `created`, `expires`, `keyid` (JWK thumbprint) i `tag="web-bot-auth"`
   - `Signature` sa samim potpisom nad izabranim komponentama, gdje Cloudflare preporučuje da se uključi izvedena komponenta `@authority`
   - `Signature-Agent` koji pokazuje na naš direktorijum ključeva
4. Prijavljujemo se kroz Bot Submission Form i biramo "Request Signature" kao metod verifikacije.

Prednost nad IP listom: ne vezuje nas za fiksne IP adrese, pa možemo mijenjati hosting, dodavati regije i skalirati bez ponovne prijave. Dokumentacija ne navodi ograničenje na enterprise ugovore, što znači da je ruta otvorena i malom SaaS-u. Ovo je preporučeni put.

**Šta verifikacija zapravo donosi, a šta ne**

Donosi: isključenje iz podrazumijevanih bot konfiguracija na svim planovima, ulazak u BotBase, i prema Radar podacima skok sa oko 33% na oko 73% uspješnih dohvata.

Ne donosi:

- **Bot Fight Mode se ne da isključiti.** Cloudflare dokumentacija za BFM kaže da se ne može prilagoditi, podesiti ni prekonfigurisati kroz WAF custom pravila, i da izdaje računski skupe izazove svemu što prepozna kao bot. Ovo je najveća rupa u planu i treba je otvoreno priznati. Sajtovi na free planu sa uključenim BFM-om će nas i dalje izazivati.
- **Under Attack Mode ne pravi izuzetke.** Kad je uključen, svi dobijaju interstitial. Postoje dokumentovani slučajevi da čak ni Google PageSpeed Insights ne prolazi kroz Under Attack Mode uprkos aktivnim allowlist pravilima.
- **Custom WAF pravila vlasnika sajta imaju prednost.** Ako je neko napisao pravilo koje blokira naš ASN ili naš UA, verifikacija nas ne spašava. To je Cloudflare 1020.

Zaključak: verifikacija je najisplativija pojedinačna investicija, ali nije srebrni metak. Treba nam i kaskada.

**Ostale allowliste vrijedne prijave**

- **Bing / Microsoft**: objavi IP listu i podrži reverse DNS, isti mehanizam kao za Bingbot verifikaciju.
- **AWS WAF Bot Control**: ima kategorije za verifikovane botove, ali nema javni program prijave analogan Cloudflare-ovom. Radi kroz reputaciju i ponašanje.
- **Akamai**: ~~okrenut enterprise partnerima, preskoči~~. **Ispravka 15.09.2026.:** Akamai je otvorio javnu prijavu (Bot or AI agent registration, Akamai Bot Directory) na istoj mehanici, RFC 9421 plus JWKS direktorij. Ista infrastruktura pokriva i njih, bez dodatnog koda. Vidi `docs/38-bot-verification.md`, korak 8.
- **DataDome, HUMAN, Imperva**: provjereno 15.09.2026., nemaju javni program prijave za operatere. Allowlisting radi vlasnik svakog zaštićenog sajta u svom panelu. Za nas to znači verifikaciju vlasništva i uputstvo vlasniku, ne prijavu.
- **Cloudflare Radar direktorijum**: automatski nakon verifikacije, i sam po sebi je marketinški koristan.

### 5.2 robots.txt: šta smijemo, a šta ne

Ovdje treba jasna interna politika jer se dva slučaja bitno razlikuju.

**Pravno i konvencionalno stanje**

robots.txt nije zakon. RFC 9309 je standard za crawlere i kodifikuje konvenciju, ne obavezu. Nepoštovanje robots.txt nije samo po sebi nezakonito u SAD-u ni u EU. U hiQ Labs v. LinkedIn Deveti okružni sud je potvrdio usku interpretaciju CFAA: pristupanje javno dostupnim podacima nije pristup "bez ovlašćenja". Ali hiQ je na kraju izgubio po osnovu kršenja ugovora (Terms of Service), što je važna pouka: javnost podataka štiti od CFAA, ne od ugovorne odgovornosti.

Praktično, za nas relevantnija je reputacija. Cloudflare Verified Bots politika navodi nepoštovanje robots.txt i crawl direktiva kao razlog za izbacivanje iz programa. Izbacivanje iz programa nas košta više nego bilo koji pojedinačni audit.

**Razlika između crawlera i agenta koji radi po nalogu korisnika**

Ovo je stvarna i priznata distinkcija, i Google je eksplicitno dokumentuje. Google-ovi "user-triggered fetchers" **generalno ignorišu robots.txt pravila**, uz obrazloženje da su "inicirani od strane korisnika da izvrše funkciju dohvata unutar Google proizvoda". Na toj listi su:

| Fetcher | User-Agent |
|---|---|
| Google Site Verifier | `Mozilla/5.0 (compatible; Google-Site-Verification/1.0)` |
| Google Read Aloud | `Google-Read-Aloud` |
| Google Publisher Center | `GoogleProducer` |
| Google-Agent | `Google-Agent` |
| Gemini Notebook | `Google-GeminiNotebook` |
| Feedfetcher | `FeedFetcher-Google` |
| Chrome Web Store | `Google-CWS` |
| Google Messages | `GoogleMessages` |
| Google Pinpoint | `Google-Pinpoint` |

Isti obrazac važi i za Lighthouse. Zvanični UA je:

```
Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse
```

i on **ne poštuje robots.txt**. Disallow pravilo za `Chrome-Lighthouse` samo komunicira preferenciju, a stvarno blokiranje traži firewall ili serversko pravilo. Ovo je direktan presedan za ono što Tidywright radi.

Bing ima sličan stav u smjernicama: robots.txt se odnosi na automatsko otkrivanje i indeksiranje, ne na dohvat koji je korisnik eksplicitno tražio.

**Naša preporučena politika**

Tri režima, zapisana i objavljena na `/bot` stranici:

**Režim A: audit koji je pokrenuo verifikovani vlasnik sajta.** Nakon dokazanog vlasništva (DNS TXT, fajl ili meta tag, vidi 5.7), tretiramo se kao alat koji vlasnik pokreće na sopstvenoj imovini. Poštujemo `Disallow` samo ako se odnosi eksplicitno na `TidywrightBot`, jer je to specifična poruka baš nama. Generalni `Disallow: /` za `*` ne poštujemo, ali ga prijavljujemo kao nalaz najvišeg prioriteta. Ovo je bezbjedno i pravno i reputaciono jer vlasnik imovine daje pristanak.

**Režim B: audit koji je pokrenulo treće lice na tuđem sajtu.** Poštujemo robots.txt u potpunosti, uključujući pravilo iz RFC 9309 da nedostupan robots.txt (5xx ili mrežna greška) znači potpunu zabranu. Ako je `Disallow: /`, ne dohvatamo stranice. Umjesto toga isporučujemo djelimičan izvještaj iz izvora koji ne traže dohvat stranica (robots.txt sam, DNS, TLS, zaglavlja, CrUX) i jasno kažemo zašto.

**Režim C: demo ili marketinški audit koji sami pokrećemo.** Isto kao režim B, samo strože. Maksimalno 3 zahtjeva po sajtu.

Za sve režime: poštuj `Crawl-delay` do 10 sekundi, drži maksimalno 1 zahtjev u sekundi po hostu, i nikad ne pravi više od 20 zahtjeva po sajtu za jedan audit.

Politiku treba objaviti javno. To je i etički ispravno i korisno kad se prijavljujemo u Verified Bots program, jer moraju vidjeti da je naša deklarisana svrha usklađena sa ponašanjem.

### 5.3 Strategija ponovnih pokušaja

**Nikad ne ponavljaj**

401, 403 bez `cf-mitigated`, 404, 405, 410, 451, NXDOMAIN, Cloudflare 1020, 521, 523, istekao ili nevalidan sertifikat (isti rezultat će se ponoviti), `failed:robots`.

**Ponovi u istom zahtjevu (sinhrono)**

408, 425, 429 sa `Retry-After` ispod 10s, 500, 502, 503, 504, 520, 522, 524, connection reset, TLS handshake timeout, DNS SERVFAIL.

**Parametri sinhrone putanje**

- Osnovni razmak 1s, faktor 2, **puni jitter** (`sleep = random(0, base * 2^attempt)`). Puni jitter je ključan: bez njega se svi paralelni poslovi sinhronizuju i udaraju origin u istom trenutku.
- Maksimalno **3 pokušaja** ukupno.
- Tvrd ukupni budžet **25 sekundi** za cijelu sinhronu putanju, uključujući DNS, TLS, redirekcije i sve pokušaje. Preko toga korisnik odustaje.
- Poseban timeout za zaglavlja (10s) odvojen od timeouta za tijelo (20s). Bez toga viseći serveri drže slotove.
- Uvijek poštuj `Retry-After` doslovno kad postoji. Ako je vrijednost preko 120s, odmah pređi u asinhroni red umjesto da čekaš.

**Asinhroni red**

Kad sinhrona putanja padne sa ponovljivom greškom, upiši posao u red sa rasporedom: **5 minuta, 30 minuta, 4 sata, 24 sata**. Poslije četvrtog neuspjeha odustani trajno. Za `failed:challenge` sa signalom Under Attack Mode, preskoči prva dva koraka i idi odmah na 4 sata, jer Under Attack Mode traje u epizodama.

Ovo je istovremeno i alat za zadržavanje leada: "poslat ćemo ti izvještaj na mejl čim sajt bude dostupan" je bolji ishod od poruke o grešci.

**Prekidač strujnog kola (circuit breaker)**

Drži brojač neuspjeha po hostu i po ASN-u, sa prozorom od 15 minuta. Ako jedan host padne 5 puta, pauziraj ga na sat vremena. Ako jedan ASN (npr. veliki shared hosting) padne 50 puta, uspori sve prema njemu. Ovo štiti našu IP reputaciju, koja je naš najvredniji resurs.

**Idempotentnost**

Sve što radimo je GET, dakle bezbjedno po definiciji. Nema rizika od dupliranih efekata. Ali pazi na jedno: ne ponavljaj POST ili bilo kakav zahtjev koji smo poslali radi prolaska kroz consent formu.

### 5.4 Kaskada renderovanja

Četiri sloja, svaki skuplji od prethodnog. Eskalacija je uslovna, ne automatska.

**Sloj 0: bez HTTP-a (0,2 do 2s, cijena zanemarljiva)**

DNS upiti (A, AAAA, CNAME, MX, NS, TXT, CAA), TLS handshake sa čitanjem certa, RDAP za starost domene. Uvijek se izvodi, paralelno sa slojem 1. Daje otprilike 15 do 20 od naših 176 provjera bez ijednog dohvata stranice.

**Sloj 1: običan HTTP GET (0,5 do 5s, cijena zanemarljiva)**

Pravilan HTTP/2 klijent sa našim imenovanim UA, kompletnim setom realističnih zaglavlja, praćenjem redirekcija i tolerantnim HTML parserom. Ovo rješava 80 do 88% slučajeva.

Eskaliraj na sloj 2 ako:
- `cf-mitigated: challenge` je prisutan
- status 403 sa poznatim WAF potpisom
- odgovor je 200 ali vidljivog teksta ima manje od 500 karaktera uz 3 ili više script tagova
- detektovan je meta refresh koji nismo mogli pratiti
- detektovan je poznati CMP potpis a sadržaja nema

**Sloj 2: headless Chrome (3 do 20s, cijena mala u novcu, velika u latenciji)**

Pravi Chrome, ne Chromium bez kodeka. Pravi Chrome rješava i TLS otisak, i HTTP/2 otisak, i redoslijed zaglavlja, i JS izazove, sve odjednom, bez ijednog falsifikovanja. To je tehnički najčistije rješenje i etički neproblematično: mi zaista jesmo browser koji renderuje stranicu po nalogu korisnika.

Cijena, konkretno. Cloudflare Browser Rendering:

| | Free plan | Paid plan |
|---|---|---|
| Browser sati | 10 minuta dnevno | 10 sati mjesečno, pa $0,09 po satu |
| Konkurentni browseri | 3 | 10 (mjesečni prosjek), pa $2,00 po dodatnom |

Račun za nas: pri 10.000 audita mjesečno i 15% eskalacije na headless sa prosjekom 12 sekundi, to je 1.500 × 12s = 5 sati. **Unutar besplatne kvote paid plana.** Čak i ako bi apsolutno svaki audit išao kroz headless: 10.000 × 12s = 33,3 sata, od čega se plaća 23,3 sata × $0,09 = **$2,10 mjesečno**.

Novac nije problem. Problem su dvije druge stvari:

1. **Latencija.** Headless render dodaje 3 do 20 sekundi. Na posjetiocu koji čeka rezultat to je razlika između "brzo" i "pokvareno". Rješenje: streamuj djelimične rezultate, pokaži rezultate sloja 0 i 1 odmah dok sloj 2 radi.
2. **Konkurentnost.** 10 konkurentnih browsera u prosjeku je ozbiljno ograničenje pri špicu. Svaki dodatni je $2,00 mjesečno, što je i dalje jeftino, ali treba planirati.

Alternativa je self-hosted Playwright. Realno: 300 do 600 MB RAM-a po browseru, praktično 2 do 4 konkurentna po vCPU. Mašina sa 4 vCPU i 8 GB RAM-a za oko $40 mjesečno nosi 8 do 12 konkurentnih renderovanja. Skuplje od Cloudflare-a i daje nam datacenter IP umjesto Cloudflare-ovog. **Cloudflare Browser Rendering je klasifikovan kao signed agent u Cloudflare-ovom sistemu**, što je dodatna prednost: dohvat kroz njega dolazi sa potpisanim identitetom, ne kao anoniman datacenter IP.

Preporuka: koristi Cloudflare Browser Rendering za sloj 2, sa self-hosted Playwrightom kao rezervom.

**Šta headless NE rješava**

Detekcija headless browsera je i dalje moguća i u 2026: `navigator.webdriver`, rijedak ili nepotpun `window.chrome` objekat, Permissions API koji vraća `denied` za notifikacije umjesto `prompt`, prazan `navigator.plugins`, `navigator.languages` koji uvijek vraća `['en-US','en']`, WebGL `UNMASKED_RENDERER_WEBGL` koji prijavljuje `Google SwiftShader` ili softverski `ANGLE` umjesto stvarnog GPU-a, canvas otisak koji odaje softversko rasterizovanje, i odsustvo prirodnog kretanja miša. Mi ne pokušavamo ništa od toga sakriti osim onoga što je legitimna konfiguracija (koristi GPU akceleraciju ako je dostupna, postavi razuman viewport, postavi `Accept-Language`). Ne instaliramo stealth plugine. Ako nas neko detektuje i blokira, to je njihovo pravo.

**Sloj 3: izvori koji ne traže naš dohvat**

Vidi sljedeću sekciju.

### 5.5 Alternativni izvori podataka

Kad HTML nije dostupan nama, možda jeste dostupan nekom drugom, ili je bio dostupan ranije.

**Google PageSpeed Insights API**

Šta daje: kompletan Lighthouse izvještaj (Performance, Accessibility, Best Practices, SEO, plus novija Agentic Browsing kategorija), sve pojedinačne audite, screenshot cijele stranice, i CrUX terenske podatke (FCP, LCP, CLS, INP, eksperimentalni TTFB) kad uzoraka ima.

Zašto je moćan za nas: PSI dohvata sajt **iz Google infrastrukture, sa Chrome-Lighthouse UA koji ne poštuje robots.txt**, i mnogi WAF-ovi ga propuštaju jer ga vlasnici sajtova sami koriste. To je potpuno legitiman zaobilazni put: ne skrivamo se, koristimo javni Google API onako kako je namijenjen.

Ograničenja: objavljene kvote su bile 240 upita u minuti i 25.000 dnevno po projektu, ali Google više ne objavljuje podrazumijevane kvote u dokumentaciji, nego ih treba čitati sa Quotas stranice u Google Cloud projektu. **Zahtjevi bez API ključa sada padaju sa HTTP 429** jer dijele zajednički pool sa dnevnim limitom nula. Dakle API ključ je obavezan. Maksimalno vrijeme analize je 120 sekundi, što znači da PSI mora ići u asinhroni red, nikad u sinhronu putanju.

PSI takođe pada na sajtovima pod Under Attack Mode, pa nije univerzalno rješenje.

**Chrome UX Report (CrUX)**

Šta daje: stvarni terenski podaci o performansama po originu ili po URL-u, bez ijednog našeg dohvata.

Ograničenja koja treba jasno razumjeti: origin mora biti **javno otkriv** (isti kriterijumi indeksabilnosti kao kod pretraživača, dakle ne 200 status, `X-Robots-Tag: noindex` ili `<meta name="robots" content="noindex">` isključuju stranicu) i **dovoljno popularan** (Google ne objavljuje prag, ali kaže da je izabran tako da distribucije budu statistički pouzdane).

Za našu ciljnu grupu, male poslovne sajtove, ovo je ozbiljno ograničenje. Velik dio njih neće imati dovoljno Chrome saobraćaja da uđe u CrUX. Kad podaci postoje, vrijedni su. Kad ne postoje, i to je nalaz ("tvoj sajt nema dovoljno saobraćaja da bi Google imao terenske podatke o njemu").

**Google Search Console API**

Samo uz autorizaciju vlasnika kroz OAuth. Daje: stvarne upite, pozicije, CTR, pokrivenost indeksa, greške crawlanja, mobilnu upotrebljivost, sitemap status. Ovo je najbogatiji izvor koji postoji i vrijedi cijelog toka verifikacije. Nikad ga ne koristi bez eksplicitne OAuth saglasnosti vlasnika, i nikad ne čuvaj tokene duže nego što treba.

Ovo treba biti glavni argument za registraciju korisnika: "poveži Search Console i dobićeš dvostruko dublji izvještaj".

**Wayback Machine**

Tri korisna API-ja:

- **Availability API**, `https://archive.org/wayback/available?url=...&timestamp=...`. Jednostavan, jedan rezultat. Ima zamku: tiho preferira snapshotove sa statusom 200, pa može vratiti snimak star sedmicama ili mjesecima ako su bliži imali greške.
- **CDX API**, `https://web.archive.org/cdx/search/cdx?url=...&output=json&filter=statuscode:200&collapse=digest&limit=-5`. Vraća tabelu snimaka sa timestampom, MIME tipom, statusom, digestom i dužinom. `collapse=digest` uklanja identične uzastopne snimke, `limit=-N` daje N najnovijih. Ovo je pravi alat za nas.
- **Save Page Now 2**, `https://web.archive.org/save`. Traži autentifikaciju i asinhron je. Korisno ako želimo da namjerno arhiviramo stanje prije popravke, ali nije dio putanje dohvata.

Nema objavljenih tvrdih limita. CDX podnosi razuman volumen za pristojne klijente, SPN2 je strogo ograničen.

Ključna napomena za izvještaj: podaci iz Wayback-a su **istorijski**, i moraju biti jasno označeni datumom snimka. Nikad ne računaj skor iz arhiviranog HTML-a bez vidljive oznake "na osnovu snimka od [datum]".

**Common Crawl**

Census iz juna 2026. na uzorku od 2.000 domena (indeks CC-MAIN-2026-25) daje 89,0% "captured" (arhiviran sadržaj sa HTTP 200 ili revisit zapisom) i 95,3% "presence" (bilo kakav zapis u indeksu). Po sektorima: univerziteti 100%, e-commerce 91,4%, news 82,8%, vlada 82,0%. Od 126 domena koji su prisutni ali bez sadržaja, 58 je vraćalo 403, 46 samo trajne redirekcije.

Ali: taj uzorak je bio od poznatih, srednje do vrlo popularnih domena. Za proizvoljan mali poslovni sajt pokrivenost je bitno niža, a svježina je problem (indeksi se objavljuju mjesečno, a konkretna stranica može biti stara više mjeseci). Common Crawl je koristan kao posljednji izvor konteksta, ne kao osnova skora.

**Provjere koje ne traže HTML uopšte**

Ovo je najpodcijenjeni dio i treba ga izgraditi rano jer je jeftin i uvijek radi:

- DNS: A, AAAA, CNAME lanac, MX (da li mejl radi), NS (ko hostuje DNS), TXT (SPF, DMARC, verifikacije), CAA, DNSSEC status, TTL vrijednosti
- Mejl higijena: SPF zapis i njegova ispravnost, DMARC politika, DKIM selektori. Ovo su prave provjere koje nemaju veze sa HTML-om i vrijedne su.
- TLS: izdavač, datum isteka, pokrivenost SAN-a (da li pokriva i apex i `www`), verzija protokola, kompletnost lanca, OCSP stapling, HSTS zaglavlje i preload status
- HTTP zaglavlja: `strict-transport-security`, `content-security-policy`, `x-content-type-options`, `x-frame-options`, `referrer-policy`, `permissions-policy`, `server`, `x-powered-by` (curenje verzija)
- Lanac redirekcija od `http://apex` do konačnog URL-a, sa svakim skokom
- `robots.txt` i `sitemap.xml` sami po sebi. Vrlo često su dostupni i kad je HTML blokiran, jer su WAF pravila često pisana za HTML rute
- `/.well-known/security.txt`, `/favicon.ico`, `/humans.txt`
- RDAP: starost domene, datum isteka registracije, status kodovi
- IP geolokacija i ASN hostinga
- Detekcija hostinga i CDN-a iz zaglavlja

**Koliko naših 176 provjera može bez HTML-a**

Procjena: između 35 i 50 provjera, dakle 20 do 28% ukupnog skora, može se izvesti bez ijednog bajta HTML-a. To je dovoljno da izvještaj ne bude prazan. Preporuka: eksplicitno označi svaku od 176 provjera oznakom `requires: none | headers | html | rendered_html | field_data` i izračunaj **pokrivenost** kao zaseban broj koji se pokazuje uz skor.

### 5.6 Rezidencijalni i rotirajući proxiji: zašto ne

Budimo iskreni. Rezidencijalni proxiji bi riješili veliki dio ovog problema. Jednom rečenicom: **ne trebamo ići tamo, i evo zašto.**

**Etika izvora IP adresa.** Rezidencijalne proxy mreže dobijaju IP adrese od stvarnih ljudi, obično kroz SDK ugrađen u besplatne aplikacije, VPN-ove i, kako je 2026. postalo javno, kroz aplikacije na smart TV-ima. Krebs on Security je u julu 2026. izvijestio da LG zabranjuje rezidencijalne proxije u aplikacijama za svoje smart TV-e nakon što su istraživači pokazali da Bright Data SDK pretvara uređaje u čvorove za scraping. Provajderi tvrde da imaju pristanak. Pitanje je koliko je taj pristanak informisan kad je zakopan u EULA besplatne aplikacije. Saobraćaj koji mi generišemo išao bi kroz kućnu vezu nekoga ko nije svjestan šta se preko nje šalje, i njegova IP adresa bi se pojavila u logovima tuđeg sajta.

**Pravno.** hiQ v. LinkedIn je sužio CFAA, ali to nas ne pokriva kod ugovorne odgovornosti, kod EU pravila o pristupu podacima, ni kod GDPR-a ako kroz proxy prolaze lični podaci. Koristiti rezidencijalni proxy je takođe jasno izbjegavanje mjera koje je vlasnik sajta postavio, što je kvalitativno drugačije od dohvatanja javne stranice.

**Poslovno.** Ovo je odlučujuće. Cloudflare Verified Bots politika navodi kao razlog za izbacivanje "korišćenje IP-ova koji nisu ekskluzivno namijenjeni servisu" i "IP blokove koji nisu prijavljeni pri onboardingu". Rezidencijalni proxy je po definiciji oboje. **Ne možemo istovremeno biti verifikovani bot i koristiti rotirajuće rezidencijalne IP-ove.** Moramo birati, a verifikacija nam donosi skok sa 33% na 73% uspjeha, trajno, na četvrtini interneta.

**Cijena.** Rezidencijalni proxiji koštaju $3 do $15 po gigabajtu, ili $50 do $150 mjesečno za skromne pakete. Za poređenje, Cloudflare Browser Rendering nas košta oko $2 mjesečno pri 10.000 audita.

**Prodajno.** Tidywright prodaje SEO higijenu. Alat koji zaobilazi WAF pravila klijenata da bi ih auditirao je teško braniti u razgovoru sa klijentom koji to primijeti u svojim logovima.

**Šta je prihvatljivo umjesto toga:**

- Izlazni IP-ovi u dvije ili tri regije, sa objavljenom listom, radi geografskog uzorkovanja i radi izbjegavanja jedne loše rute. Ovo nije skrivanje, nego mjerenje sa više tačaka.
- Cloudflare Browser Rendering, koji dolazi sa potpisanim identitetom.
- Poštovanje niskih stopa i cachiranje robots.txt-a do 24 sata po RFC 9309.

**Granični slučaj koji zaslužuje eksplicitnu odluku:** korišćenje pravog Chromea sa autentičnim TLS i HTTP/2 otiskom. Da li je to izbjegavanje? Naš stav: nije, jer mi zaista jesmo browser koji renderuje jednu stranicu po nalogu korisnika, i deklarišemo se kao takvi u User-Agentu. Granica koju ne prelazimo: ne falsifikujemo TLS otisak kroz curl-impersonate ili slične alate, ne instaliramo stealth patch-eve koji kriju `navigator.webdriver`, ne rješavamo CAPTCHA-e, i ne mijenjamo identitet nakon što nas neko blokira. Ovu granicu treba zapisati u internu politiku i objaviti na `/bot` stranici.

### 5.7 Verifikacija vlasništva

Ovo je najvredniji proizvod iz cijelog dokumenta jer istovremeno rješava blokirane sajtove, otključava dublje podatke i pretvara anonimnog posjetioca u registrovanog korisnika.

Tri metoda, sve tri standardne i poznate vlasnicima sajtova iz Google Search Console iskustva:

**1. DNS TXT zapis** (najjači, radi čak i kad je sajt potpuno nedostupan)

```
_tidywright.primjer.ba.  IN  TXT  "tidywright-verification=a7f3e9c1d2b8..."
```

Prednost: ne traži da sajt uopšte odgovara. Radi kroz Cloudflare 1020, kroz 521, kroz istekao cert, kroz sve. Dokazuje kontrolu nad domenom, ne nad jednim hostom. Mana: propagacija traje, korisnik mora imati pristup DNS-u, a kod jeftinih registrara to ume da bude mučno.

**2. Fajl na poznatoj putanji**

```
https://primjer.ba/.well-known/tidywright-verification.txt
```

Prednost: jednostavno objasniti, radi kroz FTP i kroz svaki CMS. Mana: traži da sajt odgovara, što je upravo ono što možda ne radi. Ali zanimljivo: WAF pravila često ciljaju HTML rute, pa `.well-known` putanja često prođe i kad `/` ne prolazi. Vrijedi probati.

**3. Meta tag u `<head>`**

```html
<meta name="tidywright-verification" content="a7f3e9c1d2b8...">
```

Prednost: najlakše za korisnike Wix-a, Squarespace-a i Shopify-a koji imaju polje za ubacivanje koda u head. Mana: traži da HTML bude dohvatljiv, dakle ne pomaže u slučaju bloka. Ali pomaže u slučaju login zida ili age gate-a.

**4. OAuth kroz Google Search Console** (bonus metoda)

Ako korisnik već ima verifikovanu property u Search Console, OAuth ga prepoznaje odmah i mi dobijamo i dokaz vlasništva i pristup podacima u jednom koraku. Ovo treba ponuditi prvo.

**Šta verifikacija otključava**

Poslije uspješne verifikacije:

- Prelazimo u režim A za robots.txt (vidi 5.2)
- Prikazujemo tačna uputstva kako da nas propusti kroz svoj WAF, prilagođena detektovanom provajderu. Za Cloudflare: WAF custom pravilo sa `(http.user_agent contains "TidywrightBot")` ili sa našim IP listom, akcija Skip. Za Wordfence, Sucuri, Imperva: ekvivalentna uputstva.
- Nudimo povezivanje Search Console
- Nudimo zakazivanje ponovnog audita nakon što podesi allowlist, automatski
- Čuvamo rezultat i pratimo promjenu kroz vrijeme

Uputstva treba generisati automatski, sa tačnim vrijednostima koje korisnik može kopirati. To je razlika između "ne možemo auditirati tvoj sajt" i "evo tačno tri klika kojima ćeš to riješiti".

### 5.8 Šta pokazati posjetiocu

Pravilo broj jedan: **nikad ne pokazuj samo poruku o grešci.** Neuspio audit je često prvi utisak koji prospekt dobije o Tidywright-u.

**Uvijek pokaži nešto**

Čak i u najgorem slučaju imamo DNS, TLS, zaglavlja i lanac redirekcija. To je 35 do 50 provjera. Prikaži ih kao pravi izvještaj, sa pravim skorom za taj podskup, uz jasno izražen **indikator pokrivenosti**:

```
Pokrivenost: 42 od 176 provjera
Skor za izvršene provjere: 71 / 100
```

Ne prikazuj skor kao da je kompletan. To bi bilo obmanjujuće i loše za povjerenje.

**Objasni ljudskim jezikom, po klasi kvara**

Svaka klasa kvara dobija svoj tekst. Nikad statusni kod bez objašnjenja.

| Klasa | Šta kažemo |
|---|---|
| `failed:dns` | "Ne možemo pronaći taj domen. Provjeri da li si dobro upisao adresu, ili da li je domen povezan sa hostingom." |
| `failed:tls` | "Sigurnosni sertifikat sajta ima problem. To je ozbiljno: dio posjetilaca vidi upozorenje umjesto tvog sajta. Evo šta tačno nije u redu." |
| `failed:timeout` | "Sajt je odgovarao presporo da bismo završili audit. To je samo po sebi jedan od najvažnijih SEO problema. Pokušaćemo ponovo i javiti ti se." |
| `failed:blocked` | "Tvoj sajt koristi zaštitu koja blokira automatske alate, uključujući i naš. Ista zaštita ponekad blokira i alate koje koristi Google. Evo kako da nas propustiš, ili potvrdi vlasništvo pa ćemo mi to riješiti." |
| `failed:challenge` | "Tvoj sajt traži provjeru u browseru prije nego što pusti sadržaj. To usporava i pretraživače. Pokušavamo ponovo kroz nekoliko sati." |
| `failed:robots` | "Tvoj robots.txt zabranjuje pristup svim automatskim alatima. To znači da te ni Google ne indeksira. Ovo je vjerovatno najvažniji nalaz u cijelom izvještaju." |
| `failed:content` | "Sajt je učitan, ali gotovo sav sadržaj se učitava JavaScriptom. Pretraživači to danas uglavnom mogu, ali sporije i nepouzdanije. Evo šta to znači za tebe." |

**Obrni blok u nalaz**

Ovo je najvažniji stav u cijeloj sekciji. **Blokiranje nije naš neuspjeh, nego njihov nalaz.** Sajt koji blokira imenovan, deklarisan, pošten SEO alat vrlo vjerovatno blokira i druge legitimne alate, a u nekim konfiguracijama i AI crawlere koji danas donose vidljivost. Pretvori to u stavku izvještaja sa ozbiljnošću "visoko" i objašnjenjem zašto je preagresivan WAF SEO rizik.

**Zadrži lead**

Tri poziva na akciju, po prioritetu:

1. "Ostavi mejl, javićemo ti se kad audit prođe." Veži to na asinhroni red. Ovo hvata `failed:timeout`, `failed:ratelimit`, `failed:http_server` i Under Attack Mode epizode, dakle veliku većinu ponovljivih slučajeva.
2. "Potvrdi vlasništvo i dobij pun izvještaj." Vodi u tok iz 5.7. Ovo hvata `failed:blocked`, `failed:robots` i login zidove, i usput pretvara posjetioca u registrovanog korisnika.
3. "Probaj drugi URL." Za `failed:dns` i pogrešne unose.

**Mjeri**

Dodaj event za svaku klasu kvara, sa hostom, detektovanim WAF provajderom, CMS-om i ishodom kaskade. Bez tih podataka svaka procjena u sekciji 6 ostaje procjena. Poslije mjesec dana stvarnog saobraćaja imaćemo tačne brojeve za našu publiku, a ne industrijske prosjeke.

---

## 6. Koliko sajtova će pasti, i koji

### 6.1 Procjena ukupne stope

Nema javnog istraživanja koje mjeri baš ovo (proizvoljni mali poslovni sajtovi, jedan dohvat homepage-a, pošten imenovani agent iz datacentra). Sastavljam procjenu iz onoga što jeste mjereno:

Polazna tačka su Cloudflare Radar podaci: neverifikovani ne-AI botovi dobijaju 200 u **33,3%** slučajeva. Ali taj broj mjeri sve zahtjeve, uključujući duboke crawlove agresivnih scrapera na velikim, dobro branjenim sajtovima. Mi radimo jedan zahtjev na homepage malog sajta, što je bitno povoljnije.

Korekcije naviše:

- 69,8% sajtova uopšte nema reverse proxy i time nema Cloudflare bot odbranu
- Homepage je najmanje zaštićena ruta na svakom sajtu
- Jedan zahtjev nikad ne pokreće rate limiting
- Mali poslovni sajtovi rijetko imaju enterprise anti-bot (Akamai, DataDome, Imperva zajedno su ispod 1% tržišta)

Korekcije naniže:

- Datacenter ASN nas hendikepira od prvog paketa
- Bot Fight Mode je vrlo raširen na free Cloudflare planovima, a upravo mali poslovni sajtovi su na free planu
- Od 15. septembra 2026. default se pooštrava baš na free zonama

**Procjena: 12 do 20% proizvoljnih malih poslovnih sajtova neće dati upotrebljiv HTML iz prvog običnog GET zahtjeva.**

Razlaganje te brojke, sredina raspona (16%):

| Klasa | Procjena udjela svih audita |
|---|---|
| Bot odbrana (challenge ili blok) | 6 do 9% |
| Prazan SPA ili sadržaj samo kroz JS | 3 do 5% |
| Timeout ili previše spor TTFB | 1 do 2% |
| TLS problemi | 1 do 2% |
| DNS problemi i loši unosi | 1 do 3% |
| 5xx i Cloudflare 52x | 0,5 do 1,5% |
| 404 ili soft 404 na homepage | 0,5 do 1% |
| robots.txt zabrana (režim B) | 0,5 do 1,5% |

Nakon pune kaskade:

| Mjera | Očekivano smanjenje neuspjeha |
|---|---|
| Headless sloj | Rješava skoro sve SPA slučajeve i većinu JS challenge-a. Minus 4 do 7 procentnih poena |
| Cloudflare verifikacija sa Web Bot Auth | Rješava dobar dio bot odbrane osim BFM-a i Under Attack Mode-a. Minus 2 do 4 poena |
| Asinhroni retry sa odgodom do 24h | Rješava timeoutove, 5xx, rate limite i Under Attack epizode. Minus 1,5 do 3 poena |
| `www` / apex i HTTP / HTTPS fallback matrica | Rješava dobar dio DNS i TLS slučajeva. Minus 1 do 2 poena |
| Fallback izvori (PSI, CrUX, Wayback) | Ne rješava dohvat, ali pretvara neuspjeh u djelimičan izvještaj |

**Procjena nakon svega: 4 do 7% audita ostaje bez upotrebljivog HTML-a.** Od toga skoro svi mogu dobiti smislen djelimičan izvještaj.

### 6.2 Najgore kombinacije

Rangirano od najgoreg:

**1. Bilo koji CMS + Cloudflare free plan sa uključenim Bot Fight Mode**

Ovo je ubjedljivo najgori slučaj i najčešći. Cloudflare je na 25,7% svih sajtova, free plan je dominantan kod malih sajtova, a Bot Fight Mode je jedan prekidač koji vlasnici uključe misleći da je to dobra ideja. Cloudflare dokumentacija eksplicitno kaže da se BFM **ne može prilagoditi, podesiti ni prekonfigurisati kroz WAF custom pravila**. Verifikovani status tu ne pomaže pouzdano. Jedini put naprijed: headless render (ponekad prođe CPU izazov) ili verifikacija vlasništva pa uputstvo vlasniku da isključi BFM i pređe na Super Bot Fight Mode ili WAF pravila.

**2. WordPress + Wordfence ili Sucuri, na jeftinom shared hostingu**

WordPress je 40,3% svih sajtova. Sigurnosni plugini dodaju svoj sloj blokiranja po UA i po IP reputaciji, nezavisno od Cloudflare-a. Jeftin shared hosting dodaje spor TTFB i česte 503. Ova kombinacija daje i blokove i timeoute. Dobra vijest: obično se rješava headless renderom jer plugini uglavnom gledaju UA i IP, ne TLS otisak.

**3. Wix i Squarespace**

Wix je 4,2%, Squarespace 2,4%. Oba su teško JS orijentisana i oba imaju platformske rate limite koje vlasnik sajta ne kontroliše i ne može isključiti. Wix posebno servira dosta sadržaja kroz klijentski rendering. Za ove obavezno treba headless. Loša strana: kad platforma blokira, vlasnik ne može ništa, pa ni verifikacija vlasništva ne pomaže. Dobra strana: platformski sajtovi imaju konzistentnu strukturu pa se dobro parsiraju kad prođu.

**4. Shopify**

5,4% svih sajtova. Shopify je generalno pristupačan za jedan zahtjev na homepage, ali agresivno rate limituje sve preko toga i ima svoj bot detection sloj. Jedan zahtjev obično prođe. Ne pokušavaj crawl.

**5. Headless / Jamstack sa client-side renderingom (Next.js u SPA modu, Gatsby bez SSR-a, Nuxt SPA, Vite + React)**

Statistički se kriju u onih 31,5% "bez prepoznatog CMS-a". Dohvat uvijek uspije sa 200, ali HTML je prazan. Ovo nije blok nego oblik sadržaja, i uvijek traži headless. Rastuća klasa.

**6. Enterprise anti-bot (Akamai, DataDome, HUMAN, Imperva)**

Zbirno ispod 1% tržišta i rijetko na malim sajtovima. Kad se pojave, praktično nerješivo za nas. Prihvati i pređi na djelimičan izvještaj.

**7. Stari sajtovi bez CMS-a**

Dio od 31,5% bez CMS-a. Problemi su drugačije prirode: istekli sertifikati, TLS 1.0, pogrešan charset, frameseti, sajt koji je jedna velika slika. Dohvat uglavnom uspije, ali parsiranje traži toleranciju. Dobra vijest: ovi sajtovi gotovo nikad ne blokiraju, i daju najviše nalaza po auditu, dakle najbolji su prodajni materijal.

**Najbolji slučaj:** WordPress na pristojnom hostingu (Kinsta, WP Engine, SiteGround) bez Cloudflare-a ili sa Cloudflare-om bez BFM-a. Prolazi iz prvog pokušaja skoro uvijek, daje pun HTML, i ima najviše mjerljivih SEO nalaza.

---

## 7. Preporučeni redoslijed ugradnje

### Faza 1: Higijena dohvata (1 do 2 sedmice, rješava najviše po uloženom)

1. Pravilan imenovani User-Agent sa URL-om politike, i objavljena `/bot` stranica sa svime iz 5.1.
2. Razdvoji timeoutove: DNS 2s, konekcija 5s, zaglavlja 10s, tijelo 20s, ukupni budžet 25s.
3. Matrica fallbacka na nivou URL-a: `https://apex`, `https://www`, `http://apex`, `http://www`, paralelno gdje ima smisla, sa poštovanjem HSTS preload liste.
4. Praćenje redirekcija do 10 skokova, sa detekcijom petlji i snimanjem cijelog lanca.
5. Tolerantan HTML parser i pravilna detekcija charseta (zaglavlje, pa BOM, pa meta, pa detekcija).
6. Limit veličine tijela na 10 MB.
7. Proširena taksonomija statusa iz sekcije 1, sa poljima `retryable` i `escalate_to`.
8. Klasifikacija po WAF potpisima: `cf-mitigated`, `cf-ray`, `x-amzn-waf-action`, `_abck`, `datadome`, `_px`, `incap_ses_*`.
9. Telemetrija za svaku klasu kvara, sa CMS-om i WAF provajderom.

**Očekivani efekat:** minus 3 do 5 procentnih poena neuspjeha, plus podaci kojima ćemo mjeriti sve ostalo.

### Faza 2: Retry i djelimični izvještaj (1 do 2 sedmice, najveći efekat na konverziju)

1. Eksponencijalni backoff sa punim jitterom, 3 sinhrona pokušaja, poštovanje `Retry-After`.
2. Asinhroni red sa rasporedom 5min / 30min / 4h / 24h i slanjem izvještaja mejlom.
3. Circuit breaker po hostu i po ASN-u.
4. Označi svih 176 provjera oznakom `requires:` i izračunaj pokrivenost kao zaseban broj.
5. Sloj 0: DNS, TLS, RDAP, zaglavlja, robots.txt, sitemap.xml, `.well-known`. Uvijek se izvodi, paralelno sa dohvatom.
6. Djelimičan izvještaj sa indikatorom pokrivenosti i objašnjenjima po klasi kvara iz 5.8.
7. Hvatanje mejla za asinhroni ishod.

**Očekivani efekat:** neuspio audit prestaje biti izgubljen lead. Ovo je faza sa najvećim poslovnim povratom, čak i prije nego što tehnički popravimo išta.

### Faza 3: Headless sloj (2 do 3 sedmice)

1. Cloudflare Browser Rendering kao primarni izvršilac, self-hosted Playwright kao rezerva.
2. Uslovna eskalacija po pravilima iz 5.4, nikad automatska.
3. Streamovanje djelimičnih rezultata korisniku dok sloj 2 radi.
4. Cachiranje `cf_clearance` po hostu dok traje.
5. Detekcija CMP potpisa i obrada consent interstitial-a koji zamjenjuju stranicu.
6. Detekcija shadow DOM sadržaja.
7. Bez stealth plugina, bez falsifikovanja otisaka, bez rješavanja CAPTCHA-a. Zapiši to kao politiku.

**Očekivani efekat:** minus 4 do 7 poena. Rješava skoro sve SPA slučajeve i većinu JS izazova.

### Faza 4: Identitet i verifikacija (2 do 4 sedmice rada, pa kvartal čekanja)

1. Izdvoji izlazne IP-ove fetch workera na zasebne, ekskluzivne adrese. Objavi listu u JSON-u na stalnom URL-u.
2. Postavi reverse DNS sa forward potvrdom za svaku izlaznu IP.
3. Implementiraj Web Bot Auth: Ed25519 ključ, JWKS na `/.well-known/http-message-signatures-directory`, potpisivanje po RFC 9421 sa `tag="web-bot-auth"`.
4. Prijavi se u Cloudflare Verified Bots kroz Bot Submission Form, **kao kategorija SEO**.
5. Prijavi se Bingu i drugim allowlistama koje imaju javni proces.
6. Implementiraj robots.txt politiku sa tri režima iz 5.2, sa RFC 9309 semantikom za 5xx i keširanjem do 24 sata.

**Očekivani efekat:** minus 2 do 4 poena, ali tek nakon odobrenja. Počni ranije nego što misliš da treba, jer čekanje traje.

### Faza 5: Verifikacija vlasništva i alternativni izvori (3 do 4 sedmice)

1. Tri metode verifikacije: DNS TXT, fajl na `.well-known`, meta tag. Plus OAuth kroz Search Console kao prvu ponudu.
2. Automatski generisana uputstva za allowlist, prilagođena detektovanom WAF provajderu, sa vrijednostima spremnim za kopiranje.
3. Integracija PageSpeed Insights API sa vlastitim ključem, u asinhronom redu (120s max).
4. Integracija CrUX API za terenske podatke.
5. Integracija Search Console API nakon OAuth saglasnosti.
6. Wayback CDX kao posljednji izvor za istorijski HTML, uvijek sa vidljivom oznakom datuma snimka.

**Očekivani efekat:** blokiran sajt postaje registrovan korisnik. Ovo je faza koja pretvara problem u proizvod.

### Faza 6: Fino podešavanje (kontinuirano)

1. Izlazni IP-ovi u dvije regije za geografsko uzorkovanje i detekciju geo-blokova.
2. Detekcija cloakinga kroz dva dohvata sa različitim UA i poređenje.
3. Detekcija soft 404 kroz poređenje sa nasumičnim putem.
4. Detekcija parkiranih domena i wildcard DNS-a.
5. Legacy TLS profil kao drugi pokušaj za stare sajtove.
6. Detekcija AI tarpitova kroz limite veličine i odnos linkova prema tekstu.
7. Mjesečni pregled telemetrije i ponovno računanje procjena iz sekcije 6 na osnovu stvarnih podataka.

---

## 8. Šta ostaje nerješivo

Budimo pošteni o granicama, jer je lakše dizajnirati proizvod oko poznatih granica nego se pretvarati da ih nema.

**Cloudflare Bot Fight Mode na free planu.** Cloudflare dokumentacija eksplicitno kaže da se ne može prilagoditi ni prekonfigurisati kroz WAF custom pravila. Verifikovani status ne pomaže pouzdano. Headless ponekad prođe CPU izazov, ponekad ne. Ovo je najčešći nerješiv slučaj i pogađa baš našu ciljnu grupu. Jedini pravi izlaz je da vlasnik sam isključi prekidač, što traži verifikaciju vlasništva i uputstvo.

**Under Attack Mode dok traje.** Svi dobijaju interstitial, uključujući verifikovane botove. Postoje dokumentovani slučajevi da ni Google PageSpeed Insights ne prolazi kroz Under Attack Mode uprkos aktivnim allowlist pravilima. Mi nećemo. Jedino rješenje je vrijeme, pa asinhroni retry za 6 do 24 sata.

**Interaktivne CAPTCHA-e i Turnstile koji traže ljudsku interakciju.** Ne rješavamo ih i nećemo ih rješavati. CAPTCHA farme su i etički i pravno loša ideja, a i diskvalifikuju nas iz Verified Bots programa.

**Enterprise anti-bot: Akamai Bot Manager, DataDome, HUMAN, Imperva.** Ovi sistemi kombinuju mrežnu reputaciju, TLS i HTTP/2 otisak, okolinu browsera i ponašanje, i ažuriraju modele stalno. Poraziti ih traži kontinuirano ulaganje u izbjegavanje, što je tačno ono što nećemo raditi. Zbirno su ispod 1% tržišta, pa je cijena prihvatanja niska.

**Eksplicitan `Disallow` za `TidywrightBot`.** Ovo je namjerno nerješivo. Kad neko poimence kaže da nas ne želi, poštujemo to bez izuzetka i bez zaobilaženja, uključujući i verifikovane vlasnike. Ako vlasnik želi audit svog sajta koji ima to pravilo, mora ga sam ukloniti.

**Sajtovi koji zahtijevaju klijentski sertifikat (mTLS).** Nema načina bez sertifikata.

**Sajtovi iza logina bez kredencijala.** Verifikacija vlasništva dokazuje ko je vlasnik, ali ne daje pristup. Ako korisnik ne unese kredencijale, nema audita.

**Trajno oborena infrastruktura.** Cloudflare 521 i 523, DNS bez A zapisa, ugašen hosting. Tu nema šta da se dohvati. Ali to su najvredniji nalazi u izvještaju i treba ih tako i prezentovati.

**Cloaking koji ne detektujemo.** Ako sajt servira poseban sadržaj svima koji liče na bota, naš skor mjeri taj poseban sadržaj, ne ono što vidi stvarni posjetilac. Poređenje dva dohvata sa različitim UA hvata jednostavne slučajeve, ali ne i one koji se oslanjaju na IP reputaciju ili TLS otisak. Ovo je tiha greška mjerenja i treba je priznati u metodologiji izvještaja.

**CrUX podaci za male sajtove.** Google ne objavljuje prag, ali većina malih poslovnih sajtova ga ne dostiže. To znači da najkorisniji "besplatni" fallback izvor često neće imati podatke baš za našu publiku.

**Rate limiti platformi koje vlasnik ne kontroliše.** Wix, Squarespace i slični imaju platformske limite koje ni verifikovani vlasnik ne može isključiti. Ako platforma odluči da nas ograniči, verifikacija vlasništva ne pomaže.

**Latencija headless rendera.** 3 do 20 sekundi je fizika, ne bug. Može se sakriti dobrim UX-om (streamovanje djelimičnih rezultata), ali ne može se ukloniti.

Za svaki od ovih slučajeva pravilo ostaje isto: **neuspio dohvat pretvori u nalaz i u razgovor, nikad u poruku o grešci.** Sajt koji blokira poštenog, imenovanog, verifikovanog SEO agenta ima stvaran problem koji vrijedi ispričati vlasniku, i to je sadržaj za koji ljudi plaćaju.

---

## Izvori

- [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.txt)
- [Google: How Google interprets the robots.txt specification](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt)
- [Google: User-triggered fetchers](https://developers.google.com/crawling/docs/crawlers-fetchers/google-user-triggered-fetchers)
- [Cloudflare: Verified bots policy](https://developers.cloudflare.com/bots/concepts/bot/verified-bots/policy/)
- [Cloudflare: Verified bots](https://developers.cloudflare.com/bots/concepts/bot/verified-bots/)
- [Cloudflare: Web Bot Auth](https://developers.cloudflare.com/bots/reference/bot-verification/web-bot-auth/)
- [Cloudflare blog: The age of agents, cryptographically recognizing agent traffic](https://blog.cloudflare.com/signed-agents/)
- [Cloudflare: Bot Fight Mode](https://developers.cloudflare.com/bots/get-started/bot-fight-mode/)
- [Cloudflare: Super Bot Fight Mode](https://developers.cloudflare.com/bots/get-started/super-bot-fight-mode/)
- [Cloudflare: Detect a Challenge Page response](https://developers.cloudflare.com/cloudflare-challenges/challenge-types/challenge-pages/detect-response/)
- [Cloudflare: 5xx error codes](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-5xx-errors/)
- [Cloudflare: Error 1020](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1020/)
- [Cloudflare: Browser Run pricing](https://developers.cloudflare.com/browser-run/pricing/)
- [NovaProxy: Cloudflare AI crawler default block, 15 September 2026](https://www.novaproxy.io/blog/cloudflare-will-block-ai-crawlers-by-default-on-september-15-2026-heres-what-actually-changes)
- [SEOmator: Crawl Waste Report 2026](https://seomator.com/blog/crawl-waste-report-2026)
- [W3Techs: Reverse proxy market share](https://w3techs.com/technologies/overview/proxy)
- [W3Techs: CMS market share](https://w3techs.com/technologies/overview/content_management)
- [Scrapfly: JA3/JA4 TLS fingerprinting guide](https://scrapfly.io/blog/posts/ja3-ja4-tls-fingerprinting-guide-to-detection-and-evasion)
- [c/side: Headless browser detection in 2026](https://cside.com/blog/headless-browser-detection)
- [Chrome for Developers: CrUX methodology](https://developer.chrome.com/docs/crux/methodology)
- [busyless: PageSpeed Insights API limits review](https://busyless.space/seo-apis/pagespeed-insights)
- [Known Agents: Chrome-Lighthouse user agent](https://knownagents.com/agents/chrome-lighthouse)
- [Big Iron: Wayback Machine APIs, CDX, Save Page Now, Availability](https://www.bigiron.cc/guides/wayback-machine-apis-cdx-save-page-now-and-availability)
- [Barkhausen AI: Common Crawl coverage census 2026](https://barkhausen.ai/research/common-crawl-coverage-census-2026/)
- [Krebs on Security: LG to ban residential proxies from smart TV apps](https://krebsonsecurity.com/2026/07/lg-to-ban-residential-proxies-from-smart-tv-apps/)
- [California Lawyers Association: Ninth Circuit holds data scraping is legal in hiQ v. LinkedIn](https://calawyers.org/privacy-law/ninth-circuit-holds-data-scraping-is-legal-in-hiq-v-linkedin/)
- [SSLreminder: State of TLS and internet security in early 2026](https://sslreminder.pro/blog/posts/state-of-tls-q1-2026/)
- [Bing Webmaster Blog: How to verify that Bingbot is Bingbot](https://blogs.bing.com/webmaster/August-2012/How-to-Verify-that-Bingbot-is-Bingbot/)
- [AWS: Static controls for managing bots](https://docs.aws.amazon.com/prescriptive-guidance/latest/bot-control/static-controls.html)
