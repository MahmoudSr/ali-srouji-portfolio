import '@fontsource-variable/archivo';
import '@fontsource-variable/jetbrains-mono';
import './styles/reset.css';
import './styles/tokens.css';
import './styles/main.css';

import { initScroll } from './scripts/animations/scroll';
import { initGate } from './scripts/gate';
import { initHud } from './scripts/timeline/hud';
import { initPager } from './scripts/timeline/pager';
import { initReels } from './scripts/timeline/reels';
import { initTransitions } from './scripts/transitions';

// A reload must land on the gate, not halfway down the page the visitor left.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// Styles are in by the time this module runs, so it is safe to show the gate.
document.documentElement.classList.add('styled');

async function boot() {
  initScroll();
  initTransitions();
  initReels();
  initPager();
  initHud();
  await initGate();
}

boot();
