import type { DayContent, YearIndex } from './types';
import index2026 from './generated/2026/index.json';

// Ďalší ročník: pridaj priečinok content/<rok>/ a tu zmeň import a ACTIVE_YEAR.
export const ACTIVE_YEAR = 2026;
export const index = index2026 as YearIndex;

const loaders = import.meta.glob<{ default: DayContent }>('./generated/2026/day-*.json');

export async function loadDay(day: number): Promise<DayContent> {
  const key = `./generated/${ACTIVE_YEAR}/day-${String(day).padStart(2, '0')}.json`;
  const loader = loaders[key];
  if (!loader) throw new Error(`Deň ${day} neexistuje.`);
  return (await loader()).default;
}
