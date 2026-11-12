# Ako prispieť

Ďakujeme, že chceš pomôcť. Projekt je malý a má zostať jednoduchý.

## Čo je vítané

- Oprava preklepu, štylistiky alebo vecnej chyby v texte.
- Upozornenie na teologickú alebo biblickú nepresnosť – najlepšie s odkazom na Písmo, Katechizmus alebo iný cirkevný dokument.
- Oprava chyby v aplikácii, zlepšenie prístupnosti.

## Čo radšej najprv prediskutuj (cez Issue)

- Nové funkcie. Uprednostňujeme duchovnú hodnotu a jednoduchosť pred množstvom funkcií.
- Čokoľvek, čo by zbieralo údaje o používateľoch, pridávalo účty, analytiku, notifikácie, body alebo súťaženie. To do projektu nepatrí.

## Postup

1. Vytvor vetvu a urob zmenu.
2. Pri zmene obsahu sa drž [CONTENT_GUIDELINES.md](CONTENT_GUIDELINES.md).
3. Spusti `npm run sources`, `npm run validate` a `npm test`.
4. Otvor pull request a stručne napíš, čo a prečo meníš. Pri obsahových zmenách uveď zdroj.

Kontrola obsahu a testy bežia pri každom pull requeste automaticky.

## Zásady

- Biblický text sa neprepisuje ručne; mení sa iba cez `plan.json` a `npm run scripture:fetch`.
- Do repozitára nepatria žiadne kľúče, heslá ani osobné údaje.
- V diskusiách buď vecný a láskavý.
