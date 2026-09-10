/**
 * The viewer. A strip shows light files; opening a piece is what asks for the
 * full quality one, which is fetched only then. Clips open with sound, since
 * opening one is a deliberate act, and can be silenced from the control.
 */
import { gsap } from 'gsap';
import type { Item } from '../data/work';
import { qs } from '../utils/dom';

let open = false;
/** The pager and the strips stay still while a piece is open. */
export function isViewerOpen(): boolean {
  return open;
}

let root: HTMLElement | null = null;
let items: Item[] = [];
let index = 0;
let ticker: (() => void) | null = null;

const pad = (n: number) => String(n).padStart(2, '0');
const clock = (t: number) => `${pad(Math.floor(t / 60))}:${pad(Math.floor(t % 60))}`;

function chevron(dir: 'prev' | 'next'): string {
  const path = dir === 'prev' ? 'M15 4 L7 12 L15 20' : 'M9 4 L17 12 L9 20';
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" /></svg>`;
}

function build(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'viewer';
  el.hidden = true;
  el.innerHTML = `
    <div class="viewer__chrome mono">
      <span class="viewer__title"></span>
      <button class="viewer__close" type="button" aria-label="Close">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5 L19 19 M19 5 L5 19" /></svg>
      </button>
    </div>
    <figure class="viewer__stage"></figure>
    <button class="viewer__nav viewer__nav--prev" type="button" aria-label="Previous">${chevron('prev')}</button>
    <button class="viewer__nav viewer__nav--next" type="button" aria-label="Next">${chevron('next')}</button>
    <div class="viewer__foot mono">
      <span class="viewer__tc"></span>
      <button class="viewer__sound" type="button" hidden>Sound on</button>
    </div>
    <span class="viewer__progress" aria-hidden="true"></span>`;
  document.body.appendChild(el);

  qs<HTMLElement>('.viewer__close', el)!.addEventListener('click', close);
  qs<HTMLElement>('.viewer__nav--prev', el)!.addEventListener('click', () => step(-1));
  qs<HTMLElement>('.viewer__nav--next', el)!.addEventListener('click', () => step(1));
  el.addEventListener('click', (e) => {
    // Clicking the surround closes; clicking the piece itself does not.
    if (e.target === el) close();
  });
  return el;
}

function clearStage(): void {
  if (ticker) {
    gsap.ticker.remove(ticker);
    ticker = null;
  }
  const stage = qs<HTMLElement>('.viewer__stage', root!)!;
  qs<HTMLVideoElement>('video', stage)?.pause();
  stage.innerHTML = '';
}

function render(): void {
  const item = items[index];
  const stage = qs<HTMLElement>('.viewer__stage', root!)!;
  const sound = qs<HTMLButtonElement>('.viewer__sound', root!)!;
  const tc = qs<HTMLElement>('.viewer__tc', root!)!;
  const progress = qs<HTMLElement>('.viewer__progress', root!)!;

  clearStage();
  qs<HTMLElement>('.viewer__title', root!)!.textContent = item.cut
    ? `${item.title} / ${item.cut}`
    : item.title;
  qs<HTMLElement>('.viewer__nav--prev', root!)!.hidden = index === 0;
  qs<HTMLElement>('.viewer__nav--next', root!)!.hidden = index === items.length - 1;

  if (item.kind === 'still') {
    const img = document.createElement('img');
    img.className = 'viewer__media';
    img.src = item.full;
    img.alt = item.cut ? `${item.title}, ${item.cut}` : item.title;
    stage.appendChild(img);
    sound.hidden = true;
    tc.textContent = '';
    gsap.set(progress, { scaleX: 0 });
    gsap.fromTo(img, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' });
    return;
  }

  const video = document.createElement('video');
  video.className = 'viewer__media';
  video.src = item.full;
  if (item.poster) video.poster = item.poster;
  video.playsInline = true;
  video.loop = true;
  video.preload = 'auto';
  video.controls = false;
  stage.appendChild(video);

  const audible = item.hasAudio !== false;
  video.muted = !audible;
  sound.hidden = !audible;
  sound.textContent = audible ? 'Sound on' : 'Sound off';
  sound.classList.toggle('is-on', audible);
  sound.onclick = (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    sound.textContent = video.muted ? 'Sound off' : 'Sound on';
    sound.classList.toggle('is-on', !video.muted);
  };

  void video.play().catch(() => {
    // Autoplay with sound can be refused; fall back to a silent start.
    video.muted = true;
    sound.textContent = 'Sound off';
    sound.classList.remove('is-on');
    void video.play().catch(() => {});
  });

  ticker = () => {
    if (!video.duration) return;
    tc.textContent = clock(video.currentTime);
    gsap.set(progress, { scaleX: video.currentTime / video.duration });
  };
  gsap.ticker.add(ticker);
  gsap.fromTo(video, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' });
}

function step(by: number): void {
  const next = index + by;
  if (next < 0 || next >= items.length) return;
  index = next;
  render();
}

export function openViewer(list: Item[], at: number): void {
  root ??= build();
  items = list;
  index = at;
  open = true;
  root.hidden = false;
  document.body.classList.add('is-viewing');
  render();
  gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: 'power2.out' });
}

export function close(): void {
  if (!open || !root) return;
  open = false;
  const el = root;
  gsap.to(el, {
    opacity: 0,
    duration: 0.2,
    ease: 'power2.in',
    onComplete: () => {
      clearStage();
      el.hidden = true;
      document.body.classList.remove('is-viewing');
    },
  });
}

window.addEventListener('keydown', (e) => {
  if (!open) return;
  if (e.code === 'Escape') close();
  if (e.code === 'ArrowRight') step(1);
  if (e.code === 'ArrowLeft') step(-1);
});
