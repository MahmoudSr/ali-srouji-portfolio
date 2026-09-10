/**
 * Reel groups. One group is one section: related reels side by side, each
 * playing by itself while its section is on screen, muted until asked.
 */
import { gsap } from 'gsap';
import { reelGroups, type Reel, type ReelGroup } from '../data/work';
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
      <figcaption class="reel__slate mono"><span>${reel.title}</span><span class="reel__tc">00:00</span></figcaption>
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
      <div class="group__row" data-count="${group.reels.length}">
        ${group.reels.map(reelMarkup).join('')}
      </div>
    </section>`;
}

/** Muted by default; the button is the only way sound ever starts. */
export function wireSound(video: HTMLVideoElement, button: HTMLButtonElement | null): void {
  if (!button) return;
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    button.textContent = video.muted ? 'Sound off' : 'Sound on';
    button.setAttribute('aria-pressed', String(!video.muted));
    button.classList.toggle('is-on', !video.muted);
  });
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
  qsa<HTMLButtonElement>('.sound', section).forEach((button) => {
    button.textContent = 'Sound off';
    button.setAttribute('aria-pressed', 'false');
    button.classList.remove('is-on');
  });
}

/** Run the clips of the section that just landed. */
export function playSection(section: HTMLElement): void {
  qsa<HTMLVideoElement>('video', section).forEach((video) => {
    video.preload = 'auto';
    void video.play().catch(() => {});
  });
}

export function initReels(): void {
  const host = qs<HTMLElement>('#reels');
  if (!host) return;
  host.insertAdjacentHTML('beforeend', reelGroups.map(groupMarkup).join(''));

  qsa<HTMLElement>('.reel').forEach((figure) => {
    const video = qs<HTMLVideoElement>('.reel__video', figure)!;
    const progress = qs<HTMLElement>('.reel__progress', figure)!;
    const tc = qs<HTMLElement>('.reel__tc', figure)!;
    wireSound(video, qs<HTMLButtonElement>('.sound', figure));

    // Without the pager (reduced motion) nothing else would start the clip.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? void video.play().catch(() => {}) : video.pause()),
        { threshold: 0.5 },
      ).observe(figure);
    }

    gsap.ticker.add(() => {
      const duration = video.duration;
      if (!duration) return;
      gsap.set(progress, { scaleX: video.currentTime / duration });
      tc.textContent = clipTime(video.currentTime);
    });
  });
}
