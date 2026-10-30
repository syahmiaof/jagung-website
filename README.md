# UI Jagung

Desktop-only WebGL recreation study of Pioneer’s Corn Revolution experience.

## Run locally

```bash
npm install
npm run dev
```

Webpack serves the experience at `http://127.0.0.1:4178/`. Create a production bundle with `npm run build`.

## Controls

- Scroll wheel, `ArrowDown` / `ArrowUp`, `PageDown` / `PageUp` to move between scenes.
- Open the hamburger menu to jump between Science, Real World Testing, and Result.
- Choose a field condition in the testing chapter; the scene copy and plant movement change with the selection.
- `Escape` closes an open story panel.

## Stack notes

The reference’s observable core is Three.js r102, GSAP 2 timelines, and custom full-screen scene navigation. The original RESN Jelly Web3D pipeline and original 3D assets are proprietary and were not found in a public source repository, so this project recreates the scenes procedurally. A public fan remake was found, but it uses Next.js and has no visible license; it is not used here.

This is a local frontend study. Newsletter/contact menu controls are explicitly demo-only; they do not submit data or connect to services.
