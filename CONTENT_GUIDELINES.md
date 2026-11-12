# Pravidlá tvorby obsahu

Tieto pravidlá platia pre každý text, ktorý sa v aplikácii zobrazí. Väčšinu z nich stráži `npm run validate`.

## 1. Vernosť

1. **Sväté písmo sa nikdy nepíše spamäti.** Úryvok dňa sa určí v `plan.json` (kniha, kapitola, verše) a jeho znenie stiahne `npm run scripture:fetch` zo zdroja. Súbor `scripture.json` sa ručne neupravuje.
2. **Citát v texte zamyslenia** (v úvodzovkách s odkazom) musí byť overený voči tomu istému prekladu. Ak znenie overiť nevieš, použi parafrázu a odkaz v tvare `(porov. Mt 5, 23-24)`.
3. **Rozsah citácií:** najviac 8 veršov a 170 slov na deň. Preklad je chránený autorským právom.
4. **Katechizmus:** každé zamyslenie uvádza čísla článkov KKC, z ktorých vychádza (`sources.kkc`). Číslo, ktoré spomenieš v texte, musí byť aj v zozname. Pred pridaním si článok prečítaj na <https://dkc.kbs.sk/>; `npm run kkc:check -- --text` vypíše začiatky všetkých citovaných článkov.
5. **Svätí a pápeži:** myšlienku uveď ako parafrázu s dielom a miestom (`sources.authors`). Doslovný citát iba vtedy, keď máš overený prameň. Ak miesto v diele overiť nevieš, napíš to výslovne.
6. Nič, čo sa nedá overiť, sa nevydáva za fakt.

## 2. Liturgia

- Prvý deň je vždy 1. adventná nedeľa, posledný 25. december.
- Úryvok dňa sa vyberá z čítaní daného liturgického dňa. Sviatky a spomienky sa rešpektujú.
- Od 17. do 23. decembra má deň aj O-antifónu (`antiphon`); kým nie je k dispozícii overený liturgický preklad, uvádza sa vlastná parafráza a je tak označená v zdrojoch.

## 3. Štruktúra súboru dňa

```markdown
---
day: 1
title: "Krátky názov"
idea: "Hlavná duchovná myšlienka jednou vetou."
sentence: "Veta dňa – zapamätateľné posolstvo."
context: "Kde sa úryvok v Písme nachádza a čo mu predchádza."
minutes: 14
antiphon:            # iba 17. – 23. 12.
  name: "O Sapientia – Ó, Múdrosť"
  text: "…"
questions:
  - "Dve až tri otázky."
intention: "Za koho alebo za čo sa dnes modlíme."
act: "Jeden konkrétny skutok."
closing: "Veta na cestu."
sources:
  kkc: [524, 2849]
  authors:
    - "Autor, dielo, miesto – parafráza."
---

## Zamyslenie
380 – 950 slov.

## V krátkosti
60 – 150 slov.

## Modlitba
Aspoň 60 slov, končí sa „Amen.“
```

V hlavičke používaj rovné úvodzovky `"…"` na ohraničenie hodnoty a slovenské úvodzovky `„…“` vo vnútri textu. V modlitbe sa riadok v zátvorkách zobrazí ako pokyn, napríklad `(Chvíľu zostaň v tichu.)`.

## 4. Tón a štýl

- **Zamyslenie vychádza z úryvku**, nie naopak. Najprv čo text hovorí, potom čo znamená vo viere Cirkvi, potom čo robí s mojím životom.
- **Konkrétne, nie všeobecne.** Pomenuj skutočné situácie: únavu, strach, neodpustenie, osamelosť, zvyk. Vyhni sa motivačným frázam.
- **Tykanie, pokojný hlas.** Bez moralizovania, bez strašenia, bez nadšených výkričníkov.
- **Žiadny pocit viny za vynechaný deň.** Text nesmie predpokladať, že čitateľ prešiel všetky predchádzajúce dni.
- **Modlitba** je rozhovor, nie báseň. Prvá osoba, jednoduché vety, konkrétne prosby, miesto na ticho.
- **Skutok lásky** musí byť uskutočniteľný v bežný deň, konkrétny a každý deň iný. Striedaj vzťahy, modlitbu, službu, štedrosť a prácu na sebe; nie len finančné výzvy. Pri výzvach k zmiereniu pamätaj na ľudí v situácii násilia a ponechaj bezpečnú alternatívu.
- **Citlivé témy** (depresia, strata dieťaťa, rozvod, zneužívanie): píš tak, aby sa človek necítil obvinený, a kde treba, pripomeň odbornú pomoc.
- Slovenčina s úplnou diakritikou, pomlčka `–`, úvodzovky `„“`.

## 5. Nadväznosť

Dni tvoria cestu: bdenie → obrátenie → dôvera → služba → Narodenie. Každé zamyslenie má krátko nadviazať na predchádzajúci deň alebo etapu, no musí byť zrozumiteľné aj samostatne. Neopakuj hlavný obraz ani skutok z iného dňa.

## 6. Pred zverejnením

```bash
npm run sources
```

```bash
npm run validate
```

Teologicky významnejšie zmeny daj prečítať kňazovi alebo teológovi.
