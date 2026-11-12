import { useRef, useState } from 'react';
import { index } from '../content';
import { formatLong } from '../dates';
import { href } from '../router';
import { download } from '../share';
import { actions, getData, keyOf, sanitize, useData } from '../store';

export function Journal() {
  const data = useData();
  const [msg, setMsg] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const entries = index.days.filter((d) => data.notes[keyOf(index.year, d.day)]);
  const saved = data.saved.filter((s) => s.key.startsWith(`${index.year}-`));
  const hasAnything = entries.length > 0 || saved.length > 0 || Object.keys(data.done).length > 0;
  const stamp = new Date().toISOString().slice(0, 10);

  const exportJson = () => download(`cesta-k-jasliam-zaloha-${stamp}.json`, JSON.stringify({ app: 'cesta-k-jasliam', exportedAt: new Date().toISOString(), ...getData() }, null, 2), 'application/json');

  const exportText = () => {
    const parts = [`${index.title} – môj adventný denník ${index.year}`, ''];
    for (const d of entries) parts.push(`${d.day}. deň – ${formatLong(d.date)} – ${d.title}`, data.notes[keyOf(index.year, d.day)].text.trim(), '');
    if (saved.length) {
      parts.push('Odložené myšlienky', '');
      for (const s of saved) parts.push(`– ${s.text}`);
    }
    download(`moj-adventny-dennik-${index.year}.txt`, parts.join('\n'), 'text/plain;charset=utf-8');
  };

  const importJson = async (f: File | undefined) => {
    if (!f) return;
    try {
      const parsed: unknown = JSON.parse(await f.text());
      if (!parsed || typeof parsed !== 'object' || (parsed as { app?: unknown }).app !== 'cesta-k-jasliam') throw new Error('format');
      const incoming = sanitize(parsed);
      const cur = getData();
      // Zlúčenie: zápisky zo zálohy doplnia existujúce; pri zhode dňa vyhrá novší zápis.
      const notes = { ...cur.notes };
      for (const [k, n] of Object.entries(incoming.notes)) if (!notes[k] || notes[k].updatedAt < n.updatedAt) notes[k] = n;
      const savedAll = [...cur.saved];
      for (const s of incoming.saved) if (!savedAll.some((x) => x.key === s.key && x.text === s.text)) savedAll.push(s);
      actions.replaceAll({ ...cur, notes, done: { ...incoming.done, ...cur.done }, saved: savedAll });
      setMsg(`Záloha je načítaná. Počet zápiskov v zálohe: ${Object.keys(incoming.notes).length}.`);
    } catch {
      setMsg('Tento súbor nie je zálohou z tejto aplikácie.');
    }
    if (file.current) file.current.value = '';
  };

  return (
    <div className="page">
      <header className="day__head">
        <p className="eyebrow">Súkromný priestor</p>
        <h1>Môj adventný denník</h1>
        <p className="lead">Čo ťa oslovilo, čo si uvedomuješ, za čo ďakuješ, za čo sa chceš modliť, čo chceš zmeniť.</p>
      </header>

      <section className="card card--privacy" aria-labelledby="sukromie">
        <h2 id="sukromie" className="label">
          Kde sú moje zápisky
        </h2>
        <p>
          Zápisky sa ukladajú <strong>iba do pamäte prehliadača v tomto zariadení</strong>. Neodosielajú sa na žiadny server, nevidí ich autor aplikácie ani nikto iný. Má to aj druhú stranu: v inom
          telefóne či prehliadači ich neuvidíš a ak vymažeš údaje prehliadača, stratia sa. Preto si ich občas zálohuj.
        </p>
      </section>

      <section aria-labelledby="zapisky">
        <h2 id="zapisky" className="label">
          Zápisky
        </h2>
        {entries.length === 0 ? (
          <p className="empty">Zatiaľ tu nič nie je. Zápis si môžeš urobiť pri každom otvorenom okienku – stačí pár slov.</p>
        ) : (
          <ul className="entries">
            {entries.map((d) => (
              <li key={d.day}>
                <a href={href.day(d.day)}>
                  <span className="eyebrow">
                    {d.day}. deň · {formatLong(d.date)}
                  </span>
                  <strong>{d.title}</strong>
                </a>
                <p>{data.notes[keyOf(index.year, d.day)].text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {saved.length > 0 && (
        <section aria-labelledby="odlozene">
          <h2 id="odlozene" className="label">
            Odložené myšlienky
          </h2>
          <ul className="saved">
            {saved.map((s) => {
              const n = Number(s.key.split('-')[1]);
              return (
                <li key={s.key + s.text}>
                  <p>{s.text}</p>
                  <span className="note">
                    <a href={href.day(n)}>{n}. deň</a> ·{' '}
                    <button type="button" className="link" onClick={() => actions.toggleSaved(s.key, s.text)}>
                      odstrániť
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="zaloha">
        <h2 id="zaloha" className="label">
          Záloha a prenos
        </h2>
        <div className="share__row">
          <button type="button" className="btn btn--line" onClick={exportJson} disabled={!hasAnything}>
            Stiahnuť zálohu
          </button>
          <button type="button" className="btn btn--line" onClick={exportText} disabled={entries.length === 0 && saved.length === 0}>
            Stiahnuť ako text
          </button>
          <button type="button" className="btn btn--line" onClick={() => file.current?.click()}>
            Načítať zálohu
          </button>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => void importJson(e.target.files?.[0])} />
        </div>
        <p className="note">Záloha je súbor, ktorý si uložíš k sebe. Načítaním ho preneseš do iného zariadenia; existujúce zápisky sa neprepíšu, iba doplnia.</p>
        <p className="note" role="status" aria-live="polite">
          {msg || ' '}
        </p>
        {hasAnything &&
          (confirmClear ? (
            <p className="confirm" role="alert">
              Naozaj vymazať všetky zápisky a označenia z tohto zariadenia? Nedá sa to vrátiť.{' '}
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  actions.clearAll();
                  setConfirmClear(false);
                  setMsg('Všetko je vymazané.');
                }}
              >
                Áno, vymazať
              </button>{' '}
              <button type="button" className="btn btn--line" onClick={() => setConfirmClear(false)}>
                Ponechať
              </button>
            </p>
          ) : (
            <button type="button" className="link" onClick={() => setConfirmClear(true)}>
              Vymazať všetky moje údaje z tohto zariadenia
            </button>
          ))}
      </section>
    </div>
  );
}
