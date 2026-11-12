#!/usr/bin/env node
// Stiahne presné znenie biblických úryvkov z mojabiblia.sk (katolícky preklad)
// podľa content/<rok>/plan.json a uloží ich do content/<rok>/scripture.json.
//   node scripts/fetch-scripture.mjs [rok]          – stiahne a zapíše
//   node scripts/fetch-scripture.mjs [rok] --check  – iba porovná so zapísaným znením
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { parseVerses } from './lib/verses.mjs';

const args = process.argv.slice(2);
const check = args.includes('--check');
const year = args.find((a) => /^\d{4}$/.test(a)) ?? '2026';
const dir = new URL(`../content/${year}/`, import.meta.url);
const plan = JSON.parse(readFileSync(new URL('plan.json', dir), 'utf8'));
const outUrl = new URL('scripture.json', dir);

const decode = (s) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));

const cache = new Map();
async function chapter(bookId, ch) {
  const url = `https://mojabiblia.sk/svatepismo/${bookId}/kniha-kapitola-${ch}/katolicky-preklad/`;
  if (!cache.has(url)) {
    const res = await fetch(url, { headers: { 'user-agent': 'advent-content-check' } });
    if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
    const html = await res.text();
    const verses = new Map();
    const parts = html.split(new RegExp(`<span class="verse" id="v-${bookId}-${ch}-`));
    for (const part of parts.slice(1)) {
      const n = Number(part.match(/^(\d+)"/)?.[1]);
      const words = [...part.matchAll(/<span class="word"[^>]*>([\s\S]*?)<\/span>/g)].map((m) => m[1]);
      const text = decode(words.join('').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
      if (n && text) verses.set(n, text);
    }
    cache.set(url, { url: res.url, verses });
    await new Promise((r) => setTimeout(r, 800));
  }
  return cache.get(url);
}

const out = { translation: plan.translation, source: plan.scriptureSource, fetchedAt: new Date().toISOString().slice(0, 10), passages: {} };
let problems = 0;
for (const d of plan.days) {
  const s = d.scripture;
  const { url, verses } = await chapter(s.bookId, s.chapter);
  const list = [];
  for (const n of parseVerses(s.verses)) {
    const text = verses.get(n);
    if (!text) {
      console.error(`✗ deň ${d.day}: ${s.ref} – verš ${n} sa v zdroji nenašiel`);
      problems++;
      continue;
    }
    list.push({ n, text });
  }
  out.passages[d.day] = { ref: s.ref, url, verses: list };
}

if (check) {
  if (!existsSync(outUrl)) {
    console.error('✗ scripture.json neexistuje');
    process.exit(1);
  }
  const cur = JSON.parse(readFileSync(outUrl, 'utf8'));
  for (const [day, p] of Object.entries(out.passages)) {
    const a = JSON.stringify(p.verses);
    const b = JSON.stringify(cur.passages?.[day]?.verses);
    if (a !== b) {
      console.error(`✗ deň ${day}: ${p.ref} – uložené znenie sa líši od zdroja`);
      problems++;
    }
  }
  console.log(problems ? `Nájdené rozdiely: ${problems}` : `✓ Všetkých ${plan.days.length} úryvkov sa zhoduje so zdrojom.`);
} else if (!problems) {
  writeFileSync(outUrl, JSON.stringify(out, null, 2) + '\n');
  console.log(`✓ Zapísaných ${plan.days.length} úryvkov do content/${year}/scripture.json`);
}
process.exit(problems ? 1 : 0);
