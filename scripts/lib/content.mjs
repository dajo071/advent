// Načítanie a kontrola obsahu jedného adventného ročníka.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { parseVerses } from './verses.mjs';

export const ROOT = new URL('../../', import.meta.url);

const BOOKS = new Set([
  'Gn', 'Ex', 'Lv', 'Nm', 'Dt', 'Joz', 'Sdc', 'Rút', '1 Sam', '2 Sam', '1 Kr', '2 Kr', '1 Krn', '2 Krn', 'Ezd', 'Neh', 'Tob', 'Jdt', 'Est',
  '1 Mach', '2 Mach', 'Jób', 'Ž', 'Prís', 'Kaz', 'Pies', 'Múd', 'Sir', 'Iz', 'Jer', 'Nár', 'Bar', 'Ez', 'Dan', 'Oz', 'Joel', 'Am', 'Abd',
  'Jon', 'Mich', 'Nah', 'Hab', 'Sof', 'Ag', 'Zach', 'Mal', 'Mt', 'Mk', 'Lk', 'Jn', 'Sk', 'Rim', '1 Kor', '2 Kor', 'Gal', 'Ef', 'Flp', 'Kol',
  '1 Sol', '2 Sol', '1 Tim', '2 Tim', 'Tít', 'Flm', 'Hebr', 'Jak', '1 Pt', '2 Pt', '1 Jn', '2 Jn', '3 Jn', 'Júd', 'Zjv',
]);

const words = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);

/** Prvá adventná nedeľa = štvrtá nedeľa pred 25. decembrom. */
export function firstAdventSunday(year) {
  const d = new Date(Date.UTC(year, 11, 25));
  const dow = d.getUTCDay();
  d.setUTCDate(25 - (dow === 0 ? 7 : dow) - 21);
  return d.toISOString().slice(0, 10);
}

function splitDoc(raw, file, errors) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) {
    errors.push(`${file}: chýba hlavička (frontmatter) medzi riadkami ---`);
    return null;
  }
  let meta;
  try {
    meta = parseYaml(m[1]);
  } catch (e) {
    errors.push(`${file}: chyba v hlavičke – ${e.message}`);
    return null;
  }
  const sections = {};
  let cur = null;
  for (const line of m[2].split('\n')) {
    const h = line.match(/^## (.+)$/);
    if (h) {
      cur = h[1].trim();
      sections[cur] = [];
    } else if (cur) sections[cur].push(line);
  }
  for (const k of Object.keys(sections)) sections[k] = sections[k].join('\n').trim();
  return { meta, sections };
}

export function loadYear(year) {
  const errors = [];
  const warnings = [];
  const dir = new URL(`content/${year}/`, ROOT);
  const plan = JSON.parse(readFileSync(new URL('plan.json', dir), 'utf8'));
  const scripturePath = new URL('scripture.json', dir);
  const scripture = existsSync(scripturePath) ? JSON.parse(readFileSync(scripturePath, 'utf8')) : null;
  if (!scripture) errors.push('Chýba scripture.json – spusti „npm run scripture:fetch“.');

  // --- liturgický kalendár ---
  const first = firstAdventSunday(plan.year);
  if (plan.days[0]?.date !== first) errors.push(`Prvý deň má byť 1. adventná nedeľa ${first}, v pláne je ${plan.days[0]?.date}.`);
  if (plan.days.at(-1)?.date !== `${plan.year}-12-25`) errors.push('Posledný deň má byť 25. december.');
  plan.days.forEach((d, i) => {
    if (d.day !== i + 1) errors.push(`plan.json: deň na pozícii ${i + 1} má číslo ${d.day}.`);
    if (i > 0) {
      const prev = new Date(plan.days[i - 1].date + 'T00:00:00Z');
      prev.setUTCDate(prev.getUTCDate() + 1);
      if (prev.toISOString().slice(0, 10) !== d.date) errors.push(`plan.json: dátum dňa ${d.day} nenadväzuje na predchádzajúci.`);
    }
    if (!plan.stages.some((s) => s.id === d.stage)) errors.push(`plan.json: deň ${d.day} má neznámu etapu.`);
    if (!d.liturgicalDay) errors.push(`plan.json: deň ${d.day} nemá liturgické zaradenie.`);
  });

  const files = readdirSync(new URL('days/', dir)).filter((f) => f.endsWith('.md')).sort();
  if (files.length !== plan.days.length) errors.push(`Počet súborov dní (${files.length}) sa nezhoduje s plánom (${plan.days.length}).`);

  const days = [];
  const seenTitles = new Map();
  const seenActs = new Map();
  for (const p of plan.days) {
    const file = `content/${year}/days/${String(p.day).padStart(2, '0')}.md`;
    const url = new URL(file, ROOT);
    if (!existsSync(url)) {
      errors.push(`${file}: súbor chýba.`);
      continue;
    }
    const doc = splitDoc(readFileSync(url, 'utf8').replace(/\r\n/g, '\n'), file, errors);
    if (!doc) continue;
    const { meta, sections } = doc;
    const err = (m) => errors.push(`${file}: ${m}`);
    const warn = (m) => warnings.push(`${file}: ${m}`);

    if (meta.day !== p.day) err(`v hlavičke je day: ${meta.day}, očakáva sa ${p.day}.`);
    for (const k of ['title', 'idea', 'sentence', 'context', 'intention', 'act', 'closing']) {
      if (typeof meta[k] !== 'string' || !meta[k].trim()) err(`chýba pole „${k}“.`);
    }
    if (!Array.isArray(meta.questions) || meta.questions.length < 2 || meta.questions.length > 3) err('otázok na zamyslenie má byť 2 – 3.');
    if (!Number.isInteger(meta.minutes) || meta.minutes < 8 || meta.minutes > 20) err('pole „minutes“ má byť celé číslo 8 – 20.');
    if (meta.antiphon && (!meta.antiphon.name || !meta.antiphon.text)) err('antifóna musí mať „name“ aj „text“.');

    const reflection = sections['Zamyslenie'] ?? '';
    const short = sections['V krátkosti'] ?? '';
    const prayer = sections['Modlitba'] ?? '';
    if (!reflection) err('chýba časť „## Zamyslenie“.');
    if (!short) err('chýba časť „## V krátkosti“.');
    if (!prayer) err('chýba časť „## Modlitba“.');
    const rw = words(reflection);
    if (rw < 380 || rw > 950) err(`zamyslenie má ${rw} slov (povolené 380 – 950).`);
    const sw = words(short);
    if (sw < 60 || sw > 150) err(`krátka verzia má ${sw} slov (povolené 60 – 150).`);
    if (words(prayer) < 60) err('modlitba je príliš krátka (menej než 60 slov).');
    if (!/Amen\.\s*$/.test(prayer)) warn('modlitba sa nekončí slovom „Amen.“');

    // --- zdroje ---
    const src = meta.sources ?? {};
    if (!Array.isArray(src.kkc) || src.kkc.length === 0) err('chýbajú odkazy na Katechizmus (sources.kkc).');
    else for (const n of src.kkc) if (!Number.isInteger(n) || n < 1 || n > 2865) err(`neplatné číslo článku KKC: ${n}.`);
    if (!Array.isArray(src.authors)) err('sources.authors musí byť zoznam (aj prázdny).');
    const all = [reflection, short, prayer, meta.context].join('\n');
    for (const m of all.matchAll(/KKC (\d+)(?:\s*[–-]\s*(\d+))?((?:, \d+)*)/g)) {
      const nums = [Number(m[1])];
      if (m[2]) for (let n = Number(m[1]) + 1; n <= Number(m[2]); n++) nums.push(n);
      for (const x of m[3].split(',').map((s) => s.trim()).filter(Boolean)) nums.push(Number(x));
      for (const n of nums) if (!src.kkc?.includes(n)) err(`text odkazuje na KKC ${n}, ktorý nie je v sources.kkc.`);
    }
    // --- biblické odkazy v texte ---
    for (const m of all.matchAll(/\(([^()]*?\d+, \d[^()]*)\)/g)) {
      for (const part of m[1].replace(/^porov\. /, '').split(';')) {
        const r = part.trim().match(/^((?:[123] )?[A-ZŽ][\p{L}]{0,4}) \d+(?:, \d+[\d\-–. ]*)?$/u);
        if (r && r[1] !== 'KKC' && !BOOKS.has(r[1])) err(`neznáma skratka biblickej knihy v odkaze „${part.trim()}“.`);
      }
    }
    if (!BOOKS.has(p.scripture.bookAbbr)) errors.push(`plan.json: deň ${p.day} – neznáma skratka knihy „${p.scripture.bookAbbr}“.`);

    // --- Sväté písmo ---
    let verses = [];
    const passage = scripture?.passages?.[p.day];
    if (!passage) err(`v scripture.json chýba úryvok pre deň ${p.day}.`);
    else {
      let expected = [];
      try {
        expected = parseVerses(p.scripture.verses);
      } catch (e) {
        err(e.message);
      }
      const got = passage.verses.map((v) => v.n);
      if (passage.ref !== p.scripture.ref) err(`scripture.json má odkaz „${passage.ref}“, plán „${p.scripture.ref}“ – spusti „npm run scripture:fetch“.`);
      if (JSON.stringify(got) !== JSON.stringify(expected)) err('verše v scripture.json nezodpovedajú plánu.');
      if (passage.verses.some((v) => !v.text?.trim())) err('niektorý verš má prázdny text.');
      if (!passage.url?.startsWith(scripture.source)) err('úryvok nemá odkaz na zdroj.');
      if (passage.verses.length > 8) err(`úryvok má ${passage.verses.length} veršov – rozsah citácie má byť najviac 8.`);
      const tw = words(passage.verses.map((v) => v.text).join(' '));
      if (tw > 170) err(`úryvok má ${tw} slov – rozsah citácie má byť najviac 170.`);
      verses = passage.verses;
    }

    for (const [map, val, label] of [[seenTitles, meta.title, 'názov'], [seenActs, meta.act, 'skutok lásky']]) {
      if (map.has(val)) err(`${label} sa opakuje (rovnaký ako deň ${map.get(val)}).`);
      map.set(val, p.day);
    }

    days.push({
      day: p.day,
      date: p.date,
      liturgicalDay: p.liturgicalDay,
      stage: p.stage,
      title: meta.title,
      idea: meta.idea,
      sentence: meta.sentence,
      minutes: meta.minutes,
      scripture: { ref: p.scripture.ref, bookName: p.scripture.bookName, context: meta.context, verses, url: passage?.url ?? '' },
      reflection,
      short,
      questions: meta.questions ?? [],
      prayer,
      antiphon: meta.antiphon ?? null,
      intention: meta.intention,
      act: meta.act,
      closing: meta.closing,
      sources: { kkc: src.kkc ?? [], authors: src.authors ?? [] },
    });
  }
  return { plan, scripture, days, errors, warnings };
}
