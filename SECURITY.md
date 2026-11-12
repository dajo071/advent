# Bezpečnosť a ochrana údajov

## Aké údaje aplikácia spracúva

Aplikácia je statická stránka bez servera a bez databázy.

- **V zariadení používateľa** (`localStorage`, kľúč `cesta-k-jasliam:v1`): zápisky v denníku, označené dni, odložené myšlienky, nastavenia (dĺžka zamyslenia, veľkosť písma, čas modlitby).
- **Mimo zariadenia:** nič. Aplikácia neodosiela žiadne údaje, nepoužíva cookies, analytiku ani písma či skripty tretích strán.
- Hosting GitHub Pages spracúva technické údaje o návštevách (napríklad IP adresu) podľa vlastných podmienok.

Keďže prevádzkovateľ nezískava žiadne osobné údaje, nevzniká mu k zápiskom používateľov žiadna povinnosť podľa GDPR. To by sa zmenilo pri pridaní účtov alebo spoločnej nástenky.

## Zásady v kóde

- Texty od používateľa aj obsah dní sa vykresľujú ako text, nikdy ako HTML.
- Importovaná záloha prechádza funkciou `sanitize` (`src/store.ts`), ktorá ponechá iba známe polia v očakávanom tvare.
- Repozitár neobsahuje žiadne tajné kľúče a nasadenie žiadne nepotrebuje.
- Workflow nasadenia má iba oprávnenia potrebné pre GitHub Pages.

## Známe obmedzenia

- Zápisky nie sú šifrované. Kto má prístup k odomknutému zariadeniu a prehliadaču, môže si ich prečítať.
- Vymazaním údajov prehliadača sa zápisky stratia. Aplikácia preto ponúka zálohu do súboru.
- Zatvorené okienka sú vecou používateľskej skúsenosti. Obsah budúcich dní je verejne dostupný v repozitári.

## Nahlásenie problému

Bezpečnostný problém nahlás súkromne cez **Security → Report a vulnerability** v repozitári na GitHube, nie cez verejné Issue.
