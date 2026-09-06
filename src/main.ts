import './styles/reset.css';
import './styles/tokens.css';
import './styles/main.css';

import { initScroll } from './scripts/animations/scroll';
import { initIntro } from './scripts/intro';
import { initTransitions } from './scripts/transitions';

async function boot() {
  initScroll();
  initTransitions();
  await initIntro();
}

boot();
