# Ideja u dvije minute

## Problem

Svaki SEO alat na tržištu ti kaže šta je pokvareno na sajtu. Nijedan to ne popravi.
Vlasnik malog sajta dobije listu od 38 problema, ne zna šta je od toga važno, nema koga
platiti da to odradi, i lista stoji. Agencija zna šta treba, ali naplaćuje sate za posao
koji je mehanički.

## Šta radimo

Skeniramo sajt, generišemo konkretne popravke i primijenimo ih. Ne savjete nego izmjene:
napisan title, napisan meta opis, alt tekstovi, JSON-LD blok, hreflang, preusmjerenja,
sitemap. Kupac vidi razliku prije i poslije, odobri, i izmjena ode u njegov sistem.

## Zašto bi neko birao nas

Sedam proizvoda već radi nešto slično, uključujući Ahrefs. Ali skoro svi ubacuju izmjene
JavaScriptom preko stranice. SearchAtlas u vlastitoj dokumentaciji piše da se izmjene vide
u browseru a ne u CMS-u. Skineš njihov pixel, izmjene nestanu. Kod Alli AI korisnici
prijavljuju da se sve vrati kad otkažu pretplatu.

Naša razlika je jedna rečenica: **popravka ostaje tvoja i kad odeš od nas.** Pišemo u
WordPress bazu, otvaramo pull request u repozitorij, ili dajemo patch fajl. Detalji u
`docs/07-delivery-and-safety.md`.

## Za koga

Dvije publike, jedan proizvod:

- **Vlasnik sajta** koji nema SEO stručnjaka i neće platiti 129 dolara Ahrefsu.
- **Mala agencija** koja radi SEO za klijente i hoće mehanički dio automatizovan, pod
  svojim imenom. Jedna agencija vrijedi kao sedam solo kupaca.

## Šta namjerno ne radimo

Ne gradimo indeks backlinkova, bazu volumena ključnih riječi, procjene prometa tuđih
domena, ni praćenje pozicija u velikom obimu. To su troškovi zbog kojih konkurencija
košta 129 dolara mjesečno. Razlog i brojke u `decisions/0002-buy-no-third-party-data.md`.

## Odakle je ovo došlo

Iz stvarnog audita sajta adconnecta.com, 12. septembra 2026. Audit je trajao desetak
minuta i našao 38 problema od kojih je 34 bilo mehanički popravljivo. To je bio dokaz da
jezgro radi. Taj audit se i dalje koristi kao uzorak podataka u dizajnu ekrana.
