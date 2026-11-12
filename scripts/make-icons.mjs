#!/usr/bin/env node
// Vygeneruje PNG ikony a zdieľací obrázok do public/. Spúšťa sa ručne, len keď sa mení grafika.
// Vyžaduje Playwright s prehliadačom Chromium (nie je medzi závislosťami projektu).
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');

const svg = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8');
const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/<rect width="64" height="64" rx="14" fill="#0d1525"\/>/, '');
const icon = (pad) => `<html><body style="margin:0;background:#0d1525"><svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${64 + 2 * pad} ${64 + 2 * pad}" width="100%" height="100%">${inner}</svg></body></html>`;
const og = `<html><body style="margin:0;width:1200px;height:630px;background:radial-gradient(120% 90% at 50% 0%,#1b2847,#0d1525 70%);color:#efe6d3;font-family:Georgia,serif;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
<svg viewBox="0 0 64 64" width="150" height="150">${inner}</svg>
<div style="font-size:92px;margin-top:18px;letter-spacing:1px">Cesta k jasliam</div>
<div style="font-size:36px;font-style:italic;color:#c9a35c;margin-top:22px;max-width:900px;line-height:1.35">Nepripravujme iba Vianoce.<br>Pripravujme svoje srdce na Ježiša.</div>
<div style="font-family:Arial,sans-serif;font-size:22px;letter-spacing:5px;color:#b9b3a6;margin-top:44px">ADVENTNÁ DUCHOVNÁ CESTA</div></body></html>`;

const browser = await chromium.launch();
const shot = async (html, w, h, file) => {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(html);
  await page.screenshot({ path: new URL(`../public/${file}`, import.meta.url).pathname });
  await page.close();
};
await shot(icon(0), 192, 192, 'icon-192.png');
await shot(icon(0), 512, 512, 'icon-512.png');
await shot(icon(10), 512, 512, 'icon-maskable-512.png');
await shot(icon(4), 180, 180, 'apple-touch-icon.png');
await shot(og, 1200, 630, 'og.png');
await browser.close();
console.log('✓ Ikony a og.png vygenerované.');
