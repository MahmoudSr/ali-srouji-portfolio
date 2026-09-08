/**
 * Persistent playhead HUD. Scroll position is the playhead, reported as
 * timecode, so the whole site reads as one running edit.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { qs } from '../utils/dom';

gsap.registerPlugin(ScrollTrigger);

const FPS = 24;
/** Nominal runtime of the page, in seconds, mapped across full scroll. */
const RUNTIME = 180;

export function initHud(): void {
  const tc = qs<HTMLElement>('#hud-tc');
  const fill = qs<HTMLElement>('#hud-fill');
  if (!tc || !fill) return;

  const pad = (n: number) => String(n).padStart(2, '0');

  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const frames = Math.floor(self.progress * RUNTIME * FPS);
      tc.textContent = [
        '00',
        pad(Math.floor(frames / (FPS * 60)) % 60),
        pad(Math.floor(frames / FPS) % 60),
        pad(frames % FPS),
      ].join(':');
      gsap.set(fill, { scaleX: self.progress });
    },
  });
}
