# Rječnik

Riječi koje se ponavljaju kroz dokumente, objašnjene jednom. Engleski termin ostaje u
kodu, bosanski u dokumentaciji.

| Termin | Znači u ovom projektu |
|---|---|
| Agencija (agency) | naš kupac: SEO agencija, web studio, freelancer, hosting firma. Nalog u app-u. |
| Posjetilac (visitor) | anonimna osoba na sajtu agencije koja unese URL i email. Nikad nema nalog kod nas. |
| Lead | red u bazi koji nastane kad posjetilac pošalje obrazac: email, URL, pristanak. Pripada agenciji. |
| Audit | jedno skeniranje jedne stranice: dohvat, 29 provjera, ocjena, tri popravke. Ima javni token. |
| Izvještaj (report) | stranica `/r/<token>` koja prikazuje audit posjetiocu. |
| Provjera (check) | jedno pravilo (npr. "title postoji i ima 30 do 60 znakova") s kodom, težinom, grupom. |
| Grupa | četiri kategorije provjera: technical, content, structured data, social. Svaka daje podocjenu. |
| Ocjena (score) | 0 do 100, izračunata iz težina provjera. Boja: lime 80+, amber 50 do 79, coral ispod 50. |
| Popravka (fix) | konkretna zamjena: "before" (šta je sad) i "after" (šta predlažemo), s obrazloženjem. U fazi 1 title, meta, JSON-LD. |
| FixCard | komponenta koja prikazuje jednu popravku s Now/Suggested/Copy. |
| Embed | naša skripta i iframe na sajtu agencije. |
| Embed ključ (embed key) | javni `pk_live_...` string koji veže obrazac za agenciju. |
| Hostovani obrazac | ista forma na `/a/<slug>`, bez ugradnje, za agencije koje ne mogu dodati skriptu. |
| Brendiranje (branding) | logo, boja, tekstovi agencije koje posjetilac vidi. |
| Powered by | mali natpis "powered by SiteAuditServer" na free planu. Nestaje na plaćenom. |
| siteauditserver.com | domena bez našeg brenda za sve što posjetilac vidi. |
| Radnik (worker) | Node proces na Hetzneru koji izvršava audite iz reda. |
| Red (queue) | pg-boss lista poslova u Postgresu. `audit.run` je glavni posao. |
| Posao (job) | jedan zadatak u redu, s retry i timeoutom. |
| Renderovanje (render) | otvaranje stranice u Playwright browseru kad statični HTML nema sadržaj (SPA). |
| SSRF | napad gdje neko unese URL koji pokazuje na našu unutrašnju mrežu. `safeFetch` ga sprečava. |
| safeFetch | jedina funkcija u kodu koja smije dohvatiti tuđi URL. |
| RLS | Row Level Security, pravila u Postgresu ko vidi koji red. Drži izolaciju agencija. |
| JWT claim | podatak u tokenu prijave (npr. lista agencija i uloga) koji RLS čita. |
| Entitlements | tabela "šta agencija smije" (limiti, funkcije) izvedena iz plana. Jedini izvor istine za to. |
| Plan | Free, Starter, Agency, Pro. |
| Kvota | broj audita mjesečno po planu. |
| score_only | varijanta izvještaja bez popravki (kvota puna, model nedostupan, pilot test). |
| Suppression | lista adresa kojima više ne šaljemo (odjava, bounce, prigovor). |
| Bounce | email koji se nije mogao isporučiti. Hard = adresa ne postoji. |
| Complaint | primalac označio kao spam. Najskuplji signal za reputaciju. |
| Zagrijavanje (warm-up) | postepeno povećavanje broja emailova s nove domene. |
| DPA | Data Processing Agreement, ugovor po GDPR-u između agencije (kontrolor) i nas (obrađivač). |
| Kontrolor / obrađivač | ko odlučuje o podacima / ko ih obrađuje po nalogu. Agencija / mi. |
| Podobrađivač | naši dobavljači koji vide podatke (Supabase, Resend...). |
| Pristanak (consent) | checkbox posjetioca, zapisan s tekstom, verzijom i vremenom. |
| Zadržavanje (retention) | koliko dugo čuvamo lead prije automatskog brisanja. |
| Sweep | noćni posao koji briše istekle podatke. |
| Envelope encryption | tajna šifrovana ključem koji je sam šifrovan glavnim ključem iz env-a. |
| Webhook | HTTP poziv koji šaljemo agenciji (novi lead) ili primamo (Stripe, Resend). |
| HMAC potpis | dokaz da webhook zaista dolazi od nas, računa se iz tajne i tijela. |
| Idempotency | isti zahtjev dva puta daje isti rezultat bez duplog efekta. |
| Cursor paginacija | "daj mi sljedećih 50 poslije ovog reda", umjesto stranica po broju. |
| Particija | tabela fizički podijeljena po mjesecu, da se staro briše trenutno. |
| UUIDv7 | identifikator koji je nasumičan ali sortiran po vremenu. |
| Storage | Supabase fajl skladište (S3 API). Puni JSON audita, logotipi, PDF. |
| Drizzle | ORM i alat za migracije. |
| Migracija | verzionisana promjena strukture baze. |
| Expand / contract | prvo dodaj novo, kod pređe, pa tek onda obriši staro. Nikad u jednom koraku. |
| Coolify | alat na našem Hetzner serveru koji deploya Docker kontejnere iz gita. |
| Stepenica A / B / C | tri veličine infrastrukture: do 1k, do 10k, 100k agencija. |
| Heartbeat | ping koji radnik šalje svake minute; kad stane, alarm. |
| Sintetički test | pravi audit koji monitor pokreće svakih 15 min u produkciji. |
| Storybook | katalog komponenti i ekrana s mock podacima, gdje se frontend gradi prvo. |
| MSW | Mock Service Worker, lažni API u browseru dok backend ne postoji. |
| Priča (story) | jedno stanje jedne komponente u Storybooku. |
| Feature flag | prekidač u bazi koji pali/gasi funkciju bez deploya. |
| Staff | mi, s pristupom admin panelu. |
| Impersonacija | staff otvori nalog agencije read-only, zapisano. |
| Faza 1 / 2 / 3 / 4 | widget / naplata i tim / primjena popravki na sajt / zadržavanje. |
| Konektor | način da popravka stigne u sajt: WordPress plugin, GitHub App, patch. |
| Snimak (snapshot) | stanje prije primjene popravke, za vraćanje. |
| Fingerprint | heš koji isti nalaz kroz više crawlova drži kao jedan red. |
| GSC | Google Search Console, podaci o klikovima i pozicijama, kroz OAuth. |
| PSI | PageSpeed Insights API, nije u fazi 1. |
| Turnstile | Cloudflare provjera "nisi bot" bez kolačića. |
| p95 | vrijeme ispod kojeg završi 95% zahtjeva. |
| MRR | mjesečni ponavljajući prihod. |
| Churn | procenat kupaca koji otkažu mjesečno. |
| Dunning | proces kad naplata ne uspije: emailovi, retry, pad plana. |
