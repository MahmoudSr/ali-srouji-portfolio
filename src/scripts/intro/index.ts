/**
 * Cinematic intro sequence.
 * Plan: Three.js camera model on #intro-canvas → keypress (Space/Enter)
 * → GSAP timeline: shutter, film roll, burn-through → reveal main content.
 * Placeholder until the design pass; currently dismisses on keypress.
 */
import { gsap } from 'gsap';
import { qs } from '../utils/dom';

export async function initIntro(): Promise<void> {
  const intro = qs<HTMLElement>('#intro');
  if (!intro) return;

  await new Promise<void>((resolve) => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.code !== 'Enter') return;
      e.preventDefault();
      window.removeEventListener('keydown', onKey);
      gsap.to(intro, {
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => { intro.classList.add('is-done'); resolve(); },
      });
    };
    window.addEventListener('keydown', onKey);
  });
}
