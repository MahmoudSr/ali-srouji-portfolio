/**
 * Work sections. One group is one screen: related pieces side by side, clips
 * playing by themselves while their section is up, stills sitting among them.
 * The strip shows light files; clicking a piece opens the full quality one.
 */
import { gsap } from 'gsap';
import { groups, type Group, type Item } from '../data/work';
import { isPaging } from './pager';
import { openViewer } from './viewer';
import { qs, qsa } from '../utils/dom';

const pad = (n: number) => String(n).padStart(2, '0');
const clipTime = (t: number) => `${pad(Math.floor(t / 60))}:${pad(Math.floor(t % 60))}`;

/**
 * A print on the light table. No slate over the picture and no play chrome: a
 * photograph is not playing, so it gets a caption in the margin under it, the
 * way a print on a table does.
 */
function plateMarkup(item: Item, i: number): string {
  return `
    <figure class="plate" id="reel-${item.id}" data-index="${i}" tabindex="0">
      <img class="plate__image" src="${item.strip}" alt="${item.title}" loading="lazy" decoding="async" />
      <figcaption class="plate__caption mono">
        <span class="plate__name">${item.title}</span>
        <span class="plate__cut">${item.cut ?? ''}</span>
      </figcaption>
    </figure>`;
}

function itemMarkup(item: Item, i: number): string {
  const slate = `
      <figcaption class="reel__slate mono">
        <span class="reel__name">${item.title}</span>
        <span class="reel__cut">${item.cut ?? ''}</span>
        <span class="reel__tc">${item.kind === 'clip' ? '00:00' : 'Still'}</span>
      </figcaption>`;

  if (item.kind === 'still') {
    return `
    <figure class="reel reel--still" id="reel-${item.id}" data-index="${i}" tabindex="0">
      <img class="reel__image" src="${item.strip}" alt="${item.title}" loading="lazy" decoding="async" />
      ${slate}
    </figure>`;
  }

  return `
    <figure class="reel" id="reel-${item.id}" data-index="${i}" tabindex="0">
      <video class="reel__video" src="${item.strip}" poster="${item.poster ?? ''}"
             muted loop playsinline preload="metadata" aria-label="${item.title}"></video>
      ${item.hasAudio ? '<button class="sound mono" type="button" aria-pressed="false">Sound off</button>' : ''}
      <span class="reel__progress" aria-hidden="true"></span>
      ${slate}
    </figure>`;
}

function groupMarkup(group: Group): string {
  const sheet = group.layout === 'sheet';
  const piece = sheet ? plateMarkup : itemMarkup;
  return `
    <section class="group${sheet ? ' group--sheet' : ''}" id="group-${group.id}" data-section
             data-slate="${group.title} / ${group.year}">
      <header class="group__head">
        <h3 class="group__title">${group.title}</h3>
        <p class="group__note mono">${group.note}</p>
      </header>
      <div class="group__strip">
        <div class="group__row${sheet ? ' group__row--sheet' : ''}" data-count="${group.items.length}">
          ${group.items.map(piece).join('')}
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

/** Every clip with a sound control, so only one can ever be audible. */
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

/**
 * Freeze a section: its clips hold on the frame they are on and go silent.
 * Called the instant a move starts, so nothing animates over moving video.
 */
export function freezeSection(section: HTMLElement): void {
  qsa<HTMLVideoElement>('video', section).forEach((video) => {
    video.pause();
    video.muted = true;
  });
  resetSound(section);
}

/** True when any part of the element is inside the viewport. */
function onScreen(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
}

/**
 * Get a section's clips decoding before it is asked to play, and only the ones
 * in view plus one: fetching a whole group on arrival would cost megabytes for
 * pieces the visitor may never scroll to.
 */
export function primeSection(section: HTMLElement): void {
  const videos = qsa<HTMLVideoElement>('video', section);
  const lastVisible = videos.reduce((last, video, i) => (onScreen(video) ? i : last), -1);
  const limit = lastVisible < 0 ? 0 : lastVisible + 1;
  videos.slice(0, limit + 1).forEach((video) => {
    if (video.preload === 'auto') return;
    video.preload = 'auto';
    video.load();
  });
}

/** Run the clips of the section that just landed, if they are on screen. */
export function playSection(section: HTMLElement): void {
  qsa<HTMLVideoElement>('video', section).forEach((video) => {
    if (!onScreen(video)) return;
    video.preload = 'auto';
    void video.play().catch(() => {});
  });
}

/**
 * The strip can be wider than the screen, so it can be dragged. A horizontal
 * wheel pans it too, and is kept away from the pager, which wants only
 * vertical intent.
 */
function makeDraggable(row: HTMLElement): void {
  let down = false;
  let dragging = false;
  let startX = 0;
  let startLeft = 0;

  row.addEventListener('pointerdown', (e) => {
    // A press that starts on a control is that control's, not the strip's. A
    // few pixels of drift while pressing a sound button used to turn into a
    // drag, which captured the pointer and swallowed the click.
    if ((e.target as HTMLElement).closest('button')) return;
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
      // would send the click to the strip instead of the piece under it.
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
      // A drag must not land as a click that opens a piece.
      row.addEventListener('click', (c) => c.stopPropagation(), { once: true, capture: true });
    }
    dragging = false;
  };
  row.addEventListener('pointerup', release);
  row.addEventListener('pointercancel', release);

  // The pager listens for wheel on the window and stops the event reaching
  // anything else, so a sideways gesture has to be caught before it does.
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

  const step = () => (qs<HTMLElement>('.reel, .plate', row)?.clientWidth ?? 320) + 16;
  const update = () => {
    // A row that has not been laid out yet measures as nothing, which must not
    // be read as overflow: that is what put arrows on a section that fits.
    const room = row.clientWidth;
    const overflows = room > 0 && row.scrollWidth - room > 8;
    prev.hidden = !overflows || row.scrollLeft <= 4;
    next.hidden = !overflows || row.scrollLeft >= row.scrollWidth - room - 4;
  };
  prev.addEventListener('click', () => row.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => row.scrollBy({ left: step(), behavior: 'smooth' }));
  row.addEventListener(
    'scroll',
    () => {
      update();
      primeSection(strip);
    },
    { passive: true },
  );
  window.addEventListener('resize', update);
  // Pieces get their width from their own shape, which settles after the first
  // paint and again as each file reports its size, so the row is measured on
  // every one of those moments as well as whenever the row itself changes.
  new ResizeObserver(update).observe(row);
  qsa<HTMLImageElement | HTMLVideoElement>('img, video', row).forEach((media) => {
    media.addEventListener('load', update);
    media.addEventListener('loadedmetadata', update);
  });
  row.scrollLeft = 0;
  requestAnimationFrame(update);
}

export function initReels(): void {
  const host = qs<HTMLElement>('#reels');
  if (!host) return;
  host.insertAdjacentHTML('beforeend', groups.map(groupMarkup).join(''));

  qsa<HTMLElement>('.group__row').forEach(makeDraggable);
  qsa<HTMLElement>('.group__strip').forEach(wireSteps);

  groups.forEach((group) => {
    const section = qs<HTMLElement>(`#group-${group.id}`)!;
    qsa<HTMLElement>('.reel, .plate', section).forEach((figure) => {
      const at = Number(figure.dataset.index ?? 0);

      // Opening a piece is what asks for its full quality file.
      const open = () => openViewer(group.items, at);
      figure.addEventListener('click', open);
      figure.addEventListener('keydown', (e) => {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          open();
        }
      });

      const video = qs<HTMLVideoElement>('.reel__video', figure);
      if (!video) return;
      wireSound(video, qs<HTMLButtonElement>('.sound', figure));

      // Safety net: whatever is on screen plays, whatever leaves stops. The
      // pager owns the timing, so this stays quiet while a move is running.
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

      const progress = qs<HTMLElement>('.reel__progress', figure)!;
      const tc = qs<HTMLElement>('.reel__tc', figure)!;
      gsap.ticker.add(() => {
        const duration = video.duration;
        if (!duration) return;
        gsap.set(progress, { scaleX: video.currentTime / duration });
        tc.textContent = clipTime(video.currentTime);
      });
    });
  });
}
