import { useEffect, useState } from 'react';
import { index } from './content';
import { href, useRoute } from './router';
import { isPreview, useToday } from './today';
import { isPlaying, startSound, stopSound } from './sound';
import { Home } from './components/Home';
import { DayView } from './components/DayView';
import { Journal } from './components/Journal';
import { About } from './components/About';
import { FlameIcon } from './components/Wreath';

export function App() {
  const route = useRoute();
  const today = useToday();
  const [sound, setSound] = useState(false);

  useEffect(() => {
    const titles = { home: index.title, day: index.title, journal: `Denník – ${index.title}`, about: `O projekte – ${index.title}` };
    if (route.name !== 'day') document.title = titles[route.name];
  }, [route]);

  const toggleSound = () => {
    if (isPlaying()) stopSound();
    else startSound();
    setSound(isPlaying());
  };

  const dark = route.name === 'home';
  return (
    <div className={dark ? 'app app--night' : 'app app--paper'}>
      <a className="skip" href="#obsah">
        Preskočiť na obsah
      </a>
      <header className="topbar">
        <a className="brand" href={href.home} aria-label={`${index.title} – domov`}>
          <FlameIcon />
          <span>{index.title}</span>
        </a>
        <button type="button" className="ghost" onClick={toggleSound} aria-pressed={sound} title="Tichý zvuk horiacej sviece">
          {sound ? 'Zvuk: zapnutý' : 'Zvuk: vypnutý'}
        </button>
      </header>
      {isPreview && (
        <p className="preview" role="status">
          Režim náhľadu: aplikácia sa správa, akoby bolo {today}. <a href="?nahlad=vypnut">Vypnúť</a>
        </p>
      )}
      <main id="obsah" tabIndex={-1}>
        {route.name === 'home' && <Home today={today} />}
        {route.name === 'day' && <DayView key={route.day} dayNumber={route.day} today={today} />}
        {route.name === 'journal' && <Journal />}
        {route.name === 'about' && <About />}
      </main>
      <nav className="tabs" aria-label="Hlavná navigácia">
        <a href={href.home} aria-current={route.name === 'home' || route.name === 'day' ? 'page' : undefined}>
          Cesta
        </a>
        <a href={href.journal} aria-current={route.name === 'journal' ? 'page' : undefined}>
          Denník
        </a>
        <a href={href.about} aria-current={route.name === 'about' ? 'page' : undefined}>
          O projekte
        </a>
      </nav>
    </div>
  );
}
