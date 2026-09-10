/**
 * Section by section paging. One screen is one section. A move freezes the
 * clip that is playing, travels one section, then starts the clip that landed.
 * No overlay, no effect on top: the cut is the transition.
 */
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { freezeSection, playSection, primeSection } from './reels';
import { qs, qsa } from '../utils/dom';

gsap.registerPlugin(ScrollToPlugin);

/** Travel time between sections, and the pause before another move is taken. */
const TRAVEL = 0.8;
const COOLDOWN = 260;

let paging = false;

/** True while a move is under way, so nothing starts a clip mid-travel. */
export function isPaging(): boolean {
  return paging;
}

export function initPager(): void {
  const sections = qsa<HTMLElement>('[data-section]');
  if (sections.length < 2) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slate = qs<HTMLElement>('.hud__meta');

  let index = 0;

  const setSlate = () => {
    const label = sections[index].dataset.slate;
    if (slate && label) slate.textContent = label;
  };
  setSlate();
  // The next section is ready before anyone asks for it.
  primeSection(sections[1]);

  const go = (next: number) => {
    if (paging || next < 0 || next >= sections.length) return;
    paging = true;
    freezeSection(sections[index]);
    index = next;
    const target = sections[index];
    // Decoding starts now, not when the travel ends.
    primeSection(target);

    // A fast scroll can interrupt the travel, and then onComplete never fires.
    // The timer guarantees the move always settles and the clip always starts.
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(guard);
      setSlate();
      playSection(target);
      // Momentum on a trackpad keeps firing after the move: ignore it briefly.
      window.setTimeout(() => (paging = false), COOLDOWN);
    };
    const guard = window.setTimeout(settle, TRAVEL * 1000 + 150);

    if (reduced) {
      window.scrollTo({ top: target.offsetTop, behavior: 'auto' });
      settle();
      return;
    }

    // Lenis is stopped so it cannot answer the wheel itself; the travel is a
    // plain tween of the scroll position, which always lands on the section.
    gsap.to(window, {
      scrollTo: { y: target.offsetTop, autoKill: false },
      duration: TRAVEL,
      ease: 'power3.out',
      overwrite: true,
      onComplete: settle,
    });
  };

  // Wheel and touch are read directly rather than through a helper: one
  // gesture must move exactly one section, whether it arrives as a single
  // notch from a mouse or fifty events from a trackpad flick.
  const STEP = 40;
  const GESTURE_GAP = 260;
  let travel = 0;
  let lastEvent = 0;

  window.addEventListener(
    'wheel',
    (e) => {
      // Sideways gestures belong to the strip of clips, not to the pager.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (paging) return;

      const now = performance.now();
      if (now - lastEvent > GESTURE_GAP) travel = 0;
      lastEvent = now;
      travel += e.deltaY;

      if (travel > STEP) {
        travel = 0;
        go(index + 1);
      } else if (travel < -STEP) {
        travel = 0;
        go(index - 1);
      }
    },
    { passive: false },
  );

  let touchStart = 0;
  window.addEventListener('touchstart', (e) => (touchStart = e.touches[0]?.clientY ?? 0), {
    passive: true,
  });
  window.addEventListener(
    'touchmove',
    (e) => {
      if (paging) return;
      const y = e.touches[0]?.clientY ?? 0;
      const dy = touchStart - y;
      if (Math.abs(dy) < 60) return;
      touchStart = y;
      go(index + (dy > 0 ? 1 : -1));
    },
    { passive: true },
  );

  window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowDown' || e.code === 'PageDown') go(index + 1);
    if (e.code === 'ArrowUp' || e.code === 'PageUp') go(index - 1);
  });
}
