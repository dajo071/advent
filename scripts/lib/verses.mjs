// "33-37" → [33..37]; "1.16-17" → [1,16,17]
export function parseVerses(spec) {
  const out = [];
  for (const part of String(spec).split('.')) {
    const m = part.trim().match(/^(\d+)(?:-(\d+))?$/);
    if (!m) throw new Error(`Neplatný zápis veršov: "${spec}"`);
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    if (b < a) throw new Error(`Neplatný rozsah veršov: "${spec}"`);
    for (let i = a; i <= b; i++) out.push(i);
  }
  return out;
}
