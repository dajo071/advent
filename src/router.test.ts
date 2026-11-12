import { describe, expect, it } from 'vitest';
import { parseRoute } from './router';

describe('smerovanie', () => {
  it('rozpozná stránky', () => {
    expect(parseRoute('')).toEqual({ name: 'home' });
    expect(parseRoute('#/den/10')).toEqual({ name: 'day', day: 10 });
    expect(parseRoute('#/dennik')).toEqual({ name: 'journal' });
  });
  it('ignoruje parametre za mriežkou', () => {
    expect(parseRoute('#/den/10?nahlad=2026-12-10')).toEqual({ name: 'day', day: 10 });
    expect(parseRoute('#/?nahlad=2026-12-10')).toEqual({ name: 'home' });
  });
});
