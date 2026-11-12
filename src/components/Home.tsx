import { index } from '../content';
import { candlesLit, currentDay, daysWord, diffDays, formatLong, formatShort, isOpen, weekday } from '../dates';
import { href } from '../router';
import { keyOf, useData } from '../store';
import { FlameIcon, Wreath } from './Wreath';

export function Home({ today }: { today: string }) {
  const data = useData();
  const { days, stages, year } = index;
  const current = currentDay(days, today);
  const christmas = `${year}-12-25`;
  const toChristmas = diffDays(today, christmas);
  const toStart = diffDays(today, days[0].date);
  const isChristmas = today >= christmas;
  const doneCount = days.filter((d) => data.done[keyOf(year, d.day)]).length;
  const openCount = days.filter((d) => isOpen(d, today)).length;

  return (
    <div className="home">
      <section className="hero" aria-labelledby="nadpis">
        <Wreath lit={candlesLit(days, today)} christmas={isChristmas} />
        <h1 id="nadpis">{index.title}</h1>
        <p className="motto">{index.motto}</p>
        <p className="today-line">
          <span className="cap">{formatLong(today)}</span>
          <span className="sep" aria-hidden="true">
            ·
          </span>
          {toStart > 0 ? (
            <span>
              advent sa začína o {toStart} {daysWord(toStart)}
            </span>
          ) : toChristmas > 0 ? (
            <span>
              do Vianoc {toChristmas === 1 ? 'zostáva' : toChristmas < 5 ? 'zostávajú' : 'zostáva'} {toChristmas} {daysWord(toChristmas)}
            </span>
          ) : (
            <span>Narodil sa nám Spasiteľ</span>
          )}
        </p>
      </section>

      <section className="today-card" aria-label="Dnešný deň">
        {current ? (
          <>
            <p className="eyebrow">
              {current.date === today ? 'Dnes' : 'Posledné okienko'} · {current.day}. deň · {stages.find((s) => s.id === current.stage)?.name}
            </p>
            <h2>{current.title}</h2>
            <p className="lead">{current.sentence}</p>
            <a className="btn btn--gold" href={href.day(current.day)}>
              Otvoriť {current.date === today ? 'dnešné okienko' : 'okienko'}
              <span className="btn__meta">asi {current.minutes} min</span>
            </a>
            {current.date !== today && <p className="hint">Cesta zostáva otvorená. Môžeš sa k nej kedykoľvek vrátiť.</p>}
          </>
        ) : (
          <>
            <p className="eyebrow">Ešte chvíľu</p>
            <h2>Prvé okienko sa otvorí {formatLong(days[0].date).replace(/ \d{4}$/, '')}</h2>
            <p className="lead">
              Advent sa začína prvou adventnou nedeľou. Dovtedy si môžeš pripraviť sviecu, tiché miesto a desať minút denne, ktoré budú patriť len tebe a Bohu.
            </p>
            <a className="btn btn--line" href={href.about}>
              Ako táto cesta funguje
            </a>
          </>
        )}
      </section>

      <section className="path" aria-labelledby="cesta">
        <div className="path__head">
          <h2 id="cesta">Adventná cesta</h2>
          {openCount > 0 && (
            <p className="progress-note">
              {doneCount === 0
                ? 'Sviečka pri okienku sa rozsvieti, keď si deň prejdeš. Žiadne okienko ti neutečie.'
                : `Máš za sebou ${doneCount} z ${openCount} otvorených okienok. Ostatné na teba počkajú.`}
            </p>
          )}
        </div>
        {stages.map((stage) => (
          <div className="stage" key={stage.id}>
            <h3>
              <span className="stage__num">{['I', 'II', 'III', 'IV', 'V'][stage.id - 1]}</span>
              <span>
                {stage.name}
                <small>
                  {stage.theme} · {stage.description}
                </small>
              </span>
            </h3>
            <ol className="windows">
              {days
                .filter((d) => d.stage === stage.id)
                .map((d) => {
                  const open = isOpen(d, today);
                  const done = !!data.done[keyOf(year, d.day)];
                  const isToday = d.date === today;
                  const sunday = /nedeľa|Narodenia/.test(d.liturgicalDay);
                  const cls = `window${open ? '' : ' window--locked'}${isToday ? ' window--today' : ''}${done ? ' window--done' : ''}${sunday ? ' window--feast' : ''}`;
                  const inner = (
                    <>
                      <span className="window__flame" aria-hidden="true">
                        {done && <FlameIcon />}
                      </span>
                      <span className="window__num">{d.day}</span>
                      <span className="window__date">
                        {weekday(d.date).slice(0, 2)} {formatShort(d.date)}
                      </span>
                    </>
                  );
                  return (
                    <li key={d.day}>
                      {open ? (
                        <a
                          className={cls}
                          href={href.day(d.day)}
                          aria-current={isToday ? 'date' : undefined}
                          aria-label={`${d.day}. deň, ${formatLong(d.date)}: ${d.title}${done ? ' – prejdené' : ''}${isToday ? ' – dnes' : ''}`}
                        >
                          {inner}
                        </a>
                      ) : (
                        <span className={cls} role="img" aria-label={`${d.day}. deň, ${formatLong(d.date)} – okienko je ešte zatvorené`}>
                          {inner}
                        </span>
                      )}
                    </li>
                  );
                })}
            </ol>
          </div>
        ))}
      </section>
    </div>
  );
}
