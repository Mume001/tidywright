# Finansijski model

- `model.py` računa tri scenarija. Pokretanje: `python3 model.py`.
- `scenarios.json` je izlaz, mjesec po mjesec, 24 mjeseca.
- `tidywright-scenariji.pdf` je prezentacija od 16 stranica.
- `deck.py` gradi tu prezentaciju iz `scenarios.json`.

Ulazne pretpostavke i izvore cijena vidi u `docs/03-economics.md`.

Šta se mijenja kad se mijenja pretpostavka: uredi rječnik `scen` na dnu `model.py`, gdje
su za svaki scenarij zadani mjeseci gradnje, novi kupci po mjesecu i stopa odliva.
