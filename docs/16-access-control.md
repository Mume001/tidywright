# Ko šta smije vidjeti i raditi

Uloge, matrica dozvola, i kako se to sprovodi u bazi. Pravilo: dozvola se provjerava na
tri mjesta koja se ne oslanjaju jedno na drugo. UI sakrije dugme, API odbije zahtjev, i
baza odbije red. Ako bilo koje od ta tri pukne, druga dva drže.

## Uloge

| Uloga | Vezana za | Kako nastaje |
|---|---|---|
| `visitor` | ništa, anoniman | dolazi na obrazac ili izvještaj |
| `owner` | jednu agenciju | registracija; tačno jedan po agenciji; prenosiv |
| `admin` | jednu agenciju | pozivnica od ownera |
| `member` | jednu agenciju | pozivnica od ownera ili admina |
| `client` | jedan ili više sajtova jedne agencije | pozivnica od agencije, faza 3 |
| `staff` | ništa, globalno | ručno u bazi, mi |

Jedan korisnik može imati uloge u više agencija (npr. freelancer koji radi za dvije).
Aktivna agencija se bira u gornjoj traci i čuva u sesiji.

**Uloge se ne mijenjaju zbog self-serve naloga.** Po odluci `0011`, tačka 1, nalog s
`kind = 'solo'` je jedna agencija s tačno jednim članstvom u ulozi `owner` i jednim
sajtom. Dozvole su isti red u matrici ispod, samo što `admin`, `member` i `client` nikad
ne postoje. Zato se vrijednost zove `solo`, a ne `owner`: ime uloge je već zauzeto.

## Matrica

Legenda: R čita, W piše, D briše, prazno nema pristupa.

| Resurs | visitor | member | admin | owner | client | staff |
|---|---|---|---|---|---|---|
| Vlastiti izvještaj `/r/token` | R (po tokenu) | | | | | R |
| Agencija: ime, slug | | R | RW | RW | | R |
| Brendiranje | | R | RW | RW | | R |
| Embed ključevi | | R | RW | RW | | R |
| Leadovi | | R | R, W status, D | R, W status, D | | R |
| Izvoz leadova | | | da | da | | da |
| Auditi | | R | R | R | R (svog sajta) | R |
| Podešavanja obavještenja | | | RW | RW | | |
| Webhook | | | RW | RW | | R |
| Zadržavanje podataka | | | RW | RW | | |
| Naplata | | | R | RW | | R |
| Tim: pozivanje, uloge | | | W (member, admin) | W (sve) | | |
| Prenos vlasništva | | | | W | | |
| Brisanje naloga | | | | D | | |
| Sajtovi (faza 3) | | R | RW | RW | R (svoji) | R |
| Konekcije sajta | | | RW | RW | | R |
| Popravke: odobravanje | | | W | W | W (ako mu je dozvoljeno po sajtu) | |
| Popravke: primjena | | | W | W | | |
| Vraćanje unazad | | | W | W | | |
| Admin panel | | | | | | RW |
| Impersonacija | | | | | | W, zapisano |

## Pravila koja matrica ne pokazuje

1. **Agencija vidi samo svoje redove.** Nikad, ni u jednom upitu, ni u jednom izvještaju,
   red druge agencije. Ovo drži RLS u bazi, ne aplikacija.
2. **Posjetilac nema privilegije u bazi.** Obrazac ide na naš API koji validira i upisuje
   sa servisnim ključem u ime agencije. Anonimni korisnik nema INSERT politiku ni na
   jednoj tabeli.
3. **Izvještaj je javan preko tokena.** Token od 32 znaka iz `crypto.randomBytes`, nikad
   sekvencijalan. Stranica je noindex. Obrisan lead znači 410 na izvještaju.
4. **Member ne vidi cijenu modela ni troškove.** To vidi owner u detalju audita, i staff.
5. **Client vidi samo sajtove koji su mu dodijeljeni**, i samo ako je agencija uključila
   pristup za taj sajt. Ne vidi leadove, embed, brendiranje, naplatu, tim, druge sajtove.
6. **Staff impersonacija** otvara nalog u read-only, s crvenom trakom na vrhu, i upisuje
   se u `audit_log` s razlogom koji staff mora unijeti.
7. **Owner ne može ukloniti sebe** ni sniziti sebi ulogu. Prvo prenese vlasništvo.
8. **Zadnji admin ne može biti uklonjen** ako nema ownera koji je aktivan.

## Kako se sprovodi

### U bazi (Supabase RLS)

- Svaka tabela ima kolonu `agency_id`, čak i tamo gdje se do nje može doći joinom.
  Politika poredi `agency_id` sa claimom iz JWT-a, ne radi join po `users` za svaki red.
- JWT nosi `app_metadata.agencies = [{id, role}]` (lista, jer korisnik može biti u
  više). Aktivna agencija se šalje kao zaglavlje i provjerava se da je u listi.
- Politike su `as restrictive` gdje god se traži uloga, i koriste `(select auth.uid())`
  da bi planer mogao keširati.
- `staff` je claim `app_metadata.staff = true`; politike za admin panel provjeravaju
  samo to.
- Servisni ključ koristi samo radnik i webhook rute, iz modula označenog `server-only`,
  s lint pravilom koje zabranjuje import iz `app/`.

Primjer politike za leadove, čitanje:

```sql
create policy leads_select on leads
  for select using (
    agency_id = any (
      select (a->>'id')::uuid
      from jsonb_array_elements((select auth.jwt()) -> 'app_metadata' -> 'agencies') a
    )
  );
```

Brisanje leada dodatno traži ulogu admin ili owner u toj agenciji.

### U API-ju

- Svaka ruta izvlači `agency_id` iz sesije i uloge iz JWT-a, pa provjerava matricu prije
  ičega. Nikad ne prima `agency_id` iz tijela zahtjeva kao izvor istine.
- Server actions rade isto. Nema izuzetaka za "brzi" pristup.

### U UI-ju

- Dugmad koja korisnik ne smije koristiti se ne prikazuju, ne samo onemogućavaju, osim
  gdje objašnjenje pomaže (npr. "Upgrade to remove", "Only the owner can do this").
- Ruta koju uloga ne smije vidjeti vraća 404, ne 403, da se ne otkriva postojanje.

## Dnevnik radnji (audit log)

Šta se obavezno zapisuje, sa ko, kad, na čemu, s koje IP adrese:

- prijava, neuspjela prijava, promjena lozinke, uključen MFA
- pozivnica poslata, prihvaćena, uloga promijenjena, član uklonjen, vlasništvo preneseno
- lead pregledan (samo prvi put), izvezen, obrisan
- brendiranje, webhook, zadržavanje promijenjeni
- ključ rotiran
- naplata: plan promijenjen, otkazano
- faza 3: konekcija dodata i uklonjena, popravka predložena, odobrena, primijenjena,
  vraćena, ko je odobrio
- staff: impersonacija s razlogom, prekidač promijenjen, blokada dodata

Tabela `audit_log` je append-only: nema UPDATE ni DELETE dozvole ni za servisni ključ,
samo INSERT. Čuva se 24 mjeseca. Agencija može izvesti svoj dio.

## MFA

TOTP kroz Supabase Auth, dostupan svima, obavezan za staff i za ownera kad agencija ima
više od jednog sajta u fazi 3. Enforced kroz `aal2` claim u RLS politici za osjetljive
tabele (konekcije, tim).
