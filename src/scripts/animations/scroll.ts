/**
 * Scroll setup.
 *
 * Lenis is deliberately not running. This site pages one full section at a
 * time (see timeline/pager.ts), and a smooth-scroll layer fights that twice
 * over: it answers the wheel itself, so a hard flick carries the page past the
 * section, and its frame loop writes the scroll position back every frame,
 * which cancels the pager's travel outright. Native scrolling plus ScrollTrigger
 * is what the paged layout wants. If a freely scrolling page ever returns,
 * bring Lenis back here and sync it to ScrollTrigger.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScroll(): void {
  ScrollTrigger.defaults({ markers: false });
}
