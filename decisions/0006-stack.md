# 0006 Tehnički stack prve verzije

Datum: 13.09.2026.
Status: prihvaćeno

## Odluka

- Next.js (App Router) i TypeScript za web, izvještaj i embed skriptu
- Supabase za Postgres, prijavu i fajlove
- Zaseban Node radnik za skeniranje i generisanje popravki, na malom serveru, s redom
  poslova u Postgresu
- Jedan dobavljač jezičkog modela, jeftina klasa, strukturirani JSON izlaz
- Resend za email
- Cloudflare Turnstile za zaštitu obrasca
- Vercel za web, Hetzner ili sličan VPS za radnika
- Stripe tek u fazi 2

## Zašto

- Jedan jezik za sve dijelove. Manje prebacivanja za jednog čovjeka i za Claude Code.
- Supabase daje prijavu, prava pristupa i fajlove bez sedmica posla. Vezivanje je
  prihvatljivo za proizvod koji još nema kupce. Baza je običan Postgres, pa izlaz postoji.
- Skeniranje ne pripada u serverless funkciju: traje, treba mrežni pristup prema van, i
  mora da se ograničava. Radnik na VPS-u je jeftin i predvidiv.
- Red poslova u Postgresu umjesto Redisa: manje pokretnih dijelova, dovoljno za stotine
  audita dnevno. Redis kad zatreba.
- Prva verzija ne renderuje JavaScript. Playwright ulazi tek kad se pokaže da ga stranice
  agencijskih prospekata traže.

## Posljedice

- Struktura repozitorija u `docs/08-architecture.md` se pojednostavljuje: u prvoj verziji
  nema paketa connectors ni plugins.
- Radnik i web dijele paket shared s tipovima i schemom.
