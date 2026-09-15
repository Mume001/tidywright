# 0010 Čiji je poziv na akciju, vlastita vidljivost, i šta smijemo obećati

Datum: 15.09.2026.
Status: prihvaćeno

## Kontekst

Poslije vizuelnog pregleda F1 primjedbe su skupljene u `docs/34-backlog.md`. Tri stavke
odatle nisu pitanja nego odluke koje su već donesene usmeno i koje treba zapisati da se
ne otvaraju ponovo. Ostatak backloga je ili zadatak (vidi `docs/31-build-plan.md`,
`docs/17-backend-spec.md`, `docs/05-checks.md`) ili pitanje koje čeka Mumeta
(`docs/11-open-questions.md`).

Tri odluke slijede, svaka sa svojim razlogom i posljedicama.

---

## 1. Poziv na akciju u agencijinom izvještaju ostaje agencijin

### Odluka

U izvještaju koji nosi brend agencije, poziv na akciju vodi agenciji. Pretplata na
Tidywright i poruka "spoji svoj sajt pa da mi to odradimo" postoje samo na auditu koji
ide s naše domene.

### Zašto

Model iz `decisions/0004` je da izvještaj nosi brend agencije i da je posjetilac njen
lead. Agencija je widget i stavila zbog tog leada. Ako poziv vodi na našu pretplatu,
uzimamo joj ono zbog čega nas je platila, i to na njenoj stranici i pod njenim imenom.
To nije samo nepošteno, nego i loš posao: agencija je kupac koji plaća mjesečno i koji
donosi desetine posjetilaca, a posjetilac je jedna pretplata od 29 dolara koju ionako
ne bismo dobili bez nje.

Lijevak za nas postoji i ne košta agenciju ništa: besplatni javni audit na
tidywright.com. Tamo je posjetilac naš od prvog klika i tamo poziv na akciju smije biti
pretplata. Dva lijevka, dvije publike, nijedan ne jede drugi.

### Posljedice

- Podnožje izvještaja na `/r/[token]` ostaje kako jeste: tekst koji agencija upiše u
  `cta_text`, link na njen `calendar_url`. U F1 se ne mijenja ništa.
- "Powered by Tidywright" na besplatnom paketu ostaje jedina naša oznaka u tuđem
  izvještaju. To je prepoznatljivost, ne poziv na akciju: vodi na našu naslovnu, nikad
  na naplatu.
- Besplatni javni audit na našoj domeni je jedino mjesto gdje stoji "spoji svoj sajt".
  Pravi se u F3 (`docs/28-marketing-site.md`, naslovna nosi naš vlastiti obrazac i pravi
  audit). Isti kod, druga strana iste kuće.
- Pitanje 18 u `docs/11-open-questions.md` je time zatvoreno.

---

## 2. Ne guramo vlastitu vidljivost kroz kupčeve sajtove

### Odluka

Ne gradimo linkove prema sebi kroz sajtove na kojima radimo. Ni kao opciju, ni kao
podrazumijevanu postavku koju kupac može isključiti, ni u jednoj popravci koju
generišemo.

### Zašto

Ubacivanje linkova prema nama radi rangiranja je shema linkova po Googleovim pravilima o
spamu. Kazna pogađa i nas i kupca. Mi prodajemo SEO, pa bi nas to koštalo dvostruko:
jednom u rangiranju, drugi put u povjerenju, jer alat koji tiho koristi kupčev sajt za
sebe nije moguće odbraniti u razgovoru sa kupcem koji to primijeti. Puno obrazloženje je
u `docs/34-backlog.md`, tačka E.

### Šta ostaje dopušteno i nesporno

- "Powered by Tidywright" u podnožju izvještaja na besplatnom paketu, sa
  `rel="nofollow sponsored"`.
- Studije slučaja uz pisani pristanak.
- Javni popis agencija koje koriste widget, uz pristanak.
- Recenzije.

### Posljedice

- Nijedna popravka koju generišemo ne smije sadržavati link prema našim domenama. To je
  obaveza za generator popravki u B3 i još jedan filter nad izlazom modela pored šest
  postojećih u `packages/shared/src/fix-guard.ts`: popravka koja spominje
  tidywright.com ili siteauditserver.com se odbacuje, sa testom u istom PR-u.
- Pravilo važi i za primjenu popravki u fazi 3, kad pišemo u kupčev WordPress i u
  kupčev repozitorij. Tamo je iskušenje veće i posljedica gora.

---

## 3. Ne obećavamo rang ni promet

### Odluka

Obećavamo izvršene ispravke i izmjerene tehničke ishode. Ne obećavamo poziciju u
pretrazi ni promet. Prozor mjerenja je 90 dana, ne 30.

### Zašto

Izvori su u `docs/35-fix-effectiveness.md`, sekcije 3 i 6.

- Google je u junu 2026. objavio dokument o alatima trećih strana u kojem doslovno piše
  da takvi alati nemaju pristup njihovim podacima o rangiranju i da ne mogu garantovati
  učinak. Taj dokument će kupac prije ili kasnije pročitati. Bolje da ga prvi citiramo
  mi.
- Maile Ohye iz Googlea daje 4 do 12 mjeseci do vidljivog poslovnog efekta, a Google za
  promjene koje se tiču kvaliteta navodi "nekoliko dana do nekoliko mjeseci".
- Core update dolazi otprilike svaka dva do tri mjeseca i traje 11 do 18 dana. Mjerenje
  na 30 dana ima ozbiljnu šansu da padne unutar rollouta ili tačno prije njega, i u oba
  slučaja mjeri šum.
- 68 posto Google pretraga u 2026. završava bez klika, a AI Overviews obaraju CTR do 58
  posto. Sajt može napredovati u rangiranju i istovremeno dobiti manje klikova. Ako to
  ne kažemo unaprijed, ispada da smo pogriješili.

On-page rad je prvih 20 do 30 posto puta. Poslije toga preuzimaju sadržaj i off-page, i
to nije ono što prodajemo.

### Posljedice

- Marketinški tekstovi, uslovi korišćenja i onboarding email koriste formulacije iz
  `docs/35-fix-effectiveness.md`, sekcija 6. Rečenica za sajt, rečenica za ugovor i
  pasus za onboarding su tamo napisani doslovno i prepisuju se, ne izmišljaju.
- Zabranjeno je pisati "podigni ranking", "garantovano više prometa", "Google-approved",
  "rezultati za 30 dana", "optimizovano za AI pretragu" i "tvoj naslov će se prikazati u
  Googleu". Puna lista je u 6.1.
- Ocjena se zove Tidywright Health Score i uz nju stoji da nije Google metrika i da ne
  predviđa poziciju.
- Izlaz modela pada pod isto pravilo. Popravka koja tvrdi da će podići rang je greška
  generatora, ne stvar ukusa, i hvata je filter u B3.
- Odluka `0008`, tačka 5, ostaje na snazi: marketinški tekstovi idu kakvi jesu i mijenjaju
  se kroz PR. Sada imaju granicu koju taj PR ne smije preći.
- Prvi ozbiljan izvještaj o efektu je na 90 dana. To mijenja i proizvod, ne samo tekst:
  dok se čeka, prikazuju se tehnički ishodi i odbrojavanje do prvog valjanog mjerenja,
  a ne prazan grafikon.

---

## Šta ovo ne rješava

Ostatak backloga. Kolačići i pristanak, newsletter kao zasebna prijava, popust na
odjavi, sloj na koji se odnosi zahtjev da brend bude samo naš, i sekvenca agencije
naspram self-serve, sve to ostaje otvoreno i zapisano je kao nova pitanja u
`docs/11-open-questions.md`.
