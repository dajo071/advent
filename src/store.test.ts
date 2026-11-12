import { describe, expect, it } from 'vitest';
import { emptyData, sanitize } from './store';

describe('záloha a obnova údajov', () => {
  it('prázdny alebo chybný vstup dá prázdne dáta', () => {
    expect(sanitize(null)).toEqual(emptyData());
    expect(sanitize('nezmysel')).toEqual(emptyData());
    expect(sanitize({ notes: 5, done: [] })).toEqual(emptyData());
  });
  it('zachová platné zápisky a zahodí neplatné', () => {
    const d = sanitize({
      done: { '2026-1': '2026-11-29T08:00:00Z', zle: 'x' },
      notes: { '2026-1': { text: 'Vďaka za dnešok.', updatedAt: '2026-11-29' }, '2026-2': { text: '   ' }, hack: { text: 'x' } },
      saved: [{ key: '2026-1', text: 'Bdejte' }, { key: 1, text: 2 }],
      settings: { short: true, fontScale: 9, prayerTime: '25:99' },
      extra: '<script>',
    });
    expect(Object.keys(d.done)).toEqual(['2026-1']);
    expect(Object.keys(d.notes)).toEqual(['2026-1']);
    expect(d.saved).toEqual([{ key: '2026-1', text: 'Bdejte' }]);
    expect(d.settings).toEqual({ short: true, fontScale: 1, prayerTime: '07:00' });
    expect('extra' in d).toBe(false);
  });
});
