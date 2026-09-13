# 0008 Pet tehničkih pitanja koja su stajala otvorena

Datum: 14.09.2026.
Status: prihvaćeno

## Kontekst

Poslije pisanja dokumentacije ostalo je šest otvorenih pitanja (9 do 14 u
`docs/11-open-questions.md`). Pet od njih su tehničke ili proizvodne odluke koje se mogu
donijeti iz istraživanja i sve su jeftino reverzibilne. Šesto (pravno lice) traži
Mumetovu odluku i ostaje otvoreno.

Pravilo koje sam primijenio: odluka koja se može promijeniti za manje od jednog dana rada
i manje od 100 dolara ne treba čekati sastanak. Donosi se, zapiše, i mijenja ako se
pokaže pogrešnom.

## Odluka

**1. Web ide na Vercel Pro u fazi 1.** Ne na Hetzner pored radnika.

**2. Model: GPT-5.6 Luna primarni, Claude Haiku 4.5 rezervni.** Oba iza `FixGenerator`
interfejsa, prebacivanje kroz `feature_flags.model_provider`.

**3. Besplatni plan pokazuje izvještaj odmah u iframeu**, i šalje email. Ne "provjeri
inbox".

**4. Cloudflare: obje domene kreću na Free planu.** Pro za siteauditserver.com se kupuje
kad se izmjeri da Bot Fight Mode blokira posjetioce, ne prije.

**5. Marketing tekstovi iz `28-marketing-site.md` su prijedlog koji ide u MDX kakav
jeste.** Mume ih mijenja kad F3 dođe, kroz PR, ne kroz odluku.

## Zašto

**1. Vercel.** Dvadeset dolara mjesečno protiv jednog dana postavljanja plus doživotnog
dežurstva za Next.js. Na 20 sati sedmično taj dan vrijedi više od 20 dolara. Embed
skripta i izvještaji se keširaju na Cloudflareu, pa Vercel funkcije rade samo API, što
drži račun malim. Prag za selidbu je zapisan: preko 100 dolara mjesečno, Docker slika
već postoji jer je radnik ima.

**2. Model.** Luna je 0,00112 dolara po auditu protiv 0,005 za Haiku, dakle četiri i po
puta jeftinije za posao koji je kratak i strukturiran (tri teksta po šemi, vidi
`33-model-prompts.md`). Na 900.000 audita mjesečno to je razlika od 1.000 prema 4.500
dolara. Haiku ostaje spojen jer dva dobavljača nisu luksuz nego zaštita od 429 i ispada,
a prebacivanje je jedan red konfiguracije.

**3. Izvještaj odmah.** Ovo je jedina od pet koja ima pravi kompromis, pa ide duže.

Protiv: ako se izvještaj vidi bez potvrde emaila, neko može upisati tuđu adresu i toj
osobi stigne email koji nije tražila. To je spam rizik za reputaciju domene.

Za: cijela teza proizvoda je "pokazuje popravku". Ako posjetilac mora čekati email da
vidi popravku, uništili smo demo u trenutku kad je pažnja najveća, i uništili smo
agenciji konverziju, a to je ono što ona plaća. Konkurencija koja gejtuje na email ima
lošiju konverziju i to je razlog zašto ih agencije ne vole.

Kompromis je u limitima, ne u gejtu: 3 audita po email adresi dnevno, 1 po kombinaciji
email plus host na sat, 10 po IP na sat, MX provjera domene prije slanja, suppression
lista, i automatska pauza ključa kad complaint stopa agencije pređe 0,3 posto u sedam
dana. Uz to, prvi email na adresu koju nikad nismo vidjeli nosi rečenicu "someone
requested this report from {agency site}" i odjavu u jedan klik.

Hedge: ovo je `feature_flags.free_gate_on_email`, po agenciji. Ako se pokaže da neka
agencija generiše žalbe, njoj se prekidač upali pojedinačno. Nije prepisivanje koda nego
prekidač.

**4. Cloudflare Free.** Razlog za Pro je stvaran (Bot Fight Mode se na Free planu ne može
isključiti po ruti i dio posjetilaca u iframeu dobije izazov), ali je to mjerljiva
stvar, a ne pretpostavka. Mjeri se odnosom `form_view` prema `form_submit` po ključu i
Cloudflare analitikom. Ako padne, Pro se kupi za pet minuta. Dvadeset dolara mjesečno
prije nego što postoji ijedan posjetilac je trošak bez podatka.

**5. Marketing tekstovi.** Ja ih mogu napisati, on ih mora priznati kao svoje. Nema
smisla da stoje kao "otvoreno pitanje" i blokiraju F3. Idu u MDX, mijenja ih kad ih
pročita.

## Posljedice

- `docs/11-open-questions.md` ostaje s jednim otvorenim pitanjem umjesto šest.
- F0 do F3 nemaju nijednu blokadu.
- B4 mora imati `feature_flags.free_gate_on_email` od prvog dana, po agenciji.
- B5 mora imati mjerenje `form_view` prema `form_submit` po ključu, jer je to signal
  za Cloudflare Pro.
- Troškovi stepenice A ostaju kako su u `20-infrastructure.md`, minus 20 dolara za
  Cloudflare Pro: oko 70 do 110 dolara mjesečno.
