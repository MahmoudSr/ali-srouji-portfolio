# Ali Srouji — Portfolio

Cinematic portfolio site for **Ali Srouji** (filmmaker · editor · videographer).
Owner/developer: Mahmoud Srouji (GitHub: MahmoudSr). Repo: https://github.com/MahmoudSr/ali-srouji-portfolio

## The design bar (read this first)

This site is a *filmmaker's* portfolio — the design is the product. The bar is award-site level
(Awwwards SOTD / FWA), not "clean and modern". **"Basic" is a failure state.** Before any UI work,
run the **design-taste** skill and then **frontend-design**; treat their anti-template checklists as
gates, not suggestions. If a screen could belong to any other portfolio, it is wrong — throw it out.

Non-negotiables:

- No template shapes: no centred hero + three cards, no rounded-corner glass boxes, no generic
  gradient blobs, no stock icon rows, no "Let's work together" footer.
- Type does the heavy lifting: extreme scale contrast, tight optical tracking, real hierarchy.
- Motion is authored, not decorative — every transition should read as an *edit*, with intent and
  timing a cutter would recognise.
- Nothing ships that hasn't been screenshotted with the **playwright** MCP and actually looked at.

## The concept — "The Cut"

The site is an edit, and it is built. What exists today:

**The gate.** Near-black, a blinking `● REC` dot, a running timecode, Ali's name, a hairline
timeline ruler that fills as the film's frames preload. `PRESS [SPACE]` on desktop, `TAP TO ROLL`
on touch. Nothing scrolls until the visitor presses.

**The cut-in.** Space or tap fires a white shutter flash, the letterbox slams shut, the name punches
out, and ten frames from *Chase Me Down to Main Street* hard-cut past at a tightening rhythm before
landing on the alley frame at 2:18.9. The hero clip is encoded from that exact timecode, so the film
carries on from the frame the cut stopped on and plays its own edits through to just before the
credits. The swap from still to video happens on the video's first painted frame
(`requestVideoFrameCallback`), so there is no seam.

**After the gate: paging, not scrolling.** One section fills the screen and one gesture moves exactly
one section. Wheel and touch are read directly in `timeline/pager.ts` and the travel is a GSAP tween
of the scroll position. **Lenis is deliberately switched off** (see `animations/scroll.ts`): a
smooth-scroll layer answers the wheel itself and rewrites the scroll position every frame, which
overshot sections and cancelled the travel outright.

Rules the owner settled by looking at built alternatives and rejecting them. Do not reintroduce:

- **No scroll-scrub.** Driving a clip's playhead from the wheel was built and rejected.
- **No transition overlay between sections.** A film-advance effect (sprockets, frame line, flash)
  was built and rejected: "very bad", it "goes crazy up and down". The cut is the transition.
- **A clip freezes on its frame the instant a move starts**, so nothing animates over moving video.
- **Sound is off by default** on every clip in a strip, with a visible toggle, and only one clip can
  be audible at a time. Opening a piece in the viewer starts it with sound, since that is deliberate.

**The work.** A group is one section holding related pieces, and a piece is a clip or a still. The
strip shrinks its pieces as the set grows and is dragged, wheeled sideways, stepped with arrows or
walked with the left and right keys when it runs past the screen. Clicking a piece opens the viewer:
full quality file, sound, arrows through the group, Escape to close.

Reduced motion: the gate still gates but dissolves instead of cutting, and paging jumps without a
tween.

## Look

Colour world: **bleach & ember** — near-black ground, cold silver type, one hot ember-orange accent
reserved for *live* things only (REC dot, playhead, timecode, active hover). Almost no colour in the
chrome, so Ali's footage is the only colour on screen. Grain / halation / gate-weave as a light
shader pass over the page, subtle enough to survive on a phone.

Typography is still open — bring options to the owner before locking (condensed grotesk for the
technical/edit-suite feel is the current lead).

## Content and the asset pipeline

**Two files per piece.** `strip` is a light pass the section plays (clips 540x960 at 1.0 Mbps,
stills 900px); `full` is the quality one, fetched only when a piece is opened (clips at their source
ceiling, stills 1800px). This is what keeps a full pass through the site around 28 MB instead of 59.
Adding work is a data change in `src/scripts/data/work.ts` plus the files in `public/`.

**The tools are in `tools/`,** written against AVFoundation because ffmpeg and Homebrew are not
installed on this machine and installing Homebrew needs an admin password:

```bash
swiftc -O -o /tmp/frames tools/frames.swift
swiftc -O -o /tmp/transcode tools/transcode.swift
/tmp/frames <in> <outdir> sheet 24            # contact sheet, for picking moments
/tmp/frames <in> <outdir> grab 12,52,98       # full-res stills at those seconds
/tmp/transcode <in> <out> <start> <len> <height> <mbps> <audio 0|1> [keyframeSec]
```

Check a master's real resolution before encoding: clips supplied as Instagram downloads are already
720x1280 and upscaling adds nothing, while Ali's own masters are 4K and go to 1080x1920.

**Sources.** Masters live outside the repo, in `~/Downloads` or on the external drive **Ali's HDD**
(read-only: copy from it, never move, rename or delete anything, and say the operation is read-only
before running it). Only add material the owner names; do not mine the Downloads folder.

**Repo weight.** `public/video/` is around 106 MB of full-quality files plus 30 MB of light ones.
Fine to work with, but before launch the video belongs on a CDN with adaptive streaming (Cloudflare
Stream, Mux, Vimeo) rather than in git.

## Stack (decided — do not introduce a UI framework)

Vanilla **TypeScript + Vite**. No React/Vue/Next.

- **GSAP** — all choreography (timelines, ScrollTrigger, SplitText, Flip, Observer). All plugins are
  free; import from `gsap/*`.
- **Three.js** — WebGL/shader passes (grain, halation, displacement transitions). Optional now that
  the 3D camera intro is retired; do not add a heavy 3D scene without asking.
- **Lenis** — smooth scroll, synced to ScrollTrigger in `src/scripts/animations/scroll.ts`.
- **Barba.js** — page transitions (`src/scripts/transitions/`). Types are mapped in `tsconfig.json`
  `paths` because the package's `types` field is broken; don't remove that mapping.

If a CMS / many editable pages are ever needed, migrate to **Astro** and keep the vanilla GSAP code.

## Commands

```bash
npm run dev       # http://localhost:5173
npm run build     # tsc + vite build → dist/  (must pass before committing)
npm run preview
```

## Structure

```
index.html                 entry page: gate, hero, empty #reels host
src/main.ts                boot: initScroll → initTransitions → initReels → initPager → initHud → initGate
src/styles/                reset.css, tokens.css (colours, type, --grade, --radius), main.css
src/scripts/gate/          REC screen → space/tap → cut-in → hands over to the film
src/scripts/timeline/
  pager.ts                 section paging: wheel, touch, keys, GSAP scroll tween
  reels.ts                 renders groups, strip behaviour, sound, play/freeze
  viewer.ts                full quality overlay for one piece
  hud.ts                   corner timecode and the playhead line
src/scripts/data/
  frames.ts                the film's montage frames, with source timecodes
  work.ts                  groups and pieces: the swap point for all work
src/scripts/animations/    scroll.ts (Lenis off, with the reason)
src/scripts/transitions/   Barba transitions
src/scripts/utils/         dom.ts (qs/qsa)
tools/                     frames.swift, transcode.swift (read-only media tools)
public/video/<group>/      clips: name.mp4 (full) and name-strip.mp4 (light)
public/frames/<group>/     posters and the film's montage frames
public/stills/<group>/     photographs: name.jpg and name-strip.jpg
```

## Conventions

- One module per effect/section; export an `init*()` function; register GSAP plugins where used.
- Put colours, fonts and eases in `tokens.css` as CSS variables; never hard-code them in modules.
- Animate `transform`/`opacity` only; no layout-property animation. Dispose Three.js geometries,
  materials and textures when a scene is torn down.
- Touch parity is mandatory: every Space interaction has a tap equivalent, and the gate must work
  on a phone with no keyboard.
- Assets: prefer CC0 (Poly Haven, Pexels) or CC-licensed with attribution. Keep a `CREDITS.md` entry
  for every third-party clip, image, font or sound.
- Library APIs are checked via the **context7** MCP, not from memory.
- Commit messages: short imperative subject; build must pass first.

## Skills to lean on (installed user-level in ~/.claude/skills)

**Design first — always these two before writing UI:** `design-taste` (anti-slop direction,
audit-first), `frontend-design` (typography, colour, intentional composition). Then
`modern-web-design` for current-year patterns and `dataviz` only if charts ever appear.

Motion & craft: `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins` (Flip, Observer,
SplitText), `gsap-performance`, `60fps-animation`, `micro-interaction`, `page-transition-animation`,
`barba-js`, `locomotive-scroll` (concepts apply to Lenis), `svg-animation`, `accessible-animation`.

Visual FX: `shader-glsl` (grain, halation, displacement cuts), `threejs-webgl`, `threejs-animation`,
`particle-system`, `web3d-integration-patterns`.

## Open threads

- **The film has no sound control** because its hero clip was encoded silent and the master is on
  Ali's HDD, which was unplugged. When the drive is connected, re-encode `chase-hero.mp4` from
  2:18.9 with `audio 1`; the control detects an audio track and appears by itself.
- **Four car photographs** (Land Rover interiors and a wheel) are promised but were never in
  Downloads. They want a home: probably their own group, since no existing section fits.
- **The reels section still has empty space** in groups holding only three pieces. It fills as more
  work arrives.
- **Video hosting** should move off the repo before launch.
- Sections so far: the film, Weddings & Catering, F&B, Stays.

## Retired directions (do not resurrect without asking)

- Photoreal 3D camera + film-roll intro — abandoned 2026-09-08; archived on branch
  `archive/camera-intro`. The 3D camera never cleared the photoreal bar.

## Related context (owner's other work)

Same owner produces the "Java academy" talking-head reels in Premiere Pro; that project is unrelated
to this repo except that Ali's reels may become portfolio pieces.
