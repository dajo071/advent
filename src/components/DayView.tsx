import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { index, loadDay } from '../content';
import { formatLong, isOpen } from '../dates';
import { absoluteUrl, href } from '../router';
import { canNativeShare, copyText, nativeShare, whatsappUrl } from '../share';
import { actions, isStorageOk, keyOf, useData } from '../store';
import type { DayContent } from '../types';
import { FlameIcon } from './Wreath';

const PROMPTS = ['Čo ma dnes oslovilo', 'Čo si uvedomujem', 'Za čo ďakujem', 'Za čo sa chcem modliť', 'Čo chcem zmeniť'];

const paragraphs = (text: string) => text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

function Prose({ text }: { text: string }) {
  return (
    <>
      {paragraphs(text).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
}

function Prayer({ text }: { text: string }) {
  return (
    <>
      {paragraphs(text).map((p, i) => (
        <p key={i}>
          {p.split('\n').map((line, j, arr) => (
            <span key={j} className={/^\(.*\)$/.test(line.trim()) ? 'rubric' : undefined}>
              {line}
              {j < arr.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}

function Silence() {
  const TOTAL = 60;
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (left === null || left <= 0) return;
    const id = window.setTimeout(() => setLeft(left - 1), 1000);
    return () => window.clearTimeout(id);
  }, [left]);
  const running = left !== null && left > 0;
  return (
    <section className="silence" aria-labelledby="ticho">
      <h2 id="ticho" className="label">
        Chvíľa ticha
      </h2>
      <div className={`silence__candle${running ? ' is-on' : ''}`} aria-hidden="true">
        <FlameIcon />
      </div>
      <p className="silence__text" role="status">
        {left === null && 'Skôr než pôjdeš ďalej, zostaň chvíľu pri tom, čo sa ťa dotklo.'}
        {running && 'Nič nemusíš. Len buď pred Bohom.'}
        {left === 0 && 'Ďakujem, Pane, že si tu.'}
      </p>
      {running ? (
        <button type="button" className="btn btn--line" onClick={() => setLeft(null)}>
          Ukončiť ticho ({left} s)
        </button>
      ) : (
        <button type="button" className="btn btn--line" onClick={() => setLeft(TOTAL)}>
          {left === 0 ? 'Ešte jednu minútu' : 'Minúta ticha'}
        </button>
      )}
    </section>
  );
}

function JournalBox({ noteKey }: { noteKey: string }) {
  const data = useData();
  const stored = data.notes[noteKey]?.text ?? '';
  const [text, setText] = useState(stored);
  const [status, setStatus] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  const dirty = useRef(false);

  // Uloženie s krátkym oneskorením po dopísaní.
  useEffect(() => {
    if (!dirty.current) return;
    const id = window.setTimeout(() => {
      actions.setNote(noteKey, text);
      dirty.current = false;
      setStatus(isStorageOk() ? 'Uložené v tomto zariadení.' : 'Zápis sa nepodarilo uložiť – prehliadač nepovoľuje úložisko.');
    }, 600);
    return () => window.clearTimeout(id);
  }, [text, noteKey]);
  // Uloženie pri odchode zo stránky.
  useEffect(
    () => () => {
      if (dirty.current && ref.current) actions.setNote(noteKey, ref.current.value);
    },
    [noteKey],
  );

  const change = (v: string) => {
    dirty.current = true;
    setStatus('');
    setText(v);
  };
  const addPrompt = (p: string) => {
    const next = `${text}${text && !text.endsWith('\n') ? '\n\n' : ''}${p}: `;
    flushSync(() => change(next));
    const el = ref.current;
    if (el) {
      el.focus();
      el.setSelectionRange(next.length, next.length);
    }
  };

  return (
    <section className="journal-box" aria-labelledby="zapis">
      <h2 id="zapis" className="label">
        Môj zápis
      </h2>
      <p className="note">Súkromné. Zápis zostáva iba v tomto zariadení a nikam sa neodosiela.</p>
      <div className="chips" role="group" aria-label="Pomôcky na začiatok zápisu">
        {PROMPTS.map((p) => (
          <button type="button" key={p} className="chip" onClick={() => addPrompt(p)}>
            {p}
          </button>
        ))}
      </div>
      <label className="sr-only" htmlFor="zapis-text">
        Môj zápis k dnešnému dňu
      </label>
      <textarea id="zapis-text" ref={ref} value={text} onChange={(e) => change(e.target.value)} rows={6} placeholder="Píš, čo ti prišlo na srdce…" maxLength={20000} />
      <p className="note" role="status" aria-live="polite">
        {status || ' '}
      </p>
    </section>
  );
}

function Share({ day }: { day: DayContent }) {
  const [own, setOwn] = useState('');
  const [copied, setCopied] = useState('');
  const url = absoluteUrl(href.day(day.day));
  const verse = day.scripture.verses[0];
  const dayText = `${own.trim() ? `${own.trim()}\n\n` : ''}${day.title} – ${day.sentence}\n(${index.title}, ${day.day}. deň adventu)`;
  const verseText = `${own.trim() ? `${own.trim()}\n\n` : ''}„${verse.text}“ (${day.scripture.ref.replace(/,.*/, '')}, ${verse.n})\n(${index.title}, ${day.day}. deň adventu)`;
  const copy = async (label: string, text: string) => {
    setCopied((await copyText(text)) ? label : 'Kopírovanie sa nepodarilo.');
    window.setTimeout(() => setCopied(''), 2500);
  };
  return (
    <section className="share" aria-labelledby="zdielat">
      <h2 id="zdielat" className="label">
        Podeliť sa
      </h2>
      <label htmlFor="vlastne-slovo" className="note">
        Vlastné slovo povzbudenia (nepovinné)
      </label>
      <input id="vlastne-slovo" type="text" value={own} onChange={(e) => setOwn(e.target.value)} maxLength={200} placeholder="Napríklad: Toto mi dnes pomohlo." />
      <div className="share__row">
        {canNativeShare && (
          <button type="button" className="btn btn--line" onClick={() => void nativeShare(dayText, url)}>
            Zdieľať deň
          </button>
        )}
        <a className="btn btn--line" href={whatsappUrl(dayText, url)} target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
        <button type="button" className="btn btn--line" onClick={() => void copy('Verš je skopírovaný.', `${verseText}\n${url}`)}>
          Kopírovať verš
        </button>
        <button type="button" className="btn btn--line" onClick={() => void copy('Odkaz je skopírovaný.', url)}>
          Kopírovať odkaz
        </button>
      </div>
      <p className="note" role="status" aria-live="polite">
        {copied || ' '}
      </p>
    </section>
  );
}

export function DayView({ dayNumber, today }: { dayNumber: number; today: string }) {
  const meta = index.days.find((d) => d.day === dayNumber);
  const data = useData();
  const [day, setDay] = useState<DayContent | null>(null);
  const [error, setError] = useState(false);
  const open = !!meta && isOpen(meta, today);

  useEffect(() => {
    if (!meta || !open) return;
    let alive = true;
    loadDay(meta.day).then(
      (d) => alive && setDay(d),
      () => alive && setError(true),
    );
    document.title = `${meta.day}. deň: ${meta.title} – ${index.title}`;
    return () => {
      alive = false;
    };
  }, [meta, open]);

  if (!meta) {
    return (
      <div className="page center">
        <h1>Toto okienko neexistuje</h1>
        <p>Adventná cesta má {index.days.length} dní.</p>
        <a className="btn btn--line" href={href.home}>
          Späť na cestu
        </a>
      </div>
    );
  }
  if (!open) {
    return (
      <div className="page center">
        <p className="eyebrow">{meta.day}. deň</p>
        <h1>Toto okienko je ešte zatvorené</h1>
        <p>Otvorí sa v deň, na ktorý pripadá: {formatLong(meta.date)}. Čakanie patrí k adventu.</p>
        <a className="btn btn--line" href={href.home}>
          Späť na cestu
        </a>
      </div>
    );
  }
  if (error) {
    return (
      <div className="page center">
        <h1>Obsah sa nepodarilo načítať</h1>
        <p>Skontroluj pripojenie na internet a skús to znova.</p>
        <button type="button" className="btn btn--line" onClick={() => location.reload()}>
          Skúsiť znova
        </button>
      </div>
    );
  }
  if (!day) {
    return (
      <div className="page center" role="status">
        <p>Otváram okienko…</p>
      </div>
    );
  }

  const key = keyOf(index.year, day.day);
  const done = !!data.done[key];
  const { short, fontScale } = data.settings;
  const stage = index.stages.find((s) => s.id === day.stage);
  const prev = index.days.find((d) => d.day === day.day - 1);
  const next = index.days.find((d) => d.day === day.day + 1);
  const saved = data.saved.some((s) => s.key === key && s.text === day.sentence);

  return (
    <article className="page day" style={{ ['--scale' as string]: fontScale }}>
      <header className="day__head">
        <a className="back" href={href.home}>
          ← Adventná cesta
        </a>
        <p className="eyebrow">
          {day.day}. deň · {stage?.name}
        </p>
        <h1>{day.title}</h1>
        <p className="day__meta">
          {formatLong(day.date)} · {day.liturgicalDay}
        </p>
        <p className="lead">{day.idea}</p>
        <div className="day__tools">
          <span className="note">asi {day.minutes} minút</span>
          <span className="font-tools" role="group" aria-label="Veľkosť písma">
            <button type="button" className="ghost" onClick={() => actions.setSettings({ fontScale: Math.max(0.9, +(fontScale - 0.1).toFixed(2)) })} aria-label="Zmenšiť písmo">
              A−
            </button>
            <button type="button" className="ghost" onClick={() => actions.setSettings({ fontScale: Math.min(1.4, +(fontScale + 0.1).toFixed(2)) })} aria-label="Zväčšiť písmo">
              A+
            </button>
          </span>
        </div>
      </header>

      <section className="scripture" aria-labelledby="pismo">
        <h2 id="pismo" className="label">
          Božie slovo
        </h2>
        <p className="scripture__context">{day.scripture.context}</p>
        <blockquote>
          <p>
            {day.scripture.verses.map((v, i) => (
              <span key={v.n}>
                {i > 0 && day.scripture.verses[i - 1].n !== v.n - 1 && <span className="gap"> […] </span>}
                <sup>{v.n}</sup>
                {v.text}{' '}
              </span>
            ))}
          </p>
          <footer>
            <cite>
              {day.scripture.bookName} ({day.scripture.ref})
            </cite>
          </footer>
        </blockquote>
        <p className="credit">
          {index.translation}.{' '}
          <a href={day.scripture.url} target="_blank" rel="noopener noreferrer">
            Celá kapitola na mojabiblia.sk
          </a>
        </p>
      </section>

      <section className="reflection" aria-labelledby="zamyslenie">
        <div className="reflection__head">
          <h2 id="zamyslenie" className="label">
            Zamyslenie
          </h2>
          <div className="switch" role="group" aria-label="Dĺžka zamyslenia">
            <button type="button" aria-pressed={!short} onClick={() => actions.setSettings({ short: false })}>
              Celé
            </button>
            <button type="button" aria-pressed={short} onClick={() => actions.setSettings({ short: true })}>
              V krátkosti
            </button>
          </div>
        </div>
        <div className="prose">
          <Prose text={short ? day.short : day.reflection} />
        </div>
      </section>

      <Silence />

      <section aria-labelledby="otazky">
        <h2 id="otazky" className="label">
          Otázky pre mňa
        </h2>
        <ol className="questions">
          {day.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </section>

      <JournalBox noteKey={key} />

      <section className="prayer" aria-labelledby="modlitba">
        <h2 id="modlitba" className="label">
          Modlitba
        </h2>
        {day.antiphon && <p className="antiphon">{day.antiphon.name}</p>}
        <div className="prose prose--prayer">
          <Prayer text={day.prayer} />
        </div>
      </section>

      <section className="cards">
        <div className="card" aria-labelledby="umysel">
          <h2 id="umysel" className="label">
            Dnes sa modlím za
          </h2>
          <p>{day.intention}</p>
        </div>
        <div className="card card--act" aria-labelledby="skutok">
          <h2 id="skutok" className="label">
            Skutok lásky
          </h2>
          <p>{day.act}</p>
        </div>
      </section>

      <section className="closing" aria-label="Záver dňa">
        <p className="closing__text">{day.closing}</p>
        <button type="button" className="ghost" aria-pressed={saved} onClick={() => actions.toggleSaved(key, day.sentence)}>
          {saved ? 'Myšlienka dňa je odložená v denníku' : 'Odložiť si myšlienku dňa do denníka'}
        </button>
      </section>

      <section className="done" aria-label="Označenie dňa">
        <button type="button" className={`btn ${done ? 'btn--done' : 'btn--gold'}`} aria-pressed={done} onClick={() => actions.toggleDone(key)}>
          <FlameIcon /> {done ? 'Tento deň mám za sebou' : 'Zapáliť sviečku za tento deň'}
        </button>
        <p className="note">{done ? 'Nech ťa dnešné slovo sprevádza. Kliknutím môžeš označenie zrušiť.' : 'Nie je to povinnosť ani výkon. Len tiché znamenie na tvojej ceste.'}</p>
      </section>

      <Share day={day} />

      <details className="sources">
        <summary>Z čoho toto zamyslenie vychádza</summary>
        <ul>
          <li>
            Sväté písmo: {day.scripture.bookName}, {day.scripture.ref}
          </li>
          <li>Katechizmus Katolíckej cirkvi: {day.sources.kkc.map((n) => `č. ${n}`).join(', ')}</li>
          {day.sources.authors.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </details>

      <nav className="daynav" aria-label="Susedné dni">
        {prev ? <a href={href.day(prev.day)}>← {prev.day}. deň</a> : <span />}
        {next && isOpen(next, today) ? <a href={href.day(next.day)}>{next.day}. deň →</a> : next ? <span className="note">Ďalšie okienko sa otvorí zajtra</span> : <span />}
      </nav>
    </article>
  );
}
