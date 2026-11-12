#!/usr/bin/env node
// Kontrola obsahu: štruktúra, liturgické dátumy, biblické úryvky, zdroje, SOURCES.md.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { loadYear, ROOT } from './lib/content.mjs';
import { renderSources } from './lib/sources.mjs';

const years = readdirSync(new URL('content/', ROOT)).filter((d) => /^\d{4}$/.test(d));
let failed = false;
const loaded = [];
for (const year of years) {
  const res = loadYear(year);
  loaded.push(res);
  for (const w of res.warnings) console.warn(`⚠ ${w}`);
  for (const e of res.errors) console.error(`✗ ${e}`);
  if (res.errors.length) failed = true;
  else console.log(`✓ ${year}: ${res.days.length} dní, obsah je úplný.`);
}
const want = renderSources(loaded);
const path = new URL('SOURCES.md', ROOT);
if (!existsSync(path) || readFileSync(path, 'utf8') !== want) {
  console.error('✗ SOURCES.md nie je aktuálny – spusti „npm run sources“.');
  failed = true;
} else console.log('✓ SOURCES.md zodpovedá obsahu.');
process.exit(failed ? 1 : 0);
