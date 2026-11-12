# Cesta k jasliam

**Digitálna adventná duchovná cesta.** Každý deň adventu jedno okienko: Božie slovo, zamyslenie, modlitba, úmysel a jeden skutok lásky.

> Nepripravujme iba Vianoce. Pripravujme svoje srdce na Ježiša.

Aplikácia: <https://dajo071.github.io/advent/> (po zapnutí GitHub Pages, pozri [Nasadenie](#nasadenie))

## Čo aplikácia robí

- **27 okienok** od 1. adventnej nedele (29. 11. 2026) po Narodenie Pána (25. 12. 2026), podľa liturgického kalendára, nie od 1. decembra.
- Okienko sa otvorí v deň, na ktorý pripadá, a zostáva otvorené. Budúce dni sú zatvorené.
- Každý deň: úryvok zo Svätého písma s kontextom, zamyslenie (celé alebo v krátkosti), minúta ticha, otázky, súkromný zápis, modlitba, úmysel, skutok lásky, záverečná veta.
- **Denník** uložený iba v prehliadači používateľa, so zálohou a obnovou zo súboru.
- Zdieľanie dňa alebo verša (systémové zdieľanie, WhatsApp, kopírovanie odkazu), pripomienka modlitby ako udalosť do kalendára, voliteľný zvuk sviece (predvolene vypnutý).
- Funguje ako PWA: dá sa pridať na plochu telefónu a po prvom otvorení beží aj bez internetu.
- Žiadne účty, cookies, analytika ani body a série.

## Technológie a prečo

| Voľba | Dôvod |
| --- | --- |
| Vite + React + TypeScript | Výsledkom sú statické súbory, ktoré GitHub Pages hostí zadarmo. Netreba server ani databázu. |
| Vlastné CSS s premennými | Malá aplikácia s vlastným vizuálnym štýlom; jeden súbor `src/styles.css` sa udržiava ľahšie než ďalšia knižnica. |
| Obsah v Markdowne (`content/`) | Texty sa dajú upravovať bez zásahu do kódu, aj priamo na GitHube. |
| Písma v balíku (Fontsource) | Nič sa nenačítava od tretích strán. |
| `vite-plugin-pwa` | Inštalácia na plochu a práca offline. |

## Štruktúra repozitára

```
content/2026/plan.json        plán dní: dátum, liturgické zaradenie, etapa, biblický odkaz
content/2026/scripture.json   doslovné znenie úryvkov (generuje skript, neupravovať ručne)
content/2026/days/NN.md       texty jedného dňa
scripts/                      kontrola obsahu, sťahovanie citácií, generovanie SOURCES.md
src/                          aplikácia (komponenty, štýly, logika dátumov a úložiska)
public/                       ikony a statické súbory
.github/workflows/            kontrola, testy, nasadenie
SOURCES.md                    evidencia zdrojov (generovaná)
```

## Spustenie u seba

Potrebuješ Node.js 20 alebo novší.

```bash
npm install
```

```bash
npm run dev
```

Aplikácia beží na `http://localhost:5173/advent/`.

Ďalšie príkazy:

| Príkaz | Čo robí |
| --- | --- |
| `npm run validate` | Skontroluje úplnosť obsahu, dátumy, biblické odkazy, zdroje a aktuálnosť `SOURCES.md`. |
| `npm test` | Testy logiky dátumov, úložiska a zápisu veršov. |
| `npm run build` | Kontrola, typy a produkčné zostavenie do `dist/`. |
| `npm run sources` | Znovu vygeneruje `SOURCES.md`. |
| `npm run scripture:fetch` | Stiahne znenie úryvkov podľa `plan.json` z mojabiblia.sk. |
| `npm run scripture:check` | Porovná uložené úryvky so zdrojom. |
| `npm run kkc:check` | Overí, že citované články Katechizmu existujú na dkc.kbs.sk. |

### Náhľad budúcich dní

Kto spravuje obsah, môže si aplikáciu pozrieť tak, akoby bol iný deň: pridaj za adresu `?nahlad=2026-12-10`. Vypne sa cez `?nahlad=vypnut` alebo zatvorením karty. Zamykanie dní je vec používateľskej skúsenosti, nie zabezpečenia – obsah je verejný v tomto repozitári.

## Úprava obsahu

1. Otvor `content/2026/days/NN.md` a uprav text. Štruktúru súboru opisuje [CONTENT_GUIDELINES.md](CONTENT_GUIDELINES.md).
2. Ak meníš biblický úryvok, zmeň ho v `content/2026/plan.json` a spusti `npm run scripture:fetch`.
3. Spusti `npm run sources` a `npm run validate`.
4. Po odoslaní do vetvy `main` sa zmena sama skontroluje a nasadí.

### Ďalší ročník

Vytvor `content/2027/` s rovnakou štruktúrou (`plan.json`, `days/`), spusti `npm run scripture:fetch 2027` a v `src/content.ts` zmeň rok. Kontrola sama overí, že prvý deň je 1. adventná nedeľa daného roka.

## Nasadenie

Nasadenie robí GitHub Actions (`.github/workflows/deploy.yml`) pri každej zmene vo vetve `main`.

Jednorazové nastavenie v repozitári na GitHube: **Settings → Pages → Build and deployment → Source: GitHub Actions**. Potom spusti workflow „Kontrola a nasadenie“ znova (Actions → Run workflow) alebo odošli ľubovoľnú zmenu.

Premenné prostredia: žiadne tajné kľúče nie sú potrebné. Voliteľná je iba `BASE_PATH` (pozri `.env.example`); workflow ju nastavuje podľa názvu repozitára. Ak repozitár premenuješ alebo použiješ vlastnú doménu, uprav aj adresy v `index.html` (značky `og:url`, `og:image`, `canonical`).

## Súkromie a bezpečnosť

- Zápisky, označenia dní a nastavenia sú iba v `localStorage` prehliadača. Nikam sa neodosielajú.
- Aplikácia nevolá žiadne služby tretích strán. Odkazy na mojabiblia.sk a WhatsApp sa otvárajú až po kliknutí.
- Importovaná záloha sa pred použitím prečistí (`sanitize` v `src/store.ts`); texty sa vykresľujú ako obyčajný text, nie ako HTML.
- Viac v [SECURITY.md](SECURITY.md).

## Zdroje a autorské práva

- Biblické texty: Sväté písmo – katolícky preklad, © Spolok svätého Vojtecha, Trnava. Používajú sa krátke úryvky (najviac 8 veršov denne) s uvedením prameňa a odkazom na celý text. Súhlas vydavateľa zatiaľ nebol vyžiadaný; návrh žiadosti je v [docs/ziadost-ssv.md](docs/ziadost-ssv.md).
- Zamyslenia, modlitby, otázky a výzvy sú pôvodné texty projektu. Neprešli cirkevným schválením.
- Úplná evidencia je v [SOURCES.md](SOURCES.md).
- Licencia kódu a textov zatiaľ nie je určená; bez nej platí, že všetky práva sú vyhradené autorovi repozitára.

## Čo je odložené

Spoločná nástenka modlitbových úmyslov (napríklad cez Supabase). Vyžaduje moderovanie, účty alebo pozývacie kódy a spracúvanie osobných údajov podľa GDPR, preto je ponechaná ako samostatná etapa. Dovtedy spoločenstvu slúži zdieľanie do vlastnej skupiny.
