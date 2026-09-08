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

The site is an edit. The visitor is the playhead.

**The gate.** Land on near-black. A blinking red `● REC` dot, a live timecode, Ali's name small, a
hairline timeline ruler across the bottom. One instruction: `PRESS [SPACE]` on desktop,
`TAP TO ROLL` on touch. Nothing else moves. Nothing scrolls until they press.

**The cut-in.** Space / tap = pressing PLAY. A ~3s montage of Ali's frames slams in on hard cuts
timed to a beat, letterbox bars close in, the timecode starts running, and it settles onto the hero
frame with the name over it. This must feel violent and precise — a title sequence, not a fade.

**After the gate.** The edit metaphor governs everything:

- Scroll moves a **playhead**; a live timecode in the corner counts with it.
- Sections are **clips** on a timeline strip; the strip is the navigation.
- Project hover **scrubs** the piece like a filmstrip under the cursor (cursor x = frame index).
- Section changes are **cuts and transitions** (hard cut, whip, dissolve) — never plain fades.
- Space remains the play/pause key for the whole site; it is the site's signature interaction.

Reduced motion gets a tiered fallback: the gate still gates (press to enter), but the montage
becomes a short dissolve and the scrub becomes a static frame.

## Look

Colour world: **bleach & ember** — near-black ground, cold silver type, one hot ember-orange accent
reserved for *live* things only (REC dot, playhead, timecode, active hover). Almost no colour in the
chrome, so Ali's footage is the only colour on screen. Grain / halation / gate-weave as a light
shader pass over the page, subtle enough to survive on a phone.

Typography is still open — bring options to the owner before locking (condensed grotesk for the
technical/edit-suite feel is the current lead).

## Content

No real footage on disk yet. Build with licensed/CC stand-in clips and stills in `public/video/`, and
keep every reference behind a small data module (`src/scripts/data/`) so swapping in Ali's real
frames is a data change, never a layout change. Ali's reel footage lives on the external drive
**"Ali's NVME"** — read-only: copy from it, never move or delete anything on it.

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
index.html                 entry page (gate + home)
src/main.ts                bootstrap: initScroll → initTransitions → initGate
src/styles/                reset.css, tokens.css (colours, fonts, eases), main.css
src/scripts/gate/          the REC screen → space/tap → cut-in montage → reveal
src/scripts/timeline/      playhead, timecode, clip strip navigation
src/scripts/animations/    GSAP timelines, scroll setup
src/scripts/scenes/        Three.js / shader passes (grain, halation, transitions)
src/scripts/transitions/   Barba transitions
src/scripts/data/          project + frame manifests (swap point for real footage)
src/scripts/utils/         helpers (dom.ts: qs/qsa)
public/video|audio|fonts   large static files served as-is
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

## Retired directions (do not resurrect without asking)

- Photoreal 3D camera + film-roll intro — abandoned 2026-09-08; archived on branch
  `archive/camera-intro`. The 3D camera never cleared the photoreal bar.

## Related context (owner's other work)

Same owner produces the "Java academy" talking-head reels in Premiere Pro; that project is unrelated
to this repo except that Ali's reels may become portfolio pieces.
