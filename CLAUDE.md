# Ali Srouji — Portfolio

Cinematic portfolio site for **Ali Srouji** (filmmaker · editor · videographer).
Owner/developer: Mahmoud Srouji (GitHub: MahmoudSr). Repo: https://github.com/MahmoudSr/ali-srouji-portfolio

## The brief

The site must feel like film, not like a template. Signature element, in the owner's words:
visitor lands on a **realistic camera**; presses **Space or Enter**; a **film roll rolls**; then they
enter the site. Camera and film must look real (3D model or video footage, not a flat illustration).
Motion intensity: high. "Crazy" animation is wanted, but it must stay smooth (60fps) and respect
`prefers-reduced-motion` with a tiered fallback.

Design decisions still open (ask before assuming): vintage film camera vs modern cinema rig;
colour world / mood references; typography. Do not finalise the visual identity without the owner.

## Stack (decided — do not introduce a UI framework)

Vanilla **TypeScript + Vite**. No React/Vue/Next.

- **GSAP** — all choreography (timelines, ScrollTrigger, SplitText, Flip). All plugins are free; import from `gsap/*`.
- **Three.js** — 3D camera intro, WebGL/shader effects. Load models as GLTF/GLB from `public/models/`.
- **Lenis** — smooth scroll, already synced to ScrollTrigger in `src/scripts/animations/scroll.ts`.
- **Barba.js** — page transitions (`src/scripts/transitions/`). Types are mapped in `tsconfig.json` `paths`
  because the package's `types` field is broken; don't remove that mapping.

If a CMS / many editable pages are ever needed, migrate to **Astro** and keep the vanilla GSAP/Three code.

## Commands

```bash
npm run dev       # http://localhost:5173
npm run build     # tsc + vite build → dist/  (must pass before committing)
npm run preview
```

## Structure

```
index.html                 entry page (intro + home)
src/main.ts                bootstrap: initScroll → initTransitions → initIntro
src/styles/                reset.css, tokens.css (design tokens: colours, fonts, eases), main.css
src/scripts/intro/         camera → keypress → film roll → reveal
src/scripts/scenes/        Three.js scenes, models, lighting, post-processing
src/scripts/animations/    GSAP timelines, scroll setup
src/scripts/transitions/   Barba transitions
src/scripts/utils/         helpers (dom.ts: qs/qsa)
src/assets/                small bundled assets imported in code
public/models|video|audio|fonts   large static files served as-is
```

## Conventions

- One module per effect/section; export an `init*()` function; register GSAP plugins where used.
- Put colours, fonts and eases in `tokens.css` as CSS variables; never hard-code them in modules.
- Animate `transform`/`opacity` only; no layout-property animation. Dispose Three.js geometries,
  materials and textures when a scene is torn down.
- Assets: prefer CC0 (Poly Haven) or CC-licensed with attribution (Sketchfab). Keep a `CREDITS.md`
  entry for every third-party model, video, font or sound.
- Visual work is verified with the **playwright** MCP (screenshot the dev server); library APIs are
  checked via the **context7** MCP, not from memory.
- Commit messages: short imperative subject; build must pass first.

## Skills to lean on (installed user-level in ~/.claude/skills)

frontend-design, design-taste (direction & anti-template), gsap-core / gsap-timeline /
gsap-scrolltrigger / gsap-plugins / gsap-performance, threejs-webgl, threejs-animation, shader-glsl,
particle-system, barba-js, page-transition-animation, locomotive-scroll (concepts apply to Lenis),
micro-interaction, svg-animation, 60fps-animation, accessible-animation, web3d-integration-patterns.

## Related context (owner's other work)

Same owner produces the "Java academy" talking-head reels in Premiere Pro; reel footage lives on the
external drive "Ali's NVME" which is read-only — never delete or move anything there. That project is
unrelated to this repo except that Ali's reels may become portfolio pieces.
