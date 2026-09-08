import '@fontsource-variable/archivo';
import '@fontsource-variable/jetbrains-mono';
import './styles/reset.css';
import './styles/tokens.css';
import './styles/main.css';

import { initScroll } from './scripts/animations/scroll';
import { initGate } from './scripts/gate';
import { initHud } from './scripts/timeline/hud';
import { initTransitions } from './scripts/transitions';

async function boot() {
  initScroll();
  initTransitions();
  initHud();
  await initGate();
}

boot();
