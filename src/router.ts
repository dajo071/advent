// Jednoduché smerovanie cez „#“ – funguje na GitHub Pages bez nastavovania servera.
import { useEffect, useState } from 'react';

export type Route = { name: 'home' } | { name: 'day'; day: number } | { name: 'journal' } | { name: 'about' };

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#\/?/, '');
  const m = path.match(/^den\/(\d{1,2})$/);
  if (m) return { name: 'day', day: Number(m[1]) };
  if (path === 'dennik') return { name: 'journal' };
  if (path === 'o-projekte') return { name: 'about' };
  return { name: 'home' };
}

export const href = {
  home: '#/',
  day: (n: number) => `#/den/${n}`,
  journal: '#/dennik',
  about: '#/o-projekte',
};

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(location.hash));
  useEffect(() => {
    const on = () => {
      setRoute(parseRoute(location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

/** Úplná adresa na zdieľanie. */
export function absoluteUrl(hash: string): string {
  return `${location.origin}${location.pathname}${hash === '#/' ? '' : hash}`;
}
