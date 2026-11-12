#!/usr/bin/env node
// Vygeneruje SOURCES.md z obsahu všetkých ročníkov.
import { writeFileSync, readdirSync } from 'node:fs';
import { loadYear, ROOT } from './lib/content.mjs';
import { renderSources } from './lib/sources.mjs';

const years = readdirSync(new URL('content/', ROOT)).filter((d) => /^\d{4}$/.test(d));
writeFileSync(new URL('SOURCES.md', ROOT), renderSources(years.map(loadYear)));
console.log('✓ SOURCES.md vygenerovaný.');
