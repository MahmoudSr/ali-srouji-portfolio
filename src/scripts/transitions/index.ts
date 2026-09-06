/** Barba.js page transitions — cinematic cuts between pages. Stub for now. */
import barba from '@barba/core';
import { gsap } from 'gsap';

export function initTransitions(): void {
  barba.init({
    transitions: [
      {
        name: 'fade',
        async leave({ current }) {
          await gsap.to(current.container, { autoAlpha: 0, duration: 0.4 });
        },
        enter({ next }) {
          gsap.from(next.container, { autoAlpha: 0, duration: 0.6 });
        },
      },
    ],
  });
}
