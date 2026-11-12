import type { DayMeta } from './types';

const DAYS = ['nedeľa', 'pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota'];
const MONTHS = ['januára', 'februára', 'marca', 'apríla', 'mája', 'júna', 'júla', 'augusta', 'septembra', 'októbra', 'novembra', 'decembra'];

/** Miestny dátum ako RRRR-MM-DD (nie UTC – okienko sa otvára o polnoci miestneho času). */
export function toISO(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const parse = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export function isValidISO(s: string | null | undefined): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && toISO(parse(s)) === s;
}

/** „nedeľa 29. novembra 2026“ */
export function formatLong(iso: string): string {
  const d = parse(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** „29. 11.“ */
export function formatShort(iso: string): string {
  const d = parse(iso);
  return `${d.getDate()}. ${d.getMonth() + 1}.`;
}

export const weekday = (iso: string) => DAYS[parse(iso).getDay()];

export function diffDays(fromISO: string, toISO_: string): number {
  return Math.round((parse(toISO_).getTime() - parse(fromISO).getTime()) / 86_400_000);
}

/** Okienko je otvorené v deň, na ktorý pripadá, a kedykoľvek potom. */
export const isOpen = (day: DayMeta, today: string) => day.date <= today;

/** Dnešné okienko; pred adventom null, po Vianociach posledný deň. */
export function currentDay(days: DayMeta[], today: string): DayMeta | null {
  const open = days.filter((d) => isOpen(d, today));
  return open.length ? open[open.length - 1] : null;
}

/** Koľko sviec horí na adventnom venci. */
export function candlesLit(days: DayMeta[], today: string): number {
  return days.filter((d) => /adventná nedeľa/.test(d.liturgicalDay) && isOpen(d, today)).length;
}

export function daysWord(n: number): string {
  if (n === 1) return 'deň';
  if (n >= 2 && n <= 4) return 'dni';
  return 'dní';
}
