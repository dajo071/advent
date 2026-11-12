import { useState } from 'react';
import { index } from '../content';
import { formatLong } from '../dates';
import { buildIcs } from '../ics';
import { absoluteUrl, href } from '../router';
import { copyText, download } from '../share';
import { actions, useData } from '../store';

export function About() {
  const data = useData();
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState(index.days[index.days.length - 1].date);
  const url = absoluteUrl(href.home);
  const time = data.settings.prayerTime;
  return (
    <div className="page">
      <header className="day__head">
        <p className="eyebrow">O projekte</p>
        <h1>{index.title}</h1>
        <p className="lead">{index.motto}</p>
      </header>

      <section className="prose" aria-labelledby="ako">
        <h2 id="ako" className="label">
          Ako táto cesta funguje
        </h2>
        <p>
          Advent {index.year} sa začína prvou adventnou nedeľou – {formatLong(index.days[0].date)} – a vedie k slávnosti Narodenia Pána. Každý deň sa otvorí jedno okienko. Nájdeš v ňom krátky
          úryvok zo Svätého písma, zamyslenie, otázky, modlitbu, úmysel a jeden konkrétny skutok lásky. Zaberie to desať až pätnásť minút; ak je deň plný, je tu aj krátka verzia zamyslenia.
        </p>
        <p>
          Cesta má päť etáp: {index.stages.map((s) => s.name.toLowerCase()).join(', ')}. Dni na seba nadväzujú, ale žiadny nie je povinný. Vynechané okienko zostáva otvorené a môžeš sa k nemu
          vrátiť. Duchovný život nie je súťaž – nie sú tu body, série ani výčitky.
        </p>
      </section>

      <section aria-labelledby="pripomienka">
        <h2 id="pripomienka" className="label">
          Pripomienka modlitby
        </h2>
        <p>Vyber si čas, ktorý chceš denne venovať Bohu, a pridaj si ho do vlastného kalendára. Aplikácia sama žiadne upozornenia neposiela.</p>
        <div className="share__row">
          <label htmlFor="cas">Môj čas</label>
          <input id="cas" type="time" value={time} onChange={(e) => e.target.value && actions.setSettings({ prayerTime: e.target.value })} />
          <button type="button" className="btn btn--line" onClick={() => download('cesta-k-jasliam.ics', buildIcs(index, time, url), 'text/calendar;charset=utf-8')}>
            Pridať do kalendára
          </button>
        </div>
        <p className="note">Stiahne sa súbor, ktorý otvoríš v kalendári telefónu alebo počítača. Pripomienka sa bude opakovať každý deň až do 25. decembra.</p>
      </section>

      <section aria-labelledby="spolu">
        <h2 id="spolu" className="label">
          Ísť spolu
        </h2>
        <p>Advent sa lepšie prežíva v spoločenstve. Pošli odkaz priateľom, rodine alebo do skupiny, kde sa môžete o dni podeliť a modliť sa jeden za druhého.</p>
        <div className="share__row">
          <a className="btn btn--line" href={`https://wa.me/?text=${encodeURIComponent(`${index.title} – adventná duchovná cesta. Každý deň jedno okienko.\n${url}`)}`} target="_blank" rel="noopener noreferrer">
            Pozvať cez WhatsApp
          </a>
          <button
            type="button"
            className="btn btn--line"
            onClick={async () => {
              setCopied(await copyText(url));
              window.setTimeout(() => setCopied(false), 2500);
            }}
          >
            {copied ? 'Odkaz je skopírovaný' : 'Kopírovať odkaz'}
          </button>
        </div>
      </section>

      <section className="prose" aria-labelledby="zdroje">
        <h2 id="zdroje" className="label">
          Zdroje a vernosť učeniu Cirkvi
        </h2>
        <p>
          Biblické texty sú citované doslovne podľa prekladu: {index.translation}. Znenie je prevzaté zo stránky{' '}
          <a href={index.scriptureSource} target="_blank" rel="noopener noreferrer">
            mojabiblia.sk
          </a>
          ; pri každom dni je odkaz na celú kapitolu. Citujeme iba krátke úryvky. Liturgické zaradenie dní zodpovedá kalendáru Katolíckej cirkvi na Slovensku.
        </p>
        <p>
          Zamyslenia a modlitby sú pôvodné texty. Vychádzajú zo Svätého písma a z Katechizmu Katolíckej cirkvi; pri každom dni sú uvedené články Katechizmu a diela, o ktoré sa opierajú. Myšlienky
          svätých uvádzame ako parafrázy, nie ako doslovné citáty. Texty neprešli cirkevným schválením – ak v nich nájdeš nepresnosť, budeme vďační za upozornenie.
        </p>
        <p>
          Úplná evidencia zdrojov je v súbore{' '}
          <a href="https://github.com/dajo071/advent/blob/main/SOURCES.md" target="_blank" rel="noopener noreferrer">
            SOURCES.md
          </a>{' '}
          v repozitári projektu.
        </p>
      </section>

      <details className="sources">
        <summary>Náhľad pre správcu obsahu</summary>
        <p>Zobrazí aplikáciu tak, akoby bol zvolený deň – napríklad na kontrolu budúcich okienok. Platí len v tejto karte prehliadača.</p>
        <div className="share__row">
          <label htmlFor="nahlad">Dátum náhľadu</label>
          <input
            id="nahlad"
            type="date"
            min={`${index.year}-11-01`}
            max={`${index.year + 1}-01-31`}
            defaultValue={index.days[index.days.length - 1].date}
            onChange={(e) => setPreview(e.target.value)}
          />
          <button type="button" className="btn btn--line" disabled={!preview} onClick={() => location.assign(`${location.pathname}?nahlad=${preview}`)}>
            Zobraziť
          </button>
          <button type="button" className="btn btn--line" onClick={() => location.assign(`${location.pathname}?nahlad=vypnut`)}>
            Vypnúť náhľad
          </button>
        </div>
      </details>

      <section className="prose" aria-labelledby="ochrana">
        <h2 id="ochrana" className="label">
          Súkromie
        </h2>
        <p>
          Aplikácia nemá používateľské účty, nepoužíva cookies, reklamu ani analytiku a nezbiera žiadne osobné údaje. Zápisky v denníku, označenia dní a nastavenia sa ukladajú iba v tvojom
          prehliadači. Zvuk sviece vzniká priamo v zariadení a je predvolene vypnutý. Stránku hostí služba GitHub Pages, ktorá ako každý webový server technicky spracúva IP adresu návštevníka.
        </p>
      </section>
    </div>
  );
}
