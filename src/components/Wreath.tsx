// Adventný veniec: tri fialové sviece a jedna ružová (Gaudete). Na Narodenie Pána pribudne biela.
export function FlameIcon() {
  return (
    <svg className="flame-icon" viewBox="0 0 16 24" width="12" height="18" aria-hidden="true">
      <path d="M8 1c3 4.5 6 7.6 6 12.4A6 6 0 0 1 2 13.400C2 9.800 5.200 6.200 8 1z" fill="currentColor" />
    </svg>
  );
}

const CANDLES = [
  { x: 46, color: 'var(--candle-violet)', h: 74 },
  { x: 98, color: 'var(--candle-violet)', h: 84 },
  { x: 182, color: 'var(--candle-rose)', h: 92 },
  { x: 234, color: 'var(--candle-violet)', h: 100 },
];

function Candle({ x, h, color, lit, delay }: { x: number; h: number; color: string; lit: boolean; delay: number }) {
  const top = 150 - h;
  return (
    <g>
      {lit && <circle className="glow" cx={x} cy={top - 16} r="34" style={{ animationDelay: `${delay}s` }} />}
      <rect x={x - 9} y={top} width="18" height={h} rx="2.5" fill={color} opacity={lit ? 1 : 0.55} />
      <rect x={x - 9} y={top} width="5" height={h} rx="2.5" fill="#fff" opacity="0.08" />
      <line x1={x} y1={top} x2={x} y2={top - 6} stroke="#2b2118" strokeWidth="1.4" strokeLinecap="round" />
      {lit && (
        <g className="flame" style={{ animationDelay: `${delay}s`, transformOrigin: `${x}px ${top - 6}px` }}>
          <path d={`M${x} ${top - 30}c5 8 8 12 8 17a8 8 0 0 1-16 0c0-5 3-9 8-17z`} fill="var(--flame)" />
          <path d={`M${x} ${top - 19}c2.500 4 4 6 4 8.500a4 4 0 0 1-8 0c0-2.500 1.500-4.500 4-8.500z`} fill="var(--flame-core)" />
        </g>
      )}
    </g>
  );
}

export function Wreath({ lit, christmas }: { lit: number; christmas: boolean }) {
  const label = christmas
    ? 'Adventný veniec: horia všetky štyri sviece a biela svieca Narodenia Pána.'
    : lit === 0
      ? 'Adventný veniec: sviece ešte nehoria.'
      : `Adventný veniec: ${lit === 1 ? 'horí jedna svieca' : lit === 4 ? 'horia všetky štyri sviece' : `horia ${lit} sviece`}.`;
  return (
    <svg className="wreath" viewBox="0 0 280 176" role="img" aria-label={label}>
      {CANDLES.map((c, i) => (
        <Candle key={c.x} {...c} lit={i < lit} delay={i * 0.7} />
      ))}
      {christmas && <Candle x={140} h={112} color="var(--candle-white)" lit delay={0.3} />}
      <path d="M14 152c40-9 212-9 252 0" fill="none" stroke="var(--pine)" strokeWidth="9" strokeLinecap="round" />
      <path d="M22 158c44-7 192-7 236 0" fill="none" stroke="var(--pine-dark)" strokeWidth="6" strokeLinecap="round" />
      <path d="M30 150c36-6 184-6 220 0" fill="none" stroke="var(--gold)" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}
