/**
 * Reel groups. One group is one section: related reels side by side, each
 * playing by itself while its section is on screen, muted until asked.
 */
import { gsap } from 'gsap';
import { reelGroups, type Reel, type ReelGroup } from '../data/work';
import { isPaging } from './pager';
import { qs, qsa } from '../utils/dom';

const pad = (n: number) => String(n).padStart(2, '0');
const clipTime = (t: number) => `${pad(Math.floor(t / 60))}:${pad(Math.floor(t % 60))}`;

function reelMarkup(reel: Reel): string {
  return `
    <figure class="reel" id="reel-${reel.id}">
      <video class="reel__video" src="${reel.clip}" poster="${reel.poster}"
             muted loop playsinline preload="metadata" aria-label="${reel.title}"></video>
      ${reel.hasAudio ? '<button class="sound mono" type="button" aria-pressed="false">Sound off</button>' : ''}
      <span class="reel__progress" aria-hidden="true"></span>
      <figcaption class="reel__slate mono"><span>${reel.title}${reel.cut ? ` / ${reel.cut}` : ''}</span><span class="reel__tc">00:00</span></figcaption>
    </figure>`;
}

function groupMarkup(group: ReelGroup): string {
  return `
    <section class="group" id="group-${group.id}" data-section
             data-slate="${group.title} / Reels ${group.year}">
      <header class="group__head">
        <h3 class="group__title">${group.title}</h3>
        <p class="group__note mono">${group.note}</p>
      </header>
      <div class="group__strip">
        <div class="group__row" data-count="${group.reels.length}">
          ${group.reels.map(reelMarkup).join('')}
        </div>
        <button class="strip__step strip__step--prev" type="button" aria-label="Previous clips" hidden>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 L7 12 L15 20" /></svg>
        </button>
        <button class="strip__step strip__step--next" type="button" aria-label="More clips" hidden>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 L17 12 L9 20" /></svg>
        </button>
      </div>
    </section>`;
}

/**
 * Muted by default; the button is the only way sound ever starts, and turning
 * one on turns every other one off. Two clips playing over each other is noise.
 */
export function wireSound(video: HTMLVideoElement, button: HTMLButtonElement | null): void {
  if (!button) return;
  sounded.push({ video, button });
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    soloSound(video.muted ? video : null);
  });
}

/** Every clip that has a sound control, so only one can ever be audible. */
const sounded: { video: HTMLVideoElement; button: HTMLButtonElement }[] = [];

function setSoundLabel(button: HTMLButtonElement, on: boolean): void {
  button.textContent = on ? 'Sound on' : 'Sound off';
  button.setAttribute('aria-pressed', String(on));
  button.classList.toggle('is-on', on);
}

/** Silence everything except the clip asking for sound. */
function soloSound(chosen: HTMLVideoElement | null): void {
  sounded.forEach(({ video, button }) => {
    const on = video === chosen;
    video.muted = !on;
    setSoundLabel(button, on);
  });
}

function resetSound(scope: HTMLElement): void {
  qsa<HTMLButtonElement>('.sound', scope).forEach((button) => setSoundLabel(button, false));
}

/**
 * Freeze a section: its clips hold on the frame they are on and go silent.
 * Called the instant a move starts, so the advance always runs over a still.
 */
export function freezeSection(section: HTMLElement): void {
  qsa<HTMLVideoElement>('video', section).forEach((video) => {
    video.pause();
    video.muted = true;
  });
  resetSound(section);
}

/**
 * Get a section's clips decoding before it is asked to play, so arriving does
 * not collide with the first frames being fetched and decoded.
 */
export function primeSection(section: HTMLElement): void {
  qsa<HTMLVideoElement>('video', section).forEach((video) => {
    if (video.preload === 'auto') return;
    video.preload = 'auto';
    video.load();
  });
}

/** True when any part of the element is inside the viewport. */
function onScreen(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
}

/**
 * Run the clips of the section that just landed. Only the ones actually in
 * view: a group can hold six, and six simultaneous decodes is what makes a
 * page stutter.
 */
export function playSection(section: HTMLElement): void {
  qsa<HTMLVideoElement>('video', section).forEach((video) => {
    if (!onScreen(video)) return;
    video.preload = 'auto';
    void video.play().catch(() => {});
  });
}

/**
 * The strip of clips can be wider than the screen, so it can be dragged. A
 * horizontal wheel gesture pans it too, and is kept away from the pager, which
 * only wants vertical intent.
 */
function makeDraggable(row: HTMLElement): void {
  let down = false;
  let dragging = false;
  let startX = 0;
  let startLeft = 0;

  row.addEventListener('pointerdown', (e) => {
    down = true;
    dragging = false;
    startX = e.clientX;
    startLeft = row.scrollLeft;
  });
  row.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!dragging) {
      if (Math.abs(dx) < 5) return;
      // Capture only once this is really a drag. Capturing on pointerdown
      // would send the click to the strip instead of the button under it.
      dragging = true;
      row.setPointerCapture(e.pointerId);
      row.classList.add('is-dragging');
    }
    row.scrollLeft = startLeft - dx;
  });
  const release = (e: PointerEvent) => {
    if (!down) return;
    down = false;
    if (dragging) {
      row.releasePointerCapture?.(e.pointerId);
      row.classList.remove('is-dragging');
      // A drag must not land as a click on the control underneath.
      row.addEventListener('click', (c) => c.stopPropagation(), { once: true, capture: true });
    }
    dragging = false;
  };
  row.addEventListener('pointerup', release);
  row.addEventListener('pointercancel', release);

  // The pager listens for wheel on the window and stops the event reaching
  // anything else, so a sideways gesture has to be caught before it does.
  // This runs first because reels are wired up before the pager is.
  window.addEventListener(
    'wheel',
    (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      const over = document.elementFromPoint(e.clientX, e.clientY);
      if (!over || !row.contains(over)) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      row.scrollLeft += e.deltaX;
    },
    { capture: true, passive: false },
  );
}

/** Arrows appear only when the strip actually runs past the edge. */
function wireSteps(strip: HTMLElement): void {
  const row = qs<HTMLElement>('.group__row', strip)!;
  const prev = qs<HTMLButtonElement>('.strip__step--prev', strip)!;
  const next = qs<HTMLButtonElement>('.strip__step--next', strip)!;

  const step = () => (qs<HTMLElement>('.reel', row)?.clientWidth ?? 320) + 16;
  const update = () => {
    const overflows = row.scrollWidth - row.clientWidth > 8;
    prev.hidden = !overflows || row.scrollLeft <= 4;
    next.hidden = !overflows || row.scrollLeft >= row.scrollWidth - row.clientWidth - 4;
  };

  prev.addEventListener('click', () => row.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => row.scrollBy({ left: step(), behavior: 'smooth' }));
  row.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  // The strip starts at its head, and the arrows are judged after layout has
  // settled, not before the clips have their size.
  row.scrollLeft = 0;
  requestAnimationFrame(update);
  window.setTimeout(update, 400);
}

export function initReels(): void {
  const host = qs<HTMLElement>('#reels');
  if (!host) return;
  host.insertAdjacentHTML('beforeend', reelGroups.map(groupMarkup).join(''));

  qsa<HTMLElement>('.group__row').forEach(makeDraggable);
  qsa<HTMLElement>('.group__strip').forEach(wireSteps);

  // Left and right travel the strip, the way up and down travel the sections.
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'ArrowLeft' && e.code !== 'ArrowRight') return;
    const row = qsa<HTMLElement>('.group__row').find((r) => {
      const box = r.getBoundingClientRect();
      return box.top < window.innerHeight * 0.75 && box.bottom > window.innerHeight * 0.25;
    });
    if (!row) return;
    const width = (qs<HTMLElement>('.reel', row)?.clientWidth ?? 320) + 16;
    row.scrollBy({ left: e.code === 'ArrowRight' ? width : -width, behavior: 'smooth' });
  });

  qsa<HTMLElement>('.reel').forEach((figure) => {
    const video = qs<HTMLVideoElement>('.reel__video', figure)!;
    const progress = qs<HTMLElement>('.reel__progress', figure)!;
    const tc = qs<HTMLElement>('.reel__tc', figure)!;
    wireSound(video, qs<HTMLButtonElement>('.sound', figure));

    // Safety net: whatever is actually on screen plays, whatever leaves stops.
    // The pager owns the timing, so this stays quiet while a move is running.
    new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (isPaging()) return;
          video.preload = 'auto';
          if (video.paused) void video.play().catch(() => {});
        } else {
          video.pause();
          video.muted = true;
          resetSound(figure);
        }
      },
      { threshold: 0.6 },
    ).observe(figure);

    gsap.ticker.add(() => {
      const duration = video.duration;
      if (!duration) return;
      gsap.set(progress, { scaleX: video.currentTime / duration });
      tc.textContent = clipTime(video.currentTime);
    });
  });
}
