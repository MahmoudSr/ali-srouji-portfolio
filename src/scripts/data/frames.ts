/**
 * Stand-in frames for the cut-in montage and the hero.
 * Swap point for Ali's real footage: replace the `src` values (and later point
 * `poster`/`clip` at real video) without touching any layout or timing code.
 */
export type Frame = {
  /** Image used as a montage cut and, for the hero, the held frame. */
  src: string;
  /** Short slate line shown under the strip. Keep it factual. */
  slate: string;
};

const stand = (seed: string, w = 1600, h = 900) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

/** Order is the cut order. Fast at the front, held at the end. */
export const montage: Frame[] = [
  { src: stand('ali-street-night'), slate: 'Night exterior' },
  { src: stand('ali-portrait-window'), slate: 'Window light' },
  { src: stand('ali-desert-road'), slate: 'Road' },
  { src: stand('ali-hands-camera'), slate: 'Insert' },
  { src: stand('ali-crowd-blur'), slate: 'Crowd' },
  { src: stand('ali-sea-horizon'), slate: 'Horizon' },
  { src: stand('ali-neon-corridor'), slate: 'Corridor' },
  { src: stand('ali-smoke-stage'), slate: 'Stage' },
  { src: stand('ali-rain-glass'), slate: 'Rain' },
  { src: stand('ali-hero-hold', 2400, 1350), slate: 'Held frame' },
];

/** The frame the site lands on after the cut-in. */
export const heldFrame = montage[montage.length - 1];
