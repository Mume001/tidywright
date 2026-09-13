# 0001 Popravka mora preživjeti otkazivanje pretplate

Datum: 12.09.2026.
Status: prihvaćeno

## Kontekst

Sedam proizvoda u kategoriji radi automatsko popravljanje SEO-a. Skoro svi ubacuju izmjene
JavaScriptom preko stranice. SearchAtlas u vlastitoj dokumentaciji navodi da se izmjene
vide u razvojnim alatima browsera ali ne u CMS-u. Kod Alli AI korisnici prijavljuju da se
izmjene vrate kad se otkaže pretplata. Ahrefs je pustio istu funkciju kao dodatak na svoj
plan, čime je samostalni JavaScript overlay ostao bez odbrane.

## Odluka

Popravke se upisuju u sistem koji kupac posjeduje: njegov WordPress, njegov repozitorij,
ili mu se daju kao patch fajl. Edge worker postoji samo kao posljednja opcija i jasno se
označava kao privremen.

## Zašto

- Jedina stvar koja nas razlikuje u gustoj kategoriji.
- JavaScript overlay ne vide crawleri koji ne izvršavaju JavaScript, uključujući GPTBot i
  ClaudeBot.
- Odgovor konkurencije na to je posluživanje drugačijeg HTML-a botovima, što je blizu
  cloakinga i nosi nepriznati rizik.
- Finansijski: plafon kupaca je novi kupci podijeljeni odlivom. Sve što smanjuje odliv
  vrijedi više od svega što povećava priliv. Popravka koja ostaje je razlog da se pretplata
  ne otkaže.

## Posljedice

- Prvi kanal isporuke je WordPress plugin, ne skripta.
- Treba graditi konektore, što je više posla nego jedan snippet.
- Marketinška poruka i ekran Konekcije se grade oko ove rečenice.
