#!/usr/bin/env node
// Overí, že každý článok Katechizmu uvedený v obsahu existuje v slovenskom znení na dkc.kbs.sk.
// S prepínačom --text vypíše aj začiatok každého článku (na vecnú kontrolu).
import { readdirSync } from 'node:fs';
import { loadYear, ROOT } from './lib/content.mjs';

const showText = process.argv.includes('--text');
const nums = new Map();
for (const year of readdirSync(new URL('content/', ROOT)).filter((d) => /^\d{4}$/.test(d))) {
  for (const d of loadYear(year).days) for (const n of d.sources.kkc) nums.set(n, [...(nums.get(n) ?? []), `${year}/${d.day}`]);
}
let missing = 0;
for (const n of [...nums.keys()].sort((a, b) => a - b)) {
  const res = await fetch(`https://dkc.kbs.sk/dkc.php?in=${encodeURIComponent(`KKC ${n}`)}`);
  const html = await res.text();
  const i = html.indexOf(`id='kkc_${n}'`);
  if (!res.ok || i < 0) {
    console.error(`✗ KKC ${n} (dni ${nums.get(n).join(', ')}) – článok sa nenašiel`);
    missing++;
  } else if (showText) {
    const text = html.slice(i, i + 1200).replace(/<A class="out"[\s\S]*?<\/a>/gi, '').replace(/<code>\d+<\/code>/g, '').replace(/<[^>]+>/g, ' ').replace(/^[^>]*>/, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
    console.log(`KKC ${n} [${nums.get(n).join(', ')}]: ${text.slice(0, 220)}…`);
  }
  await new Promise((r) => setTimeout(r, 300));
}
console.log(missing ? `Nenájdených článkov: ${missing}` : `✓ Všetkých ${nums.size} článkov KKC existuje.`);
process.exit(missing ? 1 : 0);
