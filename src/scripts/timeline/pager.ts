/**
 * Section by section paging. One screen is one section. A move freezes the
 * clip that is playing, travels one section, then starts the clip that landed.
 * No overlay, no effect on top: the cut is the transition.
 */
import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';
import { lenis } from '../animations/scroll';
import { freezeSection, playSection } from './reels';
import { qs, qsa } from '../utils/dom';

gsap.registerPlugin(Observer);

/** Travel time between sections, and the pause before another move is taken. */
const TRAVEL = 0.8;
const COOLDOWN = 260;

export function initPager(): void {
  const sections = qsa<HTMLElement>('[data-section]');
  if (sections.length < 2) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slate = qs<HTMLElement>('.hud__meta');

  let index = 0;
  let moving = false;

  const setSlate = () => {
    const label = sections[index].dataset.slate;
    if (slate && label) slate.textContent = label;
  };
  setSlate();

  const go = (next: number) => {
    if (moving || next < 0 || next >= sections.length) return;
    moving = true;
    freezeSection(sections[index]);
    index = next;
    const target = sections[index];

    const settle = () => {
      setSlate();
      playSection(target);
      // Momentum on a trackpad keeps firing after the move: ignore it briefly.
      window.setTimeout(() => (moving = false), COOLDOWN);
    };

    if (reduced || !lenis) {
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      settle();
      return;
    }

    lenis.scrollTo(target, {
      duration: TRAVEL,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      lock: true,
      onComplete: settle,
    });
  };

  Observer.create({
    type: 'wheel,touch',
    wheelSpeed: -1,
    tolerance: 18,
    preventDefault: true,
    onUp: () => go(index + 1),
    onDown: () => go(index - 1),
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowDown' || e.code === 'PageDown') go(index + 1);
    if (e.code === 'ArrowUp' || e.code === 'PageUp') go(index - 1);
  });
}
