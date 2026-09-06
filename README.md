# Ali Srouji — Portfolio

Cinematic portfolio site for Ali Srouji (filmmaker · editor · videographer).

## Stack

Vanilla TypeScript + Vite. No UI framework.

- **GSAP** — animation choreography, ScrollTrigger, SplitText, Flip
- **Three.js** — 3D camera intro, WebGL effects
- **Lenis** — smooth scroll (synced to ScrollTrigger)
- **Barba.js** — page transitions

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview
```

## Structure

```
index.html                 entry page (intro + home)
src/
  main.ts                  bootstrap
  styles/                  reset, design tokens, main styles
  scripts/
    intro/                 camera → keypress → film roll → reveal
    scenes/                Three.js scenes, models, lighting
    animations/            GSAP timelines, scroll setup
    transitions/           Barba page transitions
    utils/                 helpers
  assets/                  bundled assets (imported in code)
    models/ textures/ video/ audio/ fonts/ images/
public/                    static files served as-is (large models/video)
```
