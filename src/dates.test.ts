import { describe, expect, it } from 'vitest';
import { candlesLit, currentDay, daysWord, diffDays, formatLong, formatShort, isOpen, isValidISO, toISO } from './dates';
import index from './generated/2026/index.json';
import type { DayMeta } from './types';

const days = index.days as DayMeta[];

describe('dátumy', () => {
  it('formátuje dátum po slovensky', () => {
    expect(formatLong('2026-11-29')).toBe('nedeľa 29. novembra 2026');
    expect(formatLong('2026-12-25')).toBe('piatok 25. decembra 2026');
    expect(formatShort('2026-12-08')).toBe('8. 12.');
  });
  it('používa miestny dátum', () => {
    expect(toISO(new Date(2026, 10, 29, 0, 5))).toBe('2026-11-29');
    expect(toISO(new Date(2026, 10, 28, 23, 55))).toBe('2026-11-28');
  });
  it('overuje zápis dátumu', () => {
    expect(isValidISO('2026-12-10')).toBe(true);
    expect(isValidISO('2026-13-10')).toBe(false);
    expect(isValidISO('zajtra')).toBe(false);
    expect(isValidISO(null)).toBe(false);
  });
  it('počíta dni a skloňuje', () => {
    expect(diffDays('2026-11-29', '2026-12-25')).toBe(26);
    expect([1, 2, 4, 5, 26].map(daysWord)).toEqual(['deň', 'dni', 'dni', 'dní', 'dní']);
  });
});

describe('adventný kalendár 2026', () => {
  it('má 27 okienok od 1. adventnej nedele po Narodenie Pána', () => {
    expect(days).toHaveLength(27);
    expect(days[0].date).toBe('2026-11-29');
    expect(days[26].date).toBe('2026-12-25');
    expect(new Date(2026, 10, 29).getDay()).toBe(0);
  });
  it('budúce okienka sú zatvorené, dnešné a minulé otvorené', () => {
    expect(isOpen(days[0], '2026-11-28')).toBe(false);
    expect(isOpen(days[0], '2026-11-29')).toBe(true);
    expect(isOpen(days[5], '2026-11-29')).toBe(false);
    expect(isOpen(days[0], '2026-12-20')).toBe(true);
    expect(days.every((d) => isOpen(d, '2027-01-10'))).toBe(true);
  });
  it('určuje dnešné okienko', () => {
    expect(currentDay(days, '2026-11-12')).toBeNull();
    expect(currentDay(days, '2026-11-29')?.day).toBe(1);
    expect(currentDay(days, '2026-12-08')?.day).toBe(10);
    expect(currentDay(days, '2026-12-31')?.day).toBe(27);
  });
  it('zapaľuje sviece podľa adventných nedieľ', () => {
    expect(candlesLit(days, '2026-11-28')).toBe(0);
    expect(candlesLit(days, '2026-11-29')).toBe(1);
    expect(candlesLit(days, '2026-12-05')).toBe(1);
    expect(candlesLit(days, '2026-12-06')).toBe(2);
    expect(candlesLit(days, '2026-12-13')).toBe(3);
    expect(candlesLit(days, '2026-12-20')).toBe(4);
    expect(candlesLit(days, '2026-12-25')).toBe(4);
  });
});
