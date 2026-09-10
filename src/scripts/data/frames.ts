/**
 * Frames pulled from Ali's short film "Chase Me Down to Main Street" (2025).
 * Stills live in `public/frames/`, extracted read-only from the master on the
 * external drive. Cut order below is the montage order: the film's own beats,
 * tightening toward the street.
 */
export type Frame = {
  src: string;
  /** Slate line for the clip strip. Names the shot, nothing more. */
  slate: string;
  /** Source timecode in the film, in seconds. Kept so cuts can be re-pulled. */
  at: number;
};

/** The hero clip was encoded silent. Set true once it carries its audio. */
export const heroClipHasAudio = false;

export const film = {
  title: 'Chase Me Down to Main Street',
  year: 2025,
  role: 'Written and directed by Ali Srouji',
  runtime: 164,
};

/** Cut order. Fast at the front, held on the last frame. */
export const montage: Frame[] = [
  { src: '/frames/frame-09.jpg', slate: 'Cap', at: 6 },
  { src: '/frames/frame-01.jpg', slate: 'Terminal', at: 52 },
  { src: '/frames/frame-03.jpg', slate: 'Wheel', at: 59.5 },
  { src: '/frames/frame-08.jpg', slate: 'Close', at: 65 },
  { src: '/frames/frame-02.jpg', slate: 'Blade', at: 85 },
  { src: '/frames/frame-07.jpg', slate: 'Floor', at: 98 },
  { src: '/frames/frame-05.jpg', slate: 'Stairwell', at: 105 },
  { src: '/frames/frame-04.jpg', slate: 'Flare', at: 112 },
  { src: '/frames/frame-06.jpg', slate: 'Run', at: 124.8 },
  { src: '/frames/frame-10.jpg', slate: 'The alley', at: 138.9 },
];

/** The frame the site lands on after the cut-in. The hero clip is encoded from
 *  this exact timecode, so the film simply carries on from where the cut stops
 *  and runs its own edits through to just before the credits. */
export const heldFrame = montage[montage.length - 1];
