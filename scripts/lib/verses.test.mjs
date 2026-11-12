import { describe, expect, it } from 'vitest';
import { parseVerses } from './verses.mjs';
import { firstAdventSunday } from './content.mjs';

describe('zápis veršov', () => {
  it('rozvinie rozsahy a zoznamy', () => {
    expect(parseVerses('33-37')).toEqual([33, 34, 35, 36, 37]);
    expect(parseVerses('1.16-17')).toEqual([1, 16, 17]);
    expect(parseVerses('21.24-27')).toEqual([21, 24, 25, 26, 27]);
  });
  it('odmietne neplatný zápis', () => {
    expect(() => parseVerses('a-b')).toThrow();
    expect(() => parseVerses('9-3')).toThrow();
  });
});

describe('prvá adventná nedeľa', () => {
  it('sedí s liturgickým kalendárom', () => {
    expect(firstAdventSunday(2025)).toBe('2025-11-30');
    expect(firstAdventSunday(2026)).toBe('2026-11-29');
    expect(firstAdventSunday(2027)).toBe('2027-11-28');
    expect(firstAdventSunday(2028)).toBe('2028-12-03');
    expect(firstAdventSunday(2022)).toBe('2022-11-27');
  });
});
