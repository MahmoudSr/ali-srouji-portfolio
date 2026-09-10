/**
 * The gate: near-black REC screen, Space or tap acts as PLAY, a hard-cut
 * montage rolls, and the site lands on the held frame.
 * Resolves once the visitor is through, so the rest of the boot can continue.
 */
import { gsap } from 'gsap';
import { lenis } from '../animations/scroll';
import { heroClipHasAudio, montage, heldFrame } from '../data/frames';
import { wireSound } from '../timeline/reels';
import { qs } from '../utils/dom';

const FPS = 24;

/** Frames elapsed, as HH:MM:SS:FF. */
function timecode(totalFrames: number): string {
  const f = Math.max(0, Math.floor(totalFrames));
  const pad = (n: number) => String(n).padStart(2, '0');
  return [
    pad(Math.floor(f / (FPS * 3600))),
    pad(Math.floor(f / (FPS * 60)) % 60),
    pad(Math.floor(f / FPS) % 60),
    pad(f % FPS),
  ].join(':');
}

function preload(sources: string[]): Promise<void[]> {
  return Promise.all(
    sources.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  );
}

export async function initGate(): Promise<void> {
  const gate = qs<HTMLElement>('#gate');
  if (!gate) return;

  const framesLayer = qs<HTMLElement>('.gate__frames', gate)!;
  const tcEl = qs<HTMLElement>('#gate-tc')!;
  const loadEl = qs<HTMLElement>('#gate-load')!;
  const playhead = qs<HTMLElement>('#gate-playhead')!;
  const slate = qs<HTMLElement>('#gate-slate')!;
  const heroVideo = qs<HTMLVideoElement>('#hero-video')!;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nothing scrolls behind the gate, and nothing scrolls during the cut.
  lenis?.stop();

  // The hero holds the same frame the montage lands on, then keeps moving.
  heroVideo.poster = heldFrame.src;

  // Sound is off until asked for, same as the reels. The control only exists
  // if the clip actually carries audio.
  const heroSound = qs<HTMLButtonElement>('#hero-sound');
  if (heroClipHasAudio) wireSound(heroVideo, heroSound);
  else heroSound?.remove();
  heroVideo.src = window.matchMedia('(max-width: 760px)').matches
    ? '/video/hero-loop-720.mp4'
    : '/video/hero-loop.mp4';

  // Free-running record timecode. It is the site's clock from here on.
  const start = performance.now();
  const tick = () => {
    tcEl.textContent = timecode(((performance.now() - start) / 1000) * FPS);
  };
  gsap.ticker.add(tick);

  // Build one layer per cut so the montage is a set of hard swaps, no crossfades.
  const layers = montage.map((frame) => {
    const el = document.createElement('div');
    el.className = 'gate__frame';
    el.style.backgroundImage = `url(${frame.src})`;
    framesLayer.appendChild(el);
    return el;
  });

  // Real loading state on the ruler, so the cue only arms once cuts can be clean.
  const loadTween = gsap.to(loadEl, { scaleX: 0.85, duration: 6, ease: 'power1.out' });
  await preload(montage.map((f) => f.src));
  // Stills are in, so the cut can run clean. The hero clip loads behind the gate.
  heroVideo.preload = 'auto';
  heroVideo.load();
  loadTween.kill();
  gsap.to(loadEl, { scaleX: 1, duration: 0.4, ease: 'power2.out' });
  slate.textContent = 'Ready to roll';
  gate.classList.add('is-ready');

  await new Promise<void>((resolve) => {
    let rolled = false;

    const roll = () => {
      if (rolled) return;
      rolled = true;
      window.removeEventListener('keydown', onKey);
      gate.removeEventListener('pointerdown', onPointer);

      const done = () => {
        gsap.ticker.remove(tick);
        // Scroll was held through the cut. Hand it back now the site is up.
        document.body.classList.remove('is-gated');
        lenis?.start();
        gate.classList.add('is-open');
        resolve();
      };

      // The film picks up on the frame the cut lands on, so playback starts
      // there and nowhere earlier.
      const rollFilm = () => {
        heroVideo.currentTime = 0;
        void heroVideo.play().catch(() => {});
        // Cut the gate away on the video's first painted frame. Anything else
        // leaves the still on screen while the film runs on behind it, and the
        // reveal lands seconds into the shot.
        const swap = () => gsap.set(gate, { autoAlpha: 0 });
        type FrameCallbackHost = HTMLVideoElement & {
          requestVideoFrameCallback?: (cb: () => void) => number;
        };
        const host = heroVideo as FrameCallbackHost;
        if (typeof host.requestVideoFrameCallback === 'function') {
          host.requestVideoFrameCallback(swap);
        } else {
          heroVideo.addEventListener('timeupdate', swap, { once: true });
        }
      };

      if (reduced) {
        // Tier 2: the gate still gates, the montage becomes a single dissolve.
        gsap
          .timeline({ onComplete: done })
          .set(layers[layers.length - 1], { opacity: 1 })
          .to(gate, { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut' })
          .call(rollFilm)
          .to('.hud, .hud__bar', { opacity: 1, duration: 0.4 }, '-=0.2');
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: done });

      // Shutter hit: white frame, letterbox slams shut, chrome cuts out.
      tl.to('.flash', { opacity: 1, duration: 0.05 })
        .to('.flash', { opacity: 0, duration: 0.14 })
        .to('.bars__bar', { scaleY: 1, duration: 0.32, ease: 'power4.out' }, 0)
        .set('.gate__top, .gate__ruler, .gate__cue, .gate__role', { opacity: 0 }, 0.06)
        .to('.gate__name', { scale: 1.6, opacity: 0, duration: 0.45, ease: 'power3.in' }, 0.02);

      // The cut: frames swap on hard sets, the rhythm tightening as it runs.
      let at = 0.18;
      layers.forEach((layer, i) => {
        const last = i === layers.length - 1;
        const hold = last ? 0.6 : gsap.utils.mapRange(0, layers.length - 2, 0.17, 0.06, i);
        tl.set(layers, { opacity: 0 }, at)
          .set(layer, { opacity: 1, scale: 1.08, xPercent: i % 2 ? -1.5 : 1.5 }, at)
          .to(layer, { scale: 1, xPercent: 0, duration: hold * 2.4, ease: 'none' }, at);
        at += hold;
      });

      // Land: letterbox opens, the name rises out from behind the bars.
      tl.to(playhead, { x: () => gate.clientWidth, duration: at, ease: 'none' }, 0.18)
        .call(rollFilm, [], at + 0.02)
        .to('.bars__bar', { scaleY: 0, duration: 0.9, ease: 'power4.inOut' }, at + 0.1)
        .from(
          '.hero__title i',
          { yPercent: 115, duration: 1.1, stagger: 0.07, ease: 'expo.out' },
          at + 0.22,
        )
        .from('.hero__note, .hero__cta', { opacity: 0, y: 14, duration: 0.8, stagger: 0.08 }, at + 0.5)
        .to('.hud, .hud__bar', { opacity: 1, duration: 0.6 }, at + 0.6);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.code !== 'Enter') return;
      e.preventDefault();
      roll();
    };
    const onPointer = () => roll();

    window.addEventListener('keydown', onKey);
    gate.addEventListener('pointerdown', onPointer);
  });
}
