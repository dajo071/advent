// Vytvorí text SOURCES.md z načítaných ročníkov.
const sk = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d}. ${m}. ${y}`;
};

export function renderSources(loaded) {
  const L = [];
  L.push('# Evidencia zdrojov');
  L.push('');
  L.push('> Tento súbor sa generuje automaticky príkazom `npm run sources` z priečinka `content/`. Neupravuj ho ručne – zmeny patria do súborov jednotlivých dní.');
  L.push('');
  L.push('## Ako čítať túto evidenciu');
  L.push('');
  L.push('- **Sväté písmo** – doslovné znenie úryvkov je strojovo prevzaté zo zdroja (skript `scripts/fetch-scripture.mjs`) a uložené v `content/<rok>/scripture.json`. Nikdy sa neprepisuje ručne. Zhodu so zdrojom overuje príkaz `npm run scripture:check`.');
  L.push('- **Liturgické zaradenie** – dátumy a čítania dňa boli overené podľa liturgického kalendára na <https://mojabiblia.sk/liturgicky-kalendar/>.');
  L.push('- **Katechizmus Katolíckej cirkvi (KKC)** – uvádzajú sa čísla článkov, z ktorých zamyslenie vychádza. Každé číslo bolo overené voči slovenskému zneniu na <https://dkc.kbs.sk/> (príkaz `npm run kkc:check` overuje, že článok existuje; vecnú súvislosť posúdila redakcia). Obsah článkov je v texte spravidla parafrázovaný; doslovný citát je vždy v úvodzovkách s číslom článku.');
  L.push('- **Autori** – myšlienky svätých a pápežov sú uvedené ako parafrázy s odkazom na dielo. Doslovné citáty autorov sa v texte nepoužívajú. Kde nebolo možné overiť presné miesto v diele, je to výslovne uvedené.');
  L.push('- **Zamyslenia, modlitby, otázky a výzvy** sú pôvodné texty tohto projektu. Neprešli cirkevným schválením (imprimatur).');
  L.push('');
  for (const { plan, scripture, days } of loaded) {
    L.push(`## Advent ${plan.year} (liturgický rok ${plan.liturgicalYear})`);
    L.push('');
    L.push(`- **Preklad:** ${plan.translation}`);
    L.push(`- **Zdroj biblického textu:** <${plan.scriptureSource}>`);
    L.push(`- **Dátum prevzatia textu:** ${scripture ? sk(scripture.fetchedAt) : 'neprevzaté'}`);
    L.push('- **Autorské práva:** katolícky preklad je chránený autorským právom (© Spolok svätého Vojtecha, Trnava). V aplikácii sa používajú iba krátke úryvky (najviac 8 veršov denne) s uvedením prameňa a odkazom na úplný text. O súhlas s použitím je vhodné vydavateľa požiadať.');
    L.push('');
    for (const d of days) {
      L.push(`### Deň ${d.day} – ${sk(d.date)} – ${d.title}`);
      L.push('');
      L.push(`- **Liturgické zaradenie:** ${d.liturgicalDay}`);
      L.push(`- **Sväté písmo:** ${d.scripture.bookName}, ${d.scripture.ref} (${d.scripture.verses.length} ${d.scripture.verses.length < 5 ? 'verše' : 'veršov'}, doslovná citácia)`);
      L.push(`- **Zdroj textu:** <${d.scripture.url}>`);
      L.push(`- **Katechizmus Katolíckej cirkvi:** ${d.sources.kkc.map((n) => `KKC ${n}`).join(', ')}`);
      if (d.antiphon) L.push(`- **O-antifóna:** ${d.antiphon.name} (vlastná parafráza)`);
      if (d.sources.authors.length) {
        L.push('- **Autori a dokumenty:**');
        for (const a of d.sources.authors) L.push(`  - ${a}`);
      } else L.push('- **Autori a dokumenty:** –');
      L.push('');
    }
  }
  return L.join('\n');
}
