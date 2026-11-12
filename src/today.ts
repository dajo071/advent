import { useEffect, useState } from 'react';
import { isValidISO, toISO } from './dates';

// Náhľad pre správcu obsahu: ?nahlad=2026-12-10 zobrazí aplikáciu tak, akoby bol daný deň.
function previewDate(): string | null {
  try {
    const q = new URLSearchParams(location.search).get('nahlad');
    if (q === 'vypnut') sessionStorage.removeItem('nahlad');
    else if (isValidISO(q)) sessionStorage.setItem('nahlad', q);
    const s = sessionStorage.getItem('nahlad');
    return isValidISO(s) ? s : null;
  } catch {
    return null;
  }
}

const preview = typeof location === 'undefined' ? null : previewDate();
export const isPreview = preview !== null;

/** Dnešný dátum; obnoví sa po polnoci aj po návrate do aplikácie. */
export function useToday(): string {
  const [today, setToday] = useState(() => preview ?? toISO(new Date()));
  useEffect(() => {
    if (preview) return;
    const tick = () => setToday(toISO(new Date()));
    const id = window.setInterval(tick, 60_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);
  return today;
}
