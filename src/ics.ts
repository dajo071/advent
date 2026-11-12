// Pripomienka modlitby ako udalosť do kalendára (.ics) – bez notifikácií a bez servera.
import type { YearIndex } from './types';

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

export function buildIcs(index: YearIndex, time: string, url: string, stamp = new Date()): string {
  const [hh, mm] = time.split(':');
  const first = index.days[0].date.replace(/-/g, '');
  const dtstamp = stamp.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cesta k jasliam//Advent//SK',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:cesta-k-jasliam-${index.year}@advent`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${first}T${hh}${mm}00`,
    'DURATION:PT15M',
    `RRULE:FREQ=DAILY;COUNT=${index.days.length}`,
    `SUMMARY:${esc('Cesta k jasliam – chvíľa s Bohom')}`,
    `DESCRIPTION:${esc(`Otvor si dnešné adventné okienko:\n${url}`)}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc('Cesta k jasliam – dnešné okienko')}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n') + '\r\n';
}
