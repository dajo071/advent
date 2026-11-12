#!/usr/bin/env node
// Prevedie content/<rok>/ na JSON súbory, ktoré načíta aplikácia (src/generated/).
import { mkdirSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { loadYear, ROOT } from './lib/content.mjs';

const out = new URL('src/generated/', ROOT);
rmSync(out, { recursive: true, force: true });
const years = readdirSync(new URL('content/', ROOT)).filter((d) => /^\d{4}$/.test(d)).sort();
for (const year of years) {
  const { plan, scripture, days, errors } = loadYear(year);
  if (errors.length) {
    for (const e of errors) console.error(`✗ ${e}`);
    process.exit(1);
  }
  const dir = new URL(`${year}/`, out);
  mkdirSync(dir, { recursive: true });
  const index = {
    year: plan.year,
    title: plan.title,
    motto: plan.motto,
    translation: plan.translation,
    scriptureSource: plan.scriptureSource,
    stages: plan.stages,
    days: days.map((d) => ({
      day: d.day,
      date: d.date,
      liturgicalDay: d.liturgicalDay,
      stage: d.stage,
      title: d.title,
      sentence: d.sentence,
      minutes: d.minutes,
      ref: d.scripture.ref,
    })),
  };
  void scripture;
  writeFileSync(new URL('index.json', dir), JSON.stringify(index));
  for (const d of days) writeFileSync(new URL(`day-${String(d.day).padStart(2, '0')}.json`, dir), JSON.stringify(d));
  console.log(`✓ ${year}: ${days.length} dní → src/generated/${year}/`);
}
